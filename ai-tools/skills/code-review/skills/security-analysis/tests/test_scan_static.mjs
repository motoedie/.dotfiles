import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/scan-static.mjs', import.meta.url));

function git(repo, ...args) {
  const result = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function write(repo, path, value) {
  const target = join(repo, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value);
}

function repository() {
  const repo = mkdtempSync(join(tmpdir(), 'security-static-'));
  git(repo, 'init', '-q');
  git(repo, 'config', 'user.email', 'test@example.invalid');
  git(repo, 'config', 'user.name', 'Test');
  return repo;
}

function commit(repo) {
  git(repo, 'add', '.');
  git(repo, 'commit', '-qm', 'fixture');
  return git(repo, 'rev-parse', 'HEAD');
}

function scan(repo, mode = 'uncommitted', args = [], expectedStatus = 0) {
  const result = spawnSync(process.execPath, [script, '--repo', repo, '--mode', mode, ...args], {
    encoding: 'utf8',
  });
  assert.equal(result.status, expectedStatus, result.stderr + result.stdout);
  return JSON.parse(result.stdout);
}

test('detects a newly disabled TLS verification setting', () => {
  const repo = repository();
  try {
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: true };\n');
    commit(repo);
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: false };\n');

    const result = scan(repo);
    assert.equal(result.status, 'complete');
    assert.deepEqual(result.candidates, [
      { rule: 'tls-verification-disabled', file: 'config.ts', line: 1 },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('detects a newly configured JWT none algorithm', () => {
  const repo = repository();
  try {
    write(repo, 'config.json', '{"alg":"HS256"}\n');
    commit(repo);
    write(repo, 'config.json', '{"alg":"none"}\n');

    assert.deepEqual(scan(repo).candidates, [
      { rule: 'jwt-none-algorithm', file: 'config.json', line: 1 },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('flags only a newly added external resource without SRI', () => {
  const repo = repository();
  try {
    write(repo, 'page.html', '<script src="https://cdn.example/old.js"></script>\n');
    commit(repo);
    write(repo, 'page.html', [
      '<script src="https://cdn.example/old.js"></script>',
      '<script src="https://cdn.example/new.js"></script>',
      '<link rel="stylesheet" href="https://cdn.example/a.css" integrity="sha384-x">',
      '',
    ].join('\n'));

    assert.deepEqual(scan(repo).candidates, [
      { rule: 'external-resource-missing-sri', file: 'page.html', line: 2 },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('path audit follows an external base URL for a relative script', () => {
  const repo = repository();
  try {
    write(repo, 'page.html', '<base href="https://cdn.example/assets/">\n<script src="app.js"></script>\n');

    assert.deepEqual(scan(repo, 'paths', ['--path', 'page.html']).candidates, [
      { rule: 'external-resource-missing-sri', file: 'page.html', line: 2 },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('changing a base URL exposes an unchanged script', () => {
  const repo = repository();
  try {
    write(repo, 'page.html', '<base href="/assets/">\n<script src="app.js"></script>\n');
    commit(repo);
    write(repo, 'page.html', '<base href="HTTPS://cdn.example/assets/">\n<script src="app.js"></script>\n');

    assert.deepEqual(scan(repo).candidates, [
      { rule: 'external-resource-missing-sri', file: 'page.html', line: 2 },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('HTML character references in resource URLs are decoded', () => {
  const repo = repository();
  try {
    write(repo, 'page.html', '<script src="https&#58;//cdn.example/a.js"></script>\n'
      + '<link rel="stylesheet" href="https&colon;&sol;&sol;cdn.example/a.css">\n');
    assert.deepEqual(scan(repo, 'paths', ['--path', 'page.html']).candidates.map((item) => item.line), [1, 2]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('an unclosed script body does not create HTML resource tags', () => {
  const repo = repository();
  try {
    write(repo, 'page.html', '<script>const sample = "<script src=\'https://cdn.example/a.js\'>";\n');
    assert.deepEqual(scan(repo, 'paths', ['--path', 'page.html']).candidates, []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('does not treat escaped JSON text as a setting', () => {
  const repo = repository();
  try {
    write(repo, 'config.json', '{"note":"\\\"alg\\\":\\\"none\\\""}\n');
    assert.deepEqual(scan(repo, 'paths', ['--path', 'config.json']).candidates, []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('staged and range modes read their selected Git snapshot', () => {
  const repo = repository();
  try {
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: true };\n');
    const initial = commit(repo);
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: false };\n');
    git(repo, 'add', 'config.ts');
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: true };\n');

    assert.deepEqual(scan(repo, 'staged').candidates.map((item) => item.rule), [
      'tls-verification-disabled',
    ]);
    git(repo, 'commit', '-qm', 'disable TLS check');
    const current = git(repo, 'rev-parse', 'HEAD');
    assert.deepEqual(scan(repo, 'range', ['--revision', `${initial}..${current}`]).candidates.map((item) => item.rule), [
      'tls-verification-disabled',
    ]);
    assert.deepEqual(scan(repo, 'paths', ['--path', 'config.ts']).candidates, []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('branch mode includes committed, working, and untracked changes', () => {
  const repo = repository();
  try {
    write(repo, 'initial.ts', 'export const safe = true;\n');
    const base = commit(repo);
    write(repo, 'committed.ts', "export const jwt = { alg: 'none' };\n");
    commit(repo);
    write(repo, 'working.ts', 'export const tls = { rejectUnauthorized: false };\n');
    write(repo, 'untracked.html', '<script src="https://cdn.example/app.js"></script>\n');

    const result = scan(repo, 'branch', ['--base', base]);
    assert.equal(result.files, 3);
    assert.deepEqual(new Set(result.candidates.map((item) => item.rule)), new Set([
      'jwt-none-algorithm', 'tls-verification-disabled', 'external-resource-missing-sri',
    ]));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('reports npm manifest mismatch and missing lock integrity', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"dependencies":{"safe":"1.0.0"}}\n');
    write(repo, 'package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: {
      '': { dependencies: { safe: '1.0.0' } },
      'node_modules/safe': { version: '1.0.0', resolved: 'https://registry.example/safe.tgz', integrity: 'sha512-old' },
    } }));
    commit(repo);
    write(repo, 'package.json', '{"dependencies":{"safe":"2.0.0"}}\n');
    write(repo, 'package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: {
      '': { dependencies: { safe: '1.0.0' } },
      'node_modules/safe': { version: '2.0.0', resolved: 'https://registry.example/safe.tgz' },
    } }));

    const result = scan(repo);
    assert.equal(result.status, 'complete');
    assert.deepEqual(new Set(result.candidates.map((item) => item.rule)), new Set([
      'manifest-lock-mismatch', 'lock-missing-integrity',
    ]));
    assert.deepEqual(result.dependency_changes, [
      { package: 'safe', before: '1.0.0', after: '2.0.0', integrity: false },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('npm lock-only changes still check manifest consistency', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"dependencies":{"safe":"1.0.0"}}\n');
    write(repo, 'package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: {
      '': { dependencies: { safe: '1.0.0' } },
      'node_modules/safe': { version: '1.0.0', integrity: 'sha512-old' },
    } }));
    commit(repo);
    write(repo, 'package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: {
      '': { dependencies: { safe: '2.0.0' } },
      'node_modules/safe': { version: '2.0.0', integrity: 'sha512-new' },
    } }));
    assert.ok(scan(repo).candidates.some((item) => item.rule === 'manifest-lock-mismatch'));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('Yarn resolutions work, absent checksums are optional, and workspace protocol is manual', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', JSON.stringify({ dependencies: { a: '^2.0.0', local: 'workspace:*' }, resolutions: { a: '2.1.0' } }));
    write(repo, 'yarn.lock', '__metadata:\n  version: 8\n'
      + '"a@npm:2.1.0":\n  version: 2.1.0\n  resolution: "a@npm:2.1.0"\n  linkType: hard\n'
      + '"optional@npm:1.0.0":\n  version: 1.0.0\n  resolution: "optional@npm:1.0.0"\n  linkType: hard\n');
    const result = scan(repo, 'paths', ['--path', 'package.json', '--path', 'yarn.lock'], 2);
    assert.deepEqual(result.candidates, []);
    assert.deepEqual(result.limitations, ['manual lock selector check: package.json:local']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('Yarn checksum removal in a changed entry is a candidate', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"dependencies":{"a":"1.0.0"}}');
    const prefix = '__metadata:\n  version: 8\n"a@npm:1.0.0":\n  version: 1.0.0\n  resolution: "a@npm:1.0.0"\n  linkType: hard\n';
    write(repo, 'yarn.lock', `${prefix}  checksum: old\n`);
    commit(repo);
    write(repo, 'yarn.lock', prefix);
    const result = scan(repo);
    assert.deepEqual(result.candidates.map((item) => item.rule), ['lock-integrity-removed']);
    assert.deepEqual(result.dependency_changes, [
      { package: 'a', before: '1.0.0', after: '1.0.0', integrity: false },
    ]);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('Yarn Berry explicit mapping keys resolve manifest selectors', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"dependencies":{"a":"1.0.0"}}');
    write(repo, 'yarn.lock', '__metadata:\n  version: 8\n? "a@npm:1.0.0"\n:\n  version: 1.0.0\n  checksum: present\n');
    const result = scan(repo, 'paths', ['--path', 'package.json', '--path', 'yarn.lock']);
    assert.equal(result.status, 'complete');
    assert.deepEqual(result.candidates, []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('Yarn null checksum is treated as removed', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"dependencies":{"a":"1.0.0"}}');
    const prefix = '__metadata:\n  version: 8\n"a@npm:1.0.0":\n  version: 1.0.0\n';
    write(repo, 'yarn.lock', `${prefix}  checksum: prior\n`);
    commit(repo);
    write(repo, 'yarn.lock', `${prefix}  checksum: null\n`);
    assert.deepEqual(scan(repo).candidates.map((item) => item.rule), ['lock-integrity-removed']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('source extensions are case-insensitive like the Python scanner', () => {
  const repo = repository();
  try {
    write(repo, 'config.JSON', '{"rejectUnauthorized":false}\n');
    write(repo, 'page.HTML', '<script src="https://cdn.example/app.js"></script>\n');
    const result = scan(repo, 'paths', ['--path', 'config.JSON', '--path', 'page.HTML']);
    assert.deepEqual(new Set(result.candidates.map((item) => item.rule)), new Set([
      'tls-verification-disabled', 'external-resource-missing-sri',
    ]));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('a changed workspace lock reports unchecked workspace manifests', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"workspaces":["packages/*"]}');
    write(repo, 'packages/a/package.json', '{"dependencies":{"a":"1.0.0"}}');
    write(repo, 'yarn.lock', '__metadata:\n  version: 8\n"a@npm:1.0.0":\n  version: 1.0.0\n');
    commit(repo);
    write(repo, 'yarn.lock', '__metadata:\n  version: 8\n"a@npm:1.0.0":\n  version: 2.0.0\n');
    const result = scan(repo, 'uncommitted', [], 2);
    assert.deepEqual(result.limitations, ['workspace manifest selectors need manual comparison: yarn.lock']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('unsupported Yarn Classic lockfile is partial rather than clean', () => {
  const repo = repository();
  try {
    write(repo, 'package.json', '{"dependencies":{"a":"1.0.0"}}');
    write(repo, 'yarn.lock', 'a@1.0.0:\n  version "1.0.0"\n');
    const result = scan(repo, 'paths', ['--path', 'package.json', '--path', 'yarn.lock'], 2);
    assert.equal(result.status, 'partial');
    assert.ok(result.limitations.some((item) => item.includes('unsupported')));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('path audits report ignored targets they could not scan', () => {
  const repo = repository();
  try {
    write(repo, '.gitignore', 'ignored/\n');
    write(repo, 'ignored/config.ts', 'rejectUnauthorized: false\n');
    commit(repo);
    const result = scan(repo, 'paths', ['--path', 'ignored'], 2);
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.limitations, ['1 ignored path targets not scanned; verify exclusions']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('accepts a Git root reached through a symlinked path', () => {
  const repo = repository();
  const links = mkdtempSync(join(tmpdir(), 'security-static-link-'));
  try {
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: true };\n');
    commit(repo);
    write(repo, 'config.ts', 'export const options = { rejectUnauthorized: false };\n');
    const link = join(links, 'repo');
    symlinkSync(repo, link);

    const expected = [{ rule: 'tls-verification-disabled', file: 'config.ts', line: 1 }];
    assert.deepEqual(scan(link).candidates, expected);
    assert.deepEqual(scan(link, 'paths', ['--path', join(link, 'config.ts')]).candidates, expected);
  } finally {
    rmSync(links, { recursive: true, force: true });
    rmSync(repo, { recursive: true, force: true });
  }
});

test('rejects a repository subdirectory, including through a symlink', () => {
  const repo = repository();
  const links = mkdtempSync(join(tmpdir(), 'security-static-link-'));
  try {
    write(repo, 'sub/config.ts', 'rejectUnauthorized: false\n');
    commit(repo);
    const link = join(links, 'repo');
    symlinkSync(repo, link);

    for (const target of [join(repo, 'sub'), join(link, 'sub')]) {
      const result = scan(target, 'uncommitted', [], 1);
      assert.deepEqual(result, { status: 'error', error: '--repo must be the Git root' });
    }
  } finally {
    rmSync(links, { recursive: true, force: true });
    rmSync(repo, { recursive: true, force: true });
  }
});
