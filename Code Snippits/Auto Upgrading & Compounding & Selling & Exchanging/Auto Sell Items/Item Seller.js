//Sells items in whitelist
//Courtesy of: JourneyOver

var sItem = false; //Enable selling of items = true, Disable selling of items = false
var whitelist = []; //whitelist is for the selling of items

setInterval(function() {

  //sells items in whitelist
  if (sItem) {
    sellItem()
  }

}, 1000 / 4); //Loop every 1/4 seconds.

function sellItem() {
  for (let i = 0; i < character.items.length; i++) {
    let c = character.items[i];
    if (c) {
      if (c && whitelist.includes(c.name)) {

        sell(i);
      }
    }
  }
}