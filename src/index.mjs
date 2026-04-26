/**
 *	@Project: @cldmv/prettier-plugin-jsonv
 *	@Filename: /src/index.mjs
 *	@Date: 2026-04-25 21:03:02 -07:00 (1777176182)
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-04-25 21:13:41 -07:00 (1777176821)
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 */

/*! For licenses information, see LICENSE */

import { Parser } from "@cldmv/jsonv/parser";
import { doc } from "prettier";

const { hardline, indent, join } = doc.builders;

/**
 * @internal
 * @param {string} key
 * @returns {boolean}
 */
function isValidIdentifier(key) {
	return typeof key === "string" && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

/**
 * @internal
 * @param {string} str
 * @param {'"' | "'"} quote
 * @returns {string}
 */
function escapeString(str, quote) {
	let result = "";
	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		const code = str.charCodeAt(i);
		switch (char) {
			case "\\":
				result += "\\\\";
				break;
			case "\b":
				result += "\\b";
				break;
			case "\f":
				result += "\\f";
				break;
			case "\n":
				result += "\\n";
				break;
			case "\r":
				result += "\\r";
				break;
			case "\t":
				result += "\\t";
				break;
			case '"':
				result += quote === '"' ? '\\"' : '"';
				break;
			case "'":
				result += quote === "'" ? "\\'" : "'";
				break;
			default:
				if (code < 0x20 || code === 0x7f) {
					result += "\\u" + code.toString(16).padStart(4, "0");
				} else {
					result += char;
				}
		}
	}
	return result;
}

/**
 * @internal
 * @param {string} key
 * @param {import('prettier').ParserOptions} options
 * @returns {string}
 */
function printKey(key, options) {
	if (isValidIdentifier(key)) return key;
	const quote = options.singleQuote ? "'" : '"';
	return `${quote}${escapeString(String(key), quote)}${quote}`;
}

/**
 * @internal
 * @param {{ value: unknown, raw?: string }} node
 * @param {import('prettier').ParserOptions} options
 * @returns {import('prettier').Doc}
 */
function printLiteralNode(node, options) {
	const { value, raw } = node;
	if (value === null) return "null";
	if (typeof value === "boolean") return String(value);
	if (typeof value === "bigint") return `${value}n`;
	if (typeof value === "number") {
		if (Number.isNaN(value)) return "NaN";
		if (!Number.isFinite(value)) return value > 0 ? "Infinity" : "-Infinity";
		return String(value);
	}
	if (typeof value === "string") {
		const quote = options.singleQuote ? "'" : '"';
		return `${quote}${escapeString(value, quote)}${quote}`;
	}
	return raw;
}

/**
 * @internal
 * @param {import('prettier').AstPath} path
 * @param {import('prettier').ParserOptions} options
 * @param {Function} print
 * @returns {import('prettier').Doc}
 */
function printNode(path, options, print) {
	const node = path.getValue();
	if (!node) return "";

	switch (node.type) {
		case "Program":
			return [path.call(print, "body"), hardline];

		case "ObjectExpression": {
			const { properties } = node;
			if (properties.length === 0) {
				return options.bracketSpacing ? "{ }" : "{}";
			}
			return ["{", indent([hardline, join([",", hardline], path.map(print, "properties"))]), hardline, "}"];
		}

		case "Property": {
			const rawKey = node.key;
			const key = typeof rawKey === "string" ? rawKey : String(rawKey?.value ?? rawKey);
			return [printKey(key, options), ": ", path.call(print, "value")];
		}

		case "ArrayExpression": {
			const { elements } = node;
			if (elements.length === 0) return "[]";
			return ["[", indent([hardline, join([",", hardline], path.map(print, "elements"))]), hardline, "]"];
		}

		case "Literal":
			return printLiteralNode(node, options);

		case "Identifier":
			return node.name;

		case "MemberExpression":
			return [path.call(print, "object"), ".", node.property.name];

		case "TemplateLiteral": {
			const { quasis, expressions } = node;
			const parts = [];
			for (let i = 0; i < quasis.length; i++) {
				parts.push(quasis[i].value.raw);
				if (i < expressions.length) {
					parts.push(path.call(print, "expressions", i), "}");
				}
			}
			return parts;
		}

		default:
			throw new Error(`Unknown jsonv AST node type: ${node.type}`);
	}
}

/** @type {import('prettier').Plugin} */
const plugin = {
	languages: [
		{
			name: "jsonv",
			parsers: ["jsonv"],
			extensions: [".jsonv"],
			vscodeLanguageIds: ["jsonv"]
		}
	],

	parsers: {
		jsonv: {
			/**
			 * @param {string} text
			 * @param {import('prettier').ParserOptions} options
			 * @returns {object}
			 */
			parse(text, options) {
				const parser = new Parser(text, {
					year: options?.jsonvYear ?? 2025,
					strictBigInt: options?.strictBigInt ?? false,
					mode: "jsonv",
					preserveComments: true,
					tolerant: false
				});

				const result = parser.parse();

				if (result.errors?.length > 0) {
					const err = result.errors[0];
					throw new SyntaxError(`${err.message} at line ${err.loc.start.line}, column ${err.loc.start.column}`);
				}

				const { program } = result;

				// The parser discards comments during skipComments(), but the token stream
				// (parser.tokens) retains them. Extract and attach them for prettier's
				// comment attachment system.
				const comments = parser.tokens
					.filter((t) => t.type === "LineComment" || t.type === "BlockComment")
					.map((t) => ({
						type: t.type === "LineComment" ? "Line" : "Block",
						value: String(t.value),
						loc: t.loc
					}));

				if (comments.length > 0) {
					program.comments = comments;
				}

				program.loc = {
					start: { line: 1, column: 0, offset: 0 },
					end: program.body?.loc?.end ?? { line: 1, column: 0, offset: text.length }
				};

				return program;
			},

			astFormat: "jsonv",

			/**
			 * @param {object} node
			 * @returns {number}
			 */
			locStart(node) {
				return node.loc?.start?.offset ?? 0;
			},

			/**
			 * @param {object} node
			 * @returns {number}
			 */
			locEnd(node) {
				return node.loc?.end?.offset ?? 0;
			}
		}
	},

	printers: {
		jsonv: {
			print: printNode,

			/**
			 * @param {import('prettier').AstPath} commentPath
			 * @param {import('prettier').ParserOptions} options
			 * @returns {import('prettier').Doc}
			 */
			printComment(commentPath, options) {
				const comment = commentPath.getValue();
				if (comment.type === "Line") {
					const text = comment.value.trim();
					return text ? `// ${text}` : "//";
				}
				return `/*${comment.value}*/`;
			},

			/**
			 * @param {object} node
			 * @returns {boolean}
			 */
			canAttachComment(node) {
				return !!node.type && node.type !== "TemplateElement";
			},

			/**
			 * @param {object} node
			 * @returns {boolean}
			 */
			isBlockComment(node) {
				return node.type === "Block";
			}
		}
	},

	options: {
		jsonvYear: {
			type: "int",
			category: "jsonv",
			default: 2025,
			description: "Target ES year for jsonv features (2011-2025)"
		},
		strictBigInt: {
			type: "boolean",
			category: "jsonv",
			default: false,
			description: "Require explicit 'n' suffix for large integers"
		}
	}
};

export default plugin;
