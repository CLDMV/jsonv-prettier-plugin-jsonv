# @cldmv/prettier-plugin-jsonv

[![npm version]][npm_version_url] [![npm downloads]][npm_downloads_url] [![GitHub downloads]][github_downloads_url] [![Last commit]][last_commit_url] [![npm last update]][npm_last_update_url]

[![Contributors]][contributors_url] [![Sponsor shinrai]][sponsor_url]

A Prettier plugin for formatting [JSONV](https://github.com/CLDMV/jsonv) files.

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