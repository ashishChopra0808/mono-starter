/** Make a type nullable (T or null). */
export type Nullable<T> = T | null;

/**
 * Nominal/branded type — prevents accidental mixing of structurally identical types.
 *
 * @example
 *   type UserId = Brand<string, 'UserId'>;
 *   type ProjectId = Brand<string, 'ProjectId'>;
 *   // UserId and ProjectId are not assignable to each other.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/** Standard timestamp fields for persisted entities. */
export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

/** Standard id field for persisted entities. */
export interface WithId {
  id: string;
}

/**
 * Make selected keys of T optional while keeping the rest required.
 *
 * @example
 *   type Full = { a: string; b: number; c: boolean };
 *   type Partial = OptionalKeys<Full, 'b' | 'c'>;
 *   // => { a: string; b?: number; c?: boolean }
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
