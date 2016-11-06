//Player Finding Function w/ Conditions
/////////////////////////////////////////////////////////////////////////
//Modified by: Sulsaries
//Basic Structure
[Function Name] {
  var min_d = 999999,
    target = null;
  for (var id in parent.entities) {
    var current = parent.entities[id];
    if ([Condition])
      continue;
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d)
      min_d = c_dist, target = current;
    else if (current.player === true)
      target = current;
  }
  return target;
}

//Return Nearest Living Player.
//Function Name:
function get_nearest_player()
  //Condition:
current.player === false || current.dead

//Return Nearest Living Player not in a Party
//Function Name:
function get_nearest_solo_player()
  //Condition:
current.player === false || current.dead || current.party

//Returns Nearest Living Player in your Party
//Function Name:
function get_nearest_party_member()
  //Condition:
current.player === false || current.dead || current.party != character.party

//////////////////////////////////////////////////////////////////////////////
