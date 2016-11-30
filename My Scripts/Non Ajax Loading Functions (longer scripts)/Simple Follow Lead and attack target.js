// Follow Lead & Attack Leaders Target
// Base Code & Auto Compounding stuff Courtesy of: Mark
// Edits & Additions By: JourneyOver
// Version 1.5.2

//////////////////////////////
// Optional Settings Start //
////////////////////////////

var gui_tl_gold = false; //Enable Kill (or XP) till level & GPH [scripted session] = true, Disable Kill (or XP) till level & GPH [scripted session] = false
var gui_timer = false; //Enable time till level [scripted session] = true, Disable time till level [scripted session] = false
var till_level = 0; // Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

var uc = false; //Enable Upgrading & Compounding of items = true, Disable Upgrading & Compounding of items = false
var umaxlevel = 8; //Max level it will stop upgrading items at if enabled
var cmaxlevel = 3; //Max level it will stop comppounding items at if enabled
var uwhitelist = []; //Add items that you want to be upgraded as they come into your inventory [always add ' ' around item and , after item]
var cwhitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp']; //Add items that you want to be compounded [always add ' ' around item and , after item]
// Upgrading & Compounding [will only upgrade & Compound items that are in your inventory & in the whitelists] //

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

  // Party leader
  let leader = get_player(character.party);

  // Current target and target of leader.
  let currentTarget = get_target();
  let leaderTarget = get_target_of(leader);
  let targetTarget = get_target_of(currentTarget);

  // Change the target.
  if (!currentTarget || currentTarget !== leaderTarget) {
    // Current target is empty or other than the leader's.
    change_target(leaderTarget);
    currentTarget = get_target();
  }

  // Attack the target.
  if (currentTarget && can_attack(currentTarget) && targetTarget == leader) {
    // Current target isn't empty and attackable.
    attack(currentTarget);
    set_message("Attacking: " + currentTarget.mtype);
  }

  //Move to leader.
  if (leader && !character.moving)
  // Move only if you are not already moving.
    move(leader.real_x + 30, leader.real_y - 30);

}, 250);

function upgrade(ulevel, clevel) {
  for (let i = 0; i < character.items.length; i++) {
    let c = character.items[i];
    if (c) {
      if (uwhitelist.includes(c.name) && c.level < ulevel) {
        let grades = item_info(c).grades;
        let scrollname;
        if (c.level < grades[0])
          scrollname = 'scroll0';
        else if (c.level < grades[1])
          scrollname = 'scroll1';
        //else
        //scrollname = 'scroll2';

        let [scroll_slot, scroll] = find_item_filter(i => i.name === scrollname);
        if (!scroll) {
          parent.buy(scrollname);
          return;
        }

        parent.socket.emit('upgrade', {
          item_num: i,
          scroll_num: scroll_slot,
          offering_num: null,
          clevel: c.level
        });
        return;
      } else if (cwhitelist.includes(c.name) && c.level < clevel) {
        let [item2_slot, item2] = find_item_filter((item) => c.name === item.name && c.level === item.level, i + 1);
        let [item3_slot, item3] = find_item_filter((item) => c.name === item.name && c.level === item.level, item2_slot + 1);
        if (item2 && item3) {
          let cscrollname;
          if (c.level < 2)
            cscrollname = 'cscroll0';
          else
            cscrollname = 'cscroll1';

          let [cscroll_slot, cscroll] = find_item_filter(i => i.name === cscrollname);
          if (!cscroll) {
            parent.buy(cscrollname);
            return;
          }

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

// Returns the grade of the item.
function item_info(item) {
  return parent.G.items[item.name];
}

// Returns the item slot and the item given the slot to start from and a filter.
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