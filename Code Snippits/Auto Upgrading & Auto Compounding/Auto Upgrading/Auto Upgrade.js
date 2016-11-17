// Auto Upgrade
//Credits to /u/aget61695 & Termii|Kevin
var item_slot = 0; //Inventory slot of item to be upgraded
var scroll_slot = 1; //Inventory slot of 1000g scroll (T1)
var scroll2_slot = 2; //Inventory slot of 40000g scroll (T2)
var max_item_level = 7; //Max level to be upgraded to
var item_to_upgrade = "boots" //Name of item to be upgraded

setInterval(function() {

  //Buy an item_to_upgrade if there is nothing in item_slot
  if (!character.items[item_slot])
    parent.buy(item_to_upgrade, 1);

  //If scroll_slot is empty buy 200 more T1 scrolls
  if (!character.items[scroll_slot])
    parent.buy("scroll0", 200);

  //If max_item_level is above 7 this will buy a T2 scroll if scroll2_slot is empty
  if (max_item_level > 7) {
    if (!character.items[scroll2_slot])
      parent.buy("scroll1", 1);
  }
  if (character.items[item_slot] == null) {
    return;
  }

  //Upgrades items until the max_item_level is reached
  if (max_item_level <= 7) {
    if (character.items[item_slot].level < max_item_level) {
      upgrade(item_slot, scroll_slot); //upgrade using T1 scroll
    }
  } else if (max_item_level > 7) {
    //If the item is below level 7 upgrade using T1 scroll, if the item is level 7 or higher upgrade using T2 scroll
    if (character.items[item_slot].level <= 6) {
      upgrade(item_slot, scroll_slot);
    } else if (character.items[item_slot].level < max_item_level) {
      upgrade(item_slot, scroll2_slot)
    }
  }
}, 1000 / 2); // Loops every 1/2 seconds.
