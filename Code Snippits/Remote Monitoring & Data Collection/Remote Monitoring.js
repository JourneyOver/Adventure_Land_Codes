//Courtesy of idrum4316

/////////////////////
// START STAT CODE
/////////////////////
var StatKey = ""; //Go to http://land.devpad.org/ to get your StatKey & add between ""

function track_stats() {

  var StatSocket = new WebSocket("ws://land.devpad.org/update");

  StatSocket.onopen = function(event) {

    // Identify yourself to the stat server
    StatSocket.send(StatKey);
    StatSocket.send(character.name);

    // Start updating your stats every 500ms
    stat_interval = setInterval(function() {
      StatSocket.send(character.hp +
        "|" + character.max_hp +
        "|" + character.mp +
        "|" + character.max_mp +
        "|" + character.xp +
        "|" + character.max_xp +
        "|" + character.level
      );
    }, 500); // Loops every 0.5 seconds.

  };

  StatSocket.onclose = function() {
    //try to reconnect
    clearInterval(stat_interval);
    StatSocket = null;
    track_stats();
  };

}

track_stats();

///////////////////
// END STAT CODE
///////////////////
