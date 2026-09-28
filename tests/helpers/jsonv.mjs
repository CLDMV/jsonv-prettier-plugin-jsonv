/**
 * Shared helpers for the formatter tests: format through prettier with this
 * plugin, evaluate jsonv text, and list the comments of a document.
 */
import prettier from "prettier";
import { parseToAst, parseWithOptions } from "@cldmv/jsonv";
import plugin from "../../src/index.mjs";

/**
 * Format jsonv text with the plugin.
 * @param {string} text
 * @param {object} [options] - Extra prettier options (e.g. `jsonvYear`, `useTabs`).
 * @returns {Promise<string>}
 */
export function format(text, options = {}) {
	return prettier.format(text, { parser: "jsonv", plugins: [plugin], ...options });
}

/**
 * Evaluate jsonv text for a given feature year.
 * @param {string} text
 * @param {number} year
 * @returns {unknown}
 */
export function evaluate(text, year) {
	return parseWithOptions(text, { year });
}

/**
 * The comments of a document, in source order, as `//text` / `/*text*\/`.
 * Line comments are compared on their trimmed text, since the printer may add
 * a space after `//` and drops trailing whitespace.
 * @param {string} text
 * @param {number} year
 * @returns {string[]}
 */
export function commentTexts(text, year) {
	return parseToAst(text, { year }).comments.map((comment) =>
		comment.type === "Line" ? `//${comment.value.trim()}` : `/*${comment.value}*/`
	);
}

/**
 * The non-empty objects and arrays of a document, in source order, with
 * whether each spans more than one line and whether a comma follows its last
 * entry (comments between the last entry and the closing bracket are ignored).
 * @param {string} text
 * @param {number} year
 * @returns {{ multiLine: boolean, comma: boolean }[]}
 */
export function trailingCommas(text, year) {
	const { program, comments } = parseToAst(text, { year });
	const containers = [];
	const visit = (node) => {
		if (!node || typeof node !== "object") return;
		const entries = node.type === "ObjectExpression" ? node.properties : node.type === "ArrayExpression" ? node.elements : null;
		if (entries?.length) {
			const from = entries.at(-1).loc.end.offset;
			const to = node.loc.end.offset - 1;
			let between = text.slice(from, to);
			for (const comment of comments) {
				if (comment.loc.start.offset >= from && comment.loc.end.offset <= to) {
					between = between.replace(text.slice(comment.loc.start.offset, comment.loc.end.offset), "");
				}
			}
			containers.push({ multiLine: node.loc.start.line !== node.loc.end.line, comma: between.includes(",") });
		}
		for (const [key, value] of Object.entries(node)) {
			if (key !== "loc") visit(value);
		}
	};
	visit(program);
	return containers;
}
