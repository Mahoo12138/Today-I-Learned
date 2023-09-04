// 实现联合类型的全排列，将联合类型转换成所有可能的全排列数组的联合类型。
// Implement permutation type that transforms union types into the array that includes permutations of unions.

// ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']

type perm = ts00296.Permutation<"A" | "B" | "C">;
type perm2 = ts00296.Permutation2<"A" | "B" | "C">;

/**
 * @description 联合类型分发问题
 */
namespace ts00296 {
  export type Permutation<T, R = T> = [T] extends [never]
    ? []
    : T extends T
    ? [T, ...Permutation<Exclude<R, T>>]
    : never;

  // loop union
  type loopUnion<
    Union extends string,
    Item extends string = Union
  > = Item extends Item ? `loop ${Item}` : never;

  type result = loopUnion<"A" | "B" | "C">; // "loop A" | "loop B" | "loop C"

  type IsNever<T> = [T] extends [never] ? true : false;

  export type Permutation2<Union, Item = Union> = Item extends Item
    ? PermuteItem<Union, Item>
    : never;

  type PermuteItem<
    Union,
    Item,
    Rest = Exclude<Union, Item>
  > = IsNever<Rest> extends true ? [Item] : [Item, ...Permutation<Rest>];
}
