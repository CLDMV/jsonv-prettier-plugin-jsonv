/**
 * Round-trip tests: formatting must never change what a document means or
 * drop any of its content. For every valid fixture of the jsonv corpus
 * (vendored in tests/fixtures/jsonv, see its README) and every edge-case
 * fixture in tests/fixtures/lossless:
 *
 * - evaluating the formatted text gives the same value as the input;
 * - every comment survives, with the same text, in the same order;
 * - formatting is idempotent.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format, evaluate, commentTexts } from "./helpers/jsonv.mjs";

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

		describe.each(layouts)("$label", ({ options }) => {
			it("evaluates to the same value after formatting", async () => {
				const output = await format(input, { ...base, ...options });
				expect(evaluate(output, year)).toEqual(evaluate(input, year));
			});

			it("keeps every comment, in order", async () => {
				const output = await format(input, { ...base, ...options });
				expect(commentTexts(output, year)).toEqual(commentTexts(input, year));
			});

			it("is idempotent", async () => {
				const output = await format(input, { ...base, ...options });
				expect(await format(output, { ...base, ...options })).toBe(output);
			});
		});
	});
});
