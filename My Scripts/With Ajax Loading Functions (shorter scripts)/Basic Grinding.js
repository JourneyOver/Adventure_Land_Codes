// Basic Grinding
// Auto Compounding & Upgrading stuff Courtesy of: Mark
// Version 1.10.0

//////////////////////////
// Main Settings Start //
////////////////////////

//NOTE: If you use mode 2, targetting will go by character range for searching for a target instead of going for a wider radius of searching for a target. [best used for range classes]

mode = 0; //Standing still (will move if target is out of range) = 0, Front of target (Moves to front of target before attacking) = 1, Don't move at all (will not move even if target is out of range) = 2
// Movement //

mtype = 'goo'; //Monster Type of the enemy you want to attack
// Preferred Monster [always keep '' around name] //

//If you don't know the monster type of an enemy you can find it here -- http://adventure.draiv.in/

mtype2 = 'bee'; //Monster Type of the enemy you want to attack if you can't find the first
// Alternate Monster [always keep '' around name] //

////////////////////////
// Main Settings End //
//////////////////////

//////////////////////////////
// Optional Settings Start //
////////////////////////////

gui_tl_gold = false; //Enable kill (or xp) till level & GPH [scripted session] = true, Disable kill (or xp) till level & GPH [scripted session] = false
gui_timer = false; //Enable time till level [scripted session] = true, Disable time till level [scripted session] = false
till_level = 0; // Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

uc = false; //Enable Upgrading & Compounding of items = true, Disable Upgrading & Compounding of items = false
umaxlevel = 8; //Max level it will stop upgrading items at if enabled
cmaxlevel = 3; //Max level it will stop compounding items at if enabled
uwhitelist = []; //Add items that you want to be upgraded as they come into your inventory [always add ' ' around item and , after item]
cwhitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp']; //Add items that you want to be compounded [always add ' ' around item and , after item]
// Upgrading & Compounding [will only upgrade & Compound items that are in your inventory & in the whitelists] //

purchase_pots = false; //Enable Potion Purchasing = true, Disable Potion Purchasing = false
buy_hp = false; //Allow HP Pot Purchasing = true, Disallow HP Pot Purchasing = false
buy_mp = false; //Allow MP Pot Purchasing = true, Disallow MP Pot Purchasing = false
hp_potion = 'hpot0'; //+200 HP Potion = 'hpot0', +400 HP Potion = 'hpot1' [always keep '' around it]
mp_potion = 'mpot0'; //+300 MP Potion = 'mpot0', +500 MP Potion = 'mpot1' [always keep '' around it]
pots_minimum = 50; //If you have less than this, you will buy more
pots_to_buy = 1000; //This is how many you will buy
// Potion Maintenance //

////////////////////////////
// Optional Settings End //
//////////////////////////

//draw_circle(character.real_x,character.real_y,character.range);
//show_json(character);
//show_json(get_targeted_monster());
//show_json(parent.M);
//JSONs

//Grind Code below --------------------------
setInterval(function() {

  //Updates GUI for Till_Level/Gold
  if (gui_tl_gold) {
    updateGUI();
  }

  //Updates GUI for time till level
  if (gui_timer) {
    update_xptimer();
  }

  //Upgrade and Compound Items
  if (uc) {
    upgrade(umaxlevel, cmaxlevel);
  }

  //Purchases Potions when below threshold
  if (purchase_pots) {
    purchase_potions(buy_hp, buy_mp);
  }

  //Heal and restore mana if required
  if (character.hp / character.max_hp < 0.4 && new Date() > parent.next_potion) {
    parent.use('hp');
    if (character.hp <= 100)
      parent.socket.emit("transport", {
        to: "main"
      });
    //Panic Button
  }

  if (character.mp / character.max_mp < 0.3 && new Date() > parent.next_potion)
    parent.use('mp');
  //Constrained Healing

  loot();
  //Loot Chests

  var target = get_targeted_monster();
  if (mode == 2 && target && !in_attack_range(target)) target = null;
  if (!target || (target.target && target.target != character.name)) {
    target = get_closest_monster({
      m_type_priority: mtype,
      m_type_secondary: mtype2,
      no_attack: true,
      targeting_mode: mode
    });
    if (mode == 2 && target && !in_attack_range(target)) target = null;
    if (target) {
      change_target(target);
    } else {
      set_message("No Monsters");
      return;
    }
  }
  //Monster Searching

  if (can_attack(target))
    attack(target);
  set_message("Attacking: " + target.mtype);
  //Attack

  if (mode == 0) {
    // Walk half the distance
    if (!in_attack_range(target)) {
      move(
        character.real_x + (target.real_x - character.real_x) / 2,
        character.real_y + (target.real_y - character.real_y) / 2
      );
    }
  } else if (mode == 1) {
    // Move to front of target
    move(target.real_x + 5, target.real_y + 5);
  }
  //Following/Maintaining Distance

}, 250); // Loop Delay

//If an error starts producing, please notify me (@♦👻 ᒍOᑌᖇᑎᕮY Oᐯᕮᖇ 💎★#4607) on discord!
var urls = ['http://tiny.cc/MyFunctions', 'http://tiny.cc/Game_Log_Filters'];

$.each(urls, function(i, u) {
  $.ajax(u, {
    type: 'POST',
    dataType: "script",
    async: false,
    cache: true
  });
});

//Unusable:
//sleep()
//while loops