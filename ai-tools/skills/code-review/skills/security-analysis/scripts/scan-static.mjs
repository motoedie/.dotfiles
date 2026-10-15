#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const MAX_BUFFER = 64 * 1024 * 1024;
const LOCK_NAMES = ['yarn.lock', 'package-lock.json', 'npm-shrinkwrap.json'];
const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies'];

class ScanError extends Error {}

function runGit(repo, args, { missingOk = false, input } = {}) {
  const result = spawnSync('git', ['-C', repo, ...args], {
    encoding: 'buffer',
    maxBuffer: MAX_BUFFER,
    input,
  });
  if (result.error || result.status !== 0) {
    if (missingOk) return null;
    throw new ScanError(result.stderr?.toString('utf8').trim() || result.error?.message || 'Git command failed');
  }
  return result.stdout;
}

function git(repo, ...args) {
  return runGit(repo, args);
}

function parseArguments(argv) {
  const args = { paths: [] };
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    if (!['--repo', '--mode', '--path', '--base', '--revision'].includes(flag) || !argv[index + 1]) {
      throw new ScanError(`invalid argument: ${flag}`);
    }
    if (flag === '--path') args.paths.push(argv[index + 1]);
    else args[flag.slice(2)] = argv[index + 1];
  }
  if (!args.repo || !args.mode) throw new ScanError('--repo and --mode are required');
  return args;
}

function relativePath(repo, value) {
  let target = resolve(repo, value);
  try {
    target = realpathSync(target);
  } catch {
    // Git path filters may name files that do not exist in the worktree.
  }
  const path = relative(repo, target);
  if (path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path)) {
    throw new ScanError(`path outside repository: ${value}`);
  }
  return path || '.';
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function changedLines(patch) {
  const result = new Set();
  for (const match of patch.toString('utf8').matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    for (let line = start; line < start + count; line += 1) result.add(line);
  }
  return result;
}

function selectedScope(repo, args) {
  const filters = args.paths.map((path) => relativePath(repo, path));
  if (args.mode === 'paths') {
    if (filters.length === 0) throw new ScanError('paths mode needs --path');
    const tracked = git(repo, 'ls-files', '--cached', '-z', '--', ...filters);
    const untracked = git(repo, 'ls-files', '--others', '--exclude-standard', '-z', '--', ...filters);
    const paths = new Set((tracked.toString('utf8') + untracked.toString('utf8')).split('\0').filter(Boolean));
    for (const path of filters) if (isFile(resolve(repo, path))) paths.add(path);
    const selected = new Map([...paths].filter((path) => isFile(resolve(repo, path))).sort().map((path) => [path, null]));
    return { selected, before: null, ref: 'working' };
  }
  let before;
  let ref;
  let diffArgs;
  if (args.mode === 'branch' || args.mode === 'base') {
    if (!args.base) throw new ScanError('branch/base mode needs the resolved --base ref');
    before = git(repo, 'merge-base', args.base, 'HEAD').toString('utf8').trim();
    diffArgs = [before];
    ref = 'working';
  } else if (args.mode === 'uncommitted') {
    before = 'HEAD';
    diffArgs = ['HEAD'];
    ref = 'working';
  } else if (args.mode === 'staged') {
    before = 'HEAD';
    diffArgs = ['--cached'];
    ref = 'index';
  } else if (args.mode === 'range') {
    if (!args.revision) throw new ScanError('range mode needs --revision');
    if (args.revision.includes('...')) {
      const [left, right] = args.revision.split('...', 2);
      before = git(repo, 'merge-base', left, right).toString('utf8').trim();
      ref = right;
    } else if (args.revision.includes('..')) {
      [before, ref] = args.revision.split('..', 2);
    } else {
      const parent = runGit(repo, ['rev-parse', `${args.revision}^`], { missingOk: true });
      before = parent?.toString('utf8').trim() ?? runGit(repo, ['hash-object', '-t', 'tree', '--stdin'], { input: '' }).toString('utf8').trim();
      ref = args.revision;
    }
    if (!before || !ref) throw new ScanError('revision range needs two valid endpoints');
    git(repo, 'rev-parse', '--verify', `${ref}^{commit}`);
    diffArgs = [before, ref];
  } else {
    throw new ScanError(`unsupported mode: ${args.mode}`);
  }
  const selected = new Map();
  const names = git(repo, 'diff', '--no-ext-diff', '--name-only', '--diff-filter=ACMRT', '-z', ...diffArgs, '--', ...filters);
  const paths = new Set(names.toString('utf8').split('\0').filter(Boolean));
  const untracked = new Set();
  if (ref === 'working') {
    const others = git(repo, 'ls-files', '--others', '--exclude-standard', '-z', '--', ...filters);
    for (const path of others.toString('utf8').split('\0').filter(Boolean)) {
      untracked.add(path);
      paths.add(path);
    }
  }
  for (const path of [...paths].sort()) {
    if (untracked.has(path)) selected.set(path, null);
    else {
      const patch = git(repo, 'diff', '--no-ext-diff', '--unified=0', ...diffArgs, '--', path);
      selected.set(path, changedLines(patch));
    }
  }
  return { selected, before, ref };
}

function content(repo, ref, path, missingOk = false) {
  if (ref === 'working') {
    const target = resolve(repo, path);
    try {
      if (!lstatSync(target).isFile()) throw new ScanError(`cannot read ${path}`);
      return readFileSync(target);
    } catch (error) {
      if (missingOk) return null;
      throw error;
    }
  }
  return runGit(repo, ['show', `${ref === 'index' ? ':' : `${ref}:`}${path}`], { missingOk });
}

function htmlAttribute(value) {
  if (typeof value !== 'string') return value;
  const named = { amp: '&', apos: "'", colon: ':', gt: '>', lt: '<', quot: '"', sol: '/' };
  return value.replace(/&(?:#(?:x[0-9a-f]+|[0-9]+);?|[a-z]+;)/gi, (entity) => {
    if (entity.startsWith('&#')) {
      const hex = entity[2]?.toLowerCase() === 'x';
      const number = Number.parseInt(entity.slice(hex ? 3 : 2), hex ? 16 : 10);
      return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
    }
    return named[entity.slice(1, -1).toLowerCase()] ?? entity;
  });
}

function htmlResources(source) {
  const missing = [];
  let externalBase = false;
  let baseLine = null;
  let index = 0;
  while ((index = source.indexOf('<', index)) !== -1) {
    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4);
      index = end === -1 ? source.length : end + 3;
      continue;
    }
    const start = index;
    const nameMatch = /^<([A-Za-z][A-Za-z0-9-]*)\b/.exec(source.slice(start));
    if (!nameMatch) {
      index += 1;
      continue;
    }
    const tag = nameMatch[1].toLowerCase();
    index += nameMatch[0].length;
    let quote = null;
    const attributesStart = index;
    while (index < source.length) {
      const char = source[index];
      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        break;
      }
      index += 1;
    }
    const attributesText = source.slice(attributesStart, index);
    index += 1;
    if (!['base', 'script', 'link'].includes(tag)) continue;
    const attributes = new Map();
    for (const match of attributesText.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attributes.set(match[1].toLowerCase(), htmlAttribute(match[2] ?? match[3] ?? match[4] ?? null));
    }
    const line = source.slice(0, start).split('\n').length;
    if (tag === 'base') {
      externalBase = /^(?:https?:\/\/|\/\/)/i.test(attributes.get('href') ?? '');
      baseLine = line;
    } else {
      const url = attributes.get(tag === 'script' ? 'src' : 'href');
      const stylesheet = tag !== 'link' || (attributes.get('rel') ?? '').toLowerCase().split(/\s+/).includes('stylesheet');
      const direct = typeof url === 'string' && /^(?:https?:\/\/|\/\/)/i.test(url);
      const viaBase = typeof url === 'string' && externalBase && !direct && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(url);
      if (stylesheet && (direct || viaBase) && !attributes.get('integrity')) {
        missing.push({ line, baseLine: viaBase ? baseLine : null });
      }
    }
    if (tag === 'script') {
      const close = source.slice(index).search(/<\/script\s*>/i);
      if (close >= 0) index += close;
      else index = source.length;
    }
  }
  return missing;
}

function checkSources(repo, selected, ref, findings, limitations) {
  const patterns = [
    ['tls-verification-disabled', /(?<![\w\\])['"]?rejectUnauthorized['"]?\s*[:=]\s*false\b|\bNODE_TLS_REJECT_UNAUTHORIZED\s*[:=]\s*['"]?0\b/g],
    ['jwt-none-algorithm', /(?<![\w\\])['"]?(?:alg|algorithm)['"]?\s*[:=]\s*['"]none['"]/gi],
  ];
  for (const [path, changed] of selected) {
    if (!/\.(?:js|jsx|ts|tsx|json|html|htm|env)$/i.test(path)) continue;
    const raw = content(repo, ref, path, true);
    if (raw === null) {
      limitations.push(`source unreadable: ${path}`);
      continue;
    }
    let source;
    try {
      source = new TextDecoder('utf-8', { fatal: true }).decode(raw);
    } catch {
      limitations.push(`source is not UTF-8: ${path}`);
      continue;
    }
    if (/\.json$/i.test(path)) {
      try {
        JSON.parse(source);
      } catch {
        limitations.push(`invalid JSON, literal checks not completed: ${path}`);
        continue;
      }
    }
    for (const [rule, pattern] of patterns) {
      for (const match of source.matchAll(pattern)) {
        const line = source.slice(0, match.index).split('\n').length;
        if (changed === null || changed.has(line)) {
          findings.push({ rule, file: path, line });
        }
      }
    }
    if (/\.html?$/i.test(path)) {
      for (const { line, baseLine } of htmlResources(source)) {
        if (changed === null || changed.has(line) || changed.has(baseLine)) {
          findings.push({ rule: 'external-resource-missing-sri', file: path, line });
        }
      }
    }
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function lockData(name, raw) {
  if (name === 'package-lock.json' || name === 'npm-shrinkwrap.json') {
    const parsed = JSON.parse(raw.toString('utf8'));
    if (!isObject(parsed?.packages)) throw new ScanError('npm lockfile has no packages map');
    return {
      entries: Object.fromEntries(Object.entries(parsed.packages).filter(([, value]) => isObject(value))),
      selectors: {},
    };
  }
  if (name === 'yarn.lock') {
    const entries = {};
    const selectors = {};
    let key = null;
    let pendingKey = null;
    let metadata = false;
    const decode = (value) => {
      if (value.startsWith('"')) return JSON.parse(value);
      if (value.startsWith("'")) {
        if (!value.endsWith("'")) throw new ScanError('invalid Yarn Berry YAML');
        return value.slice(1, -1).replaceAll("''", "'");
      }
      if (value === 'null' || value === '~') return null;
      if (value === 'false') return false;
      if (value === 'true') return true;
      return value;
    };
    try {
      for (const line of new TextDecoder('utf-8', { fatal: true }).decode(raw).split(/\r?\n/)) {
        if (!line.trim() || line.trimStart().startsWith('#')) continue;
        if (!line.startsWith(' ')) {
          if (line.startsWith('? ')) {
            if (pendingKey !== null) throw new ScanError('invalid Yarn Berry YAML');
            pendingKey = decode(line.slice(2));
            continue;
          }
          if (pendingKey !== null && line === ':') {
            key = pendingKey;
            pendingKey = null;
          } else {
            if (pendingKey !== null) throw new ScanError('invalid Yarn Berry YAML');
            const match = /^(.+):\s*$/.exec(line);
            if (!match) throw new ScanError('invalid Yarn Berry YAML');
            key = decode(match[1]);
          }
          if (key === '__metadata') metadata = true;
          else {
            if (Object.hasOwn(entries, key)) throw new ScanError('invalid Yarn Berry YAML');
            entries[key] = { _lines: [] };
          }
        } else {
          if (key === null || !/^ {2,}\S/.test(line)) throw new ScanError('invalid Yarn Berry YAML');
          if (key === '__metadata') continue;
          entries[key]._lines.push(line);
          const field = /^  ([^:]+):(?:\s*(.*))?$/.exec(line);
          if (field && ['version', 'checksum', 'integrity'].includes(field[1])) {
            entries[key][field[1]] = decode(field[2] ?? '');
          }
        }
      }
      if (pendingKey !== null) throw new ScanError('invalid Yarn Berry YAML');
    } catch (error) {
      if (error instanceof ScanError) throw error;
      throw new ScanError('invalid Yarn Berry YAML');
    }
    if (!metadata) throw new ScanError('only Yarn Berry lockfiles are supported');
    for (const [descriptor, entry] of Object.entries(entries)) {
      for (const selector of descriptor.split(', ')) selectors[selector] = entry;
    }
    return { entries, selectors };
  }
  throw new ScanError(`unsupported lockfile: ${name}`);
}

function findLock(repo, manifest, ref) {
  let directory = dirname(manifest);
  while (true) {
    for (const name of LOCK_NAMES) {
      const path = directory === '.' ? name : join(directory, name);
      if (content(repo, ref, path, true) !== null) return path;
    }
    if (directory === '.') return null;
    directory = dirname(directory);
  }
}

function packageLabel(lock, key) {
  const label = basename(lock) === 'yarn.lock'
    ? key.split(', ', 1)[0].split('@npm:')[0]
    : key.split('node_modules/').at(-1);
  return /^[A-Za-z0-9@._/-]{1,120}$/.test(label) ? label : '[package]';
}

function candidate(findings, rule, path, detail) {
  const item = { rule, file: path };
  if (detail) item.detail = /^[A-Za-z0-9@._/-]{1,120}$/.test(detail) ? detail : '[package]';
  findings.push(item);
}

function checkDependencies(repo, selected, before, ref, findings, limitations, changes) {
  const changedLocks = [...selected.keys()].filter((path) => LOCK_NAMES.includes(basename(path)));
  const manifests = new Set([...selected.keys()].filter((path) => basename(path) === 'package.json'));
  for (const lock of changedLocks) {
    const manifest = join(dirname(lock), 'package.json');
    if (content(repo, ref, manifest, true) !== null) manifests.add(manifest);
  }
  const parsedLocks = new Map();
  const changedLockKeys = new Map();
  const workspaceLocks = new Set();
  for (const manifest of [...manifests].sort()) {
    const lock = findLock(repo, manifest, ref);
    if (!lock) {
      limitations.push(`no supported lockfile for ${manifest}`);
      continue;
    }
    let current;
    let previous;
    let entries;
    let selectors;
    let resolutions;
    let rootManifest;
    try {
      current = JSON.parse(content(repo, ref, manifest).toString('utf8'));
      const previousRaw = before ? content(repo, before, manifest, true) : null;
      previous = previousRaw ? JSON.parse(previousRaw.toString('utf8')) : {};
      if (!isObject(current) || !isObject(previous)) throw new ScanError('manifest is not an object');
      if (!parsedLocks.has(lock)) parsedLocks.set(lock, lockData(basename(lock), content(repo, ref, lock)));
      ({ entries, selectors } = parsedLocks.get(lock));
      if (!changedLockKeys.has(lock)) {
        const oldRaw = before ? content(repo, before, lock, true) : null;
        const oldEntries = oldRaw ? lockData(basename(lock), oldRaw).entries : {};
        changedLockKeys.set(lock, new Set(Object.keys(entries).filter((key) => !isDeepStrictEqual(oldEntries[key], entries[key]))));
      }
      const rootPath = join(dirname(lock), 'package.json');
      const rootRaw = content(repo, ref, rootPath, true);
      rootManifest = rootRaw ? JSON.parse(rootRaw.toString('utf8')) : {};
      resolutions = isObject(rootManifest?.resolutions) ? rootManifest.resolutions : {};
    } catch (error) {
      limitations.push(`dependency metadata unsupported for ${manifest}: ${error.message}`);
      continue;
    }
    if (changedLocks.includes(lock) && isObject(rootManifest) && rootManifest.workspaces && !workspaceLocks.has(lock)) {
      limitations.push(`workspace manifest selectors need manual comparison: ${lock}`);
      workspaceLocks.add(lock);
    }
    const declarationsByName = new Map();
    const changedNames = new Set();
    for (const section of DEPENDENCY_SECTIONS) {
      const declarations = current[section] ?? {};
      const old = previous[section] ?? {};
      if (!isObject(declarations) || !isObject(old)) {
        limitations.push(`invalid ${section} in ${manifest}`);
        continue;
      }
      for (const [name, spec] of Object.entries(declarations)) {
        if (typeof spec !== 'string') {
          limitations.push(`non-string dependency in ${manifest}:${section}`);
          continue;
        }
        if (!declarationsByName.has(name)) declarationsByName.set(name, new Set());
        declarationsByName.get(name).add(spec);
        if (!before || old[name] !== spec) changedNames.add(name);
      }
    }
    for (const [name, specs] of declarationsByName) {
      const lockChanged = [...changedLockKeys.get(lock)].some((key) => basename(lock) === 'yarn.lock'
        ? key.includes(`${name}@`) : key === '' || key.endsWith(`node_modules/${name}`));
      if (before && !changedNames.has(name) && !lockChanged) continue;
      if (specs.size !== 1) {
        limitations.push(`conflicting manifest declarations: ${manifest}:${name}`);
        continue;
      }
      const [spec] = specs;
      if (basename(lock) === 'yarn.lock') {
        const effective = resolutions[name] ?? spec;
        if (typeof effective !== 'string' || /^(?:workspace:|portal:|patch:|file:|link:|git\+)/.test(effective)) {
          limitations.push(`manual lock selector check: ${manifest}:${name}`);
          continue;
        }
        const descriptor = `${name}@${effective.startsWith('npm:') ? effective : `npm:${effective}`}`;
        const entry = selectors[descriptor];
        if (!entry) candidate(findings, 'manifest-lock-mismatch', manifest, name);
        else if (!entry.version) candidate(findings, 'lock-missing-version', lock, name);
        else if (/^\d+\.\d+\.\d+$/.test(effective) && entry.version !== effective) {
          candidate(findings, 'manifest-lock-mismatch', manifest, name);
        }
      } else {
        const location = dirname(manifest) === '.' ? '' : dirname(manifest);
        const locked = entries[location] ?? {};
        const present = DEPENDENCY_SECTIONS.flatMap((section) => isObject(locked[section]) && name in locked[section]
          ? [locked[section][name]] : []);
        if (!present.includes(spec)) candidate(findings, 'manifest-lock-mismatch', manifest, name);
      }
    }
  }
  for (const lock of changedLocks) {
    let entries;
    let oldEntries;
    try {
      if (!parsedLocks.has(lock)) parsedLocks.set(lock, lockData(basename(lock), content(repo, ref, lock)));
      entries = parsedLocks.get(lock).entries;
      const oldRaw = before ? content(repo, before, lock, true) : null;
      oldEntries = oldRaw ? lockData(basename(lock), oldRaw).entries : {};
    } catch (error) {
      limitations.push(`lockfile unsupported for ${lock}: ${error.message}`);
      continue;
    }
    for (const [key, entry] of Object.entries(entries)) {
      if (before && isDeepStrictEqual(oldEntries[key], entry)) continue;
      if (before) {
        changes.push({ package: packageLabel(lock, key), before: oldEntries[key]?.version ?? null,
          after: entry.version ?? null, integrity: Boolean(entry.checksum || entry.integrity) });
      }
      if (basename(lock) === 'yarn.lock') {
        if (oldEntries[key]?.checksum && !entry.checksum) candidate(findings, 'lock-integrity-removed', lock);
      } else if (typeof entry.resolved === 'string' && /^https?:\/\//.test(entry.resolved) && !entry.integrity) {
        candidate(findings, 'lock-missing-integrity', lock);
      }
    }
  }
}

function main() {
  try {
    const args = parseArguments(process.argv.slice(2));
    // Canonical path: symlinked --repo (e.g. macOS /var -> /private/var) must match Git's toplevel.
    const repo = realpathSync(resolve(args.repo));
    const root = git(repo, 'rev-parse', '--show-toplevel').toString('utf8').trim();
    if (realpathSync(root) !== repo) throw new ScanError('--repo must be the Git root');
    const { selected, before, ref } = selectedScope(repo, args);
    const findings = [];
    const limitations = [];
    if (args.mode === 'paths') {
      const filters = args.paths.map((path) => relativePath(repo, path));
      const ignored = git(repo, 'ls-files', '--others', '--ignored', '--exclude-standard', '-z', '--', ...filters);
      const omitted = ignored.toString('utf8').split('\0').filter((path) => path && !selected.has(path));
      if (omitted.length) limitations.push(`${omitted.length} ignored path targets not scanned; verify exclusions`);
    }
    checkSources(repo, selected, ref, findings, limitations);
    const changes = [];
    checkDependencies(repo, selected, before, ref, findings, limitations, changes);
    const output = { status: limitations.length ? 'partial' : 'complete', files: selected.size,
      candidates: findings, limitations };
    if (changes.length) output.dependency_changes = changes;
    process.stdout.write(JSON.stringify(output) + '\n');
    if (limitations.length) process.exitCode = 2;
  } catch (error) {
    process.stdout.write(JSON.stringify({ status: 'error', error: error.message }) + '\n');
    process.exitCode = 1;
  }
}

main();
