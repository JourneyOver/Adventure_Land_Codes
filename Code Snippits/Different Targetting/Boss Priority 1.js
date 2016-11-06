//Boss Priority 1
var target = get_targeted_monster();
if (!target) {
  target = get_nearest_monster({
    min_xp: 20000,
    max_att: 275
  });
  if (target && target.hp > 20000) change_target(target);
  else if (!target) change_target(get_nearest_monster({
    min_xp: 5000,
    max_att: 275
  }));
  else {
    set_message("No Monsters");
    return;
  }
}
