/**
 * create a tuple (array, but with potentially different types, which can be inferred)
 *
 * Source: https://github.com/microsoft/TypeScript/issues/27179#issuecomment-422472039
 *
 * @param elements
 * @returns a tuple
 */
function tuple<T extends any[]>(...elements: T) {
  return elements
}

type Nullable<T> = T | null

type KeyType = string | number

function mapObject<T, S>(
  obj: { [k: KeyType]: T },
  func: (k: KeyType, v: T) => S
): { [k: KeyType]: S } {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, func(k, v)])
  )
}

export { Nullable, tuple, mapObject }
