const eq = (a: any, b: any) => a === b;

// compare 2 objects for deep equality
const strictEq = (a: any, b: any): boolean => {
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === "object") {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!strictEq(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!strictEq(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return JSON.stringify(a) === JSON.stringify(b);
};
export const t = {
  eq,
} as const;
