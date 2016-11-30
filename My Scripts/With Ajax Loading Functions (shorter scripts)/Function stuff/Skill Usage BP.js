//Only useful for Basic Grinding & pocket priest scripts!

//Curse target on cooldown
var lastcurse;
function curse(target) {
  //Curse only if target hasn't been cursed and if curse is off cd (cd is 5sec).
  if ((!lastcurse || new Date() - lastcurse > 5000) && !target.cursed) {
    lastcurse = new Date();
    parent.socket.emit("ability", {
      name: "curse",
      id: target.id
    });
  }
}

//Casts Vanish if class is Rogue and enabled and off cooldown
var lastinvis;
function invis() {
  //Vanish one invis is off cd (cd is 12sec).
  if (!lastinvis || new Date() - lastinvis > 12000) {
    lastinvis = new Date();
    parent.socket.emit("ability", {
      name: "invis",
      });
  }
}

//Casts burst if class is mage and enabled and off cooldown
var lastburst;
function burst(target) {
  // Cast burst on target whenever you're off cd (cd is 10sec).
  if (!lastburst || new Date() - lastburst > 10000) {
    lastburst = new Date();
    parent.socket.emit("ability", {
      name: "burst",
      id: target.id
    });
  }
}

//casts Taunt if class is warrior and enabled and off cooldown
var lasttaunt;
function taunt(target) {
  // Taunt only if target hasn't been taunted and if taunt is from cd (cd is 6sec).
  if ((!lasttaunt || new Date() - lasttaunt > 6000) && !target.taunted) {
    lasttaunt = new Date();
    parent.socket.emit("ability", {
      name: "taunt",
      id: target.id
    });
  }
}

//casts charge if class is warrior and enabled and off cooldown
var lastcharge;
function charge() {
  // charge only if charge is off of cd (cd is 40sec).
  if (!lastcharge || new Date() - lastcharge > 40000) {
    lastcharge = new Date();
    parent.socket.emit("ability", {
      name: "charge",
      });
  }
}

//casts supershot when off cooldown and if enabled
var lastsupershot;
function supershot(target) {
  // Cast supershot whenever your off cd (cd is 30sec).
  if (!lastsupershot || new Date() - lastsupershot > 30000) {
    lastsupershot = new Date();
    parent.socket.emit("ability", {
      name: "supershot",
      id: target.id
    });
  }
}