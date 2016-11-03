//Version 1.3.0

var till_level = 0; // Kills till level = 0, XP till level = 1
//Main Settings

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
  updateGUI();

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
  var leader = get_player(character.party);

  // Current target and target of leader.
  var currentTarget = get_targeted_monster();
  var leaderTarget = get_target_of(leader);
  var targetTarget = get_target_of(currentTarget);

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
    set_message("Attacking " + currentTarget.mtype);
  }

  //Move to leader.
  if (!character.moving)
  // Move only if you are not already moving.
    move(leader.real_x, leader.real_y);

}, 1000 / 4);

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

//GUI Stuff
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

var p = parent;

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

  let brc = $('#bottomrightcorner');
  $('#xpui').css({
    fontSize: '28px',
  });

  brc.find('.xpsui').css({
    background: 'url("https://i.imgur.com/zCb8PGK.png")',
    backgroundSize: 'cover'
  });

  brc.find('#goldui').remove();
  let gb = $('<div id="goldui"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '0 5px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '30px',
    color: '#FFD700',
    textAlign: 'center',
  });
  gb.insertBefore($('#gamelog'));
}

var last_target = null;

if (till_level === 0)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / p.G.levels[character.level]) * 100).toFixed(2);
  let xp_string = `LV${character.level} ${xp_percent}%`;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  if (last_target) {
    let xp_missing = p.G.levels[character.level] - character.xp;
    let monster_xp = p.G.monsters[last_target].xp;
    let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
    let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
    xp_string += ` (${ncomma(monsters_left)} kills to go!)`;
  }
  $('#xpui').html(xp_string);
  $('#goldui').html(ncomma(character.gold) + " GOLD");
} else if (till_level === 1)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
  let xp_missing = ncomma(G.levels[character.level] - character.xp);
  let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) xp to go!`;
  $('#xpui').html(xp_string);
  $('#goldui').html(ncomma(character.gold) + " GOLD");
}

function ncomma(x) {
  let number = x.toString();
  let result = [];
  while (number.length > 3) {
    result.unshift(number.slice(-3));
    number = number.slice(0, -3);
  }
  result.unshift(number);
  return result.join(',');
}

initGUI();
