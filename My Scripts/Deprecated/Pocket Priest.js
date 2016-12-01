// Pocket Priest
// Will follow your party around and auto-heal the members based on a priority calculation.
// It looks at their max hp vs current hp and heals the person with the highest percentage loss.
//Courtesy of: Sulsaries and JourneyOver
//Version 1.1.2

var till_level = 1; //Kills till level = 0, XP till level = 1 (do not use 0 for now until I can get attacking/cursing in)
//Main Settings

var purchase_pots = false; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 1000; //This is how many you will buy
//Automatic Potion Purchasing!

//Grind Code below --------------------------
var party_list = [{
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  }
]

var party_count = 0;
//Fills the Party List
function fill_party_list() {
  var min_d = 999999,
    target = null;
  party_count = 0;
  set_message("Making party_list");
  party_list[party_count].name = character.name;
  party_count++;
  for (id in parent.entities) {

    var current = parent.entities[id];
    if (current.player === false || current.dead || current.party != character.party /* || current.hp==current.max_hp*/ ) {

      continue;
    }
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d && current.player === true) {
      target = current;
      party_list[party_count].name = target.name;
      party_count++;
      set_message("Added a member.");
    }
  }
  return;
}

setInterval(function() {

  //Updates GUI for Till_Level/Gold
  updateGUI();

  //Loot available chests
  loot();

  //Heal and restore mana if required
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

  //Purchases Potions when below threshold
  if (purchase_pots) {
    purchase_potions();
  }

  //Re-enable this line if you need to move without using abilities
  //if(character.moving) return;

  //Set target to null;
  var target = null;
  //Update party list
  fill_party_list();
  //show_json(party_list);
  set_message(party_count);
  //set_message(party_list[0].name);

  for (var x = 0; x < party_count; x++) {
    set_message("Setting Priority");
    target = get_player(party_list[x].name);
    set_message("Not broken!");
    set_message(target.name);
    if (target) change_target(target);
    party_list[x].priority = (target.max_hp - target.hp) / target.max_hp;
    set_message(party_list[x].priority);
    set_message("Priority set.");
  }

  var highest_priority = 0;
  for (var x = 0; x < party_count; x++) {
    set_message("Finding highest priority.");
    if (party_list[x].priority > party_list[highest_priority].priority) {
      highest_priority = x;
    }
  }
  set_message("Highest priority found.");

  //target = get_player(party_list[0].name);

  target = get_player(party_list[highest_priority].name);
  if (party_list[highest_priority].priority > .30 && !target.rip) {
    if (target) change_target(target);
    heal(target);
    set_message("Healing " + target.name);
  }

  if (!in_attack_range(target)) {
    move_to(target, character.range);

    set_message("Moving to Priority");
  }

  //set_message(party_count);

}, 1000 / 3); //Loops every 1/4 seconds.

function purchase_potions() {
  set_message("Buying pots.");
  if (character.items[0].q < pots_minimum) {
    parent.buy("hpot0", pots_to_buy);
  }
  if (character.items[1].q < pots_minimum) {
    parent.buy("mpot0", pots_to_buy);
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

function initGUI() {
  let $ = parent.$;
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

/* if (till_level === 0)

function updateGUI() {
    let $ = parent.$;
    let xp_percent = ((character.xp / parent.G.levels[character.level]) * 100).toFixed(2);
    let xp_string = `LV${character.level} ${xp_percent}%`;
    if (parent.ctarget && parent.ctarget.type == 'monster') {
      last_target = parent.ctarget.mtype;
    }
    if (last_target) {
      let xp_missing = parent.G.levels[character.level] - character.xp;
      let monster_xp = parent.G.monsters[last_target].xp;
      let party_modifier = character.party ? 1.5 / parent.party_list.length : 1;
      let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
      xp_string += ` (${ncomma(monsters_left)} to go!)`;
    }
    $('#xpui').html(xp_string);
    $('#goldui').html(ncomma(character.gold) + " GOLD");
  } else */
if (till_level === 1)

function updateGUI() {
  let $ = parent.$;
  let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
  let xp_missing = ncomma(G.levels[character.level] - character.xp);
  let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) to go!`;
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