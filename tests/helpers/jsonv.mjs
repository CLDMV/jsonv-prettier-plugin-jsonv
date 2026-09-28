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
