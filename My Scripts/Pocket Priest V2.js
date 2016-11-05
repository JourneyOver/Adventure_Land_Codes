// Pocket Priest V2
// Will follow your party around and auto-heal the members based on a priority calculation.
// It looks at their max hp vs current hp and heals the person with the highest percentage loss.
// Base code and Auto Compounding Courtesy of: Mark
// Edits & Additions By: JourneyOver
// Version 1.3.6

var heal_dist = 1; //Stay at a distance and move when out of range of target/leader (only when leader is attacking something) = 0, Stay always on top of leader [default] = 1
var useCursing = true; //set to false to turn priest skill curse off
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
//Automatic Potion Purchasing!

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

  //Move when out of range of target/leader (only when leader is attacking)
  if (heal_dist === 0 && target && !in_attack_range(target))
    move_to(target, character.range);
  else if (heal_dist === 1 && !character.moving)
  //Stay ontop of leader.
    move(leader.real_x, leader.real_y);

}, 1000 / 4);

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

function move_to(char, distance) {
  if (!char) return;
  var dist_x = character.real_x - char.real_x;
  var dist_y = character.real_y - char.real_y;

  var from_char = sqrt(dist_x * dist_x + dist_y * dist_y);

  var perc = from_char / distance;

  if (perc > 1.01) {
    move(
      character.real_x - (dist_x - dist_x / perc),
      character.real_y - (dist_y - dist_y / perc)
    );
    return true;
  }
  return false;
};

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

//Purchase Potions
function purchase_potions(buyHP, buyMP) {
  let [hpslot, hppot] = find_item(i => i.name == hp_potion);
  let [mpslot, mppot] = find_item(i => i.name == mp_potion);

  if (buyHP && (!hppot || hppot.q < pots_minimum)) {
    parent.buy(hp_potion, pots_to_buy);
    set_message("Buying hp pots.");
  }
  if (buyMP && (!mppot || mppot.q < pots_minimum)) {
    parent.buy(mp_potion, pots_to_buy);
    set_message("Buying mp pots.");
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

//GUI Stuff
var minute_refresh; // how long before the tracker resets
var last_target = null;
var gold = character.gold;
var date = new Date();
var p = parent;

var skills = {
  'charge': {
    display: 'Charge',
    cooldown: 40000
  },
  'taunt': {
    display: 'Taunt',
    cooldown: 6000
  },
  'supershot': {
    display: 'Super Shot',
    cooldown: 30000
  },
  'curse': {
    display: 'Curse',
    cooldown: 5000
  },
  'invis': {
    display: 'Stealth',
    cooldown: 12000,
    start: () => new Promise((res) => {
      let state = 0;
      let watcher_interval = setInterval(() => {
        if (state == 0 && character.invis) state = 1;
        else if (state == 1 && !character.invis) state = 2;

        if (state == 2) {
          clearInterval(watcher_interval);
          res();
        }
      }, 10);
    })
  }
};

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

function create_cooldown(skill) {
  let $ = p.$;

  let cd = $('<div class="cd"></div>').css({
    background: 'black',
    border: '5px solid gray',
    height: '30px',
    position: 'relative',
    marginTop: '5px',
  });

  let slider = $('<div class="cdslider"></div>').css({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    background: 'green',
    border: '2px solid black',
    boxSizing: 'border-box',
  });

  let text = $(`<span class="cdtext">${skill}</div>`).css({
    width: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: '30px',
    position: 'relative',
  });

  cd.append(slider);
  cd.append(text);

  return cd;
}

var cooldowns = [];

function manage_cooldown(skill) {
  let $ = p.$;

  let skill_info = skills[skill];

  if (!skill_info || cooldowns.includes(skill)) return;
  cooldowns.push(skill);

  let start = skill_info.start ? skill_info.start() : Promise.resolve();

  let el = create_cooldown(skill_info.display);
  $('#cdcontainer').append(el);

  start.then(() => {
    el.find('.cdslider').animate({
      width: '4px'
    }, skill_info.cooldown, 'linear', () => {
      el.remove();
      cooldowns.splice(cooldowns.indexOf(skill), 1);
    });
  });
}

function initGUI() {
  let $ = p.$;
  let brc = $('#bottomrightcorner');
  let blc = $('#bottomleftcorner2');
  $('#xpui').css({
    fontSize: '25px',
  });

  if (p.original_emit) p.socket.emit = p.original_emit;

  $('#cdcontainer').remove();

  let mid = $('#bottommid');
  let cd_container = $('<div id="cdcontainer"></div>').css({
    width: '360px',
    position: 'absolute',
    bottom: '90px',
    right: 0,
    left: 0,
    margin: 'auto'
  });

  mid.append(cd_container);

  p.original_emit = p.socket.emit;

  p.socket.emit = function(event, args) {
    if (parent && event == 'ability') {
      manage_cooldown(args.name);
    }
    p.original_emit.apply(this, arguments);
  };

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
