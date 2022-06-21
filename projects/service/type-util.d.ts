declare namespace TypeUtil {

  /** Useful for state management */
  export interface KeyedLookup<Value extends { key: K }, K extends string | number = string | number> {
    [key: string]: Value;
  }

  export type KeyedEqualTests<T extends Record<string, any>> = {
    [Key in keyof T]?: ((curr: T[Key], next: T[Key]) => boolean);
  }

  export type KeyedTrue<T extends Record<string, any>> = {
    [Key in keyof T]?: true;
  }

}
