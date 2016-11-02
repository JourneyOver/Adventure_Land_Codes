var till_level = 0; // Kills till level = 0, XP till level = 1
//Main Settings

var purchase_pots = false; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 1000; //This is how many you will buy
//Automatic Potion Purchasing!

//Grind Code below --------------------------
setInterval(function() {

  //Updates GUI for Till_Level/Gold
  updateGUI();

  //Purchases Potions when below threshold
  if (purchase_pots) {
    purchase_potions();
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

if (till_level === 0)

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
  } else if (till_level === 1)

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

function purchase_potions() {
  if (character.items[0].q < pots_minimum) {
    parent.buy("hpot0", pots_to_buy);
  }
  if (character.items[1].q < pots_minimum) {
    parent.buy("mpot0", pots_to_buy);
    set_message("Buying pots.");
  }
}
