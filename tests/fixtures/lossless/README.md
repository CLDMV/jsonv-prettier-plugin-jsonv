# Lossless-printing edge cases

Hand-written inputs for `tests/round-trip.test.vitest.mjs`, covering what the jsonv corpus does not: the issue #25 reproduction (`issue-25.jsonv`), every key form, every number form, string quote styles and escapes, template interpolation edge cases, comments in every position, references and member access, empty and nested containers, non-object roots, and a document without a trailing newline. They are formatted with `jsonvYear: 2025`.

`crlf.jsonv` uses CRLF line endings, including one inside a template literal. It is formatted with `endOfLine: "auto"`. Prettier normalizes line endings before a plugin sees the text, and with the default `endOfLine: "lf"` a CRLF inside a template literal is written back as LF. jsonv keeps the CR in the template's value, unlike ECMAScript, which normalizes it, so the formatted file evaluates to a different string in that case.
