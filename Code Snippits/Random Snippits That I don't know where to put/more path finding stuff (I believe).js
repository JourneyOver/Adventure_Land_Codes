let map_graph = initialize_graph(parent.current_map);
let cur_node = map_graph.get(character.real_x, character.real_y);
let target_node = map_graph.get(0, 0);
let path = find_path(cur_node, target_node);
console.info(path);

/////////////////////////////////////////////////

const graph_cache = {};
export async function go_to_point(point) {
  if (!graph_cache[point.map]) {
    console.time('Initialize Graph');
    graph_cache[point.map] = initialize_graph(point.map);
    console.timeEnd('Initialize Graph');
  }

  let map = graph_cache[point.map];

  let current_node = map.get(character.real_x, character.real_y);
  let target_node = map.get(point.x, point.y);

  let current_virtual = new VirtualNode(current_node, character.real_x, character.real_y);
  let target_virtual = new VirtualNode(target_node, point.x, point.y);

  console.time('Find path');
  let path = find_path(current_virtual, target_virtual);
  console.timeEnd('Find path');

  current_virtual.destroy();
  target_virtual.destroy();

  while (path.length) {
    let target = path.shift();
    move(target.x, target.y);

    while (character.moving) {
      await sleep(1000 / 20);
    }

    let pos = new Vec(character);
    // Unexpected movement (probably by the player), so cancel
    // the path movement.
    if (!pos.equals(target)) break;
  }
}