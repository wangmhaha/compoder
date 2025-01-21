const wishes = [
  "灵蛇献瑞，万事顺遂！",
  "蛇年大吉，福运亨通！",
  "金蛇献福，喜气盈门！",
  "蛇年纳祥，吉星高照！",
  "蛇舞新春，福寿安康！",
  "蛇年大展宏图，事业蒸蒸日上！",
  "金玉满堂，喜气盈门！",
  "蛇年好运到，财源广进！",
  "新春大吉，心想事成！",
  "蛇年福气到，阖家幸福！",
]

/**
 * Returns a random New Year wish from the predefined list
 */
export const getRandomWish = (): string => {
  const randomIndex = Math.floor(Math.random() * wishes.length)
  return wishes[randomIndex]
}
