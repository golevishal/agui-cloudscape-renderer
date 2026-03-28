/**
 * Deep merges two values. Arrays are treated as full replacements (not concatenated).
 * Primitives from `source` overwrite `target`.
 */
export function deepMerge(target: unknown, source: unknown): unknown {
  if (target === source) return target;
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;

  if (Array.isArray(target) && Array.isArray(source)) {
    return source;
  }

  const result = { ...(target as Record<string, unknown>) };
  for (const key of Object.keys(source as Record<string, unknown>)) {
    result[key] = deepMerge(result[key], (source as Record<string, unknown>)[key]);
  }
  return result;
}

/**
 * Resolves a JSON Pointer string (RFC 6901 subset) against a state object.
 *
 * Supported pointer prefixes:
 * - `$/path/to/value`
 * - `#/path/to/value`
 * - `$path/to/value`
 *
 * Returns `undefined` if the path does not exist in the state or if the
 * input is not a recognized pointer format.
 */
export function resolvePointer(state: Record<string, unknown>, pointer: string): unknown {
  if (!pointer) return pointer;

  let pathString = pointer;
  if (pathString.startsWith('$/')) {
    pathString = pathString.slice(2);
  } else if (pathString.startsWith('#/')) {
    pathString = pathString.slice(2);
  } else if (pathString.startsWith('$')) {
    pathString = pathString.slice(1);
  } else {
    // Not a valid pointer string
    return undefined;
  }

  if (!pathString) return state; // root

  const path = pathString.split('/');
  let current: unknown = state;
  for (const key of path) {
    if (current == null) return undefined;
    // Decode JSON Pointer escape sequences RFC 6901
    const unescapedKey = key.replace(/~1/g, '/').replace(/~0/g, '~');
    current = (current as Record<string, unknown>)[unescapedKey];
  }
  return current;
}
