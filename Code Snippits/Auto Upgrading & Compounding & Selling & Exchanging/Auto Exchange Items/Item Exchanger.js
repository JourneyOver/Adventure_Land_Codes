//exchanges items in whitelist
//Courtesy of: JourneyOver

var eItem = false; //Enable exchanging of items = true, Disable exchanging of items = false
var whitelist = []; //whitelist is for the exchanging of items

setInterval(function() {

  //exchanges items in whitelist
  if (eItem) {
    exchangeItem()
  }

}, 1000 / 4); //Loop every 1/4 seconds.

function exchangeItem() {
  for (let i = 0; i < character.items.length; i++) {
    let c = character.items[i];
    if (c) {
      if (c && whitelist.includes(c.name)) {

        exchange(i)
        parent.e_item = i;
      }
    }
  }
}