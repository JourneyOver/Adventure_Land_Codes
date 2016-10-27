//Refined Potion Use
if (character.hp <= character.max_hp - 200 || character.mp < character.mp_cost) {
  use_hp_or_mp();
}

//refined Potion Use 2
if (character.hp / character.max_hp < 0.3) {
  parent.use('hp');
  if (character.hp <= 100)
    parent.socket.emit("transport", {
      to: "main"
    });
  //Panic Button
}

if (character.mp / character.max_mp < 0.3)
  parent.use('mp');
//Constrained Healing
