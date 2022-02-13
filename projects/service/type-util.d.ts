declare namespace TypeUtil {

  export type KeyedEquality<T extends Record<string, any>> = {
    [Key in keyof T]?: ((curr: T[Key], next: T[Key]) => boolean);
  }

}
