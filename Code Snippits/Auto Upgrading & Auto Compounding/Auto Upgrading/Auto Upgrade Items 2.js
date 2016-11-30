//Only works on items already in your inventory! Auto Buys scrolls if out though!
//Courtesy of: Mark

var en = false; //Enable Upgrading of items = true, Disable Upgrading of items = false
var emaxlevel = 8; //Max level it will stop upgrading items at if enabled
var whitelist = []; //Add items that you want to be upgraded as they come to your inventory [always add ' ' around item and , after item]
// Upgrading [enhancing] [will only upgrade items that are in your inventory & in the whitelist] //

setInterval(function() {

  if (en) {
    upgrade(emaxlevel);
  }

}, 1000 / 4); // Loops every 1/4 seconds.

function upgrade(level) {
  let i = character.items.length;
  while (i--) {
    let c = character.items[i];
    if (c && whitelist.includes(c.name) && c.level < level) {
      let grades = get_grade(c);
      let scrollname;
      if (c.level < grades[0])
        scrollname = 'scroll0';
      else if (c.level < grades[1])
        scrollname = 'scroll1';
      else
        scrollname = 'scroll2';

      let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
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
    }
  }
}

function get_grade(item) {
  return parent.G.items[item.name].grades;
}

// Returns the item slot and the item given the slot to start from and a filter.
function find_item(filter) {
  for (let i = 0; i < character.items.length; i++) {
    let item = character.items[i];

    if (item && filter(item))
      return [i, character.items[i]];
  }

  return [-1, null];
}