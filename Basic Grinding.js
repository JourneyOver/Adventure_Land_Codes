/* var enemydist = parent.G.monsters.<targettype>.range + 5; //Change <targettype> to whatever you are fighting, list of names for each monster will be in targettype variables.txt, this will be dynamic soonish */
//deprecated for now, using a different method to get distance thanks to wiz!
var mode = 2; //0 is kite (move in straight line while attacking), 1 is standing still (will move if target is out of range), 2 is circle kite (walks in circles around enemy)
var min_xp_from_mob = 100; //set to minimum xp you want to be getting from each kill -- lowest amount of xp a mob has to have to be targetted
var max_att_from_mob = 120; //set to maximum damage you want to take from each hit -- most attack you're willing to fight
var min_xp_from_mob2 = 100; //set to minimum xp you want to be getting from each kill if can't find min from first target -- lowest amount of xp a mob has to have to be targetted
var max_att_from_mob2 = 120; //set to maximum damage you want to take from each hit if can't find max from first target -- most attack you're willing to fight
//Settings

var prevx = 0;
var prevy = 0;
//Previous coords

var angle;
var flipcd = 0;
var stuck = 2;
//Distance Maintainence Variables

//show_json(character);
//show_json(get_targeted_monster());
//show_json(parent.M);
//JSONs

//Automatic Potion Purchasing!
var purchase_pots = true; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 1000; //This is how many you will buy

setInterval(function() {

	if (purchase_pots) {
		purchase_potions();
	}

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

	var charx = character.real_x;
	var chary = character.real_y;
	//Character Location

	var target = get_targeted_monster();
	if (!target) {
		target = get_nearest_monster({
			min_xp: min_xp_from_mob,
			max_att: max_att_from_mob
		});
		if (target) {
			change_target(target);
			angle = Math.atan2(target.real_y - chary, target.real_x - charx);
		} else {
			target = get_nearest_monster({
				min_xp: min_xp_from_mob2,
				max_att: max_att_from_mob2
			});
			if (target)
				change_target(target);
			else {
				set_message("No Monsters");
				return;
			}
		}
	}
	enemydist = parent.G.monsters[target.mtype].range + 5;
	//Monster Searching

	loot();
	//Loot Chests

	if (can_attack(target))
		attack(target);
	//Attack

	/*		var parmem = get_nearest_player();
			if (parmem) {
				parent.socket.emit("party_invite", {
					id: parmem.id
				});
			}
			//Invite to Party */

	var distx = target.real_x - charx;
	var disty = target.real_y - chary;
	if (!angle && target)
		angle = Math.atan2(disty, distx);
	//Enemy Distance and Angle

	set_message("Location:\n" +
		Math.ceil(charx) + "," + Math.ceil(chary));
	//Output

	if (mode === 0) {
		if (distx > 0) //Player is left of enemy
			move(target.real_x - enemydist, chary);
		if (distx < 0) //Player is right of enemy
			move(target.real_x + enemydist, chary);
		if (disty > 0) //Player is below enemy
			move(charx, target.real_y - enemydist);
		if (disty < 0) //Player is above enemy
			move(charx, target.real_y + enemydist);
	} else if (mode == 1) {
		if (!in_attack_range(target)) {
			move(
				character.real_x + (target.real_x - character.real_x) / 2,
				character.real_y + (target.real_y - character.real_y) / 2
			);
		}
		// Walk half the distance
	} else if (mode == 2) {
		var chx = charx - prevx;
		var chy = chary - prevy;
		var distmov = Math.sqrt(chx * chx + chy * chy);

		if (distmov < stuck) {
			angle = angle + Math.PI * 2 * 0.125;
		}
		if (parent.distance(character, target) <= enemydist && flipcd > 18) {
			angle = angle + Math.PI * 2 * 0.35;
			flipcd = 0;
		}
		flipcd++;
		//Stuck Code

		var new_x = target.real_x + enemydist * Math.cos(angle);
		var new_y = target.real_y + enemydist * Math.sin(angle);
		move(new_x, new_y);
		//Credit to /u/idrum4316
	}
	//Following/Maintaining Distance

	prevx = Math.ceil(charx);
	prevy = Math.ceil(chary);
	//Sets new coords to prev coords

}, 200); // Loop Delay

function isBetween(num, compare, range) {
	return num >= compare - range && num <= compare + range;
}

function get_nearest_player() {
	var min_d = 999999,
		target = null;
	for (var id in parent.entities) {
		var current = parent.entities[id];
		if (current.type != "character" || current.dead)
			continue;
		var c_dist = parent.distance(character, current);
		if (c_dist < min_d) min_d = c_dist, target = current;
	}
	return target;
}

function purchase_potions() {
	set_message("Buying pots.");
	if (character.items[0].q < pots_minimum) {
		parent.buy("hpot0", pots_to_buy);
	}
	if (character.items[1].q < pots_minimum) {
		parent.buy("mpot0", pots_to_buy);
	}
}

//Unusable:
//sleep()
//while loops
