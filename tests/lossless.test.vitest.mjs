/**
 * Targeted tests for lossless printing (issue #25): keys, literals, comments,
 * templates and references are printed from their source text, and every
 * comment is kept in place.
 *
 * These expectations are written without trailing commas, so every format
 * here runs with `trailingComma: "none"`; trailing commas are covered in
 * trailing-comma.test.vitest.mjs.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";
import plugin from "../src/index.mjs";
import { format as formatJsonv, evaluate } from "./helpers/jsonv.mjs";

const fixturesDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "fixtures");
const tabs = { useTabs: true };
const noTrailingComma = { trailingComma: "none" };

/**
 * Format with the plugin, without trailing commas unless `options` says otherwise.
 * @param {string} text
 * @param {object} [options]
 * @returns {Promise<string>}
 */
function format(text, options = {}) {
	return formatJsonv(text, { ...noTrailingComma, ...options });
}

/** A `\u` escape prefix, built so no tool rewrites it into the character itself. */
const U = "\\" + "u";

/**
 * Format `{ key: value }` entries (given as source text) and return the
 * printed entries, one per line, without indentation.
 * @param {string} body
 * @param {object} [options]
 * @returns {Promise<string[]>}
 */
async function printedEntries(body, options = {}) {
	const output = await format(`{\n${body}\n}`, { ...tabs, ...options });
	return output
		.split("\n")
		.slice(1, -2)
		.map((line) => line.replace(/^\t/, ""));
}

describe("issue #25 reproduction", () => {
	const input = readFileSync(resolve(fixturesDir, "lossless/issue-25.jsonv"), "utf8");

	it("prints keys, numbers and comments from the source", async () => {
		expect(await format(input, tabs)).toBe(
			[
				"{",
				"\t// the port",
				"\tport: 8080,",
				'\thost: "x", /* block */',
				"\tbig: 1_000_000,",
				"\tbits: 0b1111_0000,",
				"\thex: 0xFF,",
				"\turl: `http://${host}:${port}`,",
				"\tref: host,",
				"\tquoted: true",
				"}",
				""
			].join("\n")
		);
	});

	it("never prints a stringified key object", async () => {
		expect(await format(input)).not.toContain("[object Object]");
	});

	it("evaluates to the same value", async () => {
		expect(evaluate(await format(input), 2025)).toEqual(evaluate(input, 2025));
	});
});

describe("keys", () => {
	it("prints identifier and keyword keys as written", async () => {
		const keys = ["port: 1,", "$dollar: 2,", "_under: 3,", "camelCase9: 4,", "true: 5,", "false: 6,", "null: 7,", "Infinity: 8,", "NaN: 9"];
		expect(await printedEntries(keys.join(" "))).toEqual(keys);
	});

	it("prints numeric and BigInt keys from their source text", async () => {
		const keys = ["3: 1,", "0x10: 2,", "7n: 3,", "1.5: 4,", "-1: 5,", "1_000: 6,", "0b11: 7,", "0o7: 8"];
		expect(await printedEntries(keys.join(" "))).toEqual(keys);
	});

	it("unquotes a quoted key only when its content is a plain identifier without escapes", async () => {
		const input = [`"plain": 1,`, `'single': 2,`, `"true": 3,`, `"$x": 4,`].join("\n");
		expect(await printedEntries(input)).toEqual(["plain: 1,", "single: 2,", "true: 3,", "$x: 4"]);
	});

	it("keeps every other quoted key exactly as written", async () => {
		const keys = [
			`"has space": 1,`,
			`'single quoted space': 2,`,
			`"a${U}0062": 3,`,
			`'it\\'s': 4,`,
			`"say \\"hi\\"": 5,`,
			`"1abc": 6,`,
			`"with-dash": 7,`,
			`"": 8`
		];
		expect(await printedEntries(keys.join("\n"))).toEqual(keys);
	});

	it("keeps the evaluated keys identical", async () => {
		const input = `{ plain: 1, "quoted": 2, 'q': 3, "a${U}0062": 4, 0x10: 5, 7n: 6, true: 7, "true": 8 }`;
		expect(evaluate(await format(input), 2025)).toEqual(evaluate(input, 2025));
	});
});

describe("literals", () => {
	it("prints every number form from its source text", async () => {
		const numbers = [
			"1_000_000",
			"0b1111_0000",
			"0B1010",
			"0xFF",
			"0xff",
			"0xFF_AA_BB",
			"0o755",
			"0O17",
			"0755",
			"123n",
			"9_007_199_254_740_993n",
			"0xFFFFFFFFFFFFFFFFn",
			"0b1n",
			"0o777n",
			"9007199254740993",
			"Infinity",
			"-Infinity",
			"NaN",
			"-NaN",
			"+1000",
			"-42",
			".5",
			"5.",
			"-.25",
			"1e10",
			"1E-5",
			"2.5e+3",
			"-0",
			"3.141592653589793238"
		];
		const entries = numbers.map((raw, index) => `n${index}: ${raw}${index < numbers.length - 1 ? "," : ""}`);
		expect(await printedEntries(entries.join(" "))).toEqual(entries);
	});

	it("prints strings with their quote style and escapes", async () => {
		const strings = [
			`"double"`,
			`'single'`,
			`"it's"`,
			`'say "hi"'`,
			`"say \\"hi\\""`,
			`'it\\'s'`,
			`"tab\\there\\nnewline \\\\ \\/ \\b \\f \\r \\v \\0"`,
			`'\\x41\\x42'`,
			`"${U}00e9${U}20AC"`,
			`"café"`,
			`""`,
			"`plain template`",
			"`a \\` backtick and \\${not interpolated}`"
		];
		const entries = strings.map((raw, index) => `s${index}: ${raw}${index < strings.length - 1 ? "," : ""}`);
		expect(await printedEntries(entries.join("\n"))).toEqual(entries);
	});

	it("ignores singleQuote: strings are never requoted", async () => {
		const input = `{ a: "double", b: 'single' }`;
		const expected = `{\n\ta: "double",\n\tb: 'single'\n}\n`;
		expect(await format(input, { ...tabs, singleQuote: true })).toBe(expected);
		expect(await format(input, { ...tabs, singleQuote: false })).toBe(expected);
	});

	it("keeps line continuations and multi-line templates verbatim", async () => {
		const input = '{\n\ta: "first \\\nsecond",\n\tb: `line one\n  line two\n\tline three`\n}\n';
		expect(await format(input, tabs)).toBe(input);
	});

	it("prints true, false and null", async () => {
		expect(await printedEntries("a: true, b: false, c: null")).toEqual(["a: true,", "b: false,", "c: null"]);
	});

	it("prints a root that is not an object", async () => {
		expect(await format("  'root'  ")).toBe("'root'\n");
		expect(await format("0x2A")).toBe("0x2A\n");
		expect(await format("[1_0, .5,]", tabs)).toBe("[\n\t1_0,\n\t.5\n]\n");
	});
});

describe("templates and references", () => {
	it("prints interpolations with explicit delimiters and verbatim text", async () => {
		const input = [
			"{",
			"host: 'h', port: 1, server: { name: 'n' },",
			"url: `http://${ host }:${  port  }/`,",
			"member: `${server.name}`,",
			"braceAfter: `${host}}`,",
			"braceBefore: `}${host}`,",
			"bracesAround: `{${host}}`,",
			"dollar: `$${port}`,",
			"escapes: `\\`${host}\\` \\${raw}`,",
			"multiLine: `a ${host}\nb ${port}\n  c`",
			"}"
		].join("\n");
		expect(await printedEntries(input.slice(2, -2))).toEqual([
			"host: 'h',",
			"port: 1,",
			"server: {",
			"\tname: 'n'",
			"},",
			"url: `http://${host}:${port}/`,",
			"member: `${server.name}`,",
			"braceAfter: `${host}}`,",
			"braceBefore: `}${host}`,",
			"bracesAround: `{${host}}`,",
			"dollar: `$${port}`,",
			"escapes: `\\`${host}\\` \\${raw}`,",
			"multiLine: `a ${host}",
			"b ${port}",
			"  c`"
		]);
	});

	it("formats a template nested inside an interpolation", async () => {
		expect(await format("{ a: `x${ `in ${ b }` }y` }", tabs)).toBe("{\n\ta: `x${`in ${b}`}y`\n}\n");
	});

	it("does not depend on the quasis' raw text or spans", async () => {
		// Simulate token spans that include the closing `}` of the previous
		// interpolation (CLDMV/jsonv#48) and quasi `raw` values that are wrong
		// altogether: the output must not change.
		const parse = plugin.parsers.jsonv.parse;
		const mangled = {
			...plugin,
			parsers: {
				jsonv: {
					...plugin.parsers.jsonv,
					parse(text, options) {
						const ast = parse(text, options);
						const visit = (node) => {
							if (!node || typeof node !== "object") return;
							if (node.type === "TemplateLiteral") {
								node.quasis.forEach((quasi, index) => {
									if (index > 0) quasi.loc.start = { ...quasi.loc.start, offset: quasi.loc.start.offset - 1 };
									quasi.value.raw = "}#";
								});
							}
							for (const [key, value] of Object.entries(node)) {
								if (key !== "loc") visit(value);
							}
						};
						visit(ast);
						return ast;
					}
				}
			}
		};
		const input = "{ h: 1, a: `x}${h}}y${ h /* c */ }z` }";
		const expected = await format(input);
		expect(expected).toBe("{\n  h: 1,\n  a: `x}${h}}y${h /* c */}z`\n}\n");
		expect(await prettier.format(input, { ...noTrailingComma, parser: "jsonv", plugins: [mangled] })).toBe(expected);
	});

	it("prints references and member access", async () => {
		const input = "{ base: { t: 1, n: { d: 2 } }, bare: base, member: base.t, deep: base . n . d }";
		expect(await printedEntries(input.slice(2, -2))).toEqual([
			"base: {",
			"\tt: 1,",
			"\tn: {",
			"\t\td: 2",
			"\t}",
			"},",
			"bare: base,",
			"member: base.t,",
			"deep: base.n.d"
		]);
		expect(evaluate(await format(input), 2025)).toEqual(evaluate(input, 2025));
	});
});

describe("comments", () => {
	it("keeps comments in every position", async () => {
		const input = [
			"// leading document comment",
			"{",
			"\t// leading property comment",
			"\ta: 1, // line after comma",
			"\tb: 2, /* block after comma */",
			"\tc: 3 /* block before comma */,",
			"\td /* between key and colon */: 4,",
			"\te: /* between colon and value */ 5,",
			"\tf // line between key and colon",
			"\t: 6,",
			"\tg: // line between colon and value",
			"\t7,",
			"\t/* before key */ h: 8,",
			"\tm: 11, /* first */ /* second */",
			"\tn: 12 // last",
			"\t// own line at the end",
			"} // trailing document comment",
			"/* after everything */"
		].join("\n");
		expect(await format(input, tabs)).toBe(
			[
				"// leading document comment",
				"{",
				"\t// leading property comment",
				"\ta: 1, // line after comma",
				"\tb: 2, /* block after comma */",
				"\tc: 3 /* block before comma */,",
				"\td /* between key and colon */: 4,",
				"\te: /* between colon and value */ 5,",
				"\tf: // line between key and colon",
				"\t6,",
				"\tg: // line between colon and value",
				"\t7,",
				"\t/* before key */ h: 8,",
				"\tm: 11, /* first */ /* second */",
				"\tn: 12 // last",
				"\t// own line at the end",
				"} // trailing document comment",
				"/* after everything */",
				""
			].join("\n")
		);
	});

	it("keeps dangling comments in empty objects and arrays", async () => {
		const input = "{ a: { /* block */ }, b: [ // line\n ], c: {\n// one\n// two\n} }";
		expect(await printedEntries(input.slice(2, -2))).toEqual([
			"a: {",
			"\t/* block */",
			"},",
			"b: [",
			"\t// line",
			"],",
			"c: {",
			"\t// one",
			"\t// two",
			"}"
		]);
	});

	it("keeps comments in arrays", async () => {
		const input = "[\n1, // one\n2, /* two */\n3 /* three */,\n// before four\n4\n// after four\n]";
		expect(await format(input, tabs)).toBe("[\n\t1, // one\n\t2, /* two */\n\t3 /* three */,\n\t// before four\n\t4\n\t// after four\n]\n");
	});

	it("keeps comments inside template interpolations", async () => {
		const input = [
			"{ h: 1,",
			"a: `${ /* lead */ h }`,",
			"b: `${h /* trail */}`,",
			"c: `${h // line after\n}`,",
			"d: `${ // line before\nh}`,",
			"e: `${h}-${h // second\n}`,",
			"f: `${h}-${ // before second\nh}` }"
		].join("\n");
		const output = await format(input, tabs);
		expect(output).toBe(
			[
				"{",
				"\th: 1,",
				"\ta: `${/* lead */ h}`,",
				"\tb: `${h /* trail */}`,",
				"\tc: `${h // line after",
				"\t}`,",
				"\td: `${// line before",
				"\th}`,",
				"\te: `${h}-${h // second",
				"\t}`,",
				"\tf: `${h}-${// before second",
				"\th}`",
				"}",
				""
			].join("\n")
		);
		expect(evaluate(output, 2025)).toEqual(evaluate(input, 2025));
	});

	it("keeps comments inside member access", async () => {
		const input = "{ b: { t: 1 }, x: b /* obj */ . /* prop */ t, y: b // after object\n.t, z: b. // after dot\nt }";
		expect(await printedEntries(input.slice(2, -2))).toEqual([
			"b: {",
			"\tt: 1",
			"},",
			"x: b /* obj */./* prop */ t,",
			"y: b.// after object",
			"t,",
			"z: b.// after dot",
			"t"
		]);
	});

	it("keeps block comments verbatim, including multi-line ones", async () => {
		const input = "{\n\ta: /* multi\n\t   line */ 1,\n\t/**\n\t * doc\n\t */\n\tb: 2\n}\n";
		expect(await format(input, tabs)).toBe(input);
	});

	it("adds a space after // only before a letter or digit and keeps the rest of the text", async () => {
		const input = "{\n//note\n//9 lives\n///triple\n//!bang\n//-----\n//\ttab\n//\n// trailing space   \na: 1 }";
		expect(await format(input, tabs)).toBe(
			"{\n\t// note\n\t// 9 lives\n\t///triple\n\t//!bang\n\t//-----\n\t//\ttab\n\t//\n\t// trailing space\n\ta: 1\n}\n"
		);
	});
});

describe("layout", () => {
	it("keeps the existing layout: one entry per line, no trailing comma", async () => {
		expect(await format("{a:1,b:[1,2,],c:{d:2,},}", tabs)).toBe("{\n\ta: 1,\n\tb: [\n\t\t1,\n\t\t2\n\t],\n\tc: {\n\t\td: 2\n\t}\n}\n");
	});

	it("keeps a single blank line between entries and collapses longer runs", async () => {
		expect(await format("{a:1,\n\nb:2,\n\n\n\nc:3,d:4}", tabs)).toBe("{\n\ta: 1,\n\n\tb: 2,\n\n\tc: 3,\n\td: 4\n}\n");
	});

	it("prints empty objects per bracketSpacing and empty arrays as []", async () => {
		expect(await format("{ a: {}, b: [ ] }", tabs)).toBe("{\n\ta: { },\n\tb: []\n}\n");
		expect(await format("{ a: {}, b: [ ] }", { ...tabs, bracketSpacing: false })).toBe("{\n\ta: {},\n\tb: []\n}\n");
	});
});

describe("parser options and errors", () => {
	it("reports parse errors with their position", async () => {
		await expect(format("{ a: 1 b: 2 }")).rejects.toThrow("Expected ',' or '}' in object at line 1, column 7");
	});

	it("reports lexical errors", async () => {
		await expect(format('{ a: "x }')).rejects.toThrow("Unterminated string");
	});

	it("gates syntax by jsonvYear", async () => {
		await expect(format("{ a: 0b1 }", { jsonvYear: 2011 })).rejects.toThrow("Binary literals not allowed");
		expect(await format("{ a: 0b1 }", { jsonvYear: 2015 })).toBe("{\n  a: 0b1\n}\n");
	});

	it("applies strictBigInt", async () => {
		await expect(format("{ a: 9007199254740993 }", { strictBigInt: true })).rejects.toThrow("outside safe integer range");
		expect(await format("{ a: 9007199254740993 }")).toBe("{\n  a: 9007199254740993\n}\n");
	});

	it("rejects an AST node type the printer does not know", async () => {
		const loc = { start: { line: 1, column: 0, offset: 0 }, end: { line: 1, column: 1, offset: 1 } };
		const broken = {
			...plugin,
			parsers: {
				jsonv: {
					...plugin.parsers.jsonv,
					parse: () => ({ type: "Program", body: { type: "Unknown", loc }, loc, comments: [] })
				}
			}
		};
		await expect(prettier.format("x", { parser: "jsonv", plugins: [broken] })).rejects.toThrow("Unknown jsonv AST node type: Unknown");
	});
});
