/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /tests/cjs-entry.test.vitest.mjs
 *	@Date: 2026-11-01T12:07:43-08:00 (1793563663)
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
 * @fileoverview The CommonJS entry from source: src/index.cjs loads src/index.mjs through
 * require(esm) and exports the plugin object itself, and the package name resolves to it
 * under the prettier-plugin-jsonv-dev condition. tests/cjs/entry.test.cjs checks the
 * built dist/ copy.
 */
import { describe, it, expect, afterEach } from "vitest";
import { createRequire } from "node:module";
import prettier from "prettier";
import plugin, { plugin as namedPlugin } from "../src/index.mjs";

const require = createRequire(import.meta.url);
const entry = require.resolve("../src/index.cjs");
const requireModule = Object.getOwnPropertyDescriptor(process.features, "require_module");

afterEach(() => {
	Object.defineProperty(process.features, "require_module", requireModule);
	delete require.cache[entry];
});

describe("src/index.cjs", () => {
	// Vitest loads ../src/index.mjs through its own module graph and require() goes through
	// Node's loader, so the two sides are separate instances of the same module: compare
	// their shape, not object identity.
	it("exports the plugin object, with the same shape as the ESM entry", () => {
		expect(plugin).toBe(namedPlugin);
		const cjs = require("../src/index.cjs");
		expect(Object.keys(cjs).sort()).toEqual(Object.keys(plugin).sort());
		expect(Object.keys(cjs).sort()).toEqual(["languages", "options", "parsers", "printers"]);
		expect(cjs.languages).toEqual(plugin.languages);
		expect(cjs.options).toEqual(plugin.options);
		expect(Object.keys(cjs.parsers)).toEqual(Object.keys(plugin.parsers));
		expect(Object.keys(cjs.printers.jsonv).sort()).toEqual(Object.keys(plugin.printers.jsonv).sort());
		expect(cjs.parsers.jsonv.astFormat).toBe("jsonv");
	});

	it("is what require() of the package name returns under the dev condition", () => {
		expect(require.resolve("@cldmv/prettier-plugin-jsonv")).toBe(entry);
		expect(require("@cldmv/prettier-plugin-jsonv")).toBe(require("../src/index.cjs"));
	});

	it("formats through prettier when loaded with require()", async () => {
		const cjs = require("../src/index.cjs");
		const out = await prettier.format("{a:1,b:[2,3]}", { parser: "jsonv", plugins: [cjs], trailingComma: "none" });
		expect(out).toBe("{\n\ta: 1,\n\tb: [\n\t\t2,\n\t\t3\n\t]\n}\n".replace(/\t/g, "  "));
	});

	it("fails early with ERR_REQUIRE_ESM on a Node.js without require(esm)", () => {
		Object.defineProperty(process.features, "require_module", { configurable: true, enumerable: true, value: false });
		delete require.cache[entry];
		expect(() => require("../src/index.cjs")).toThrow(
			expect.objectContaining({
				code: "ERR_REQUIRE_ESM",
				message: expect.stringContaining("require() needs Node.js >=22.22.0")
			})
		);
	});
});
