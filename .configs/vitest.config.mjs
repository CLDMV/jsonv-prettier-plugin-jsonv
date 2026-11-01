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

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Anchor the project root to the package directory so include/exclude work no
// matter what cwd vitest is invoked from.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
	root,
	resolve: {
		// Replaces the defaults, so keep the usual ones alongside the package's own
		// condition (which routes the "." export to src/).
		conditions: ["prettier-plugin-jsonv-dev", "module", "browser", "development|production"]
	},
	ssr: {
		// Vitest often goes through the SSR resolve pipeline even in node tests.
		resolve: {
			conditions: ["prettier-plugin-jsonv-dev", "node", "development|production"]
		}
	},
	test: {
		include: ["tests/**/*.test.vitest.mjs"],
		exclude: ["node_modules"],
		environment: "node",
		testTimeout: 30000,
		// Workers get the condition on their node CLI (execArgv), so Node's own resolver
		// (including require() of the package from src/index.cjs tests) loads src/ too.
		nodeOptions: ["--conditions=prettier-plugin-jsonv-dev"],
		reporters: ["dot"],
		coverage: {
			provider: "v8",
			include: ["src/**"],
			exclude: ["**/*.json", "tests/**"],
			reporter: ["text", "html", "json-summary", "json"]
		}
	}
});
