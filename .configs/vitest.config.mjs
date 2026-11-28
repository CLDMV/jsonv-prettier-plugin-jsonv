/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /.configs/vitest.config.mjs
 *	@Date: 2026-04-25T21:21:04-07:00 (1777177264)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-11-07T22:14:09-08:00 (1794118449)
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
// `--mode=dist` (npm run test:dist) leaves the -dev condition off, so tests that import "@cldmv/prettier-plugin-jsonv" by name run
// against the build in dist/ instead of src/.
export default defineConfig(({ mode }) =>
	mergeConfig(
		mode === "dist" ? {} : devCondition({ root }),
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
	)
);
