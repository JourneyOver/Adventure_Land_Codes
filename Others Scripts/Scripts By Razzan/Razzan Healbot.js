var party = [{
    name: "Razaan",
    priority: 0
  },
  {
    name: "Ryasha",
    priority: 0
  },
  {
    name: "Shistara",
    priority: 0
  },
  {
    name: "Rathien",
    priority: 0
  },
  {
    name: "Nutmeg",
    priority: 0
  },
  {
    name: "Caranyc",
    priority: 0
  }
]

var main_assist = "Razaan";

setInterval(function() {

  use_hp_or_mp();
  //loot();

  if (character.moving) return;
  var target = null;

  for (var x = 0; x < party.length; x++) {
    target = get_player(party[x].name);
    if (target) change_target(target);
    party[x].priority = (target.max_hp - target.hp) / target.max_hp;
  }

  var highest_priority = 0;
  for (var x = 0; x < party.length; x++) {
    if (party[x].priority > party[highest_priority].priority)
      highest_priority = x;
  }

  if (party[highest_priority].priority > .20) {
    target = get_player(party[highest_priority].name);
    if (target) change_target(target);
    set_message("Healing " + target.name);
    heal(target);
    return;
  } else {
    target = get_nearest_monster({});
    change_target(target);
    set_message("It is hitting " + target.target);
    if (target.target == main_assist) {
      if (can_attack(target)) {
        set_message("I'm hitting " + target.name);
        attack(target);
      }
    }
  }

  target = get_player(party[0].name);
  if ((target.real_x != character.real_x) || (target.real_y != character.real_y)) {
    move(
      character.real_x + (target.real_x - character.real_x),
      character.real_y + (target.real_y - character.real_y)
    );
  }


}, 1000 / 4); // Loops every 1/4 seconds.