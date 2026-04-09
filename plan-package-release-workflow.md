# Plan: Package Release Workflow

## Goal

Make `oc-plugin-the-matrix` easy to release, publish, and maintain as an installable OpenCode package.

## Current State

- the repo now builds a publishable package to `dist/`
- `package.json` exports `./dist/index.js`
- bundled theme JSON assets are copied into `dist/`
- `README.md` now documents package-name installation and local development installation
- there is no CI workflow yet
- there is no automated publish workflow yet
- versioning is still manual

## Recommendation

Use a staged rollout:

1. do one manual release first
2. add CI to build and pack on every push/PR
3. add automated npm publish on version tags
4. follow semantic versioning for future releases

This keeps the first package release simple while still moving toward a clean automated release flow.

## Versioning Strategy

Use semantic versioning:

- **patch**: fixes, docs updates, packaging fixes, small non-breaking theme tweaks
- **minor**: new plugin features, new settings, new color presets, non-breaking UI/theme enhancements
- **major**: breaking config changes, removed settings, incompatible package entry changes, or behavior changes that require migration

### Recommended next version

Publish the first package-ready release as:

- `0.2.0`

Reason:

- the plugin is now materially more capable than the earlier `0.1.0`
- package-style installation is a meaningful improvement
- the current feature set now includes plugin-wide toggle behavior, selectable accent colors, and package distribution setup

## Manual Release Flow

For the first release, use this process manually:

1. bump `package.json` version
2. run:

   ```bash
   npm install
   npm run build
   npm pack
   ```

3. inspect the tarball contents
4. test installation in OpenCode using the package name
5. publish to npm
6. create a git tag such as `v0.2.0`
7. push the tag

## CI Workflow Plan

Add a GitHub Actions workflow for validation on pushes and pull requests.

### Suggested checks

- checkout repository
- set up Node
- run `npm ci`
- run `npm run build`
- run `npm pack`

### Outcome

This ensures the package can always:

- build successfully
- produce a valid npm tarball
- keep publishable assets in sync

## Release Workflow Plan

After the first manual release works, add a second workflow for automated publishing.

### Trigger

- push of tags matching `v*`

### Suggested steps

- checkout repository
- set up Node
- run `npm ci`
- run `npm run build`
- run `npm publish`

This workflow should use an npm token stored in GitHub Actions secrets.

## Suggested Files To Add Later

- `.github/workflows/ci.yml` ✅
- `.github/workflows/release.yml` ✅

## Practical Next Steps

1. publish one release manually
2. verify package-name install in a clean OpenCode environment
3. configure `NPM_TOKEN` in GitHub Actions secrets
4. create a git tag such as `v0.2.0` after the manual publish flow is proven

## Notes

- start with manual release so packaging problems are easier to debug
- only automate npm publish once one manual publish has succeeded
- keep `npm pack` as part of CI even after publish automation is added
- CI and release workflow scaffolding now exist in the repo, but the npm publish step still depends on a configured `NPM_TOKEN`
