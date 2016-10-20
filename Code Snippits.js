//Returns the nearest living player.
function get_nearest_player() {
	var min_d = 999999,
		target = null;
	for (id in parent.entities) {
		var current = parent.entities[id];
		if (current.player === false || current.dead) continue;
		var c_dist = parent.distance(character, current);
		if (c_dist < min_d) min_d = c_dist, target = current;
		else if (current.player === true) {
			target = current;
		}
	}
	return target;
}

//Returns the nearest living player not currently in a party
function get_nearest_solo_player() {
	var min_d = 999999,
		target = null;
	for (id in parent.entities) {
		var current = parent.entities[id];
		if (current.player === false || current.dead || current.party) continue;
		var c_dist = parent.distance(character, current);
		if (c_dist < min_d) min_d = c_dist, target = current;
		else if (current.player === true) {
			target = current;
		}
	}
	return target;
}

//Gets the nearest living member of your party
//Modified by: Sulsaries
function get_nearest_party_member() {
	var min_d = 999999,
		target = null;
	for (id in parent.entities) {
		var current = parent.entities[id];
		if (current.player === false || current.dead || current.party != character.party) {
			continue;
		}
		var c_dist = parent.distance(character, current);
		if (c_dist < min_d) min_d = c_dist, target = current;
		else if (current.player === true) {
			target = current;
		}
	}
	return target;
}

//Fills the party_list with the living members of your party in the area.
//Modified by: Sulsaries
var party_count = 0;
var party_list = [
	{
		name: "",
		priority: 0
},
	{
		name: "",
		priority: 0
},
	{
		name: "",
		priority: 0
},
	{
		name: "",
		priority: 0
},
	{
		name: "",
		priority: 0
},
	{
		name: "",
		priority: 0
}, ]

function fill_party_list() {
	var min_d = 999999,
		target = null;
	party_count = 0;
	for (id in parent.entities) {
		var current = parent.entities[id];
		if (current.player === false || current.dead || current.party != character.party) {
			continue;
		}
		var c_dist = parent.distance(character, current);
		if (c_dist < min_d) min_d = c_dist, target = current;
		else if (current.player === true) {
			target = current;
			party_list[party_count].name = target.name;
		}
	}
	return;
}

// Auto Upgrade
//Above setInerval
var upgradeNumber = 0;
var itemNumber = 0; //Change this zero to where your items to upgrade start

//Inside setInterval
if (upgradeNumber < 3 && itemNumber <= /last item to be upgraded/) {
	upgrade(itemNumber, 39);
	upgradeNumber++;
	if (upgradeNumber == 3) {
		upgradeNumber = 0;
		itemNumber++;
	}
}

// Auto Upgrade 2 (stops at a +6)
var item_slot = 0;
var scroll_slot = 1;
var scroll2_slot = 2;
var max_item_level = 7;
var item_to_upgrade = "boots"


setInterval(function(){

    if(!character.items[item_slot])
        parent.buy(item_to_upgrade, 1);
    if(!character.items[scroll_slot])
        parent.buy("scroll0", 200);
    if(!character.items[scroll2_slot])
        parent.buy("scroll1", 1);

    if(max_item_level <= 7)
    {
        if(character.items[item_slot].level < max_item_level)
        {
            upgrade(item_slot, scroll_slot);
        }
    }else if(max_item_level > 7)
    {
        if(character.items[item_slot].level <= 6)
        {
            upgrade(item_slot, scroll_slot);
        }else if(character.items[item_slot].level < max_item_level)
        {
            upgrade(item_slot, scroll2_slot)
        }
    }



},1000/2); // Loops every 1/2 seconds.

//Auto Upgrade 3
var item_slot = 0;
var scroll_slot = 1;
// Put the item to upgrade in slot 0, the scroll to use in slot 1
// If the items are not present (used/destroyed), buy new ones.
if (!character.items[item_slot])
	parent.buy("gloves", 1);
if (!character.items[scroll_slot])
	parent.buy("scroll0", 200);

// parent.upgrade(item_slot, scroll_slot) didn't seem to work
// upgrade changes u_item and u_scroll, so I just change them directly.
parent.u_item = item_slot;
parent.u_scroll = scroll_slot;
parent.upgrade();

//Refined Potion Use
if (character.hp <= character.max_hp - 200 || character.mp < character.mp_cost) {
	use_hp_or_mp();
}

//refined Potion Use 2
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

//Automatic Potion Purchasing!
//Courtesy of: Sulsaries
var purchase_pots = true; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 100; //This is how many you will buy

function purchase_potions() {
	set_message("Buying pots.");
	if (character.items[0].q < pots_minimum) {
		parent.buy("hpot0", pots_to_buy);
	}
	if (character.items[1].q < pots_minimum) {
		parent.buy("mpot0", pots_to_buy);
	}
}

//Place inside setInterval to check potions when turned on.
if (purchase_pots) {
	purchase_potions();
}

//Checks to see if your character has moved.
//Modified by: Sulsaries
var deltaX = 0;
var deltaY = 0;
var oldX = character.real_x;
var oldY = character.real_y;

function has_moved() {
	deltaX = character.real_x - oldX;
	deltaY = character.real_y - oldY;
	var moved = false;
	if (deltaX || deltaY) {
		moved = true;
	}
	oldX = character.real_x;
	oldY = character.real_y;
	return moved;
}
