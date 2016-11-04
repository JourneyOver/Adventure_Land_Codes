// Auto Compounding Courtesy of: Mark
// Version 1.6.2

var mode = 0; //kite (move in straight line while attacking) [default] = 0, standing still (will move if target is out of range) = 1, circle kite (walks in circles around enemy) = 2, Front of target (Moves to front of target before attacking) = 3, Don't Move at all (will not move even if target is out of range) = 4
var targetting = 2; //Monster Range  = 0, Character Range = 1, Tank Range[default] = 2
var min_xp_from_mob = 1000; //set to minimum xp you want to be getting from each kill -- lowest amount of xp a mob has to have to be attacked
var max_att_from_mob = 100; //set to maximum damage you want to take from each hit -- most attack you're willing to fight
var min_xp_from_mob2 = 500; //set to minimum xp you want to be getting from each kill if can't find min from first target -- lowest amount of xp a mob has to have to be attacked
var max_att_from_mob2 = 50; //set to maximum damage you want to take from each hit if can't find max from first target -- most attack you're willing to fight
//Main Settings

var gui_tl_gold = false; //Set to true in order to turn on GUI for kill (or xp) till level + gold per hour (and gold per scripted session gained/lost) [if set to true and then turned to false you'll have to refresh game]
var gui_timer = false; //Set to true in order to turn on GUI for time till level [if set to true and then turned to false you'll have to refresh game]
var till_level = 0; // Kills till level = 0, XP till level = 1
//GUI Settings

var cp = false; //Set to true in order to allow compounding of items
var whitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj'];
var use_better_scrolls = false; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
var maxLevel = 3;
//compound settings

var purchase_pots = false; //Set to true in order to allow potion purchases
var buy_hp = false; //Set to true in order to allow hp potion purchases
var buy_mp = false; //Set to true in order to allow mp potion purchases
var hp_potion = 'hpot0'; //+200 HP Potion = 'hpot0', +400 HP Potion = 'hpot1' [always keep '' around it]
var mp_potion = 'mpot0'; //+300 MP Potion = 'mpot0', +500 MP Potion = 'mpot1' [always keep '' around it]
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 1000; //This is how many you will buy
//Automatic Potion Purchasing settings!

var prevx = 0;
var prevy = 0;
//Previous coords

var angle;
var flipcd = 0;
var stuck = 1;
//Distance Maintainence Variables

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

  loot();
  //Loot Chests

  var charx = character.real_x;
  var chary = character.real_y;
  //Character Location

  var target = get_targeted_monster();
  if (!target || (target.target && target.target != character.name)) {
    target = get_nearest_available_monster({
      min_xp: min_xp_from_mob,
      max_att: max_att_from_mob,
      no_attack: true
    });
    if (target) {
      change_target(target);
      angle = Math.atan2(target.real_y - chary, target.real_x - charx);
    } else if (!target) {
      target = get_nearest_available_monster({
        min_xp: min_xp_from_mob2,
        max_att: max_att_from_mob2
      });
      if (target) {
        change_target(target);
        angle = Math.atan2(target.real_y - chary, target.real_x - charx);
      } else {
        set_message("No Monsters");
        return;
      }
    }
  }
  //Monster Searching

  var enemydist;
  if (targetting === 0)
    enemydist = parent.G.monsters[target.mtype].range + 5;
  else if (targetting == 1)
    enemydist = character.range - 10;
  else
    enemydist = 30;
  //Targetting

  if (can_attack(target))
    attack(target);
  set_message("Attacking: " + target.mtype);
  //Attack

  /*  var parmem = get_nearest_solo_player();
    if (parmem)
      parent.socket.emit("party", {
        event: 'invite',
        id: parmem.id
      });
    //Invite to Party */

  var distx = target.real_x - charx;
  var disty = target.real_y - chary;
  if (!angle && target)
    angle = Math.atan2(disty, distx);
  //Enemy Distance and Angle


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

    if (distmov < stuck)
      angle = angle + Math.PI * 2 * 0.125;
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
  } else if (mode == 3) {
    move(target.real_x, target.real_y + 5);
  } else if (mode == 4) {}
  //Following/Maintaining Distance

  prevx = Math.ceil(charx);
  prevy = Math.ceil(chary);
  //Sets new coords to prev coords

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

function isBetween(num, compare, range) {
  return num >= compare - range && num <= compare + range;
}

function get_nearest_solo_player() {
  var min_d = 999999,
    target = null;
  for (var id in parent.entities) {
    var current = parent.entities[id];
    if (current.player === false || current.dead || current.party)
      continue;
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d)
      min_d = c_dist, target = current;
    else if (current.player === true)
      target = current;
  }
  return target;
  //Credit to /u/Sulsaries
}

function get_nearest_available_monster(args) {
  var min_d = 400,
    target = null;
  for (id in parent.entities) {
    var current = parent.entities[id];
    if (current.type != "monster" || args.min_xp && current.xp < args.min_xp || args.max_att && current.attack > args.max_att || current.dead || (current.target && current.target != character.name)) continue;
    if (args.no_target && current.target && current.target != character.name) continue;
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d) min_d = c_dist, target = current;
  }
  return target;
}

//GUI Stuff
var minute_refresh; // how long before the tracker resets
var last_target = null;
var gold = character.gold;
var date = new Date();
var p = parent;

function init_xptimer(minref) {
  minute_refresh = minref || 1;
  p.add_log(minute_refresh.toString() + ' min until refresh!', 0x00FFFF);

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
