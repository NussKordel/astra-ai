/**
 * Preprocesses AI response text to ensure proper LaTeX formatting
 * This fixes common AI mistakes in math formula formatting
 */
export function preprocessMathText(text: string): string {
  if (!text) return text;

  let processed = text;

  // Fix double backslashes (common AI mistake: \\frac instead of \frac)
  // But don't break existing correct LaTeX
  
  // Fix common math patterns that AI writes without LaTeX delimiters
  const mathPatterns = [
    // f(x) = x^2 patterns
    { pattern: /([a-zA-Z])\(([^)]+)\)\s*=\s*([^\s,]+)/g, replacement: "$$$1($2) = $3$$" },
    // Power of x: x^2, x^n, etc.
    { pattern: /(?<!\$)(x\^[0-9a-zA-Z]+)(?!\$)/g, replacement: "$$$1$$" },
    // Simple fractions like (1/2), (a/b)
    { pattern: /\(([^/]+)\/([^)]+)\)/g, replacement: "$$\\frac{$1}{$2}$$" },
  ];

  // Apply patterns carefully - only if not already in math mode
  // Check if text has LaTeX delimiters
  const hasLatexDelimiters = /\$\$.*?\$\$|\$[^\s$]+\$/.test(processed);
  
  if (!hasLatexDelimiters) {
    // Wrap standalone math expressions
    processed = processed
      // f(x) = ... patterns
      .replace(/([a-zA-Z])\(([^)]+)\)\s*=\s*([^\n,]+)/g, (match, func, args, expr) => {
        if (match.includes('$$')) return match;
        return `$${func}(${args}) = ${expr}$`;
      })
      // Power of x
      .replace(/(?<![a-zA-Z])x\^([0-9a-zA-Z]+)(?![a-zA-Z])/g, "$$x^{$1}$$")
      // Common functions
      .replace(/\b(sin|cos|tan|log|ln|lim|sum|int)\b/g, "\\$1")
      // Common constants
      .replace(/\b(pi|alpha|beta|gamma|delta|theta)\b/g, "\\$1");
  }

  // Fix AI double-escaping issues
  processed = processed
    // Fix \\frac -> \frac (AI sometimes double-escapes)
    .replace(/\\\\frac/g, "\\frac")
    .replace(/\\\\cdot/g, "\\cdot")
    .replace(/\\\\int/g, "\\int")
    .replace(/\\\\sum/g, "\\sum")
    .replace(/\\\\lim/g, "\\lim")
    .replace(/\\\\sin/g, "\\sin")
    .replace(/\\\\cos/g, "\\cos")
    .replace(/\\\\tan/g, "\\tan")
    .replace(/\\\\log/g, "\\log")
    .replace(/\\\\ln/g, "\\ln")
    .replace(/\\\\sqrt/g, "\\sqrt")
    .replace(/\\\\pi/g, "\\pi")
    .replace(/\\\\alpha/g, "\\alpha")
    .replace(/\\\\beta/g, "\\beta")
    .replace(/\\\\gamma/g, "\\gamma")
    .replace(/\\\\delta/g, "\\delta")
    .replace(/\\\\theta/g, "\\theta")
    .replace(/\\\\cdot/g, "\\cdot")
    .replace(/\\\\pm/g, "\\pm")
    .replace(/\\\\times/g, "\\times")
    .replace(/\\\\div/g, "\\div")
    .replace(/\\\\infty/g, "\\infty")
    .replace(/\\\\to/g, "\\to")
    .replace(/\\\\Rightarrow/g, "\\Rightarrow")
    .replace(/\\\\Leftarrow/g, "\\Leftarrow")
    .replace(/\\\\rightarrow/g, "\\rightarrow")
    .replace(/\\\\leftarrow/g, "\\leftarrow")
    .replace(/\\\\quad/g, "\\quad")
    .replace(/\\\\,/g, "\\,")
    .replace(/\\\\;\s/g, "\\;")
    // Fix \$\$ -> $$ (if AI escaped dollar signs)
    .replace(/\\\$\$\$/g, "$$$")
    .replace(/\\\$\$/g, "$$")
    .replace(/\\\$/g, "$");

  // Ensure proper display math for multi-line formulas
  processed = processed
    // If a line has multiple LaTeX commands, wrap in $$..$$
    .replace(/^(.*\\frac.*\\cdot.*)$/gm, (match) => {
      if (match.startsWith("$$") || match.startsWith("$")) return match;
      return `$$${match}$$`;
    });

  return processed;
}

/**
 * Postprocess to fix any remaining KaTeX rendering issues
 */
export function postprocessMathText(text: string): string {
  if (!text) return text;

  return text
    // Remove empty math blocks
    .replace(/\$\$\s*\$\$/g, "")
    .replace(/\$\s*\$/g, "")
    // Fix triple dollar signs
    .replace(/\$\$\$/g, "$$");
}
