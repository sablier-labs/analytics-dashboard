/**
 * @type {import("lint-staged").Configuration}
 */
module.exports = {
  "*.{js,json,jsonc,ts,tsx}": "npx biome check --write",
  "*.{js,ts,tsx}": "npx biome lint --write --only correctness/noUnusedImports",
  "*.{md,yml,yaml}": "npx prettier --cache --write",
};
