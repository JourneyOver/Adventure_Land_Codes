var cp = false; //Set to true in order to allow compounding of items
var whitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj'];
var maxLevel = 3;
//compound settings [current issues = buys slightly over what it needs for scrolls / need at least one scroll in inventory (anywhere) ]

setInterval(function() {

  //Compound Items
  if (cp) {
    compound_items();
  }

}, 1000 / 4); // Loops every 1/4 seconds.

var collection;
var count;

function compound_items() {
  collection = new Map();
  count = 2;
  character.items.forEach(group);

  let [cscroll0_slot, cscroll0] = find_item(i => i.name == 'cscroll0');
  if (cscroll0 && cscroll0.q < count)
    parent.buy('cscroll0', count - cscroll0.q);
  for (let key of collection.keys()) {
    let c = collection.get(key);
    for (let i = 1; i + 2 < c.length; i += 3) {
      parent.socket.emit('compound', {
        items: [c[i], c[i + 1], c[i + 2]],
        scroll_num: cscroll0_slot,
        offering_num: null,
        clevel: c[0]
      });
    }
  }
}

function group(item, index) {
  if (item && item.level < maxLevel && whitelist.includes(item.name)) {
    let key = item.name + item.level;

    if (!collection.has(key))
      collection.set(key, [item.level, index]);
    else
      collection.get(key).push(index);

    count++;
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
