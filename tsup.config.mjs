/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /tsup.config.mjs
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
 * @fileoverview Bundler config: produces the published dist/ output from source.
 *
 *  - dist/index.mjs: the plugin, bundled from src/index.mjs and minified with names kept. The `@cldmv/jsonv` and
 *    `prettier` peers stay external (tsup leaves peerDependencies out of the bundle).
 *  - dist/index.cjs: not built. src/index.cjs is a thin, hand-written CJS entry that `require()`s the sibling
 *    ./index.mjs, and onSuccess copies it verbatim next to the bundle, so it never duplicates the plugin.
 *
 * Sourcemaps are generated for local debugging and left out of the tarball by package.json's `files`.
 */
import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
	entry: { index: "src/index.mjs" },
	format: ["esm"],
	outDir: "dist",
	target: "node18",
	platform: "node",
	splitting: false,
	sourcemap: true,
	dts: false,
	minify: true,
	keepNames: true,
	removeNodeProtocol: false,
	clean: true,
	outExtension() {
		return { js: ".mjs" };
	},
	onSuccess() {
		copyFileSync("src/index.cjs", "dist/index.cjs");
	}
});
