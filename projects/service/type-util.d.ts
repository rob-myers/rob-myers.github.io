declare namespace TypeUtil {

  export type KeyedEqualTests<T extends Record<string, any>> = {
    [Key in keyof T]?: ((curr: T[Key], next: T[Key]) => boolean);
  }

  export type KeyedTrue<T extends Record<string, any>> = {
    [Key in keyof T]?: true;
  }

}
