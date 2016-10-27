//Checks to see if your character has moved.
//Modified by: Sulsaries
var deltaX = 0;
var deltaY = 0;
var oldX = character.real_x;
var oldY = character.real_y;

function has_moved() {
  deltaX = character.real_x - oldX;
  deltaY = character.real_y - oldY;
  var moved = false;
  if (deltaX || deltaY) {
    moved = true;
  }
  oldX = character.real_x;
  oldY = character.real_y;
  return moved;
}
