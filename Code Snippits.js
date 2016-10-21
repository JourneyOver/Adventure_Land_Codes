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
} ]

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

// Auto Upgrade 2
var item_slot = 0; //Inventory slot of item to be upgraded
var scroll_slot = 1; //Inventory slot of 1000g scroll (T1)
var scroll2_slot = 2; //Inventory slot of 40000g scroll (T2)
var max_item_level = 7; //Max level to be upgraded to
var item_to_upgrade = "boots" //Name of item to be upgraded


setInterval(function(){

    //Buy an item_to_upgrade if there is nothing in item_slot
    if(!character.items[item_slot])
        parent.buy(item_to_upgrade, 1);

    //If scroll_slot is empty buy 200 more T1 scrolls
    if(!character.items[scroll_slot])
        parent.buy("scroll0", 200);

    //If max_item_level is above 7 this will buy a T2 scroll if scroll2_slot is empty
    if(max_item_level > 7)
    {
        if(!character.items[scroll2_slot])
        parent.buy("scroll1", 1);
    }


    //Upgrades items until the max_item_level is reached
    if(max_item_level <= 7)
    {
        if(character.items[item_slot].level < max_item_level)
        {
            upgrade(item_slot, scroll_slot); //upgrade using T1 scroll
        }
    }else if(max_item_level > 7)
    {
        //If the item is below level 7 upgrade using T1 scroll, if the item is level 7 or higher upgrade using T2 scroll
        if(character.items[item_slot].level <= 6)
        {
            upgrade(item_slot, scroll_slot);
        }
        else if(character.items[item_slot].level < max_item_level)
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

//More Advenced Auto upgrade
function find_item(itemName) {
  var i;

  for (i = 0; i < 42; i++) {
    if (character.items[i] != undefined &&
        character.items[i].name == itemName) {
          return i;
        }
  }
  return -1;

}

function equipItem(invSlot) {
  var sock = get_socket();
  sock.emit("equip", {num: invSlot});
}

function upgradeEquip(itemName, equipSlot, level, buyable) {
  var invSlot;
  var invItem;
  var equippedItem;
  var scrollSlot;

  //ensure item in inv
  invSlot = find_item(itemName);
  if (invSlot == -1) {
    if (buyable) {
      buy(itemName, 1);
      return true;
    }
    return false;
  } else {
    invItem = character.items[invSlot];
  }

  //ensure item is equipped
  equippedItem = character.slots[equipSlot];
  if (equippedItem == undefined || equippedItem.name != itemName) {
    equipItem(invSlot);
    return true;
  }

  //ensure equipped item is not at level
  if (equippedItem.level >= level) {
    return false;
  }

  //equip the better
  if (invItem.level > equippedItem.level) {
    equipItem(invSlot);
    return true;
  }


  if (invItem.level < 7) {
  //ensure have scroll
    scrollSlot = find_item("scroll0");
    if (scrollSlot == -1) {
      buy("scroll0", 1);
      return true;
    }

    //upgrade the inv
    upgrade(invSlot, scrollSlot);
    return true;
  }
  else {
    scrollSlot = find_item("scroll1");
    if (scrollSlot == -1) {
      buy("scroll1", 1);
      return true;
    }

    //upgrade the inv
    upgrade(invSlot, scrollSlot);
    return true;
  }
}

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

//Follow The Party Leader And Attack His Target
setInterval(function(){
    loot();
    if(character.max_hp - character.hp > 200 ||
       character.max_mp - character.mp > 300)
        use_hp_or_mp();

    // Party leader
    var leader = get_player(character.party);

    // Current target and target of leader.
    var currentTarget = get_targeted_monster();
    var leaderTarget = get_target_of(leader)

    // Change the target.
    if (!currentTarget || currentTarget != leaderTarget){
        // Current target is empty or other than the leader's.
        change_target(leaderTarget);
        currentTarget = get_targeted_monster();
    }

    // Attack the target.
    if(currentTarget && can_attack(currentTarget)){
        // Current target isn't empty and attackable.
        attack(currentTarget);
    }

    //Move to leader.
    if(!character.moving)
        // Move only if you are not already moving.
        move(character.real_x + (leader.real_x - character.real_x),
             character.real_y + (leader.real_y - character.real_y));
},1000/4);


//Upgrade and exchange
var upgrade = true; // true for upgrading, false for exchanging
var exItemScroll = 0 // The slot with the scrolls/item to be exchanged (slot 0 is first inv slot)
var itemSlot = 1 // The slot with the item to be upgraded.
var maxLevel = 7 // Max level the item can become.

var updatesPS; // Number of updates per sec.

setInterval(function(){
    if(upgrade && character.items[itemSlot].level < maxLevel-1) {
        upgrade(itemSlot,exItemScroll);
        updatesPS = 4;
    }
    else{
        exchange(exItemScroll);
        updatesPS = 1;
    }
},1000/updatesPS);


//different targeting procedure
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
