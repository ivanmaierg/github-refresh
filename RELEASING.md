# Releasing

How to ship a new version of GitHub Auto-Refresh. The release workflow is fully automated — bump the version, write a changelog entry, push the tag, and GitHub Actions handles the rest.

## TL;DR

```bash
# 1. Move "Unreleased" entries into a new version section in CHANGELOG.md
# 2. Bump version, create commit + tag in one step:
pnpm release:patch        # 0.1.0 → 0.1.1
# or
pnpm release:minor        # 0.1.0 → 0.2.0
# or
pnpm release:major        # 0.1.0 → 1.0.0

# 3. Push commit + tag (this triggers the Release workflow):
git push --follow-tags
```

A few minutes later, a GitHub Release appears with the prebuilt zip attached and the changelog notes in the body. Then upload that same zip to the Chrome Web Store dashboard and submit for review.

## Versioning

We follow [Semantic Versioning](https://semver.org/):

| Bump | When |
|---|---|
| **patch** (`0.1.0 → 0.1.1`) | Bug fixes, no behavior change for users |
| **minor** (`0.1.0 → 0.2.0`) | New user-visible feature, backward compatible |
| **major** (`0.1.0 → 1.0.0`) | Breaking change to settings shape, removed feature, or anything that requires user re-onboarding |

The Chrome Web Store doesn't enforce semver, but it makes the changelog readable and the [Unreleased]/compare links in `CHANGELOG.md` keep working without manual surgery.

## Step-by-step

### 1. Update the changelog

Open [`CHANGELOG.md`](CHANGELOG.md). Move every line under `## [Unreleased]` into a new section above it:

```md
## [Unreleased]

## [0.2.0] - 2026-06-15

### Added
- ...

### Fixed
- ...
```

Use the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

Update the compare links at the bottom:

```md
[Unreleased]: https://github.com/ivanmaierg/github-refresh/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ivanmaierg/github-refresh/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ivanmaierg/github-refresh/releases/tag/v0.1.0
```

Commit this on `main` (or in the same commit as the version bump — see below).

### 2. Bump the version + tag

The `release:*` scripts use `npm version` under the hood, which:

1. Updates `package.json` (and `package-lock.json` if present).
2. Creates a commit `chore: release v<new>`.
3. Creates an annotated git tag `v<new>`.

```bash
pnpm release:patch       # or release:minor / release:major
```

If you've already committed the changelog separately, that's fine — the bump commit will be on top of it.

### 3. Push

```bash
git push --follow-tags
```

`--follow-tags` pushes both the commit and the new annotated tag in one command.

### 4. Watch the release workflow

Open <https://github.com/ivanmaierg/github-refresh/actions>. The **Release** workflow runs on the new tag and:

1. Installs deps.
2. Generates icons.
3. Typechecks.
4. Builds.
5. Verifies `package.json` version matches the tag.
6. Zips `dist/` → `releases/github-refresh-v<version>.zip`.
7. Creates a GitHub Release with the zip attached and the matching `CHANGELOG.md` section as the body.

If the version-vs-tag check fails, the most likely cause is that you tagged manually without bumping `package.json`. Fix with:

```bash
git tag -d v<x.y.z>                        # delete local tag
git push --delete origin v<x.y.z>          # delete remote tag (if pushed)
# then bump properly with pnpm release:* and push again
```

### 5. Upload to the Chrome Web Store

1. Download the zip from the GitHub Release page.
2. Open the [CWS dashboard](https://chrome.google.com/webstore/devconsole/) → the existing `github-refresh` item.
3. **Package** tab → **Upload new package** → drag the zip.
4. **Submit for review**.

You don't need to re-fill the listing or privacy fields — they're sticky across versions. Only the package changes.

## Hotfix release

If the latest release ships broken:

1. `git checkout -b hotfix/v<x.y.z+1> v<broken>`
2. Cherry-pick or write the fix.
3. Add a `## [<x.y.z+1>] - <date>` section to `CHANGELOG.md`.
4. `pnpm release:patch` → `git push --follow-tags`.
5. Open a PR back to `main` so the fix doesn't get lost.

## Pre-release / beta

Append a pre-release suffix in `package.json` (`0.2.0-beta.1`) and tag matching (`v0.2.0-beta.1`). The release workflow will publish it; mark **Pre-release** on the GitHub Release after it's created (or set `prerelease: true` in `release.yml` for non-stable tags — currently not configured).

## Reverting a release

GitHub Releases can be deleted, but the tag stays on the commit. If you need to fully invalidate a version, also delete the tag (`git push --delete origin v<x.y.z>`) and bump to the next patch — never reuse a version number, since users may have already cached the broken zip.
