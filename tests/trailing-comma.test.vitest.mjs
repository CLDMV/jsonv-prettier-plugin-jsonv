/**
 * Targeted tests for prettier's `trailingComma` option (issue #27). Like
 * prettier's JS printer for object and array literals, `"all"` and `"es5"`
 * put a comma after the last entry of every object or array that breaks
 * across lines, `"none"` never does, and commas in the source are normalized
 * to the option. Formatting stays lossless: the value never changes and
 * comments around the last entry stay in place.
 */
import { describe, it, expect } from "vitest";
import { format, evaluate, commentTexts, trailingCommas } from "./helpers/jsonv.mjs";

const tabs = { useTabs: true };
const values = ["all", "es5", "none"];

/**
 * Format with tabs and the given `trailingComma`, and check the result keeps
 * the value and comments of the input and is idempotent.
 * @param {string} input
 * @param {string} trailingComma
 * @returns {Promise<string>}
 */
async function formatChecked(input, trailingComma) {
	const options = { ...tabs, trailingComma };
	const output = await format(input, options);
	expect(evaluate(output, 2025)).toEqual(evaluate(input, 2025));
	expect(commentTexts(output, 2025)).toEqual(commentTexts(input, 2025));
	expect(await format(output, options)).toBe(output);
	return output;
}

/**
 * Expected output for "all"/"es5" and for "none", given as lines where `,?`
 * marks a trailing comma.
 * @param {string[]} lines
 * @returns {{ all: string, es5: string, none: string }}
 */
function expected(lines) {
	const text = lines.join("\n") + "\n";
	const withComma = text.replaceAll(",?", ",");
	return { all: withComma, es5: withComma, none: text.replaceAll(",?", "") };
}

describe("the trailingComma option", () => {
	it("defaults to prettier's default, 'all'", async () => {
		expect(await format("{a:1,b:[1,2]}", tabs)).toBe("{\n\ta: 1,\n\tb: [\n\t\t1,\n\t\t2,\n\t],\n}\n");
		expect(await format("{a:1,b:[1,2]}", tabs)).toBe(await format("{a:1,b:[1,2]}", { ...tabs, trailingComma: "all" }));
	});

	describe.each(values)("trailingComma: %s", (trailingComma) => {
		it("adds or removes the trailing comma whatever the source had", async () => {
			const want = expected(["{", "\ta: 1,", "\tb: [", "\t\t1,", "\t\t2,?", "\t],", "\tc: {", "\t\td: 2,?", "\t},?", "}"])[trailingComma];
			expect(await formatChecked("{a:1,b:[1,2,],c:{d:2,},}", trailingComma)).toBe(want);
			expect(await formatChecked("{a:1,b:[1,2],c:{d:2}}", trailingComma)).toBe(want);
		});

		it("breaks a single-line source container and treats it as broken", async () => {
			const want = expected(["[", "\t1,", "\t{", "\t\ta: 2,?", "\t},?", "]"])[trailingComma];
			expect(await formatChecked("[1, { a: 2 }]", trailingComma)).toBe(want);
		});

		it("adds the comma at every level of nested containers", async () => {
			const want = expected(["[", "\t1,", "\t[", "\t\t2,", "\t\t[", "\t\t\t3,?", "\t\t],?", "\t],?", "]"])[trailingComma];
			expect(await formatChecked("[1,[2,[3]]]", trailingComma)).toBe(want);
		});

		it("never adds one to an empty container, even one holding comments", async () => {
			const want = expected(["{", "\ta: { },", "\tb: [],", "\tc: {", "\t\t/* block */", "\t},", "\td: [", "\t\t// line", "\t],?", "}"])[trailingComma];
			expect(await formatChecked("{ a: {}, b: [ ], c: { /* block */ }, d: [ // line\n ] }", trailingComma)).toBe(want);
			expect(await formatChecked("[]", trailingComma)).toBe("[]\n");
			expect(await formatChecked("{}", trailingComma)).toBe("{ }\n");
			expect(await format("{}", { trailingComma, bracketSpacing: false })).toBe("{}\n");
		});

		it("never adds one to a root that is not a container", async () => {
			expect(await formatChecked("'root'", trailingComma)).toBe("'root'\n");
			expect(await formatChecked("0x2A", trailingComma)).toBe("0x2A\n");
		});

		it("keeps blank lines and the other entries' commas unchanged", async () => {
			const want = expected(["{", "\ta: 1,", "", "\tb: 2,?", "}"])[trailingComma];
			expect(await formatChecked("{a: 1,\n\n\nb: 2}", trailingComma)).toBe(want);
		});
	});
});

describe("comments around the last entry", () => {
	describe.each(values)("trailingComma: %s", (trailingComma) => {
		it.each([
			["a line comment after the last entry's comma", "{\n\ta: 1, // c\n}", ["{", "\ta: 1,? // c", "}"]],
			["a line comment after a last entry without a comma", "{\n\ta: 1 // c\n}", ["{", "\ta: 1,? // c", "}"]],
			["a line comment before a comma on the next line", "{\n\ta: 1 // c\n\t,\n}", ["{", "\ta: 1,? // c", "}"]],
			["a block comment after the last entry's comma", "{\n\ta: 1, /* c */\n}", ["{", "\ta: 1,? /* c */", "}"]],
			["a block comment before the last entry's comma", "{\n\ta: 1 /* c */,\n}", ["{", "\ta: 1 /* c */,?", "}"]],
			["a block comment after a last entry without a comma", "{\n\ta: 1 /* c */\n}", ["{", "\ta: 1 /* c */,?", "}"]],
			["two block comments after the last entry's comma", "{\n\ta: 1, /* c */ /* d */\n}", ["{", "\ta: 1,? /* c */ /* d */", "}"]],
			["a block and a line comment after the last entry", "{\n\ta: 1 /* c */ // d\n}", ["{", "\ta: 1 /* c */,? // d", "}"]],
			["a block comment before the closing bracket on the same line", "{ a: 1, /* c */ }", ["{", "\ta: 1,? /* c */", "}"]],
			["a block comment before the closing bracket, no comma", "[1 /* c */ ]", ["[", "\t1 /* c */,?", "]"]],
			["a line comment on its own line after the last entry", "{\n\ta: 1\n\t// c\n}", ["{", "\ta: 1,?", "\t// c", "}"]],
			["a block comment on its own line after the last entry", "{\n\ta: 1,\n\t/* c */\n}", ["{", "\ta: 1,?", "\t/* c */", "}"]],
			["own-line comments after a commented last entry", "[\n1, // one\n// two\n/* three */\n]", ["[", "\t1,? // one", "\t// two", "\t/* three */", "]"]],
			["a comment on the closing bracket's line", "{\n\ta: 1\n} // c", ["{", "\ta: 1,?", "} // c"]],
			["comments in a nested last entry", "{ a: [ 1 // one\n ], /* after a */ }", ["{", "\ta: [", "\t\t1,? // one", "\t],? /* after a */", "}"]]
		])("%s", async (_label, input, lines) => {
			expect(await formatChecked(input, trailingComma)).toBe(expected(lines)[trailingComma]);
		});

		it("keeps a block comment before the next entry as that entry's leading comment", async () => {
			const want = expected(["[", "\t1,", "\t/* c */ 2,?", "]"])[trailingComma];
			expect(await formatChecked("[1, /* c */ 2]", trailingComma)).toBe(want);
		});
	});
});

describe("jsonv syntax", () => {
	it("adds trailing commas that parse in every jsonv year", async () => {
		const input = "{ a: [1, { b: 2 }], c: 'x' }";
		for (let year = 2011; year <= 2025; year++) {
			const output = await format(input, { jsonvYear: year });
			expect(trailingCommas(output, year)).toEqual([
				{ multiLine: true, comma: true },
				{ multiLine: true, comma: true },
				{ multiLine: true, comma: true }
			]);
			expect(evaluate(output, year)).toEqual(evaluate(input, year));
		}
	});
});

describe("the trailingCommas test helper", () => {
	it("reports single-line and broken containers and ignores comments", () => {
		expect(trailingCommas("[[1,], [2], [3 /* , */], {a: 1, /* c */}, [\n4\n], [\n5, // ,\n]]", 2025)).toEqual([
			{ multiLine: true, comma: false },
			{ multiLine: false, comma: true },
			{ multiLine: false, comma: false },
			{ multiLine: false, comma: false },
			{ multiLine: false, comma: true },
			{ multiLine: true, comma: false },
			{ multiLine: true, comma: true }
		]);
	});
});
