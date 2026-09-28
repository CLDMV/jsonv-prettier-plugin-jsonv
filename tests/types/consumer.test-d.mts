/**
 * @fileoverview Type-level consumer test. It imports the BUILT declarations through the
 * package's own `exports` (a self-reference by package name resolves to
 * `types/dist/index.d.mts`) and uses the plugin the way a prettier consumer would. It is
 * compiled with `tsc --noEmit` by `npm run test:types`; every `@ts-expect-error` must still
 * see an error.
 */
import * as prettier from "prettier";
import type { AstPath, Doc, Options, Parser, Plugin, Printer, SupportOption } from "prettier";
import plugin from "@cldmv/prettier-plugin-jsonv";
import type {
	JsonvComment,
	JsonvNode,
	JsonvOptions,
	JsonvParserOptions,
	JsonvPlugin,
	JsonvProgram,
	JsonvYear
} from "@cldmv/prettier-plugin-jsonv";

// The plugin is a prettier plugin, with no casts.
plugin satisfies Plugin;
plugin satisfies JsonvPlugin;
const asPlugin: Plugin<JsonvNode> = plugin;
const asPlugins: Options["plugins"] = [plugin];
void [asPlugin, asPlugins];

// Its parser, printer and option definitions are typed, not just "some plugin".
plugin.parsers.jsonv satisfies Parser<JsonvNode>;
plugin.parsers.jsonv.astFormat satisfies string;
plugin.printers.jsonv satisfies Printer<JsonvNode>;
plugin.languages[0]?.extensions satisfies string[] | undefined;
plugin.options.jsonvYear.type satisfies "int";
plugin.options.jsonvYear.default satisfies number | undefined;
plugin.options.strictBigInt.type satisfies "boolean";
// Every JsonvOptions key has an option definition, and nothing else does.
plugin.options satisfies Record<keyof JsonvOptions, SupportOption>;
const optionNames: Array<keyof typeof plugin.options> = ["jsonvYear", "strictBigInt"] satisfies Array<keyof JsonvOptions>;
void optionNames;
// @ts-expect-error -- the plugin defines no "json" parser.
void plugin.parsers.json;

// Format with the plugin and its own options.
const options: JsonvOptions = { jsonvYear: 2021, strictBigInt: true };
export const formatted: Promise<string> = prettier.format("{ a: 1 }", { parser: "jsonv", plugins: [plugin], ...options });
export const formattedDefaults: Promise<string> = prettier.format("{ a: 1 }", {
	parser: "jsonv",
	plugins: [plugin],
	...({} satisfies JsonvOptions)
});
export const formattedInvalid: Promise<string> = prettier.format("{ a: 1 }", {
	parser: "jsonv",
	plugins: [plugin],
	// @ts-expect-error -- 1999 is not a year @cldmv/jsonv supports.
	...({ jsonvYear: 1999 } satisfies JsonvOptions)
});

// The options are closed and typed.
2025 satisfies JsonvYear;
2011 satisfies JsonvYear;
// @ts-expect-error -- 1999 is not a year @cldmv/jsonv supports.
const badYear: JsonvOptions = { jsonvYear: 1999 };
// @ts-expect-error -- strictBigInt is a boolean.
const badBigInt: JsonvOptions = { strictBigInt: "yes" };
// @ts-expect-error -- unknown option (a typo of jsonvYear).
const typo: JsonvOptions = { jsonvYaer: 2021 };
void [badYear, badBigInt, typo];

// The parser and printer are typed against the jsonv AST.
declare const parserOptions: JsonvParserOptions;
parserOptions.jsonvYear satisfies JsonvYear | undefined;
parserOptions.originalText satisfies string;
const parsed: JsonvNode | Promise<JsonvNode> = plugin.parsers.jsonv.parse("{ a: 1 }", parserOptions);
void parsed;

declare const program: JsonvProgram;
program.body satisfies { type: string };
program.comments satisfies JsonvComment[] | undefined;

declare const commentPath: AstPath<JsonvNode>;
const printed: Doc | undefined = plugin.printers.jsonv.printComment?.(commentPath, parserOptions);
void printed;

// A comment carries its jsonv text plus prettier's attachment fields.
declare const comment: JsonvComment;
comment.type satisfies "Line" | "Block";
comment.value satisfies string;
comment.leading satisfies boolean | undefined;
comment.enclosingNode satisfies JsonvNode | undefined;
