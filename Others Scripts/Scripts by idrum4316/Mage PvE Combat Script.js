var attack_mode = true;
var target;

// Store your last coordinates here for comparison
var last_x = character.real_x;
var last_y = character.real_y;
var last_x2 = last_x; // Keep track of one more back to detect edges better
var last_y2 = last_y; //
var angle; // Your desired angle from the monster, in radians
var flip_cooldown = 0;
var stuck_threshold = 2;

// Target monster parameters
var minimum_xp = 100;
var maximum_att = 150;

setInterval(function() {

  // Use a hp or mp potion
  if (character.hp < character.max_hp - 200) {
    parent.use('hp');
  } else if (character.mp < character.mp_cost * 4) {
    parent.use('mp');
  }

  loot();

  if (!attack_mode) return;

  target = get_targeted_monster();

  if (!target) {
    target = get_nearest_monster({
      min_xp: minimum_xp,
      max_att: maximum_att
    });

    if (target) {
      change_target(target);

      // If target changed, calculate the angle between it and you
      var diff_x = character.real_x - target.real_x;
      var diff_y = character.real_y - target.real_y;
      angle = Math.atan2(diff_y, diff_x);
    } else {
      set_message("No Monsters");
      return;
    }
  }

  // If for some reason we have a target but no angle, set the angle
  if (!angle && target) {
    diff_x = character.real_x - target.real_x;
    diff_y = character.real_y - target.real_y;
    angle = Math.atan2(diff_y, diff_x);
  }

  // Calculate the distance we moved since the last iteration
  chx = character.real_x - last_x;
  chy = character.real_y - last_y;
  dist_moved = Math.sqrt(chx * chx + chy * chy);

  // Calculate the distance we moved since the 2nd to last iteration
  chx2 = character.real_x - last_x2;
  chy2 = character.real_y - last_y2;
  dist_moved2 = Math.sqrt(chx2 * chx2 + chy2 * chy2);

  // If the dist_moved is low enough to indicate that we're stuck,
  // rotate our desired angle 45 degrees around the target
  if (dist_moved < stuck_threshold || dist_moved2 < stuck_threshold * 2) {
    angle = angle + ((Math.PI * 2) * 0.125);
  }

  // If target gets too close, maybe we're stuck? Flip the rotation some.
  // Has a cooldown after flipping so it doesn't thrash back and forth
  if (parent.distance(character, target) <= character.range / 4 && flip_cooldown > 18) {
    angle = angle + ((Math.PI * 2) * 0.35);
    flip_cooldown = 0;
  }
  flip_cooldown++;

  // Calculate our new desired position. It will be our max attack range
  // from the target, at the angle described by var angle.
  var new_x = target.real_x + character.range * Math.cos(angle);
  var new_y = target.real_y + character.range * Math.sin(angle);

  move(new_x, new_y);

  if (can_attack(target)) {
    set_message("Attacking");
    attack(target);
  }

  // Make the current coordinates available to the next iteration
  last_x2 = last_x;
  last_y2 = last_y;
  last_x = character.real_x;
  last_y = character.real_y;

}, 1000 / 4); // Loops every 0.25 seconds.