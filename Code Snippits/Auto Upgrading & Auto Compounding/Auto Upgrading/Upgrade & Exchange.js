//Upgrade and exchange
var upgrade = true; // true for upgrading, false for exchanging
var exItemScroll = 0; // The slot with the scrolls/item to be exchanged (slot 0 is first inv slot)
var itemSlot = 1; // The slot with the item to be upgraded.
var maxLevel = 7; // Max level the item can become.

var updatesPS = ; // Number of updates per sec.

setInterval(function() {
  if (upgrade && character.items[itemSlot].level < maxLevel - 1) {
    upgrade(itemSlot, exItemScroll);
    updatesPS = 4;
  } else {
    exchange(exItemScroll);
    updatesPS = 1;
  }
}, 1000 / updatesPS);
