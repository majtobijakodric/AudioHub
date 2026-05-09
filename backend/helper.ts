
// x is string means that f this function returns true, TypeScript can treat x as a string afterward.
export function isString(x: unknown): x is string {
    return typeof x === "string";
}

export function isEmptyString(x: string): boolean {
    return x.length === 0;
}
