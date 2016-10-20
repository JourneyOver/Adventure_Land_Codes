//Returns the nearest living player.
function get_nearest_player()
{
    var min_d = 999999,
        target = null;
    for (id in parent.entities)
    {
        var current = parent.entities[id];
        if (current.player === false || current.dead) continue;
        var c_dist = parent.distance(character, current);
        if (c_dist < min_d) min_d = c_dist, target = current;
        else if (current.player === true)
        {
            target = current;
        }
    }
    return target;
}

//Returns the nearest living player not currently in a party
function get_nearest_solo_player()
{
    var min_d = 999999,
        target = null;
    for (id in parent.entities)
    {
        var current = parent.entities[id];
        if (current.player === false || current.dead || current.party) continue;
        var c_dist = parent.distance(character, current);
        if (c_dist < min_d) min_d = c_dist, target = current;
        else if (current.player === true)
        {
            target = current;
        }
    }
    return target;
}

// Auto Upgrade
//Above setInerval
var upgradeNumber = 0;
var itemNumber = 0; //Change this zero to where your items to upgrade start

//Inside setInterval
if (upgradeNumber < 3 && itemNumber <= /last item to be upgraded/)
{
    upgrade(itemNumber, 39);
    upgradeNumber++;
    if (upgradeNumber == 3)
    {
        upgradeNumber = 0;
        itemNumber++;
    }
}

//Automatic Potion Purchasing!
//Courtesy of: Sulsaries
var purchase_pots=true; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 100; //This is how many you will buy

function purchase_potions(){
    set_message("Buying pots.");
    if (character.items[0].q < pots_minimum){
        parent.buy("hpot0",pots_to_buy);
    }
    if (character.items[1].q < pots_minimum){
        parent.buy("mpot0",pots_to_buy);
    }
}

    //Place inside setInterval to check potions when turned on.
    if (purchase_pots){
        purchase_potions();
    }




//Checks to see if your character has moved.
//Modified by: Sulsaries
var deltaX = 0;
var deltaY = 0;
var oldX = character.real_x;
var oldY = character.real_y;
function has_moved(){
    deltaX = character.real_x-oldX;
    deltaY = character.real_y-oldY;
    var moved = false;
    if (deltaX || deltaY){
        moved = true;
    }
    oldX=character.real_x;
    oldY=character.real_y;
    return moved;
}
