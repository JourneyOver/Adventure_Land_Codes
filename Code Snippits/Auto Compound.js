var compound_items = false; //Set to true in order to allow compounding of items
var whitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj'];
var maxlevel = 3;
var cscroll = 0;

setInterval(function() {

  //Compound Items
  if (compound_items) {
    compoundItems();
  }

}, 200); // Loop Delay

function group() {
  let res = [];

  for (let i = 0; i < character.items.length; i++) {
    let c = character.items[i];

    if (c && Contains(whitelist, c.name)) {
      let added = false;
      for (let j = 0; j < res.length && !added; j++) {
        if (res[j][0].name == c.name && res[j][0].level == c.level) {
          res[j][res[j].length] = i;
          added = true;
        }
      }

      if (!added)
        res[res.length] = [c, i];
    }
  }

  return res;
}

function Contains(list, item) {
  for (id in list) {
    if (list[id] == item)
      return true;
  }

  return false;
}

function compoundItems() {
  let groups = group();

  for (id in groups) {
    let c = groups[id];

    if (c.length >= 4 && c[0].level < maxlevel) {
      compound(c[1], c[2], c[3], cscroll);
      return;
    }
    if (character.items[0].q == 1) {
      if (character.gold > 20 * 6400)
        parent.buy('cscroll0', 5);
    }
  }
}
