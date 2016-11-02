//Different Targetting Procedure
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

////////////////////////////////////////////////////////////////////////////////
//Boss Priority 2
var target = get_targeted_monster();
if (!target) {
  target = GetTarget();
  if (target) {
    change_target(target);
  } else if (!target) {
    target = GetTarget()
    if (target) {
      change_target(target);
    } else {
      set_message("No Monsters");
      return;
    }
  }
}

function GetNearestMonster(args) {
  //args:
  // max_att - max attack
  // min_xp - min XP
  // m_type:
  // target: Only return monsters that target this "name" or player object
  // no_target: Only pick monsters that don't have any target
  var min_d = 999999,
    target = null;
  if (!args) args = {};
  if (args && args.target && args.target.name) args.target = args.target.name;
  for (id in parent.entities) {
    var current = parent.entities[id];
    if (current.type != "monster" || args.min_xp && current.xp < args.min_xp || args.max_att && current.attack > args.max_att || current.dead) continue;
    if (args.mtype && current.mtype != args.mtype) continue;
    if (args.target && current.target != args.target) continue;
    if (args.no_target && current.target && current.target != character.name) continue;
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d) min_d = c_dist, target = current;
  }
  return target;
}

function GetTarget() {
  //target=GetNearestMonster({min_xp:100,max_att:100});
  var target;
  if (!target) target = GetNearestMonster({
    mtype: "mrpumpkin"
  });
  if (!target) target = GetNearestMonster({
    mtype: "gscorpion"
  });
  if (!target) target = GetNearestMonster({
    mtype: "phoenix"
  });
  if (!target) target = GetNearestMonster({
    mtype: "dknight2"
  });
  if (!target) target = GetNearestMonster({
    mtype: "osnake"
  });
  if (!target) target = GetNearestMonster({
    mtype: "worm"
  });
  if (!target) target = GetNearestMonster({
    mtype: "goo"
  });
  if (!target) target = GetNearestMonster({
    mtype: "scorpion"
  });
  if (!target) target = GetNearestMonster({
    mtype: "mvampire"
  });
  if (!target) target = GetNearestMonster({
    mtype: "bat"
  });
  if (!target) target = GetNearestMonster({
    mtype: "fvampire"
  });
  if (!target) target = GetNearestMonster({
    mtype: "ghost"
  });
  //if (target && !(target.mtype == "goo" || target.mtype == "osnake" || target.mtype == "worm"))
  //target=undefined;
  return target;
}

////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
// Dont Attack Tagged Mobs
var target = get_targeted_monster();
if (!target || (target.target && target.target != character.name)) {
  target = get_nearest_available_monster({
    min_xp: 20000,
    max_att: 275,
    no_attack: true
  });
  if (target) {
    change_target(target);
  } else if (!target) {
    target = get_nearest_available_monster({
      min_xp: 5000,
      max_att: 275
    });
    if (target) {
      change_target(target);
    } else {
      set_message("No Monsters");
      return;
    }
  }
}

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

////////////////////////////////////////////////////////////////////////////////
