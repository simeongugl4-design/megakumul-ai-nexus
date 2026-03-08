/**
 * Preprocesses LaTeX content to fix common rendering issues with react-markdown + remark-math + rehype-katex.
 *
 * Issues fixed:
 * 1. Bare \begin{aligned/cases/pmatrix/...} not wrapped in $$ delimiters
 * 2. \boxed{} outside math delimiters
 * 3. Escaped backslashes that break LaTeX environments
 */

const MATH_ENVS = [
  "aligned",
  "align",
  "align\\*",
  "cases",
  "pmatrix",
  "bmatrix",
  "vmatrix",
  "matrix",
  "gathered",
  "split",
  "array",
  "eqnarray",
  "equation",
  "equation\\*",
];

const ENV_PATTERN = MATH_ENVS.join("|");

export function preprocessLatex(content: string): string {
  if (!content) return content;

  let result = content;

  // Fix 1: Wrap bare \begin{env}...\end{env} blocks that aren't already inside $$ delimiters
  // Match \begin{env} that is NOT preceded by $$ (with optional whitespace)
  const bareEnvRegex = new RegExp(
    `(?<![\\$])\\\\begin\\{(${ENV_PATTERN})\\}([\\s\\S]*?)\\\\end\\{\\1\\}(?![\\$])`,
    "g"
  );
  result = result.replace(bareEnvRegex, (match, env, body) => {
    // Check if already wrapped in $$ by looking at surrounding context
    return `$$\\begin{${env}}${body}\\end{${env}}$$`;
  });

  // Fix 2: Wrap bare \boxed{...} not inside math delimiters
  result = result.replace(
    /(?<!\$)\\boxed\{([^}]+)\}(?!\$)/g,
    "$$\\boxed{$1}$$"
  );

  // Fix 3: Fix double-escaped backslashes in math environments (\\\\  → \\)
  // Only inside $$ blocks
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    // Fix quadruple backslash to double (common streaming artifact)
    const fixed = inner.replace(/\\\\\\\\/g, "\\\\");
    return `$$${fixed}$$`;
  });

  // Fix 4: Ensure $$ blocks have proper newlines around them for block rendering
  result = result.replace(/([^\n])\$\$/g, "$1\n$$");
  result = result.replace(/\$\$([^\n])/g, "$$\n$1");

  return result;
}
