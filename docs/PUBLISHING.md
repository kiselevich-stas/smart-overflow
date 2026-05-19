# Publishing to npm

This repository is prepared for modern npm publication with trusted publishing and provenance.

## 1. Rename placeholders

Update these values before publishing:

- `package.json` → `author`
- `package.json` → `homepage`
- `package.json` → `repository.url`
- `package.json` → `bugs.url`
- `LICENSE` → copyright holder

Check whether the package name is available on npm. If `smart-overflow` is already taken, publish under a scope, for example:

```json
{
  "name": "@your-scope/smart-overflow"
}
```

For scoped public packages, keep:

```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

## 2. Install and verify locally

```bash
npm install
npm run check
npm run test:e2e
npm run pack:check
```

`npm run pack:check` shows which files will be included in the published tarball.

## 3. Create GitHub repository

```bash
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/smart-overflow.git
git push -u origin main
```

## 4. Configure npm trusted publishing

In npm package settings, configure GitHub Actions as a trusted publisher for:

- repository owner: `YOUR_GITHUB_USERNAME`
- repository name: `smart-overflow`
- workflow file: `release.yml`
- environment: empty unless you explicitly protect releases with a GitHub Environment

Trusted publishing removes the need for long-lived npm automation tokens.

## 5. Release

The included workflow publishes on GitHub Release publication.

Recommended release flow:

```bash
npm version patch
npm run check
git push --follow-tags
```

Then create a GitHub Release for the new tag. The release workflow will run CI checks and publish to npm.

## 6. After publish

Verify:

```bash
npm view smart-overflow version
npm view smart-overflow dist.integrity
npm install smart-overflow
```

Then test in a fresh project:

```ts
import { calculateOverflow } from 'smart-overflow';

console.log(calculateOverflow({ containerWidth: 100, items: [] }));
```

## Manual fallback

Manual publish is not preferred, but can be used before trusted publishing is configured:

```bash
npm login
npm run check
npm publish --access public --provenance
```

Use an account protected with strong 2FA.
