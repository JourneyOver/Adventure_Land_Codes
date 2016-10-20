/* var enemydist = parent.G.monsters.<targettype>.range + 5; //Change <targettype> to whatever you are fighting, list of names for each monster will be in targettype variables.txt, this will be dynamic soonish */
//deprecated for now, using a different method to get distance thanks to wiz!
var mode = 0; //0 is kite(moveing around while attacking), 1 is standing still, 2 is testing (do not use testing for now)
var min_xp_from_mob = 100; //set to minimum xp you want to be getting from each kill -- lowest amount of xp a mob has to have to be targetted
var max_att_from_mob = 120; //set to maximum damage you want to take from each hit -- most attack you're willing to fight
var min_xp_from_mob2 = 4000; //set to minimum xp you want to be getting from each kill if can't find min from first target -- lowest amount of xp a mob has to have to be targetted
var max_att_from_mob2 = 120; //set to maximum damage you want to take from each hit if can't find max from first target -- most attack you're willing to fight
//Settings

var prevx = 0;
var prevy = 0;
//Previous coords

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

	var target = get_targeted_monster();
	if (!target) {
		target = get_nearest_monster({
			min_xp: min_xp_from_mob,
			max_att: max_att_from_mob
		});
		if (target)
			change_target(target);
		else {
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
	//Monster Searching

	loot();
	//Loot Chests

	if (can_attack(target))
		attack(target);
	//Attack

	var parmem = get_nearest_player();
	parent.socket.emit("party_invite", {
		id: parmem.id
	});
	//Invite to Party

	var charx = character.real_x;
	var chary = character.real_y;
	//Character Location

	var distx = target.real_x - charx;
	var disty = target.real_y - chary;
	//Enemy Distance

	set_message("Location:\n" +
		Math.ceil(charx) + "," + Math.ceil(chary) +
		"\nEnemy:\n" +
		Math.ceil(target.real_x) + "," + Math.ceil(target.real_y) +
		"\nDistance:\n" +
		Math.ceil(distx) + "," + Math.ceil(disty));
	//Output

	if (mode === 0) {
		if (distx > 0) //Player is left of enemy
		{
			move(target.real_x - parent.G.monsters[target.mtype].range + 5, chary);
		}
		if (distx < 0) //Player is right of enemy
		{
			move(target.real_x + parent.G.monsters[target.mtype].range + 5, chary);
		}
		if (disty > 0) //Player is below enemy
		{
			move(charx, target.real_y - parent.G.monsters[target.mtype].range + 5);
		}
		if (disty < 0) //Player is above enemy
		{
			move(charx, target.real_y + parent.G.monsters[target.mtype].range + 5);
		}
	} else if (mode == 1)
		if (!in_attack_range(target)) {
			move(
				character.real_x + (target.real_x - character.real_x) / 2,
				character.real_y + (target.real_y - character.real_y) / 2
			);
			// Walk half the distance
		}
		/*    else if (mode == 2)
		    {
		        var tox, toy;
		        for (tox = -parent.G.monsters[target.mtype].range+5; tox <= parent.G.monsters[target.mtype].range+5; tox++)
		        {
		            for (toy = -parent.G.monsters[target.mtype].range+5; toy <= parent.G.monsters[target.mtype].range+5; toy++)
		            {
		                if (Math.pow(tox, 2) + Math.pow(toy, 2) == Math.pow(parent.G.monsters[target.mtype].range+5, 2))
		                    move(target.real_x + tox, target.real_y + toy);
		            }
		        }
		    } */
		//Following/Maintaining Distance - Too Simplistic

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
