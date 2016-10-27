//Automatic Potion Purchasing!
//Courtesy of: Sulsaries
var purchase_pots = true; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 100; //This is how many you will buy

function purchase_potions() {
  set_message("Buying pots.");
  if (character.items[0].q < pots_minimum) {
    parent.buy("hpot0", pots_to_buy);
  }
  if (character.items[1].q < pots_minimum) {
    parent.buy("mpot0", pots_to_buy);
  }
}

//Place inside setInterval to check potions when turned on.
if (purchase_pots) {
  purchase_potions();
}
