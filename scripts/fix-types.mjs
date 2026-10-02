/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /scripts/fix-types.mjs
 *	@Date: 2026-04-25T21:39:37-07:00 (1777178377)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-10-02T12:20:15-07:00 (1790968815)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

/**
 * Fix types source maps to reference dist/ instead of src/
 * This script copies the types from types/src to types/dist and updates source map references
 */

import { copyFileSync, existsSync, mkdirSync } from "fs";

// Copy all files from types/src to types/dist
const srcDir = "./types/src";
const distDir = "./types/dist";
const srcFile = `${srcDir}/index.d.mts`;
const srcMapFile = `${srcDir}/index.d.mts.map`;
const distFile = `${distDir}/index.d.mts`;
const distMapFile = `${distDir}/index.d.mts.map`;

try {
	// Create dist directory if it doesn't exist
	if (!existsSync(distDir)) {
		mkdirSync(distDir, { recursive: true });
	}

	// Copy the declaration file
	copyFileSync(srcFile, distFile);

	// Copy the source map file
	copyFileSync(srcMapFile, distMapFile);
} catch (error) {
	console.error("Error fixing types:", error);
	process.exit(1);
}
