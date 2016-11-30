function checkPosition(){
  var leader = get_player(character.party);
  var currentTarget = get_targeted_monster();
  if(!character.moving) {
    if ((leader) && (character.real_y != leader.real_y) && ((in_attack_range(currentTarget)) || (!currentTarget))){
      move(leader.real_x+50,leader.real_y);
    }
  }
}

setInterval(checkPosition,1000);