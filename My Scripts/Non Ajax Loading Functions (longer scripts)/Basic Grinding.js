// Basic Grinding
// Auto Compounding & Upgrading stuff Courtesy of: Mark
// Version 1.10.0

//////////////////////////
// Main Settings Start //
////////////////////////

//NOTE: If you use mode 2, targetting will go by character range for searching for a target instead of going for a wider radius of searching for a target. [best used for range classes]

var mode = 0; //Standing still (will move if target is out of range) = 0, Front of target (Moves to front of target before attacking) = 1, Don't move at all (will not move even if target is out of range) = 2
// Movement //

var mtype = 'goo'; //Monster Type of the enemy you want to attack
// Preferred Monster [always keep '' around name] //

//If you don't know the monster type of an enemy you can find it here -- http://adventure.draiv.in/

var mtype2 = 'bee'; //Monster Type of the enemy you want to attack if you can't find the first
// Alternate Monster [always keep '' around name] //

////////////////////////
// Main Settings End //
//////////////////////

//////////////////////////////
// Optional Settings Start //
////////////////////////////

var gui_tl_gold = false; //Enable kill (or xp) till level & GPH [scripted session] = true, Disable kill (or xp) till level & GPH [scripted session] = false
var gui_timer = false; //Enable time till level [scripted session] = true, Disable time till level [scripted session] = false
var till_level = 0; //Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

var uc = false; //Enable Upgrading & Compounding of items = true, Disable Upgrading & Compounding of items = false
var upgrade_level = 8; //Max level it will stop upgrading items at if enabled
var compound_level = 3; //Max level it will stop compounding items at if enabled
uwhitelist = []; //uwhitelist is for the upgrading of items.
cwhitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp']; //cwhitelist is for the compounding of items.
// Upgrading & Compounding [will only upgrade & Compound items that are in your inventory & in the whitelists] //

var purchase_pots = false; //Enable Potion Purchasing = true, Disable Potion Purchasing = false
var buy_hp = false; //Allow HP Pot Purchasing = true, Disallow HP Pot Purchasing = false
var buy_mp = false; //Allow MP Pot Purchasing = true, Disallow MP Pot Purchasing = false
var hp_potion = 'hpot0'; //+200 HP Potion = 'hpot0', +400 HP Potion = 'hpot1' [always keep '' around it]
var mp_potion = 'mpot0'; //+300 MP Potion = 'mpot0', +500 MP Potion = 'mpot1' [always keep '' around it]
var pots_minimum = 50; //If you have less than this, you will buy more
var pots_to_buy = 1000; //This is how many you will buy
// Potion Maintenance //

useInvis = false; //[Rogue Skill] //Enable going invisible on cooldown = true, Disable going invisible on cooldown = false
useBurst = false; //[Mage Skill] //Enable Using burst on cooldown [only on targets above 6,000 hp] = true, Disable using burst on cooldown = false
useTaunt = false; //[Warrior Skill] //Enable Using taunt on cooldown = true, Disable using taunt on cooldown = false
useCharge = false; //[Warrior Skill] //Enable Using charge on cooldown = true, Disable using charge on cooldown = false
useSupershot = false; //[Ranger Skill] //Enable using supershot on cooldown = true, Disable using supershot on cooldown = false
// Skill Usage [Only turn on skill for the class you are running, if you want to use skills] //

////////////////////////////
// Optional Settings End //
//////////////////////////

//draw_circle(character.real_x,character.real_y,character.range);
//show_json(character);
//show_json(get_targeted_monster());
//show_json(parent.M);
//JSONs

//Grind Code start --------------------------
setInterval(function() {
  //Monster Searching
  var target = get_targeted_monster();
  if (mode == 2 && target && !in_attack_range(target)) target = null;
  if (!target || (target.target && target.target != character.name)) {
    target = get_closest_monster({
      m_type_priority: mtype,
      m_type_secondary: mtype2,
      targeting_mode: mode,
      no_attack: true,
      path_check: true
    });
    if (mode == 2 && target && !in_attack_range(target)) target = null;
    if (target) {
      change_target(target);
    } else {
      set_message("No Monsters");
      return;
    }
  }

  //Uses Vanish if enabled
  if (useInvis && character.ctype === 'rogue') {
    invis();
  }

  //Uses Burst if enabled [only on targets above 6,000 hp]
  if (useBurst && target.hp > 6000 && character.ctype === 'mage') {
    burst(target);
  }

  //Uses taunt if enabled
  if (useTaunt && character.ctype === 'warrior') {
    taunt(target);
  }

  //Uses Charge if enabled
  if (useCharge && character.ctype === 'warrior') {
    charge();
  }

  //Uses supershot if enabled [only on targets above 6,000 hp]
  if (useSupershot && target.hp > 6000 && character.ctype === 'ranger') {
    supershot(target);
  }

  //Attack
  if (can_attack(target))
    attack(target);
  set_message("Attacking: " + target.mtype);

}, (1 / character.frequency + 50) / 4); //base loop off character frequency

setInterval(function() {

  var target = get_targeted_monster();
  //Following/Maintaining Distance
  if (mode == 0) {
    //Walk half the distance
    if (target && !in_attack_range(target)) {
      move(
        character.real_x + (target.real_x - character.real_x) / 2,
        character.real_y + (target.real_y - character.real_y) / 2
      );
    }
  } else if (mode == 1) {
    if (target) {
      //Move to front of target
      move(target.real_x + 5, target.real_y + 5);
    }
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

}, 250); //Loop every 250 milliseconds

setInterval(function() {

  //Upgrade and Compound Items
  if (uc) {
    upgrade_and_compound(upgrade_level, compound_level);
  }

  //Purchases Potions when below threshold
  if (purchase_pots) {
    purchase_potions(buy_hp, buy_mp);
  }

}, 1000); //Loop every 1 second.

setInterval(function() {

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
//--------------------------Grind Code End

//Upgrade & Compound items in your inventory
function upgrade_and_compound(ulevel, clevel) {
  for (let i = 0; i < character.items.length; i++) {
    let c = character.items[i];
    if (c) {
      if (uwhitelist.includes(c.name) && c.level < ulevel) {
        let grades = item_info(c).grades;
        let scrollname;
        //Gets the item grade from parent.G.items so it only uses the cheapest scroll possible.
        if (c.level < grades[0])
          scrollname = 'scroll0';
        else if (c.level < grades[1])
          scrollname = 'scroll1';
        else
          scrollname = 'scroll2';
        //Check if the required scroll is in the inventory, buy one if there isn't.

        let [scroll_slot, scroll] = find_item_filter(i => i.name === scrollname);
        if (!scroll) {
          parent.buy(scrollname);
          return;
        }

        //Upgrade the item.
        parent.socket.emit('upgrade', {
          item_num: i,
          scroll_num: scroll_slot,
          offering_num: null,
          clevel: c.level
        });
        return;
      } else if (cwhitelist.includes(c.name) && c.level < clevel) { //There is an item that has to be compounded.
        let [item2_slot, item2] = find_item_filter((item) => c.name === item.name && c.level === item.level, i + 1); //The second item to compound.
        let [item3_slot, item3] = find_item_filter((item) => c.name === item.name && c.level === item.level, item2_slot + 1); //The third item to compound.
        if (item2 && item3) { //If there is a second and third copy of the item compound them.
          let cscrollname;
          if (c.level < 2) //Use whitescroll at base and +1.
            cscrollname = 'cscroll0';
          else //Use blackscroll at +2 and higher
            cscrollname = 'cscroll1';

          //Check if the required scroll is in the inventory, buy one if there isn't.
          let [cscroll_slot, cscroll] = find_item_filter(i => i.name === cscrollname);
          if (!cscroll) {
            parent.buy(cscrollname);
            return;
          }

          //Compound the items.
          parent.socket.emit('compound', {
            items: [i, item2_slot, item3_slot],
            scroll_num: cscroll_slot,
            offering_num: null,
            clevel: c.level
          });
          return;
        }
      }
    }
  }
}

//Potion Purchasing
function purchase_potions(buyHP, buyMP) {
  let [hpslot, hppot] = find_item_filter(i => i.name == hp_potion);
  let [mpslot, mppot] = find_item_filter(i => i.name == mp_potion);

  if (buyHP && (!hppot || hppot.q < pots_minimum)) {
    parent.buy(hp_potion, pots_to_buy);
    set_message("Buying HP pots.");
  }
  if (buyMP && (!mppot || mppot.q < pots_minimum)) {
    parent.buy(mp_potion, pots_to_buy);
    set_message("Buying MP pots.");
  }
}

//Returns the item slot and the item given the slot to start from and a filter.
function find_item_filter(filter, search_slot) {
  let slot = search_slot;
  if (!slot)
    slot = 0

  for (let i = slot; i < character.items.length; i++) {
    let item = character.items[i];

    if (item && filter(item))
      return [i, character.items[i]];
  }

  return [-1, null];
}

//Returns the item information from parent.G.items of the item.
function item_info(item) {
  return parent.G.items[item.name];
}

//Custom m_type targetting
function get_closest_monster(args) {
  //args:
  //m_type_priority - the monster you want to attack (bosses)
  //m_type_secondary - the monster you attack when your boss is not there
  //target: Only return monsters that target this "name" or player object
  var min_d = 999999,
    target = null;
  var mode = -1;
  if (args.targeting_mode) {
    mode = args.targeting_mode
    if (mode == 2) min_d = character.range;
  }
  if (args.m_type_priority == null && args.m_type_secondary == null) return null;
  if (args && args.target && args.target.name) args.target = args.target.name;
  for (id in parent.entities) {
    var current = parent.entities[id];
    if (current.type != "monster" || current.dead || (current.target && current.target != character.name)) continue;
    if (args.no_target && current.target && current.target != null && current.target != character.name) continue;
    if (args.path_check && !can_move_to(current)) continue;
    var c_dist = parent.distance(character, current);
    if (current.mtype == args.m_type_priority) {
      if (mode != 2) return current;
      else if (mode == 2 && c_dist < character.range) return current;
    } else if (c_dist < min_d && current.mtype == args.m_type_secondary) {
      min_d = c_dist;
      target = current;
    }
  }
  return target;
}

//Skill Usage

//Casts Vanish if class is Rogue and enabled and off cooldown
var lastinvis;

function invis() {
  //Vanish one invis is off cd (cd is 12sec).
  if (!lastinvis || new Date() - lastinvis > 12000) {
    lastinvis = new Date();
    parent.socket.emit("ability", {
      name: "invis",
    });
  }
}

//Casts burst if class is mage and enabled and off cooldown
var lastburst;

function burst(target) {
  //Cast burst on target whenever you're off cd (cd is 10sec).
  if (!lastburst || new Date() - lastburst > 10000) {
    lastburst = new Date();
    parent.socket.emit("ability", {
      name: "burst",
      id: target.id
    });
  }
}

//casts Taunt if class is warrior and enabled and off cooldown
var lasttaunt;

function taunt(target) {
  //Taunt only if target hasn't been taunted and if taunt is from cd (cd is 6sec).
  if ((!lasttaunt || new Date() - lasttaunt > 6000) && !target.taunted) {
    lasttaunt = new Date();
    parent.socket.emit("ability", {
      name: "taunt",
      id: target.id
    });
  }
}

//casts charge if class is warrior and enabled and off cooldown
var lastcharge;

function charge() {
  //Charge only if charge is off of cd (cd is 40sec).
  if (!lastcharge || new Date() - lastcharge > 40000) {
    lastcharge = new Date();
    parent.socket.emit("ability", {
      name: "charge",
    });
  }
}

//casts supershot when off cooldown and if enabled
var lastsupershot;

function supershot(target) {
  //Cast supershot whenever your off cd (cd is 30sec).
  if (!lastsupershot || new Date() - lastsupershot > 30000) {
    lastsupershot = new Date();
    parent.socket.emit("ability", {
      name: "supershot",
      id: target.id
    });
  }
}

//GUI Stuff
var minute_refresh; //how long before the clock refreshes
var last_target = null;
var gold = character.gold;
var date = new Date();
var p = parent;

function init_xptimer(minref) {
  minute_refresh = minref || 1;
  p.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);

  let $ = p.$;
  let brc = $('#bottomrightcorner');

  brc.find('#xptimer').remove();

  let xpt_container = $('<div id="xptimer"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '96px',
    fontSize: '28px',
    color: '#77EE77',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px'
  });

  //vertical centering in css is fun
  let xptimer = $('<div id="xptimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
    .appendTo(xpt_container);

  brc.children().first().after(xpt_container);
}

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
//lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)

function update_xptimer() {
  if (character.xp == last_xp_checked_kill) return;

  let $ = p.$;
  let now = new Date();

  let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
  if (time < 1) return; // 1s safe delay
  let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
  if (time > 60 * minute_refresh) {
    last_minutes_checked = new Date();
    last_xp_checked_minutes = character.xp;
  }
  last_xp_checked_kill = character.xp;

  let xp_missing = p.G.levels[character.level] - character.xp;
  let seconds = Math.round(xp_missing / xp_rate);
  let minutes = Math.round(seconds / 60);
  let hours = Math.round(minutes / 60);
  let counter = `${hours}h ${minutes % 60}min`;

  $('#xpcounter').text(counter);
  $('#xprate').text(`${ncomma(xp_rate)} XP/s`);
}

function initGUI() {
  let $ = p.$;
  let brc = $('#bottomrightcorner');
  let blc = $('#bottomleftcorner2');
  $('#xpui').css({
    fontSize: '25px',
  });

  brc.find('.xpsui').css({
    background: 'url("https://i.imgur.com/zCb8PGK.png")',
    backgroundSize: 'cover'
  });

  blc.find('#goldui').remove();
  blc.find('#goldgainloss').remove();
  let gb = $('<div id="goldui"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '-5px'
  });
  let ggl = $('<div id="goldgainloss"></div>').css({ //gold gain loss
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '-5px'
  });
  $('#bottomleftcorner2').prepend(ggl);
  $('#bottomleftcorner2').prepend(gb);
}

if (till_level === 0)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / p.G.levels[character.level]) * 100).toFixed(2);
  let xp_string = `LV${character.level} ${xp_percent}%`;
  var goldPerHour = 0;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  if (last_target) {
    let xp_missing = p.G.levels[character.level] - character.xp;
    let monster_xp = p.G.monsters[last_target].xp;
    goldPerHour = Math.round((character.gold - gold) / ((new Date() - date) / 3600000));
    let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
    let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
    xp_string += ` (${ncomma(monsters_left)} kills to go!)`;
  }
  $('#xpui').html(xp_string);
  $('#goldui').html(goldPerHour.toLocaleString('en-US', {
    minimumFractionDigits: 0
  }) + " Gold/hour");
  $('#goldgainloss').html(ncomma(character.gold - gold) + " Gold gain/lost");
} else if (till_level === 1)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
  let xp_missing = ncomma(G.levels[character.level] - character.xp);
  let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) xp to go!`;
  var goldPerHour = 0;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  goldPerHour = Math.round((character.gold - gold) / ((new Date() - date) / 3600000));
  let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
  $('#xpui').html(xp_string);
  $('#goldui').html(goldPerHour.toLocaleString('en-US', {
    minimumFractionDigits: 0
  }) + " Gold/hour");
  $('#goldgainloss').html(ncomma(character.gold - gold) + " Gold gain/lost");
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

if (gui_tl_gold) {
  initGUI();
}

if (gui_timer) {
  init_xptimer(5);
}

//Unusable:
//sleep()
//while loops