/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /scripts/build.mjs
 *	@Date: 2026-04-25T16:34:42-07:00 (1777160082)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-10-02T12:20:14-07:00 (1790968814)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

import { build } from "esbuild";
import { resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

await build({
	entryPoints: [resolve(root, "src/index.mjs")],
	outfile: resolve(root, "dist/index.mjs"),
	bundle: false,
	format: "esm",
	// sourcemap: true,
	sourcemap: false,
	minifyWhitespace: true
	// legalComments: "none",
	// banner: "/*! For licenses information, see LICENSE */"
});
