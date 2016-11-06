//Boss Priority 3
function get_boss_monster(args) {
  var min_d = 999999,
    target = null;

  if (!args)
    args = {};
  if (args && args.target && args.target.name)
    args.target = args.target.name;

  for (var id in parent.entities) {
    var current = parent.entities[id];
    if (current.type !== "monster" || args.min_xp && current.xp < args.min_xp || args.max_att && current.attack > args.max_att || current.hp < 20000 || current.dead)
      continue;
    if (args.target && current.target !== args.target)
      continue;
    if (args.no_target && current.target && current.target !== character.name)
      continue;
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d)
      min_d = c_dist, target = current;
  }
  return target;
}
