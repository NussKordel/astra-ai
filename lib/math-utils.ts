/**
 * Preprocesses AI response text to ensure proper LaTeX formatting
 * This fixes common AI mistakes in math formula formatting
 */
export function preprocessMathText(text: string): string {
  if (!text) return text;

  let processed = text;

  // STEP 1: Convert LaTeX delimiters \( ... \) to $...$ (inline math)
  // The AI uses \( f(x) = x^2 \) but remark-math expects $f(x) = x^2$
  processed = processed
    .replace(/\\\(\s*/g, "$")   // \(... -> $...
    .replace(/\s*\\\)/g, "$");    // ...\) -> ...$

  // STEP 2: Convert LaTeX delimiters \[ ... \] to $$...$$ (display math)
  processed = processed
    .replace(/\\\[\s*/g, "$$")    // \[... -> $$...
    .replace(/\s*\\\]/g, "$$");    // ...\] -> ...$$

  // STEP 3: Fix double backslashes (common AI mistake: \\frac instead of \frac)
  processed = processed
    .replace(/\\\\frac/g, "\\frac")
    .replace(/\\\\cdot/g, "\\cdot")
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
    .replace(/\\\\Rightarrow/g, "\\Rightarrow")
    .replace(/\\\\Leftarrow/g, "\\Leftarrow")
    .replace(/\\\\rightarrow/g, "\\rightarrow")
    .replace(/\\\\leftarrow/g, "\\leftarrow")
    .replace(/\\\\quad/g, "\\quad")
    .replace(/\\\\,/g, "\\,")
    .replace(/\\\\;\s/g, "\\;");

  // STEP 4: Fix escaped dollar signs (AI sometimes writes \$ instead of $)
  processed = processed
    .replace(/\\\$\$\$/g, "$$$")
    .replace(/\\\$\$/g, "$$")
    .replace(/\\\$/g, "$");

  // STEP 5: Ensure text inside $...$ doesn't contain $ signs
  // Split by math blocks and clean
  const parts = processed.split(/(\$[^$]+\$)/g);
  processed = parts.map((part, i) => {
    // Even indices are text, odd are math
    if (i % 2 === 1) {
      // Math block - ensure single $ on each side
      const content = part.replace(/^\$+/, "").replace(/\$+$/, "");
      return `$${content}$`;
    }
    return part;
  }).join("");

  // STEP 6: Ensure display math $$...$$ is correct
  const displayParts = processed.split(/(\$\$[^$]+\$\$)/g);
  processed = displayParts.map((part, i) => {
    if (i % 2 === 1) {
      const content = part.replace(/^\$+/, "").replace(/\$+$/, "");
      return `$$${content}$$`;
    }
    return part;
  }).join("");

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
