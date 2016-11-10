// Basic Grinding
// Auto Compounding stuff Courtesy of: Mark
// Version 1.7.1

//////////////////////////
// Main Settings Start //
////////////////////////

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
var till_level = 0; // Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

var cp = false; //Enable compounding [will compound items once you collect a set of 3] = true, Disable compounding [will not compound items] = false
var whitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp'];
var use_better_scrolls = false; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
var maxLevel = 3; //Max level it will stop compounding items at if enabled
// Compounding //

var purchase_pots = false; //Enable Potion Purchasing = true, Disable Potion Purchasing = false
var buy_hp = false; //Allow HP Pot Purchasing = true, Disallow HP Pot Purchasing = false
var buy_mp = false; //Allow MP Pot Purchasing = true, Disallow MP Pot Purchasing = false
var hp_potion = 'hpot0'; //+200 HP Potion = 'hpot0', +400 HP Potion = 'hpot1' [always keep '' around it]
var mp_potion = 'mpot0'; //+300 MP Potion = 'mpot0', +500 MP Potion = 'mpot1' [always keep '' around it]
var pots_minimum = 50; //If you have less than this, you will buy more
var pots_to_buy = 1000; //This is how many you will buy
// Potion Maintenance //

////////////////////////////
// Optional Settings End //
//////////////////////////

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

  //Compound Items
  if (cp) {
    compound_items();
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
      targeting_mode: 2
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

}, 200); // Loop Delay

function compound_items() {
  let to_compound = character.items.reduce((collection, item, index) => {
    if (item && item.level < maxLevel && whitelist.includes(item.name)) {
      let key = item.name + item.level;
      !collection.has(key) ? collection.set(key, [item.level, index]) : collection.get(key).push(index);
    }
    return collection;
  }, new Map());

  for (var c of to_compound.values()) {
    let scroll_name = use_better_scrolls && c[0] > 1 ? 'cscroll1' : 'cscroll0';

    for (let i = 1; i + 2 < c.length; i += 3) {
      let [scroll, _] = find_item(i => i.name == scroll_name);
      if (scroll == -1) {
        parent.buy(scroll_name);
        return;
      }
      parent.socket.emit('compound', {
        items: [c[i], c[i + 1], c[i + 2]],
        scroll_num: scroll,
        offering_num: null,
        clevel: c[0]
      });
    }
  }
}

function purchase_potions(buyHP, buyMP) {
  let [hpslot, hppot] = find_item(i => i.name == hp_potion);
  let [mpslot, mppot] = find_item(i => i.name == mp_potion);

  if (buyHP && (!hppot || hppot.q < pots_minimum)) {
    parent.buy(hp_potion, pots_to_buy);
    set_message("Buying HP pots.");
  }
  if (buyMP && (!mppot || mppot.q < pots_minimum)) {
    parent.buy(mp_potion, pots_to_buy);
    set_message("Buying MP pots.");
  }
}

function find_item(filter) {
  for (let i = 0; i < character.items.length; i++) {
    let item = character.items[i];

    if (item && filter(item))
      return [i, character.items[i]];
  }

  return [-1, null];
}

function get_closest_monster(args) {
  //args:
  // m_type_priority - the monster you want to attack (bosses)
  // m_type_secondary -the monster you attack when your boss is not there
  // target: Only return monsters that target this "name" or player object
  var min_d = 999999,
    target = null;
  var mode = -1;
  if (args.targeting_mode) {
    mode = args.targeting_mode
    if (mode == 2) min_d = 999999;
  }
  if (args.m_type_priority == null && args.m_type_secondary == null) return null;
  if (args && args.target && args.target.name) args.target = args.target.name;
  for (id in parent.entities) {
    var current = parent.entities[id];
    if (current.type != "monster" || current.dead || (current.target && current.target != character.name)) continue;
    if (args.no_target && current.target && current.target != null && current.target != character.name) continue;
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

//GUI Stuff
var minute_refresh; // how long before the tracker refreshes
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
    /*  marginBottom: '16px' */
  });

  //vertical centering in css is fun
  let xptimer = $('<div id="xptimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
    .appendTo(xpt_container);

  brc.prepend(xpt_container);
}

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
// lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)

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
  let ggl = $('<div id="goldgainloss"></div>').css({ // gold gain loss
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