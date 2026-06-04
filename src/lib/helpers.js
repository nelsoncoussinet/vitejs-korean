export function parseDefinitions(str) {
  if (!str) return [];
  const parts = str.split(/\(\d+\)/).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [str];
}
