import { builtinAbilities, loadAbilityById } from "@promptos/abilities";

console.log(builtinAbilities.map((a) => a.id));
// ["code.explain", "code.review.api", "write.tech.spec"]

const ability = await loadAbilityById("code.review.api");
console.log(ability?.supportedLanguages);
