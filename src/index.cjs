/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /src/index.cjs
 *	@Date: 2026-11-01T12:07:26-08:00 (1793563646)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-11-01T13:14:07-08:00 (1793567647)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

/**
 * CommonJS entry point: a thin, synchronous wrapper around the ESM plugin.
 *
 * Node's `require()` loads an ES module synchronously as long as its module graph
 * has no top-level await, so this file re-exports the plugin from ./index.mjs
 * instead of tsup bundling a second copy for CommonJS. It returns the default
 * export, the plugin object (`languages`, `parsers`, `printers`, `options`), which
 * is what Prettier expects from a CommonJS plugin.
 *
 * Node.js versions without require(esm) would fail with a bare ERR_REQUIRE_ESM,
 * so the check below fails early with a message that says what to do instead.
 *
 * tsup.config.mjs copies this file verbatim to dist/index.cjs. Its
 * `require("./index.mjs")` resolves to the sibling src/index.mjs in a checkout
 * and to the bundle in dist/.
 *
 * @module @cldmv/prettier-plugin-jsonv
 */
"use strict";

if (!process.features?.require_module) {
	const error = new Error(
		`@cldmv/prettier-plugin-jsonv: require() needs Node.js >=22.22.0 (this is ${process.version}). On older Node.js, load the package with import() instead.`
	);
	error.code = "ERR_REQUIRE_ESM";
	throw error;
}

module.exports = require("./index.mjs").default;
