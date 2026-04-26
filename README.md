# @cldmv/prettier-plugin-jsonv

[![npm version](https://img.shields.io/npm/v/@cldmv/prettier-plugin-jsonv)](https://www.npmjs.com/package/@cldmv/prettier-plugin-jsonv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

MIT