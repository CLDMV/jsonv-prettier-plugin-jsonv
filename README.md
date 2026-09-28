# @cldmv/prettier-plugin-jsonv

[![npm version]][npm_version_url] [![npm downloads]][npm_downloads_url] [![GitHub downloads]][github_downloads_url] [![Last commit]][last_commit_url] [![npm last update]][npm_last_update_url]

[![Contributors]][contributors_url] [![Sponsor shinrai]][sponsor_url]

A Prettier plugin for formatting [JSONV](https://github.com/CLDMV/jsonv) files.

## ✨ What's New

### Latest: v1.1.0 (September 2026)

- **Formatting is now lossless** — every version through v1.0.6 could silently corrupt a `.jsonv` file on format: unquoted keys collapsed to `"[object Object]"`, comments were dropped, and numbers were rewritten from their evaluated value (`1_000_000` → `1000000`, `0xFF` → `255`). The printer is rewritten around `@cldmv/jsonv` 1.1.0's `parseToAst()` so keys, numbers, strings and comments are all printed from their source text, with round-trip tests over the full jsonv fixture corpus. Requires `@cldmv/jsonv` 1.1.0 or later (#26, fixes #25).
- **Trailing commas now follow Prettier's `trailingComma` option** — `"all"` (Prettier's default) and `"es5"` add a comma after the last entry of a multi-line object or array, `"none"` never does, matching Prettier's own JavaScript behavior instead of silently ignoring the setting (#31, fixes #27).
- [View full v1.1.0 Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.1.0.md)

### Recent Releases

- **v1.0.6** (September 2026) — GPG signing wired into the hotfix redirector, and the dev toolchain re-aligned on vitest 5.0.0 (#20, #23) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.0.6.md))
- **v1.0.5** (September 2026) — hotfix: vitest and @vitest/coverage-v8 bumped to 5.0.0 for a path-traversal advisory in the dev toolchain (#22) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.0.5.md))
- **v1.0.4** (September 2026) — dependency and CI-tooling updates, including `@cldmv/jsonv` to 1.0.2 (#9, #14, #15) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.0.4.md))
- **v1.0.3** (August 2026) — CI concurrency fix so release-relevant runs are never superseded (#7, #8) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.0.3.md))

📚 **For complete version history, see [docs/changelog/](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/tree/master/docs/changelog/) and the [GitHub Releases](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/releases).**

## Features

- Formats `.jsonv` files using the @cldmv/jsonv parser
- Supports all ES2015-2025 features (JSON5, binary/octal literals, BigInt, numeric separators, etc.)
- Configurable year-based feature detection
- Proper handling of comments and whitespace
- Integrates with Prettier's configuration system

## Installation

```bash
npm install --save-dev @cldmv/prettier-plugin-jsonv prettier @cldmv/jsonv
```

## Usage

Add the plugin to your Prettier configuration:

### Using `.prettierrc.mjs` or `prettier.config.mjs`:

```javascript
import jsonv from 'prettier-plugin-jsonv';

export default {
  plugins: [jsonv],
  overrides: [
    {
      files: "*.jsonv",
      options: {
        jsonvYear: 2025,
        strictBigInt: false
      }
    }
  ]
};
```

### Using `.prettierrc` or `prettier.config.js`:

```javascript
module.exports = {
  plugins: ['prettier-plugin-jsonv'],
  overrides: [
    {
      files: "*.jsonv",
      options: {
        jsonvYear: 2025,
        strictBigInt: false
      }
    }
  ]
};
```

## Configuration Options

| Option          | Type   | Default | Description                               |
|----------------|--------|---------|-----------------------------------------|
| `jsonvYear`    | number | 2025    | The year to use for JSONV features (2015-2025) |
| `strictBigInt`   | boolean| false   | Whether to enforce strict BigInt parsing     |

### Trailing commas

The plugin honours Prettier's [`trailingComma`](https://prettier.io/docs/options#trailing-commas) option the way Prettier's JavaScript printer does for object and array literals:

- `"all"` (Prettier's default) and `"es5"` put a comma after the last entry of every object or array that breaks across lines. Non-empty objects and arrays are always printed one entry per line, so only empty ones (`{ }`, `[]`) are printed on a single line, and they never get a comma.
- `"none"` never adds one.

Trailing commas already in the source are not kept as written: the option normalizes them, adding or removing the comma after the last entry. Every jsonv year (2011-2025) allows trailing commas, so the comma never makes a document invalid, and it never changes the parsed value. Comments next to the last entry stay in place: `a: 1, // note` keeps the comment after the comma, `a: 1 /* note */,` keeps it before.

## License

[![GitHub license]][github_license_url] [![npm license]][npm_license_url]

Apache-2.0 © Shinrai / CLDMV

[npm version]: https://img.shields.io/npm/v/%40cldmv%2Fprettier-plugin-jsonv.svg?style=for-the-badge&logo=npm&logoColor=white&labelColor=CB3837
[npm_version_url]: https://www.npmjs.com/package/@cldmv/prettier-plugin-jsonv
[npm downloads]: https://img.shields.io/npm/dm/%40cldmv%2Fprettier-plugin-jsonv.svg?style=for-the-badge&logo=npm&logoColor=white&labelColor=CB3837
[npm_downloads_url]: https://www.npmjs.com/package/@cldmv/prettier-plugin-jsonv
[npm last update]: https://img.shields.io/npm/last-update/%40cldmv%2Fprettier-plugin-jsonv?style=for-the-badge&logo=npm&logoColor=white&labelColor=CB3837
[npm_last_update_url]: https://www.npmjs.com/package/@cldmv/prettier-plugin-jsonv
[npm license]: https://img.shields.io/npm/l/%40cldmv%2Fprettier-plugin-jsonv.svg?style=for-the-badge&logo=npm&logoColor=white&labelColor=CB3837
[npm_license_url]: https://www.npmjs.com/package/@cldmv/prettier-plugin-jsonv
[github downloads]: https://img.shields.io/github/downloads/CLDMV/jsonv-prettier-plugin-jsonv/total?style=for-the-badge&logo=github&logoColor=white&labelColor=181717
[github_downloads_url]: https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/releases
[last commit]: https://img.shields.io/github/last-commit/CLDMV/jsonv-prettier-plugin-jsonv?style=for-the-badge&logo=github&logoColor=white&labelColor=181717
[last_commit_url]: https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/commits
[github license]: https://img.shields.io/github/license/CLDMV/jsonv-prettier-plugin-jsonv.svg?style=for-the-badge&logo=github&logoColor=white&labelColor=181717
[github_license_url]: https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/HEAD/LICENSE
[contributors]: https://img.shields.io/github/contributors/CLDMV/jsonv-prettier-plugin-jsonv.svg?style=for-the-badge&logo=github&logoColor=white&labelColor=181717
[contributors_url]: https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/graphs/contributors
[sponsor shinrai]: https://img.shields.io/github/sponsors/shinrai?style=for-the-badge&logo=githubsponsors&logoColor=white&labelColor=EA4AAA&label=Sponsor
[sponsor_url]: https://github.com/sponsors/shinrai