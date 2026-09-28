/** @type {JsonvPlugin} */
export const plugin: JsonvPlugin;
export default plugin;
/**
 * An ES year `@cldmv/jsonv` can target.
 */
export type JsonvYear = NonNullable<ParseOptions["year"]>;
/**
 * The plugin's own formatting options, passed to prettier next to its
 * built-in options (`prettier.format(text, { parser: "jsonv", plugins: [plugin], jsonvYear: 2021 })`).
 */
export type JsonvOptions = {
    /**
     * - Target ES year for jsonv features. Default `2025`.
     */
    jsonvYear?: JsonvYear | undefined;
    /**
     * - Require an explicit `n` suffix for integers outside the safe range. Default `false`.
     */
    strictBigInt?: boolean | undefined;
};
/**
 * The fields prettier's comment attachment (and this plugin) set on a node.
 */
export type JsonvNodeAttachment = {
    /**
     * - The comments attached to this node.
     */
    comments?: JsonvComment[] | undefined;
};
/**
 * A comment as prettier's comment attachment sees it: `@cldmv/jsonv`'s
 * `Comment` plus the fields prettier sets while attaching it.
 */
export type JsonvCommentAttachment = {
    /**
     * - Printed before the node it is attached to.
     */
    leading?: boolean | undefined;
    /**
     * - Printed after the node it is attached to.
     */
    trailing?: boolean | undefined;
    /**
     * - Set once the comment has been printed.
     */
    printed?: boolean | undefined;
    /**
     * - For a dangling comment: the entry or expression it follows.
     */
    marker?: JsonvSyntaxNode | undefined;
    /**
     * - The innermost node that contains the comment.
     */
    enclosingNode?: JsonvSyntaxNode | undefined;
    /**
     * - The child of `enclosingNode` just before the comment.
     */
    precedingNode?: JsonvSyntaxNode | undefined;
    /**
     * - The child of `enclosingNode` just after the comment.
     */
    followingNode?: JsonvSyntaxNode | undefined;
    /**
     * - Comments are never attached to comments.
     */
    comments?: undefined;
};
export type JsonvComment = Comment & JsonvCommentAttachment;
export type JsonvProgram = Program & JsonvNodeAttachment;
export type JsonvObjectExpression = ObjectExpression & JsonvNodeAttachment;
export type JsonvProperty = Property & JsonvNodeAttachment;
export type JsonvLiteral = Literal & JsonvNodeAttachment;
export type JsonvIdentifier = Identifier & JsonvNodeAttachment;
export type JsonvMemberExpression = MemberExpression & JsonvNodeAttachment;
export type JsonvTemplateLiteral = TemplateLiteral & JsonvNodeAttachment;
/**
 * An `ArrayExpression`. `@cldmv/jsonv` types `elements` ESTree-style, with
 * `null` for a hole, but jsonv has no holes: its parser reads a value for
 * every element, so the list never contains `null`.
 */
export type JsonvArrayExpression = Omit<ArrayExpression, "elements"> & {
    elements: Expression[];
} & JsonvNodeAttachment;
/**
 * A node of the positioned AST `@cldmv/jsonv`'s `parseToAst` returns.
 */
export type JsonvSyntaxNode = JsonvProgram | JsonvObjectExpression | JsonvArrayExpression | JsonvProperty | JsonvLiteral | JsonvIdentifier | JsonvMemberExpression | JsonvTemplateLiteral;
/**
 * A node the printer is handed: a syntax node, or a comment (for `printComment`).
 */
export type JsonvNode = JsonvSyntaxNode | JsonvComment;
/**
 * The options the parser and printer receive: prettier's resolved options
 * plus this plugin's, which prettier fills from their defaults.
 */
export type JsonvParserOptions = ParserOptions<JsonvNode> & JsonvOptions;
/**
 * The `print` callback prettier passes to `Printer#print`.
 */
export type JsonvPrint = Parameters<Printer<JsonvNode>["print"]>[2];
/**
 * The plugin object: its language, `jsonv` parser and printer, and its options.
 * Assignable to prettier's `Plugin`.
 */
export type JsonvPlugin = {
    /**
     * - The `jsonv` language (`.jsonv` files).
     */
    languages: SupportLanguage[];
    /**
     * - The `jsonv` parser.
     */
    parsers: {
        jsonv: Parser<JsonvNode>;
    };
    /**
     * - The `jsonv` printer (the parser's `astFormat`).
     */
    printers: {
        jsonv: Printer<JsonvNode>;
    };
    /**
     * - The option definitions behind {@link JsonvOptions}.
     */
    options: {
        jsonvYear: IntSupportOption;
        strictBigInt: BooleanSupportOption;
    };
};
import type { ParseOptions } from "@cldmv/jsonv";
import type { Comment } from "@cldmv/jsonv";
import type { Program } from "@cldmv/jsonv";
import type { ObjectExpression } from "@cldmv/jsonv";
import type { Property } from "@cldmv/jsonv";
import type { Literal } from "@cldmv/jsonv";
import type { Identifier } from "@cldmv/jsonv";
import type { MemberExpression } from "@cldmv/jsonv";
import type { TemplateLiteral } from "@cldmv/jsonv";
import type { ArrayExpression } from "@cldmv/jsonv";
import type { Expression } from "@cldmv/jsonv";
import type { ParserOptions } from "prettier";
import type { Printer } from "prettier";
import type { SupportLanguage } from "prettier";
import type { Parser } from "prettier";
import type { IntSupportOption } from "prettier";
import type { BooleanSupportOption } from "prettier";
//# sourceMappingURL=index.d.mts.map