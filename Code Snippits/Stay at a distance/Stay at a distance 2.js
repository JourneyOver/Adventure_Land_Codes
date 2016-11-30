// Could be improved to move away from monsters if too close to Tank
setInterval(function(){
  var tank = get_player("");
  var safeRange = 200;

  var distance = Math.hypot(
    character.real_x - tank.real_x,
    character.real_y - tank.real_y
  );

  // Comfortable range
  if (distance >= safeRange) {
    move(
      character.real_x+(tank.real_x-character.real_x)/2,
      character.real_y+(tank.real_y-character.real_y)/2
    );
  }
}, 5000);