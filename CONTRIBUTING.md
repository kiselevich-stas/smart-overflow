# Contributing

Thanks for considering a contribution.

## Development

```bash
npm install
npm run demo
npm run check
npm run test:e2e
```

## Pull request checklist

- Add or update unit tests for algorithm changes.
- Add or update e2e tests for demo/browser behavior changes.
- Keep the core framework-agnostic.
- Do not add runtime dependencies without a strong reason.
- Update documentation when public API changes.

## API design rules

- Prefer pure functions for core behavior.
- Keep framework adapters outside the core package.
- Avoid DOM-specific types in core APIs.
- Preserve stable output ordering.
- Add runtime validation for public inputs.
