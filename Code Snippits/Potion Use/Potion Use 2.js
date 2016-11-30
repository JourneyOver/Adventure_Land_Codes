//Heal and restore mana if required
if (character.hp / character.max_hp < 0.4 && new Date() > parent.next_potion) {
  parent.use('hp');
  if (character.hp <= 100)
    parent.socket.emit("transport", {
      to: "main"
    });
  //Panic Button
}

if (character.mp / character.max_mp < 0.3 && new Date() > parent.next_potion)
  parent.use('mp');
//Constrained Healing