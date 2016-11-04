/////////////////////
// START SOCKET STUFF
/////////////////////
var AttackSocket = new WebSocket("ws://land.devpad.org/update");
AttackSocket.onopen = function (event) {
    AttackSocket.onmessage = function (event) {
        console.log(event.data);
    }
    AttackSocket.send("password");
    setInterval(function(){
        AttackSocket.send(character.hp + ";" + character.max_hp + ";" + character.mp + ";" + character.max_mp + ";" + character.xp + ";" + character.max_xp + ";" + character.level + ";" + character.name);
    },500); // Loops every 0.5 seconds.
};
/////////////////////
// END SOCKET STUFF
/////////////////////
