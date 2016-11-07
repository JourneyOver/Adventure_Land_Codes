//////////////////////////
// Main Settings Start //
////////////////////////

var mode = 0; //kite (move in straight line while attacking) [default] = 0, standing still (will move if target is out of range) = 1, Front of target (Moves to front of target before attacking) = 2, Don't Move at all (will not move even if target is out of range) = 3
// Movement //

var targetting = 2; //Monster Range  = 0, Character Range = 1, Tank Range[default] = 2
// Attacking Distance //

var mon1xp = 1000; //Min xp the enemy must have for you to attack it
var mon1atk = 100; //Max damage the enemy must have for you to attack it
// Preferred Monster Stats //

var mon2xp = 500; //Min xp the enemy must have for you to attack it
var mon2atk = 50; //Max damage the enemy must have for you to attack it
// Alternate Monster Stats //

////////////////////////
// Main Settings End //
//////////////////////

var prevx = 0;
var prevy = 0;
//Previous coords

var angle;
var stuck = 1;
var stuckcd = 0;
//Distance Maintainence Variables

//Grind Code below --------------------------
setInterval(function() {

  var target = get_targeted_monster();
  if (mode == 2 && target && !in_attack_range(target)) target = null;
  if (!target || (target.target && target.target != character.name)) { //Find Priority Monster
    target = get_nearest_available_monster({
      min_xp: mon1xp,
      max_att: mon1atk,
      no_attack: true
    });
    if (target) {
      change_target(target);
      angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
    } else if (!target || (target.target && target.target != character.name)) { //Find Alternate Monster
      target = get_nearest_available_monster({
        min_xp: mon2xp,
        max_att: mon2atk,
        no_attack: true
      });
      if (target) {
        change_target(target);
        angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
      } else {
        set_message("No Monsters");
        return;
      }
    }
  }
  //Monster Searching

  var enemydist;
  if (targetting === 0)
    enemydist = parent.G.monsters[target.mtype].range + 5;
  else if (targetting == 1)
    enemydist = character.range - 10;
  else if (targetting === 2)
    enemydist = 30;
  //Targetting

  if (mode === 0) {
    move_to_position(target, enemydist);
  } else if (mode == 1) {
    if (!in_attack_range(target)) {
      move(
        character.real_x + (target.real_x - character.real_x) / 2,
        character.real_y + (target.real_y - character.real_y) / 2
      );
    }
    // Walk half the distance
  } else if (mode == 2) {
    move(target.real_x + 5, target.real_y + 5);
  } else if (mode == 3) {}
  //Following/Maintaining Distance

  prevx = Math.ceil(character.real_x);
  prevy = Math.ceil(character.real_y);
  //Sets new coords to prev coords

}, 200); // Loop Delay

function move_to_position(target, enemydist) //Movement Algorithm
{
  if (!angle && target)
    angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
  //Set Angle Just in Case

  var distmov = Math.sqrt(Math.pow(character.real_x - prevx, 2) + Math.pow(character.real_y - prevy, 2));
  //Distance Since Previous

  if (distmov < stuck && stuckcd > 10) {
    angle = angle + (Math.PI * 2 * 0.125);
    stuckcd = 0;
  }
  stuckcd++;

  move(target.real_x + enemydist * Math.cos(angle), target.real_y + enemydist * Math.sin(angle));
}

function get_nearest_available_monster(args) {
  //args:
  // max_att - max attack
  // min_xp - min XP
  // target: Only return monsters that target this "name" or player object
  // no_target: Only pick monsters that don't have any target
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
