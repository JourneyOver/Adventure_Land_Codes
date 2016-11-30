//Gold + Kills till level GUI
setInterval(function() {
  updateGUI();
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
    xp_string += ` (${ncomma(monsters_left)} kills to go!)`;
  }
  $('#xpui').html(xp_string);
  $('#goldui').html(ncomma(character.gold) + " GOLD");
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

initGUI();