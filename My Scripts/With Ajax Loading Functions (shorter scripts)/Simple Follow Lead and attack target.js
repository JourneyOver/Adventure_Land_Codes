// Follow Lead & Attack Leaders Target
// Base Code & Auto Compounding stuff Courtesy of: Mark
// Edits & Additions By: JourneyOver
// Version 1.7.5

//////////////////////////////
// Optional Settings Start //
////////////////////////////

gui_tl_gold = false; //Enable Kill (or XP) till level & GPH [scripted session] = true, Disable Kill (or XP) till level & GPH [scripted session] = false
gui_timer = false; //Enable time till level [scripted session] = true, Disable time till level [scripted session] = false
till_level = 0; //Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

uc = false; //Enable Upgrading/Compounding/selling/exchanging of items = true, Disable Upgrading/Compounding/selling/exchanging of items = false
upgrade_level = 8; //Max level it will stop upgrading items at if enabled
compound_level = 3; //Max level it will stop compounding items at if enabled
swhitelist = []; //swhitelist is for the selling of items
ewhitelist = []; //ewhitelist is for the exchanging of items
uwhitelist = []; //uwhitelist is for the upgrading of items.
cwhitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp']; //cwhitelist is for the compounding of items.
// Upgrading/Compounding/selling/exchanging //

purchase_pots = false; //Enable Potion Purchasing = true, Disable Potion Purchasing = false
buy_hp = false; //Allow HP Pot Purchasing = true, Disallow HP Pot Purchasing = false
buy_mp = false; //Allow MP Pot Purchasing = true, Disallow MP Pot Purchasing = false
hp_potion = 'hpot0'; //+200 HP Potion = 'hpot0', +400 HP Potion = 'hpot1' [always keep '' around it]
mp_potion = 'mpot0'; //+300 MP Potion = 'mpot0', +500 MP Potion = 'mpot1' [always keep '' around it]
pots_minimum = 50; //If you have less than this, you will buy more
pots_to_buy = 1000; //This is how many you will buy
// Potion Maintenance //

useInvis = false; //[Rogue Skill] //Enable going invisible on cooldown = true, Disable going invisible on cooldown = false
useBurst = false; //[Mage Skill] //Enable Using burst on cooldown [only on targets above 6,000 hp] = true, Disable using burst on cooldown = false
useCharge = false; //[Warrior Skill] //Enable Using charge on cooldown = true, Disable using charge on cooldown = false
useSupershot = false; //[Ranger Skill] //Enable using supershot on cooldown = true, Disable using supershot on cooldown = false
// Skill Usage [Only turn on skill for the class you are running, if you want to use skills] //

////////////////////////////
// Optional Settings End //
//////////////////////////

//Grind Code start --------------------------
setTimeout(function () {
  setInterval(function () {

    //Party leader
    let leader = get_player(character.party);

    //Current target and target of leader.
    let currentTarget = get_target();
    let leaderTarget = get_target_of(leader);
    let targetTarget = get_target_of(currentTarget);

    //Change the target.
    if (!currentTarget || currentTarget !== leaderTarget) {
      //Current target is empty or other than the leader's.
      change_target(leaderTarget);
      currentTarget = get_target();
    }

    //Uses Vanish if enabled
    if (useInvis && character.ctype === 'rogue') {
      invis();
    }

    //Uses Burst if enabled [only on targets above 6,000 hp]
    if (useBurst && currentTarget && currentTarget.hp > 6000 && character.ctype === 'mage') {
      burst(currentTarget);
    }

    //Uses Charge if enabled
    if (useCharge && character.ctype === 'warrior') {
      charge();
    }

    //Uses supershot if enabled [only on targets above 6,000 hp]
    if (useSupershot && currentTarget && currentTarget.hp > 6000 && character.ctype === 'ranger') {
      supershot(currentTarget);
    }

    //Attack the target.
    if (currentTarget && can_attack(currentTarget) && targetTarget == leader) {
      //Current target isn't empty and attackable.
      attack(currentTarget);
      set_message("Attacking: " + currentTarget.mtype);
    }

  }, (1 / character.frequency + 50) / 4); //base loop off character frequency

  setInterval(function () {

    //Party leader
    let leader = get_player(character.party);

    //Move to leader.
    if (leader && !character.moving)
      //Move only if you are not already moving.
      move(leader.real_x + 30, leader.real_y - 30);

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

  }, 250); //Loop every 250 milliseconds

  setInterval(function () {

    //Upgrade/Compound/Sell/Exchange Items
    if (uc) {
      seuc_merge(upgrade_level, compound_level);
    }

    //Purchases Potions when below threshold
    if (purchase_pots) {
      purchase_potions(buy_hp, buy_mp);
    }

  }, 1000); //Loop every 1 second.

  setInterval(function () {

    //Updates GUI for Till_Level/Gold
    if (gui_tl_gold) {
      updateGUI();
    }

    //Updates GUI for Time Till Level
    if (gui_timer) {
      update_xptimer();
    }

    //Loot available chests
    loot();

  }, 500); //Loop every 500 milliseconds
}, 500); //Delay execution of Grind Code by 500 milliseconds to load ajax.
//--------------------------Grind Code End

//If an error starts producing consistently, please notify me (@♦👻 ᒍOᑌᖇᑎᕮY Oᐯᕮᖇ 💎★#4607) on discord! [uncomment game log filters if you want them]
var urls = ['http://tiny.cc/MyFunctions', 'http://tiny.cc/Skill_Usage_S' /*, 'http://tiny.cc/Game_Log_Filters' */ ];

$.each(urls, function(i, u) {
  $.ajax(u, {
    type: 'POST',
    dataType: "script",
    async: false,
    cache: true
  });
});