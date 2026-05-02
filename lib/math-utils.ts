/**
 * Preprocesses AI response text to ensure proper LaTeX formatting
 * This fixes common AI mistakes in math formula formatting
 */
export function preprocessMathText(text: string): string {
  if (!text) return text;

  let processed = text;

  // STEP 1: Convert LaTeX delimiters \( ... \) to $...$ (inline math)
  processed = processed
    .replace(/\\\(\s*/g, "$")
    .replace(/\s*\\\)/g, "$");

  // STEP 2: Convert LaTeX delimiters \[ ... \] to $$...$$ (display math)
  processed = processed
    .replace(/\\\[\s*/g, "$$")
    .replace(/\s*\\\]/g, "$$");

  // STEP 3: Handle \begin{aligned}...\end{aligned} and similar environments
  // These MUST be wrapped in $$...$$ to render in KaTeX
  const envs = ["aligned", "align", "equation", "gather", "cases", "matrix", "bmatrix", "pmatrix"];
  for (const env of envs) {
    const beginRegex = new RegExp(`\\\\begin\\{${env}\\}`, "g");
    const endRegex = new RegExp(`\\\\end\\{${env}\\}`, "g");
    
    // Find all occurrences and wrap entire block in $$
    let match;
    const beginPattern = new RegExp(`\\\\begin\\{${env}\\}`);
    const endPattern = new RegExp(`\\\\end\\{${env}\\}`);
    
    while (beginPattern.test(processed)) {
      const startIdx = processed.search(beginPattern);
      if (startIdx === -1) break;
      
      const endIdx = processed.indexOf(`\\end{${env}}`, startIdx);
      if (endIdx === -1) break;
      
      const before = processed.slice(0, startIdx);
      const block = processed.slice(startIdx, endIdx + `\\end{${env}}`.length);
      const after = processed.slice(endIdx + `\\end{${env}}`.length);
      
      // Check if already wrapped in $$
      const trimmedBefore = before.trimEnd();
      const trimmedAfter = after.trimStart();
      
      let newBlock = block;
      if (!trimmedBefore.endsWith("$$")) {
        newBlock = "$$" + newBlock;
      }
      if (!trimmedAfter.startsWith("$$")) {
        newBlock = newBlock + "$$";
      }
      
      processed = before + newBlock + after;
      break; // Process one at a time to avoid index issues
    }
  }

  // STEP 4: Fix AI double-escaping issues inside math
  processed = processed
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
    .replace(/\\\\;\s/g, "\\;");

  // STEP 5: Fix escaped dollar signs
  processed = processed
    .replace(/\\\$\$\$/g, "$$$")
    .replace(/\\\$\$/g, "$$")
    .replace(/\\\$/g, "$");

  // STEP 6: Fix line breaks in math (\ at end of line inside $$...$$)
  // Convert single \ followed by newline to just newline inside display math
  processed = processed.replace(/(\$\$[\s\S]*?)\\\s*\n\s*(?=\$\$)/g, "$1\n");

  // STEP 7: Fix remaining math block delimiters
  // Ensure text inside $...$ doesn't contain $ signs
  const parts = processed.split(/(\$[^$]+\$)/g);
  processed = parts.map((part, i) => {
    if (i % 2 === 1) {
      const content = part.replace(/^\$+/, "").replace(/\$+$/, "");
      return `$${content}$`;
    }
    return part;
  }).join("");

  // Ensure display math $$...$$ is correct
  const displayParts = processed.split(/(\$\$[\s\S]*?\$\$)/g);
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
