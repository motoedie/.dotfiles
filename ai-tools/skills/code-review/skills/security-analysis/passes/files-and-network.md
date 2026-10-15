# Quick: Files and Outbound Network

Load for file access, uploads, archives, converters, URL fetching, or outbound
requests.

- Normalize paths and constrain read, write, and extraction roots. Prevent
  traversal, including archive extraction outside its destination.
- Validate uploads by content signature, type, and size; isolate uploaded
  files and dangerous parsers. Scan or quarantine risky files when applicable.
  Bound archive extraction and decompression, and prevent uploaded content
  from being served in a dangerous browser context.
- Restrict SSRF protocols, hosts, ports, redirects, and private-network
  destinations. For company device access, constrain destinations to
  authorized networks or inventory instead of blanket private-IP blocking.
- Enforce outbound timeouts and response-size limits.
