//Refined Potion Use
if (character.hp <= character.max_hp - 200 || character.mp < character.mp_cost) {
  use_hp_or_mp();
}