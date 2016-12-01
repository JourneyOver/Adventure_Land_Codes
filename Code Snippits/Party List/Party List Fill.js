//Fills the party_list with the living members of your party in the area
var party_list = [{
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  },
  {
    name: "",
    priority: 0.0
  }
]

var party_count = 0;
//Fills the Party List
function fill_party_list() {
  var min_d = 999999,
    target = null;
  party_count = 0;
  set_message("Making party_list");
  party_list[party_count].name = character.name;
  party_count++;
  for (id in parent.entities) {

    var current = parent.entities[id];
    if (current.player === false || current.dead || current.party != character.party /* || current.hp==current.max_hp*/ ) {

      continue;
    }
    var c_dist = parent.distance(character, current);
    if (c_dist < min_d && current.player === true) {
      target = current;
      party_list[party_count].name = target.name;
      party_count++;
      set_message("Added a member.");
    }
  }
  return;
}