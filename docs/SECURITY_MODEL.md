# Security model

SmartOverflow is a local calculation library. It does not process secrets, make network requests, evaluate user-provided code or touch storage.

## Runtime security properties

The published package is designed to have:

- zero runtime dependencies;
- no network access;
- no filesystem access;
- no dynamic `eval` / `Function` usage;
- no DOM access in the core algorithm;
- deterministic output from explicit input.

## Supply-chain security

The repository is prepared for:

- npm trusted publishing through GitHub Actions;
- provenance-enabled publication;
- short-lived OIDC-based publish credentials instead of long-lived npm tokens;
- Dependabot updates for GitHub Actions and npm dependencies;
- CI checks before release.

## Consumer responsibility

SmartOverflow returns ids and metadata. Consumers are responsible for safe rendering in their UI framework.

Do not insert untrusted labels or metadata into HTML with unsafe APIs such as `innerHTML`. Render labels as text nodes or framework text bindings.

## Reporting vulnerabilities

See [`../SECURITY.md`](../SECURITY.md).
