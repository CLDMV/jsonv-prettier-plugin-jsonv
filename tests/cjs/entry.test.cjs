/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /tests/cjs/entry.test.cjs
 *	@Date: 2026-11-01T12:08:22-08:00 (1793563702)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-11-01T12:09:04-08:00 (1793563744)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

/**
 * @fileoverview Checks the built dist/ output: dist/index.cjs is the verbatim copy of
 * src/index.cjs, it exposes the same plugin as dist/index.mjs, and Prettier formats a
 * .jsonv file through a CommonJS config that require()s the plugin. Run after
 * `npm run build` (see `test:dist`).
 */
"use strict";

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const prettier = require("prettier");

const root = path.resolve(__dirname, "../..");
const dist = path.join(root, "dist");
// Scratch for the CJS config smoke test; tmp/ is gitignored.
const scratch = path.join(root, "tmp", `cjs-entry-test-${process.pid}`);

after(() => fs.rmSync(scratch, { recursive: true, force: true }));

test("dist/index.cjs is a verbatim copy of src/index.cjs", () => {
	assert.equal(fs.readFileSync(path.join(dist, "index.cjs"), "utf8"), fs.readFileSync(path.join(root, "src/index.cjs"), "utf8"));
});

test("the CJS entry exposes the same plugin as the ESM entry", async () => {
	const esm = await import(pathToFileURL(path.join(dist, "index.mjs")).href);
	const cjs = require(path.join(dist, "index.cjs"));
	assert.equal(cjs, esm.default);
	assert.equal(cjs, esm.plugin);
	assert.deepEqual(Object.keys(cjs).sort(), ["languages", "options", "parsers", "printers"]);
	assert.equal(cjs.languages, esm.default.languages);
	assert.equal(cjs.parsers, esm.default.parsers);
	assert.equal(cjs.printers, esm.default.printers);
	assert.equal(cjs.options, esm.default.options);
});

test("Prettier formats through a CommonJS config that require()s the plugin", async () => {
	fs.mkdirSync(scratch, { recursive: true });
	const config = path.join(scratch, "prettier.config.cjs");
	fs.writeFileSync(
		config,
		`module.exports = { plugins: [require(${JSON.stringify(path.join(dist, "index.cjs"))})], useTabs: true, trailingComma: "none" };\n`
	);
	const file = path.join(scratch, "data.jsonv");
	fs.writeFileSync(file, "{a:1,b:[2,3]}");

	const options = await prettier.resolveConfig(file, { config });
	assert.equal(options.plugins.length, 1);
	const out = await prettier.format(fs.readFileSync(file, "utf8"), { ...options, filepath: file });
	assert.equal(out, "{\n\ta: 1,\n\tb: [\n\t\t2,\n\t\t3\n\t]\n}\n");
});
