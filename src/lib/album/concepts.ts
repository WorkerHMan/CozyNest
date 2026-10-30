/**
 * The fixed vocabulary the album's semantic tags come from, with the Chinese
 * words that map onto each one.
 *
 * ## Why a fixed list instead of free language
 *
 * The tagging model scores an image against a set of concepts; it does not parse
 * Chinese. So the honest promise is "these few dozen concepts work well", not
 * "ask it anything" — spec §4.4. The aliases are what let someone type 「小狗」
 * and reach the `dog` concept.
 *
 * Adding a concept means adding a key here and tagging photos with it; nothing
 * else needs to change.
 */
export const CONCEPT_ALIASES: Record<string, readonly string[]> = {
  dog: ["小狗", "狗狗", "狗", "汪", "柴犬", "puppy"],
  cat: ["猫", "小猫", "喵"],
  sea: ["海", "海边", "大海", "海滩", "海浪"],
  mountain: ["山", "雪山", "山里", "山景"],
  snow: ["雪", "下雪", "雪景", "雪地"],
  night: ["夜", "夜景", "夜晚", "夜里", "灯"],
  lake: ["湖", "湖边", "湖面"],
  food: ["吃", "食物", "美食", "饭", "水果", "野果"],
  building: ["建筑", "楼", "房子", "屋顶"],
  flower: ["花", "花朵", "野花"],
  animal: ["动物", "羊", "鸟", "猫狗"],
  person: ["人", "人物", "合影", "肖像"],
  sky: ["天空", "云", "星"],
  tree: ["树", "树林", "树叶", "森林"],
  street: ["街", "街道", "胡同", "巷子"],
  summer: ["夏", "夏天", "热"],
  portrait: ["自拍", "人像"],
}

/**
 * Concept ids for a typed word.
 *
 * Matches on the alias **or** on the concept id itself, so `dog` and 「小狗」
 * find the same thing. Returns an empty array rather than guessing: a word the
 * vocabulary does not cover is a term the text index still gets a chance at.
 */
export function conceptIdsFor(term: string): string[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []

  return Object.entries(CONCEPT_ALIASES)
    .filter(([id, aliases]) => id === needle || aliases.some((alias) => alias.toLowerCase() === needle))
    .map(([id]) => id)
}
