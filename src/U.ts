export namespace U {
  export const randomString = (length: number): string => {
    const letters = "abcdefghijklmnopqrstuvxyz";
    const uppercase = letters.toUpperCase();
    const all = letters + uppercase;
    const abs = Math.abs(length);
    let result = "";

    for (let i = 0; i < abs; i++) {
      const char = all.charAt(Math.floor(Math.random() * all.length));
      result += char;
    }
    return result;
  };

  export const pickRandom = <T>(
    array: Array<T> | ReadonlyArray<T>
  ): T | null => {
    if (!Array.isArray(array)) {
      return null;
    }
    const index = Math.floor(Math.random() * array.length);
    return array[index] ?? null;
  };

  export const sleep = (milliSeconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milliSeconds));
  };

  export const identity = <T>(item: T): T => item;

  export const searchForSubString = <T extends { name: string }>(
    searchTerm: string,
    list: ReadonlyArray<T>
  ) => {
    const hasWord = (searchTerm: string) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (item: T): boolean => {
        const lowerCase = item.name?.toLowerCase() ?? "";
        return lowerCase.includes(lowerCaseSearchTerm);
      };
    };
    const filterFunction = hasWord(searchTerm);
    const result = list.filter(filterFunction);
    return result;
  };

  export const isInfinity = (number: number) => {
    return (
      number === Number.POSITIVE_INFINITY ||
      number === Number.NEGATIVE_INFINITY ||
      number === Infinity
    );
  };
  export type NonEmptyArray<T> = [T, ...T[]];
  export const isNonEmptyArray = <T>(
    array: Array<T>
  ): array is NonEmptyArray<T> => {
    return array.length > 0;
  };

  export const hasKey = <T extends string>(
    obj: unknown,
    key: T
  ): obj is Record<typeof key, unknown> => {
    if (!isRecord(obj)) {
      return false;
    }
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  export const isRecord = (obj: unknown): obj is Record<string, unknown> => {
    if (!obj) {
      return false;
    }

    if (Array.isArray(obj)) {
      return false;
    }

    if (typeof obj !== "object") {
      return false;
    }

    if (obj === null) {
      return false;
    }
    return true;
  };

  export const isInRange = (min: number, max: number) => {
    return (value: number) => value >= min && value <= max;
  };

  export const deleteProp = <Obj, Key extends keyof Obj>(
    obj: Obj,
    key: Key
  ): Omit<Obj, Key> => {
    delete obj[key];
    return obj;
  };
  export const isString = (str: unknown, minLength = 0): str is string => {
    if (typeof str !== "string") {
      return false;
    }

    const evalLength = minLength < 0 ? 0 : minLength;
    return str.length >= evalLength;
  };

  export const isBool = (obj: boolean): obj is boolean =>
    typeof obj === "boolean";

  export const isTrue = (bool: boolean): bool is true => bool === true;

  export const isFalse = (bool: boolean): bool is false => bool === false;

  export const isDefined = (obj: unknown): boolean => {
    const notNull = obj !== null;
    const notUndefined = obj !== undefined;
    return notNull && notUndefined;
  };
  export const isNumber = (value?: number): value is number => {
    const isNumber = typeof value === "number";
    const notNaN = !Number.isNaN(value);
    return isNumber && notNaN;
  };

  export const maxFn = (upperLimit: number) => {
    return (value: number) => {
      return Math.min(value, upperLimit);
    };
  };

  export const minFn = (lowerLimit: number) => {
    return (value: number) => {
      return Math.min(value, lowerLimit);
    };
  };
}
