import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = process.argv[2] ? path.resolve(process.argv[2]) : fileURLToPath(new URL("../src/", import.meta.url));
const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(file) && !/\.(test|spec)\.tsx?$/.test(file) && !file.includes(`${path.sep}test${path.sep}`)) files.push(file);
  }
}
walk(root);
const relative = (file) => path.relative(root, file).replaceAll(path.sep, "/");
const errors = [];
const graph = new Map();
const report = (file, message) => errors.push(`${relative(file)}: ${message}`);

function resolve(file, specifier) {
  const base = specifier.startsWith("@/") ? path.join(root, specifier.slice(2)) : specifier.startsWith(".") ? path.resolve(path.dirname(file), specifier) : undefined;
  if (!base) return;
  const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(existsSync);
  if (!resolved) report(file, `unresolved import ${specifier}`);
  return resolved;
}

for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const name = relative(file);
  const imports = [];
  const directives = source.statements.filter(ts.isExpressionStatement).filter((node) => ts.isStringLiteral(node.expression)).map((node) => node.expression.text);
  let server = name.startsWith("services/server/") || name.startsWith("config/");
  let markedServer = false;
  function collect(node) {
    let specifier;
    let typeOnly = false;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifier = node.moduleSpecifier.text;
      typeOnly = Boolean(node.isTypeOnly || node.importClause?.isTypeOnly);
      const bindings = node.importClause?.namedBindings;
      if (!node.importClause?.name && bindings && ts.isNamedImports(bindings) && bindings.elements.length && bindings.elements.every((item) => item.isTypeOnly)) typeOnly = true;
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require")) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      specifier = node.arguments[0].text;
    }
    if (specifier) {
      if (specifier === "server-only") { markedServer = true; server = true; }
      if (["next/headers", "next/server"].includes(specifier) || specifier.startsWith("node:")) server = true;
      const target = resolve(file, specifier);
      if (target) {
        const destination = relative(target);
        imports.push({ target, typeOnly });
        if (!name.startsWith("app/") && destination.startsWith("app/")) report(file, `lower layer imports app: ${specifier}`);
        if (!name.startsWith("app/") && !name.startsWith("features/") && destination.startsWith("features/")) report(file, `lower layer imports feature: ${specifier}`);
        if (name.startsWith("domains/") && /^(services|config|mocks|components\/layout)\//.test(destination)) report(file, `domain imports infrastructure: ${specifier}`);
        if (name.startsWith("components/shared/") && /^(domains|services|config|mocks|components\/layout)\//.test(destination)) report(file, `shared imports upper layer: ${specifier}`);
        if (name.startsWith("components/ui/") && !/^(components\/ui|lib)\//.test(destination)) report(file, `primitive imports upper layer: ${specifier}`);
        if (name.startsWith("lib/") && !destination.startsWith("lib/")) report(file, `lib imports application layer: ${specifier}`);
        if (name.startsWith("mocks/") && destination.startsWith("services/server/")) report(file, `mock imports server module: ${specifier}`);
        if (typeOnly && !name.startsWith("services/server/") && destination.startsWith("services/server/")) report(file, `import pure contracts instead of server types: ${specifier}`);
        if ((name.includes("/contracts") || name.startsWith("services/contracts/")) && !typeOnly) report(file, `contract has runtime dependency: ${specifier}`);
      }
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
  if ((name.startsWith("services/server/") || name.startsWith("config/")) && !markedServer) report(file, "server entrypoint lacks server-only marker");
  graph.set(file, { imports, server, client: directives.includes("use client") });
}

for (const [file, entry] of graph) {
  if (!entry.client) continue;
  const visited = new Set();
  function visit(current, chain) {
    if (visited.has(current)) return;
    visited.add(current);
    const node = graph.get(current);
    if (!node) return;
    if (node.server) { report(file, `client reaches server: ${chain.map(relative).join(" -> ")}`); return; }
    for (const dependency of node.imports) if (!dependency.typeOnly) visit(dependency.target, [...chain, dependency.target]);
  }
  visit(file, [file]);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Boundaries OK (${files.length} modules; client graphs checked transitively).`);
