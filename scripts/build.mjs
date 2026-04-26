/**
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /scripts/build.mjs
 *	@Date: 2026-04-25 16:34:42 -07:00 (1777160082)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-04-25 21:13:26 -07:00 (1777176806)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
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
	minifyWhitespace: true
	// legalComments: "none",
	// banner: "/*! For licenses information, see LICENSE */"
});
