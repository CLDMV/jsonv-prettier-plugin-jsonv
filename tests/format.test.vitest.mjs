/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /tests/format.test.vitest.mjs
 *	@Date: 2026-04-25T21:21:04-07:00 (1777177264)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-10-02T12:20:26-07:00 (1790968826)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import prettier from "prettier";
import plugin from "../src/index.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = resolve(__dirname, "fixtures");
const configPath = resolve(__dirname, "../.configs/.prettierrc");

const unformatted = readFileSync(resolve(fixturesDir, "unformatted.jsonv"), "utf8");
const formatted = readFileSync(resolve(fixturesDir, "formatted.jsonv"), "utf8");

async function format(text) {
	// Resolve the project's .prettierrc (applies *.jsonv overrides by filename)
	const config = await prettier.resolveConfig(resolve(fixturesDir, "file.jsonv"), {
		config: configPath
	});
	return prettier.format(text, { ...config, plugins: [plugin] });
}

describe("@cldmv/prettier-plugin-jsonv", () => {
	it("unformatted fixture has formatting issues (differs from expected)", () => {
		expect(unformatted).not.toBe(formatted);
	});

	it("formats unformatted jsonv to match the formatted fixture", async () => {
		const result = await format(unformatted);
		expect(result).toBe(formatted);
	});

	it("is idempotent — formatting an already-formatted file produces no changes", async () => {
		const result = await format(formatted);
		expect(result).toBe(formatted);
	});
});
