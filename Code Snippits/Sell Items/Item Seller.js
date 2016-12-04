//Sells items in whitelist
//Courtesy of: JourneyOver

var sItem = false; //Enable selling of items = true, Disable selling of items = false
var whitelist = []; //Add items that you want to be sold as they come to your inventory [always add ' ' around item and , after item if adding more items]

setInterval(function() {

  //sells items in whitelist
  if (sItem) {
    sellItem(i)
  }

}, 1000 / 4); //Loop every 1/4 seconds.

function sellItem() {
  let i = character.items.length;
  while (i--) {
    let c = character.items[i];
    if (c && whitelist.includes(c.name)) {

      sell(i);
      return;
    }
  }
}