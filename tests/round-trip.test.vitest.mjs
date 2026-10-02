/**
 *
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /tests/round-trip.test.vitest.mjs
 *	@Date: 2026-09-28T20:02:02+00:00 (1790625722)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-10-02T12:20:27-07:00 (1790968827)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

/**
 * Round-trip tests: formatting must never change what a document means or
 * drop any of its content. For every valid fixture of the jsonv corpus
 * (vendored in tests/fixtures/jsonv, see its README) and every edge-case
 * fixture in tests/fixtures/lossless:
 *
 * - evaluating the formatted text gives the same value as the input;
 * - every comment survives, with the same text, in the same order;
 * - formatting is idempotent;
 * - a trailing comma follows the last entry of exactly the objects and arrays
 *   that break across lines, or of none of them under `trailingComma: "none"`.
 *
 * Each check runs for every `trailingComma` value (issue #27).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format, evaluate, commentTexts, trailingCommas } from "./helpers/jsonv.mjs";

const fixturesDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "fixtures");

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listJsonv(dir) {
	return readdirSync(dir)
		.flatMap((name) => {
			const path = join(dir, name);
			if (statSync(path).isDirectory()) return listJsonv(path);
			return path.endsWith(".jsonv") ? [path] : [];
		})
		.sort();
}

const corpusDir = join(fixturesDir, "jsonv");
const corpus = listJsonv(corpusDir).map((path) => {
	const name = relative(corpusDir, path);
	// Corpus fixtures live under their feature year (2011/, 2015/, ...).
	return { name: `jsonv/${name}`, path, year: Number(name.split("/")[0]) };
});

const losslessDir = join(fixturesDir, "lossless");
const edgeCases = listJsonv(losslessDir).map((path) => ({ name: `lossless/${relative(losslessDir, path)}`, path, year: 2025 }));

const layouts = [
	{ label: "default options", options: {} },
	{ label: "tabs, printWidth 140", options: { useTabs: true, printWidth: 140 } }
];

const trailingCommaValues = ["all", "es5", "none"];

describe("round-trip across the jsonv fixture corpus and edge cases", () => {
	it("finds the vendored corpus and the edge-case fixtures", () => {
		expect(corpus.length).toBe(27);
		expect(edgeCases.length).toBeGreaterThanOrEqual(12);
	});

	describe.each([...corpus, ...edgeCases])("$name", ({ path, year }) => {
		const input = readFileSync(path, "utf8");
		// The CRLF fixture keeps its line endings only when prettier is told to
		// (see crlf.jsonv in tests/fixtures/lossless/README.md).
		const base = { jsonvYear: year, ...(path.endsWith("crlf.jsonv") ? { endOfLine: "auto" } : {}) };

		describe.each(layouts)("$label", ({ options: layout }) => {
			describe.each(trailingCommaValues)("trailingComma: %s", (trailingComma) => {
				const options = { ...base, ...layout, trailingComma };

				it("evaluates to the same value after formatting", async () => {
					const output = await format(input, options);
					expect(evaluate(output, year)).toEqual(evaluate(input, year));
				});

				it("keeps every comment, in order", async () => {
					const output = await format(input, options);
					expect(commentTexts(output, year)).toEqual(commentTexts(input, year));
				});

				it("is idempotent", async () => {
					const output = await format(input, options);
					expect(await format(output, options)).toBe(output);
				});

				it("puts a trailing comma after the last entry of broken containers only", async () => {
					const output = await format(input, options);
					for (const { multiLine, comma } of trailingCommas(output, year)) {
						expect(comma).toBe(trailingComma !== "none" && multiLine);
					}
				});
			});
		});
	});
});
