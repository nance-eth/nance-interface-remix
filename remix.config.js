/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: [
    /^rehype.*/,
    /^remark.*/,
    /^mdast.*/,
    /^micromark.*/,
    "ccount",
    "devlop",
    /^unist.*/,
    "markdown-table",
    "longest-streak",
    /^hast.*/,
    /^property.*/,
    /^comma.*/,
    /^space.*/,
    /^vfile.*/,
    "web-namespaces",
    "zwitch",
    "html-void-elements",
    "github-slugger",
    /^react-markdown$/,
    "estree-util-is-identifier-name",
    "html-url-attributes",
    /^decode.*/,
    /^character.*/,
    "trim-lines",
    /^unified.*/,
    "bail",
    "is-plain-obj",
    "trough",
    "@ungap/structured-clone",
    /^wagmi.*/,
    /^@wagmi.*/,
    "connectkit",
    /^@toast-ui.*/,
  ],
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  browserNodeBuiltinsPolyfill: { modules: { buffer: true, events: true } },
};
