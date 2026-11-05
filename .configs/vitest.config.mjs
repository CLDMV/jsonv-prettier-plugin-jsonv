/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /.configs/vitest.config.mjs
 *	@Date: 2026-04-25T21:21:04-07:00 (1777177264)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-11-01T12:08:56-08:00 (1793563736)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

import { defineConfig, mergeConfig } from "vitest/config";
import { devCondition } from "@cldmv/configs/vitest.config.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Anchor the project root to the package directory so include/exclude work no
// matter what cwd vitest is invoked from.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// devCondition() puts the package's prettier-plugin-jsonv-dev condition (which routes the "."
// export to src/) ahead of Vite's default conditions for the client and SSR resolvers, and on
// the worker command line, so Node's own resolver (including require() of the package from
// src/index.cjs tests) loads src/ too.
export default mergeConfig(
	devCondition({ root }),
	defineConfig({
		root,
		test: {
			include: ["tests/**/*.test.vitest.mjs"],
			exclude: ["node_modules"],
			environment: "node",
			testTimeout: 30000,
			reporters: ["dot"],
			coverage: {
				provider: "v8",
				include: ["src/**"],
				exclude: ["**/*.json", "tests/**"],
				reporter: ["text", "html", "json-summary", "json"]
			}
		}
	})
);
