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

function find_item(starting_slot, filter) {
  let slot = find_slot(starting_slot, filter);
  if (slot == -1) return [-1, null];
  return [slot, character.items[slot]];
}

function scroll_type(name, level) {
  if (level >= 7 || parent.G.items[name].a) {
    return 'scroll1'
  } else {
    return 'scroll0';
  }
}

function calculate_scrolls_needed(item, max_level) {
  let scroll0_needed = 0;
  let scroll1_needed = 0;

  for (let i = item.level; i < max_level; i++) {
    if (scroll_type(item.name, i) == 'scroll1') scroll1_needed++;
    else scroll0_needed++;
  }

  return [scroll0_needed, scroll1_needed];
}

var upgrade_running = false;

function preemptive_upgrades(item_slot, scroll0_slot, scroll1_slot, max_level) {
  let item = character.items[item_slot];
  let scroll0 = character.items[scroll0_slot];
  let scroll1 = character.items[scroll1_slot];

  let [scroll0_needed, scroll1_needed] = calculate_scrolls_needed(item, max_level);
  if ((scroll0_needed > 0 && (scroll0.name != "scroll0" || scroll0.q < scroll0_needed)) ||
    (scroll1_needed > 0 && (scroll1.name != "scroll1" || scroll1.q < scroll1_needed))) {
    parent.add_log('Preemptive upgrade called without prerequisites!');
    return;
  }

  if (upgrade_running) return;
  upgrade_running = true;


  let starting_level = item.level;
  let current_level = item.level;

  let success_listener = data => {
    if (data && data.message == 'Item upgrade succeeded') {
      current_level++;

      if (current_level == max_level) {
        clear_listeners();
        console.log(`%cUpgraded to +${max_level} successfully!`, 'color: green');
      }
    }
  };

  let failure_listener = data => {
    if (data == 'Item upgrade failed') {
      clear_listeners();
      console.log(`%cItem upgrade failed going from +${current_level} to +${current_level + 1}`, 'color: red');
    }
  };

  let parent = window.parent;
  let clear_listeners = () => {
    clear_listeners = () => {};
    parent.socket.removeListener('game_log', success_listener);
    parent.socket.removeListener('game_error', failure_listener);
    upgrade_running = false;
  };

  // Safe cleanup in case something goes wrong
  setTimeout(clear_listeners, 500);

  parent.socket.on('game_log', success_listener);
  parent.socket.on('game_error', failure_listener);

  for (let i = starting_level; i < max_level; i++) {
    let scroll_slot = scroll0_slot;
    if (scroll_type(item.name, i) == 'scroll1') {
      scroll_slot = scroll1_slot;
    }

    parent.socket.emit('upgrade', {
      item_num: item_slot,
      scroll_num: scroll_slot,
      offering_num: null,
      clevel: i
    });
  }
}

function upgrade_or_buy(item_name, max_level) {
  let [item_slot, item] = find_item(i => i.name == item_name && i.level < max_level);
  if (item_slot == -1) {
    return parent.buy(item_name);
  }

  let [scroll0_slot, scroll0] = find_item(i => i.name == 'scroll0');
  let [scroll1_slot, scroll1] = find_item(i => i.name == 'scroll1');

  let scroll0_num = scroll0_slot != -1 ? scroll0.q : 0;
  let scroll1_num = scroll1_slot != -1 ? scroll1.q : 0;

  let [scroll0_needed, scroll1_needed] = calculate_scrolls_needed(item, max_level);
  if (scroll0_num < scroll0_needed) {
    parent.buy('scroll0', scroll0_needed - scroll0_num);
  }

  if (scroll1_num < scroll1_needed) {
    parent.buy('scroll1', scroll1_needed - scroll1_num);
  }

  if (scroll0_num >= scroll0_needed && scroll1_num >= scroll1_needed) {
    preemptive_upgrades(item_slot, scroll0_slot, scroll1_slot, max_level);
  }
}

setInterval(function() {
  let item_to_upgrade = 'staff';
  let max_level = 8;
  if (find_slot(i => i.name == item_to_upgrade && i.level == max_level) == -1) {
    upgrade_or_buy(item_to_upgrade, max_level);
  }
}, 1000 / 4);
