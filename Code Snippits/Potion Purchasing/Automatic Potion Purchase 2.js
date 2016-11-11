function restock_potions(hp_potion, mp_potion, pots_minimum, quantity) {
  let hppot = find_item(i => i.name == hp_potion)[1];
  let mppot = find_item(i => i.name == mp_potion)[1];
  if ((!hppot || hppot.q < pots_minimum)) {
    parent.buy(hp_potion, quantity);
    set_message("Buying HP pots.");
  }
  if ((!mppot || mppot.q < pots_minimum)) {
    parent.buy(mp_potion, quantity);
    set_message("Buying MP pots.");
  }
}