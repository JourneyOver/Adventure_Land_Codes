function compound(compound_level) {
  let cur_slot = 0;
  while (cur_slot < character.items.length) {
    let [acc_slot, acc] = find_item(cur_slot, i => item_info(i).compound && i.level < compound_level);
    if (acc_slot == -1) return;
    let second = find_slot(acc_slot + 1, i => i.name == acc.name && i.level == acc.level);
    let third = find_slot(second + 1, i => i.name == acc.name && i.level == acc.level);
    if (second != -1 && third != -1) {
      let scroll_name = acc.level < 2 ? 'cscroll0' : 'cscroll1';
      let scroll = find_slot(i => i.name == scroll_name);
      if (scroll == -1) {
        parent.buy(scroll_name);
        return;
      }
      parent.socket.emit('compound', {
        items: [acc_slot, second, third],
        scroll_num: scroll,
        offering_num: null,
        clevel: acc.level
      });
      break;
    } else {
      cur_slot = acc_slot + 1;
    }
  }
}

function item_info(item) {
  return parent.G.items[item.name];
}

function find_slot(starting_slot, filter) {
  if (typeof starting_slot == 'function') {
    filter = starting_slot;
    starting_slot = 0;
  }
  for (let i = starting_slot; i < character.items.length; i++) {
    let item = character.items[i];
    if (item && filter(item)) return i;
  }
  return -1;
}
