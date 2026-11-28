/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /src/index.cjs
 *	@Date: 2026-11-01T12:07:26-08:00 (1793563646)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-11-01T16:29:24-08:00 (1793579364)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

/**
 * CommonJS entry point: the generic CLDMV shim over the ESM build.
 *
 * The package exports one value, the plugin object (`languages`, `parsers`, `printers`, `options`), as both
 * `default` and `plugin`. The shim counts the two aliases once, so `require("@cldmv/prettier-plugin-jsonv")`
 * returns the plugin object itself, which is what Prettier expects from a CommonJS plugin.
 *
 * tsup.config.mjs copies this file verbatim to dist/index.cjs. Its `require("./index.mjs")` resolves to the
 * sibling src/index.mjs in a checkout and to the built ESM entry in dist/.
 *
 * @module @cldmv/prettier-plugin-jsonv
 */
"use strict";

if (!process.features?.require_module) {
	const error = new Error(
		`@cldmv/prettier-plugin-jsonv: require() needs Node.js ^20.19.0 or >=22.13.0 (this is ${process.version}). On older Node.js, load the package with import() instead.`
	);
	error.code = "ERR_REQUIRE_ESM";
	throw error;
}

// Same exports as `import`. One distinct exported value (aliases of it count once) comes back as that value,
// so require(x)(...) works; anything else comes back as the module object ({ default, ...named }).
const esm = require("./index.mjs");
const values = new Set(
	Object.keys(esm)
		.filter((key) => key !== "__esModule")
		.map((key) => esm[key])
);
module.exports = values.size === 1 ? values.values().next().value : esm;
