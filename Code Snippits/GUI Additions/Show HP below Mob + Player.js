function draw_rectangle(x, y, width, height, size, color, fill, opacity) {
  if (!color) color = 0x00F33E;
  if (!size) size = 1;
  let rectangle = new PIXI.Graphics();
  if (opacity) {
    rectangle.alpha = opacity;
  }
  if (fill) {
    rectangle.beginFill(color);
  }
  rectangle.lineStyle(size, color);
  rectangle.drawRect(x, y, width, height);
  if (fill) {
    rectangle.endFill();
  }
  return rectangle;
}

// From runner_functions.js https://github.com/kaansoral/adventureland/blob/master/runner_functions.js
// Modified not to be pushed onto the canvas yet
function draw_circle(x, y, radius, size, color) {
  if (!color) {
    color = 0x00F33E;
  }
  if (!size) {
    size = 1;
  }
  let sprite = new PIXI.Graphics();
  sprite.lineStyle(size, color);
  sprite.drawCircle(x, y, radius);
  return sprite;
}

// From runner_functions.js https://github.com/kaansoral/adventureland/blob/master/runner_functions.js
// Modified not to be pushed onto the canvas yet
function draw_line(x, y, x2, y2, size, color) {
  if (!color) {
    color = 0xF38D00;
  }
  if (!size) {
    size = 1;
  }
  let sprite = new PIXI.Graphics();
  sprite.lineStyle(size, color);
  sprite.moveTo(x, y);
  sprite.lineTo(x2, y2);
  sprite.endFill();
  return sprite;
}

// Credit due to draivin
function draw_text(x, y, text, size = 20, color = 0x000000, font = 'pixel', quality = 2) {
  let sprite = new PIXI.Text(text, {
    fontFamily: font,
    fontSize: size * quality,
    fontWeight: 'bold',
    fill: color,
    align: 'center'
  });
  sprite.anchor.set(0.5, 0.5);
  sprite.scale = new PIXI.Point(1 / quality, 1 / quality);
  sprite.position.x = x;
  sprite.position.y = y;
  sprite.displayGroup = parent.text_layer;
  return sprite;
}

const colours = [0x00FFFF, 0x00CCFF, 0x0099FF, 0x0066FF, 0x0033FF, 0x0000FF];

function draw() {
  clear_drawings();
  let sprite_array = [];
  sprite_array = sprite_array.concat(draw_hp_in_range());
  sprite_array = sprite_array.concat(draw_party_data());
  apply_PIXI(sprite_array);
}

function clear_drawings() {
  drawings.forEach(sprite => {
    try {
      sprite.destroy();
    } catch (ex) {}
  });
  drawings = parent.drawings = [];
}

function draw_party_data() {
  let party_members = parent.party_list;
  if (party_members.length < 1) {
    return;
  }
  let sprite_array = [];
  for (let i = 0; i < party_members.length; i++) {
    let entity = get_player(party_members[i]);
    if (!entity) {
      continue;
    }
    // Drawing Party Member's Range
    sprite_array.push(draw_rectangle(entity.real_x - (entity.awidth / 2), entity.real_y - character.aheight, entity.awidth, entity.aheight, null, colours[i]));
    sprite_array.push(draw_circle(entity.real_x, entity.real_y, entity.range + 40, null, colours[i]));
    let target = get_target_of(entity);
    if (!target) {
      continue;
    }
    // Drawing Party Member's Target
    sprite_array.push(draw_line(entity.real_x, entity.real_y, target.real_x, target.real_y, null, colours[i]));
    if (target.mtype) {
      sprite_array.push(draw_rectangle(target.real_x - (target.width / 2), target.real_y - target.height, target.width, target.height, null, colours[i]));
    } else {
      sprite_array.push(draw_rectangle(target.real_x - (target.awidth / 2) - 1, target.real_y - target.aheight - 1, target.awidth + 2, target.aheight + 2, null, colours[i]));
    }
  }
  return sprite_array;
}

function draw_hp_in_range() {
  let entities = filter_in_range();
  let sprite_array = [];
  sprite_array = sprite_array.concat(draw_unit_hp(character));
  entities.forEach(entity => sprite_array = sprite_array.concat(draw_unit_hp(entity)));
  return sprite_array;
}

function draw_unit_hp(entity) {
  const base_offset = 4;
  const line_offset = 7;
  const x_offset = 0.75;
  const border = 1;
  let sprite_array = [];
  let name_sprite = null;
  let hp_sprite = null;

  // Get Name
  if (entity.mtype) {
    name_sprite = draw_text(entity.real_x, entity.real_y + base_offset, entity.mtype, 10);
  } else {
    name_sprite = draw_text(entity.real_x, entity.real_y + base_offset, entity.name, 10);
  }

  // Get HP
  hp_sprite = draw_text(entity.real_x, entity.real_y + base_offset + line_offset, entity.hp + "/" + entity.max_hp, 10, getColor(entity.hp / entity.max_hp));

  let max_width = name_sprite.width > hp_sprite.width ? name_sprite.width : hp_sprite.width;
  let max_height = name_sprite.height + hp_sprite.height;

  let name_plate = draw_rectangle(entity.real_x - (max_width / 2) - x_offset - border, entity.real_y - border, max_width + (border * 2), max_height + (border * 2), null, 0x333333, true, 0.5);

  sprite_array.push(name_plate, name_sprite, hp_sprite);

  return sprite_array;
}

// Credit due to http://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
function getColor(value) {
  //value from 0 to 1
  let hue = (value * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}

function apply_PIXI(sprite_array) {
  for (let sprite of sprite_array) {
    parent.drawings.push(sprite);
    parent.map.addChild(sprite);
  }
}