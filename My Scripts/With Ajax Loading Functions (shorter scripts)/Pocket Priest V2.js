// Pocket Priest V2
// Base code and Auto Compounding Courtesy of: Mark
// Edits & Additions By: JourneyOver
// Version 1.5.0

//////////////////////////
// Main Settings Start //
////////////////////////

useCursing = true; //Enable Cursing = true, Disable Cursing = false
// Cursing [Will only curse targets above 6,000 HP] //

////////////////////////
// Main Settings End //
//////////////////////

//////////////////////////////
// Optional Settings Start //
////////////////////////////

gui_tl_gold = false; //Enable Kill (or XP) till level & GPH & Skill cooldown [scripted session] = true, Disable Kill (or XP) till level & GPH & Skill cooldown [scripted session] = false
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

  //Loot available chests
  loot();

  //Heal and restore mana if required
  if (character.hp / character.max_hp < 0.3 && new Date() > parent.next_potion) {
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

  //Purchases Potions when below threshold
  if (purchase_pots) {
    purchase_potions(buy_hp, buy_mp);
  }

  //Get the Party leader
  let leader = get_player(character.party);
  // This particular code only works when the priest in a party and within the searchrange of the leader.
  if (!leader) return;

  //Get the injured party members.
  let injured = GetInjured(leader.name);

  // Heal a party member
  if (injured.length > 0) {
    let target = injured[0];

    for (let i = 1; i < injured.length; i++) {
      // Target the party member with the lowest amount of hp
      if (injured[i].max_hp - injured[i].hp > target.max_hp - target.hp)
        target = injured[i];
    }

    heal(target);
    set_message("Healing: " + target.name);
  }

  // Do damage.
  target = get_target_of(leader);

  // If there is a valid target, attempt to curse it.
  if (target && get_target_of(target) && in_attack_range(target) && get_target_of(target).party == character.party) {
    if (useCursing && target.hp > 6000) {
      curse(target);
      set_message("Cursing: " + target.mtype);
    }

    // If you can attack the target, do so.
    if (can_attack(target))
      attack(target);
    set_message("Attacking: " + target.mtype);
  }

  //Move to leader.
  if (!character.moving)
  // Move only if you are not already moving.
    move(leader.real_x - 30, leader.real_y - 30);

}, 250);

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

var lastcurse;

function curse(target) {
  //Curse only if target hasn't been cursed and if curse off cd (cd is 5sec).
  if ((!lastcurse || new Date() - lastcurse > 5000) && !target.cursed) {
    lastcurse = new Date();
    parent.socket.emit("ability", {
      name: "curse",
      id: target.id
    });
  }
}

//Returns the injured party members.
function GetInjured(leader) {
  //List of party members.
  let res = [];
  //Only heal targets below 80% hp.
  let percentage = 0.8;

  for (id in parent.entities) {
    //current entity
    let c = parent.entities[id];

    //Only add if the target is a player, has a party and it's your party, isn't dead and in healing range.
    if (c.type == "character" && c.party && c.party == leader && !c.rip && can_attack(c)) {
      //Check if target is injured enough.
      if (c.hp < c.max_hp * percentage)
        res.push(c);
    }
  }

  //Add yourself to the party if you don't have full health.
  if (character.hp < character.max_hp * percentage)
    res.push(character);

  return res;
}