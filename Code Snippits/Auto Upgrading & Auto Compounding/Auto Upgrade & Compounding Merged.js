//Upgrading only works on items already in your inventory! Auto Buys scrolls if out though!
//Courtesy of: Mark

var uc = false; //Enable Upgrading & Compounding of items = true, Disable Upgrading & Compounding of items = false
var umaxlevel = 8; //Max level it will stop upgrading items at if enabled
var cmaxlevel = 3; //Max level it will stop comppounding items at if enabled
var uwhitelist = []; //Add items that you want to be upgraded as they come into your inventory [always add ' ' around item and , after item]
var cwhitelist = ['wbook0', 'intamulet', 'stramulet', 'dexamulet', 'intearring', 'strearring', 'dexearring', 'hpbelt', 'hpamulet', 'ringsj', 'amuletofm', 'orbofstr', 'orbofint', 'orbofres', 'orbofhp']; //Add items that you want to be compounded [always add ' ' around item and , after item]
// Upgrading & Compounding [will only upgrade & Compound items that are in your inventory & in the whitelists] //

setInterval(function() {

  //Upgrade and Compound Items
  if (uc) {
    upgrade(umaxlevel, cmaxlevel);
  }

}, 200); // Loops every 200 milliseconds.

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