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

	loot();
	//Loot Chests

	// Party leader
	var leader = get_player(character.party);

	// Current target and target of leader.
	var currentTarget = get_targeted_monster();
	var leaderTarget = get_target_of(leader)
	var targetTarget = get_target_of(currentTarget)

	// Change the target.
	if (!currentTarget || currentTarget != leaderTarget) {
		// Current target is empty or other than the leader's.
		change_target(leaderTarget);
		currentTarget = get_targeted_monster();
	}

	// Attack the target.
	if (currentTarget && can_attack(currentTarget) && targetTarget == leader) {
		// Current target isn't empty and attackable.
		attack(currentTarget);
	}

	//Move to leader.
	if (!character.moving)
	// Move only if you are not already moving.
		move(leader.real_x, leader.real_y);

	set_message("Dpsing");
}, 1000 / 4);

function purchase_potions() {
	set_message("Buying pots.");
	if (character.items[0].q < pots_minimum) {
		parent.buy("hpot0", pots_to_buy);
	}
	if (character.items[1].q < pots_minimum) {
		parent.buy("mpot0", pots_to_buy);
	}
}
