# @cldmv/prettier-plugin-jsonv

[![npm version]][npm_version_url] [![npm downloads]][npm_downloads_url] [![GitHub downloads]][github_downloads_url] [![Last commit]][last_commit_url] [![npm last update]][npm_last_update_url]

[![Contributors]][contributors_url] [![Sponsor shinrai]][sponsor_url]

A Prettier plugin for formatting [JSONV](https://github.com/CLDMV/jsonv) files.

## ✨ What's New

### Latest: v1.1.4 (October 2026)

- **Header tooling on fix-headers 2.2.0** — the `@cldmv/fix-headers` dev dependency moves to 2.2.0, so `@Last modified by` follows content edits only, and `@cldmv/configs` moves to 1.2.4, which turns off the forced author updates. The header pass was re-run and every file already matched, so nothing was restamped. No plugin code, published file or runtime dependency changed (#51, #54).
- [View full v1.1.4 Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.1.4.md)

### Recent Releases

- **v1.1.3** (October 2026) — the CI `✅ Required PR Check` mirror job runs on every path instead of being skipped on in-repo PRs (#49) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.1.3.md))
- **v1.1.2** (October 2026) — dev-dependency bumps, including `@cldmv/vitest-runner` 1.5.1 and `@cldmv/jsonv` 1.1.1 in development (#46, #47) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.1.2.md))
- **v1.1.1** (October 2026) — uniform file headers from the shared CLDMV fix-headers config, and a skipped PR run no longer satisfies Required PR Check (#44, #45) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.1.1.md))
- **v1.1.0** (September 2026) — lossless printing from `@cldmv/jsonv`'s source AST (fixing key, comment and number corruption), `trailingComma` support and a typed plugin (#26, #31, #32) ([Changelog](https://github.com/CLDMV/jsonv-prettier-plugin-jsonv/blob/master/docs/changelog/v1/v1.1.0.md))

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
import jsonv from "prettier-plugin-jsonv";

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
	plugins: ["prettier-plugin-jsonv"],
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

| Option         | Type    | Default | Description                                    |
| -------------- | ------- | ------- | ---------------------------------------------- |
| `jsonvYear`    | number  | 2025    | The year to use for JSONV features (2015-2025) |
| `strictBigInt` | boolean | false   | Whether to enforce strict BigInt parsing       |

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
