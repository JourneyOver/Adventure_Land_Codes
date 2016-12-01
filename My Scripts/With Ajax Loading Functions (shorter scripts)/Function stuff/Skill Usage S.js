//Only used for Simple Follow Lead and attack target script!

//Casts Vanish if class is Rogue and enabled and off cooldown
var lastinvis;

function invis() {
  //Vanish once invis is off cd (cd is 12sec).
  if (!lastinvis || new Date() - lastinvis > 12000) {
    lastinvis = new Date();
    parent.socket.emit("ability", {
      name: "invis",
    });
  }
}

//Casts burst if class is mage and enabled and off cooldown
var lastburst;

function burst(currentTarget) {
  //Cast burst on target whenever you're off cd (cd is 10sec).
  if (!lastburst || new Date() - lastburst > 10000) {
    lastburst = new Date();
    parent.socket.emit("ability", {
      name: "burst",
      id: currentTarget.id
    });
  }
}

/* //casts Taunt if class is warrior and enabled and off cooldown
var lasttaunt;

function taunt(currentTarget) {
  //Taunt only if target hasn't been taunted and if taunt is from cd (cd is 6sec).
  if ((!lasttaunt || new Date() - lasttaunt > 6000) && !currentTarget.taunted) {
    lasttaunt = new Date();
    parent.socket.emit("ability", {
      name: "taunt",
      id: currentTarget.id
    });
  }
} */

//casts charge if class is warrior and enabled and off cooldown
var lastcharge;

function charge() {
  //Charge only if charge is off of cd (cd is 40sec).
  if (!lastcharge || new Date() - lastcharge > 40000) {
    lastcharge = new Date();
    parent.socket.emit("ability", {
      name: "charge",
    });
  }
}

//casts supershot when off cooldown and if enabled
var lastsupershot;

function supershot(currentTarget) {
  //Cast supershot on target whenever you're off cd (cd is 30sec).
  if (!lastsupershot || new Date() - lastsupershot > 30000) {
    lastsupershot = new Date();
    parent.socket.emit("ability", {
      name: "supershot",
      id: currentTarget.id
    });
  }
}