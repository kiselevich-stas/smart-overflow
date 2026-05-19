# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.x | Security fixes are handled on a best-effort basis until 1.0 |

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Report privately by emailing: YOUR_SECURITY_EMAIL@example.com

Include:

- affected version;
- reproduction steps;
- impact;
- whether the issue affects runtime behavior, published artifacts or CI/release process.

## Security posture

SmartOverflow has no runtime dependencies and the core algorithm performs no DOM access, network requests, dynamic code execution or storage access.

Publication is designed to use npm trusted publishing and provenance through GitHub Actions.
