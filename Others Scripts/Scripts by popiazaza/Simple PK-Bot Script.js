//Go to spawn point (0,0) in halloween map before use this script!
//Note: You can press "Town" button to go to spawn point.
var hp_potion = 400; // 200 or 400 hp potion
var mp_potion = 300; // 300 or 500 mp potion
var kite_attack = false; // Simple kite attack, just run away from enemy.
var auto_respawn = false; // Useful for 24/7 PK haunt (You should expect 0 XP/Gold)
function get_nearest_people() {
  var target = null,
    entities = parent.entities;
  for (i in entities)
    if (entities[i].type == "character" && entities[i].hp > 0) target = entities[i];
  return target;
}

function handle_death() {
  respawn();
  return true;
}
game_log("PK Mode is ON");
var next_location = 1;
var next_place = "South Pom Pom";
var checked = 0;
setInterval(function() {
  if (character.rip) {
    respawn();
    return;
  }
  if (character.max_hp - character.hp > hp_potion) {
    parent.use('hp');
  }
  if (character.max_mp - character.mp > mp_potion) {
    parent.use('mp');
  }

  var target = get_nearest_people();
  if (target) {
    change_target(target);
  } else {
    set_message("Move : " + next_place);
    if (next_location == 0) {
      if (character.real_x == 0 && character.real_y == 0) {
        if (checked == 0) {
          next_location = 1;
        } else if (checked == 1) {
          next_location = 2;
        } else if (checked == 2) {
          next_location = 4;
        }
      } else {
        parent.socket.emit('town');
      }
    } else if (next_location == 1) {
      if (character.real_x == 0 && character.real_y == 590) {
        checked = 1;
        next_location = 0;
        next_place = "West Snake";
      } else {
        move(0, 590);
      }
    } else if (next_location == 2) {
      if (character.real_x == -510 && character.real_y == 0) {
        next_location = 3;
      } else {
        move(-510, 0);
      }
    } else if (next_location == 3) {
      if (character.real_x == -510 && character.real_y == -670) {
        checked = 2;
        next_location = 0;
        next_place = "North Snake";
      } else {
        move(-510, -670);
      }
    } else if (next_location == 4) {
      if (character.real_x == 60 && character.real_y == 0) {
        next_location = 5;
      } else {
        move(60, 0);
      }
    } else if (next_location == 5) {
      if (character.real_x == 60 && character.real_y == -580) {
        next_location = 6;
      } else {
        move(60, -580);
      }
    } else if (next_location == 6) {
      if (character.real_x == 380 && character.real_y == -590) {
        checked = 0;
        next_place = "South Pom Pom";
        next_location = 0;
      } else {
        move(380, -590);
      }
    }
    return;
  }

  if (!in_attack_range(target)) {
    move(
      character.real_x + (target.real_x - character.real_x) / 4,
      character.real_y + (target.real_y - character.real_y) / 4
    );
  } else if (can_attack(target)) {
    set_message("Attacking");
    attack(target);
    if (kite_attack) {
      move(character.real_x - (target.real_x - character.real_x > 0 ? 20 : -20), character.real_y - (target.real_y - character.real_y > 0 ? 20 : -20));
    }
  }

}, 1000 / 4);

//Anti-Stuck Script
var last_x = 99999;
var last_y = 99999;
setInterval(function() {
  if (last_x - 10 < character.real_x && last_x + 10 > character.real_x && last_y - 10 < character.real_y && last_y + 10 > character.real_y) {
    next_location = 1;
    next_place = "South Pom Pom";
    checked = 0;
    parent.socket.emit('town');
  } else {
    last_x = character.real_x;
    last_y = character.real_y;
  }
}, 5000);