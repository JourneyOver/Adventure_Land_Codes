// Dont Attack Tagged Mobs
var target = get_targeted_monster();
if (!target || (target.target && target.target != character.name)) { //Find Priority Monster
  target = get_nearest_available_monster({
    min_xp: 20000,
    max_att: 275,
    no_attack: true
  });
  if (target) {
    change_target(target);
  } else if (!target || (target.target && target.target != character.name)) { //Find Alternate Monster
    target = get_nearest_available_monster({
      min_xp: 5000,
      max_att: 275,
      no_attack: true
    });
    if (target) {
      change_target(target);
    } else {
      set_message("No Monsters");
      return;
    }
  }
}
//Monster Searching

function get_nearest_available_monster(args) {
  var min_d = 400,
    target = null;
  for (id in parent.entities) {
    var current = parent.entities[id];
    if (current.type != "monster" || args.min_xp && current.xp < args.min_xp || args.max_att && current.attack > args.max_att || current.dead || (current.target && current.target != character.name)) continue;
    if (args.no_target && current.target && current.target != character.name) continue;
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d) min_d = c_dist, target = current;
  }
  return target;
}
