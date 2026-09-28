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

import { parseToAst } from "@cldmv/jsonv/parser";
import { doc, util } from "prettier";

const { group, hardline, ifBreak, indent, join } = doc.builders;

/**
 * @import { AstPath, BooleanSupportOption, Doc, IntSupportOption, Parser, ParserOptions, Printer, SupportLanguage } from "prettier"
 * @import { ArrayExpression, Comment, Expression, Identifier, Literal, MemberExpression, ObjectExpression, ParseError, ParseOptions, Program, Property, SourceLocation, TemplateLiteral } from "@cldmv/jsonv"
 */

/**
 * An ES year `@cldmv/jsonv` can target.
 * @typedef {NonNullable<ParseOptions["year"]>} JsonvYear
 */

/**
 * The plugin's own formatting options, passed to prettier next to its
 * built-in options (`prettier.format(text, { parser: "jsonv", plugins: [plugin], jsonvYear: 2021 })`).
 * @typedef {object} JsonvOptions
 * @property {JsonvYear} [jsonvYear] - Target ES year for jsonv features. Default `2025`.
 * @property {boolean} [strictBigInt] - Require an explicit `n` suffix for integers outside the safe range. Default `false`.
 */

/**
 * The fields prettier's comment attachment (and this plugin) set on a node.
 * @typedef {object} JsonvNodeAttachment
 * @property {JsonvComment[]} [comments] - The comments attached to this node.
 */

/**
 * A comment as prettier's comment attachment sees it: `@cldmv/jsonv`'s
 * `Comment` plus the fields prettier sets while attaching it.
 * @typedef {object} JsonvCommentAttachment
 * @property {boolean} [leading] - Printed before the node it is attached to.
 * @property {boolean} [trailing] - Printed after the node it is attached to.
 * @property {boolean} [printed] - Set once the comment has been printed.
 * @property {JsonvSyntaxNode} [marker] - For a dangling comment: the entry or expression it follows.
 * @property {JsonvSyntaxNode} [enclosingNode] - The innermost node that contains the comment.
 * @property {JsonvSyntaxNode} [precedingNode] - The child of `enclosingNode` just before the comment.
 * @property {JsonvSyntaxNode} [followingNode] - The child of `enclosingNode` just after the comment.
 * @property {undefined} [comments] - Comments are never attached to comments.
 */

/**
 * @typedef {Comment & JsonvCommentAttachment} JsonvComment
 * @typedef {Program & JsonvNodeAttachment} JsonvProgram
 * @typedef {ObjectExpression & JsonvNodeAttachment} JsonvObjectExpression
 * @typedef {Property & JsonvNodeAttachment} JsonvProperty
 * @typedef {Literal & JsonvNodeAttachment} JsonvLiteral
 * @typedef {Identifier & JsonvNodeAttachment} JsonvIdentifier
 * @typedef {MemberExpression & JsonvNodeAttachment} JsonvMemberExpression
 * @typedef {TemplateLiteral & JsonvNodeAttachment} JsonvTemplateLiteral
 */

/**
 * An `ArrayExpression`. `@cldmv/jsonv` types `elements` ESTree-style, with
 * `null` for a hole, but jsonv has no holes: its parser reads a value for
 * every element, so the list never contains `null`.
 * @typedef {Omit<ArrayExpression, "elements"> & { elements: Expression[] } & JsonvNodeAttachment} JsonvArrayExpression
 */

/**
 * A node of the positioned AST `@cldmv/jsonv`'s `parseToAst` returns.
 * @typedef {JsonvProgram | JsonvObjectExpression | JsonvArrayExpression | JsonvProperty | JsonvLiteral | JsonvIdentifier | JsonvMemberExpression | JsonvTemplateLiteral} JsonvSyntaxNode
 */

/**
 * A node the printer is handed: a syntax node, or a comment (for `printComment`).
 * @typedef {JsonvSyntaxNode | JsonvComment} JsonvNode
 */

/**
 * The options the parser and printer receive: prettier's resolved options
 * plus this plugin's, which prettier fills from their defaults.
 * @typedef {ParserOptions<JsonvNode> & JsonvOptions} JsonvParserOptions
 */

/**
 * The `print` callback prettier passes to `Printer#print`.
 * @typedef {Parameters<Printer<JsonvNode>["print"]>[2]} JsonvPrint
 */

/**
 * The plugin object: its language, `jsonv` parser and printer, and its options.
 * Assignable to prettier's `Plugin`.
 * @typedef {object} JsonvPlugin
 * @property {SupportLanguage[]} languages - The `jsonv` language (`.jsonv` files).
 * @property {{ jsonv: Parser<JsonvNode> }} parsers - The `jsonv` parser.
 * @property {{ jsonv: Printer<JsonvNode> }} printers - The `jsonv` printer (the parser's `astFormat`).
 * @property {{ jsonvYear: IntSupportOption, strictBigInt: BooleanSupportOption }} options - The option definitions behind {@link JsonvOptions}.
 */

/**
 * Printing is lossless: every literal, key and identifier is printed from its
 * source text, never from its evaluated value, and every comment is attached
 * through prettier's comment API so it is printed exactly once, in order.
 * Only layout (indentation, line breaks, blank-line runs, spacing inside
 * template interpolations) is normalized, plus the unquoting of quoted keys
 * whose content is a plain identifier.
 */

/**
 * Child keys of each node type, in source order. Template quasis are left out:
 * they carry no comments and are printed from the source text.
 * @internal
 * @type {Record<string, string[]>}
 */
const VISITOR_KEYS = {
	Program: ["body"],
	ObjectExpression: ["properties"],
	Property: ["key", "value"],
	ArrayExpression: ["elements"],
	MemberExpression: ["object", "property"],
	TemplateLiteral: ["expressions"],
	Literal: [],
	Identifier: []
};

/**
 * Node types whose entries are separated by commas. Queried with
 * `enclosingNode?.type`, which is `undefined` for a comment outside every node.
 * @internal
 * @type {ReadonlySet<string | undefined>}
 */
const CONTAINERS = new Set(["ObjectExpression", "ArrayExpression"]);

/**
 * Characters that end a line comment (ECMAScript line terminators).
 * @internal
 */
const LINE_TERMINATOR = /[\n\r\u2028\u2029]/g;

/**
 * A quoted key may be printed unquoted when it is written without escapes and
 * its content is an identifier the jsonv lexer reads back as the same key.
 * @internal
 */
const IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * @internal
 * @param {{ loc?: SourceLocation }} node - Any positioned node or comment.
 * @returns {number}
 */
function locStart(node) {
	// `loc` is optional on @cldmv/jsonv's `ASTNode`, but parseToAst positions every node.
	return /** @type {SourceLocation} */ (node.loc).start.offset;
}

/**
 * @internal
 * @param {{ loc?: SourceLocation }} node - Any positioned node or comment.
 * @returns {number}
 */
function locEnd(node) {
	// `loc` is optional on @cldmv/jsonv's `ASTNode`, but parseToAst positions every node.
	return /** @type {SourceLocation} */ (node.loc).end.offset;
}

/**
 * Print a property key from its source form. A quoted key whose content is a
 * plain identifier with no escapes is unquoted (`"host"` -> `host`); this
 * keeps the key identical because jsonv evaluates both to the same string.
 * Everything else (other quoted keys, numeric and BigInt keys) is printed
 * exactly as written.
 * @internal
 * @param {JsonvLiteral} node - A `Literal` key node.
 * @returns {string}
 */
function printLiteralKey(node) {
	const { value, raw } = node;
	const quoted = raw[0] === '"' || raw[0] === "'";
	if (quoted && raw.slice(1, -1) === value && IDENTIFIER.test(value)) {
		return value;
	}
	return raw;
}

/**
 * Return the index of the `${` or closing backtick that ends the template
 * text starting at `pos`, skipping escape sequences.
 * @internal
 * @param {string} text
 * @param {number} pos
 * @returns {number}
 */
function findTemplateTextEnd(text, pos) {
	while (pos < text.length && text[pos] !== "`" && !(text[pos] === "$" && text[pos + 1] === "{")) {
		pos += text[pos] === "\\" ? 2 : 1;
	}
	return pos;
}

/**
 * Return the index of the `}` that closes a template interpolation, starting
 * from the end of its expression and skipping whitespace and comments.
 * @internal
 * @param {string} text
 * @param {number} pos
 * @returns {number}
 */
function findInterpolationEnd(text, pos) {
	while (pos < text.length && text[pos] !== "}") {
		if (text.startsWith("//", pos)) {
			// A line comment inside an interpolation always ends before its `}`,
			// so a line terminator follows it and `exec` cannot return `null`.
			LINE_TERMINATOR.lastIndex = pos;
			pos = /** @type {RegExpExecArray} */ (LINE_TERMINATOR.exec(text)).index;
		} else if (text.startsWith("/*", pos)) {
			pos = text.indexOf("*/", pos + 2) + 2;
		} else {
			pos++;
		}
	}
	return pos;
}

/**
 * Print the comments of the current node that are neither leading nor
 * trailing (and match `filter`), joined by hard line breaks.
 * @internal
 * @param {AstPath<JsonvNode>} path
 * @param {ParserOptions<JsonvNode>} options
 * @param {(comment: JsonvComment) => boolean} [filter]
 * @returns {Doc[]}
 */
function printDanglingComments(path, options, filter = () => true) {
	/** @type {Doc[]} */
	const parts = [];
	if (!path.node.comments) return parts;
	path.each((commentPath) => {
		const comment = commentPath.node;
		if (comment.leading || comment.trailing || !filter(comment)) return;
		comment.printed = true;
		parts.push(printComment(commentPath, options));
	}, "comments");
	return parts;
}

/**
 * Print an object or array: one entry per line, and at most one blank line
 * kept between entries where the source had one.
 *
 * The last entry gets a trailing comma per prettier's `trailingComma` option,
 * as prettier's JS printer does for object and array literals: `"all"` and
 * `"es5"` add one when the container breaks across lines, `"none"` never
 * does, and an empty container never gets one. Commas in the source are not
 * kept: the option normalizes them, adding or removing the trailing comma.
 * Every jsonv year allows trailing commas, and the plugin always parses in
 * `jsonv` mode, so no target syntax forbids the comma.
 *
 * The comma goes where the source's own comma would: after a same-line block
 * comment written before it (`a: 1 /* c *\/,`), before one written after it
 * (`a: 1, /* c *\/`, see handleEndOfLineComment), and before any line or
 * own-line comment, which prettier prints as a line suffix.
 * @internal
 * @param {AstPath<JsonvNode>} path - A path to an `ObjectExpression` or `ArrayExpression`.
 * @param {ParserOptions<JsonvNode>} options
 * @param {JsonvPrint} print
 * @param {"properties" | "elements"} key - The name of that node's entry list.
 * @param {Array<Property | Expression>} entries - That entry list.
 * @param {string} open
 * @param {string} close
 * @returns {Doc}
 */
function printContainer(path, options, print, key, entries, open, close) {
	if (entries.length === 0) {
		const dangling = printDanglingComments(path, options);
		if (dangling.length === 0) {
			return open === "{" && options.bracketSpacing ? "{ }" : open + close;
		}
		return [open, indent([hardline, join(hardline, dangling)]), hardline, close];
	}

	// Comments written after an entry's comma, on the same line (see handleEndOfLineComment).
	const afterComma = entries.map((entry) => printDanglingComments(path, options, (comment) => comment.marker === entry));
	const trailingComma = options.trailingComma === "none" ? "" : ifBreak(",");
	/** @type {Doc[]} */
	const parts = [];
	path.each((entryPath, index) => {
		parts.push(print());
		const isLast = index === entries.length - 1;
		parts.push(isLast ? trailingComma : ",");
		for (const comment of afterComma[index]) {
			parts.push(" ", comment);
		}
		if (!isLast) {
			parts.push(hardline);
			if (util.isNextLineEmpty(options.originalText, locEnd(entryPath.node))) {
				parts.push(hardline);
			}
		}
	}, key);
	return group([open, indent([hardline, ...parts]), hardline, close]);
}

/**
 * Print a template literal with interpolations. The text between the
 * delimiters is sliced from the source (so escapes and line breaks are kept
 * verbatim) and the backticks, `${` and `}` are printed explicitly; the
 * quasis' own `raw` spans are not relied on.
 * @internal
 * @param {AstPath<JsonvNode>} path - A path to a `TemplateLiteral`.
 * @param {ParserOptions<JsonvNode>} options
 * @param {JsonvPrint} print
 * @param {JsonvTemplateLiteral} node - That `TemplateLiteral`.
 * @returns {Doc}
 */
function printTemplateLiteral(path, options, print, node) {
	const text = options.originalText;
	/** @type {Doc[]} */
	const parts = ["`"];
	let pos = locStart(node) + 1;
	node.expressions.forEach((expression, index) => {
		const textEnd = findTemplateTextEnd(text, pos);
		const comments = printDanglingComments(path, options, (comment) => comment.marker === expression);
		parts.push(text.slice(pos, textEnd), "${", print(["expressions", index]));
		for (const comment of comments) {
			parts.push(" ", comment, hardline);
		}
		parts.push("}");
		pos = findInterpolationEnd(text, locEnd(expression)) + 1;
	});
	parts.push(text.slice(pos, findTemplateTextEnd(text, pos)), "`");
	return parts;
}

/**
 * @internal
 * @param {AstPath<JsonvNode>} path
 * @param {ParserOptions<JsonvNode>} options
 * @param {JsonvPrint} print
 * @returns {Doc}
 */
function printNode(path, options, print) {
	const { node } = path;

	switch (node.type) {
		case "Program":
			return [print("body"), hardline];

		case "ObjectExpression":
			return printContainer(path, options, print, "properties", node.properties, "{", "}");

		case "ArrayExpression":
			return printContainer(path, options, print, "elements", node.elements, "[", "]");

		case "Property":
			return [print("key"), ": ", print("value")];

		case "Literal":
			return path.key === "key" ? printLiteralKey(node) : node.raw;

		case "Identifier":
			return node.name;

		case "MemberExpression":
			return [print("object"), ".", print("property")];

		case "TemplateLiteral":
			return printTemplateLiteral(path, options, print, node);

		default:
			throw new Error(`Unknown jsonv AST node type: ${node.type}`);
	}
}

/**
 * Place a line comment that sits inside a construct printed on one line
 * (between a key and its value, inside a member access, or inside a template
 * interpolation), where prettier's default placement would move it to the end
 * of the output line and merge it with any other line comment there.
 * @internal
 * @param {JsonvComment} comment
 * @param {string} text
 * @returns {boolean} `true` when the comment was attached here.
 */
function handleLineComment(comment, text) {
	const { enclosingNode, precedingNode, followingNode } = comment;
	if (comment.type !== "Line" || !enclosingNode) return false;

	switch (enclosingNode.type) {
		case "Property":
		case "MemberExpression":
			// `key // c` + newline + `: value` -> `key: // c` + newline + `value`
			util.addLeadingComment(followingNode, comment);
			return true;

		case "TemplateLiteral":
			if (precedingNode && locStart(comment) < findInterpolationEnd(text, locEnd(precedingNode))) {
				// After an expression, inside its interpolation: printed there.
				util.addDanglingComment(enclosingNode, comment, precedingNode);
			} else {
				// Before the expression of a later interpolation.
				util.addLeadingComment(followingNode, comment);
			}
			return true;

		default:
			return false;
	}
}

/**
 * Keep a block comment written after an object/array entry's comma
 * (`a: 1, /* note *\/`) after the comma, instead of prettier's default of
 * moving it in front of the comma. Line comments already print there.
 * @internal
 * @param {JsonvComment} comment
 * @param {string} text
 * @returns {boolean} `true` when the comment was attached here.
 */
function handleCommentAfterComma(comment, text) {
	const { enclosingNode, precedingNode } = comment;
	if (comment.type === "Block" && precedingNode && CONTAINERS.has(enclosingNode?.type)) {
		// Only `false` for a start index outside the text, and a node's end offset is inside it.
		const commaIndex = /** @type {number} */ (util.getNextNonSpaceNonCommentCharacterIndex(text, locEnd(precedingNode)));
		if (text[commaIndex] === "," && commaIndex < locStart(comment)) {
			util.addDanglingComment(enclosingNode, comment, precedingNode);
			return true;
		}
	}
	return false;
}

/**
 * A comment that ends a line: after an entry's comma, or inside a construct
 * printed on one line.
 * @internal
 * @param {any} comment
 * @param {string} text
 * @returns {boolean} `true` when the comment was attached here.
 */
function handleEndOfLineComment(comment, text) {
	return handleCommentAfterComma(comment, text) || handleLineComment(comment, text);
}

/**
 * A comment followed by more code on its line. After the last entry's comma
 * (`[1, /* note *\/ ]`) it stays after the comma like an end-of-line one;
 * before a following entry it is left to prettier, which makes it that
 * entry's leading comment.
 * @internal
 * @param {any} comment
 * @param {string} text
 * @returns {boolean} `true` when the comment was attached here.
 */
function handleRemainingComment(comment, text) {
	return (!comment.followingNode && handleCommentAfterComma(comment, text)) || handleLineComment(comment, text);
}

/**
 * Print a comment from its source text. A line comment gets a space after
 * `//` when it starts with a letter or digit (`//note` -> `// note`); its text
 * is otherwise kept as written, minus trailing whitespace. Block comments are
 * printed verbatim.
 * @internal
 * @param {AstPath<JsonvNode>} commentPath
 * @param {ParserOptions<JsonvNode>} options
 * @returns {Doc}
 */
function printComment(commentPath, options) {
	const comment = commentPath.node;
	if (comment.type === "Line") {
		const text = comment.value.trimEnd();
		return /^[\p{L}\p{N}]/u.test(text) ? `// ${text}` : `//${text}`;
	}
	return options.originalText.slice(locStart(comment), locEnd(comment));
}

/** @type {JsonvPlugin} */
export const plugin = {
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
			 * Parse with `@cldmv/jsonv`'s positioned AST: every node carries `loc`
			 * offsets, literals carry `raw`, and all comments are returned.
			 * @param {string} text
			 * @param {JsonvParserOptions} options
			 * @returns {JsonvProgram}
			 */
			parse(text, options) {
				/** @type {{ program: JsonvProgram, comments: JsonvComment[], errors: ParseError[] }} */
				const { program, comments, errors } = parseToAst(text, {
					year: options.jsonvYear,
					strictBigInt: options.strictBigInt,
					mode: "jsonv"
				});

				if (errors.length > 0) {
					const err = errors[0];
					throw new SyntaxError(`${err.message} at line ${err.loc.start.line}, column ${err.loc.start.column}`);
				}

				program.comments = comments;
				return program;
			},

			astFormat: "jsonv",
			locStart,
			locEnd
		}
	},

	printers: {
		jsonv: {
			print: printNode,

			/**
			 * @param {JsonvNode} node
			 * @returns {string[]}
			 */
			getVisitorKeys(node) {
				return VISITOR_KEYS[node.type];
			},

			printComment,

			/**
			 * @param {JsonvNode} node
			 * @returns {boolean}
			 */
			canAttachComment(node) {
				return Boolean(node.type);
			},

			/**
			 * @param {JsonvNode} node
			 * @returns {boolean}
			 */
			isBlockComment(node) {
				return node.type === "Block";
			},

			handleComments: {
				ownLine: handleLineComment,
				endOfLine: handleEndOfLineComment,
				remaining: handleRemainingComment
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
