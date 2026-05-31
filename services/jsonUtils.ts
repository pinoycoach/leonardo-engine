// ═══════════════════════════════════════════════════════════════════════════
// JSON EXTRACTION HELPER
// ═══════════════════════════════════════════════════════════════════════════
// Claude often returns JSON wrapped in markdown code fences, e.g.:
//   ```json
//   { ... }
//   ```
// Calling JSON.parse() on the raw response then throws. This helper strips the
// fences (and any surrounding prose/whitespace) so the payload parses cleanly.
//
// Defined in its own module (rather than directly in leonardo.ts) to avoid a
// circular import: leonardo.ts imports every agent, and the agents import this
// helper. leonardo.ts re-exports it for convenience.
export function extractJSON(text: string): string {
  // Strip markdown code blocks (```json ... ``` or ``` ... ```)
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  // Strip any leading/trailing whitespace
  return text.trim();
}
