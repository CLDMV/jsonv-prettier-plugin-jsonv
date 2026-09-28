# Vendored jsonv fixture corpus

These files are the valid fixtures of the [`@cldmv/jsonv`](https://github.com/CLDMV/jsonv) test suite, copied verbatim from `tests/fixtures/` of `CLDMV/jsonv` at commit [`5bfa55bc9dbcd188d991db38a6565e1b3d853760`](https://github.com/CLDMV/jsonv/commit/5bfa55bc9dbcd188d991db38a6565e1b3d853760) (`next`, v1.1.0). The `violations/` fixtures (inputs that must fail to parse) are not included.

Each file sits under the ECMAScript feature year it targets (`2011/`, `2015/`, `2020/`, ...). `tests/round-trip.test.vitest.mjs` formats every file with that year as `jsonvYear` and checks that the formatted text evaluates to the same value, keeps every comment in order, and is stable when formatted again.

To refresh the corpus, copy the non-`violations/` `.jsonv` files from a newer `CLDMV/jsonv` commit and update the commit above. Do not edit the files by hand.
