var is_game = 1,
  is_server = 0,
  is_pvp = 0;
var inception = new Date();
var log_game_events = true;
var scale = 2;
var round_xy = true,
  floor_xy = false;
var round_entities_xy = false;
var offset_walking = true;
var antialias = false,
  mode_nearest = true;
var force_webgl = false,
  force_canvas = false;
var gtest = false;
var mode = {
  dom_tests: 0,
  dom_tests_pixi: 0,
  bitmapfonts: 0,
};
var log_flags = {
  timers: 1,
};
var ptimers = true;
var cached_map = location.search.indexOf("fast") != -1;
var mdraw_mode = "redraw",
  mdraw_border = 40;
var mdraw_tiling_sprites = false;
var manual_stop = false;
var manual_centering = true;
var high_precision = false;
var retina_mode = false;
var text_quality = 2;
var bw_mode = false,
  border_mode = false;
var character_names = false;
var hp_bars = true;
var next_attack = new Date(),
  next_potion = new Date(),
  next_transport = new Date();
var last_interaction = new Date(),
  afk_edge = 60,
  mm_afk = false;
var last_drag_start = new Date();
var last_npc_right_click = new Date();
var block_right_clicks = true;
var mouse_only = true;
var show_names = 0;
var the_code = "";
var character_id = "",
  server_name = "";
var character = null,
  map = null,
  game_loaded = false;
var inventory = [];
var tints = [];
var entities = {},
  future_entities = {
    players: {},
    monsters: {}
  },
  pull_all = false,
  pull_all_next = false,
  prepull_target_id = null;
var text_layer, monster_layer, player_layer, chest_layer, map_layer;
var rip = false,
  rip_texture = null;
var heartbeat = new Date(),
  slow_heartbeats = 0;
var ctarget = null;
var textures = {};
var total_map_tiles = 0;
var tiles = null,
  dtile = null;
var map_npcs = [],
  map_doors = [];
var map_tiles = [],
  map_entities = [],
  dtile_size = 32;
var water_tiles = [],
  last_water_frame = -1;
var drawings = [];
var chests = {},
  party_list = [];
var tile_sprites = {},
  sprite_last = {};
var topleft_npc = false,
  inventory = false,
  code = false,
  pvp = false;
var topright_npc = false;
var transports = false;
var code_run = false,
  code_active = false;
var draws = 0;
var S = {
  font: "Pixel",
  normal: 18,
  large: 24,
  huge: 36,
  chat: 18,
};
setInterval(function() {
  var a = mssince(heartbeat);
  if (a > 900) {
    slow_heartbeats++
  } else {
    if (a < 600) {
      slow_heartbeats = 0
    }
  }
  if (is_hidden()) {
    pull_all_next = true
  }
  if (!is_hidden() && pull_all_next) {
    console.log("pull_all_next triggered");
    pull_all_next = false;
    pull_all = true;
    future_entities = {
      players: {},
      monsters: {}
    }
  }
  if (window.last_draw) {
    if (code_run && mssince(last_draw) > 500) {
      draw(0, 1)
    } else {
      if (!code_run && mssince(last_draw) > 15000) {
        draw(0, 1)
      }
    }
  }
  mm_afk = (ssince(window.last_interaction) > afk_edge / 2);
  if (character && !character.afk && ssince(window.last_interaction) > afk_edge) {
    character.afk = true;
    socket.emit("property", {
      afk: true
    })
  }
  if (character && character.afk && ssince(window.last_interaction) <= afk_edge) {
    character.afk = false;
    socket.emit("property", {
      afk: false
    })
  }
  heartbeat = new Date()
}, 100);

function code_button() {
  add_log("Executed");
  add_tint(".mpui", {
    ms: 3000
  })
}

function log_in(a, c, b) {
  if (!game_loaded) {
    ui_log("Game hasn't loaded yet");
    return
  }
  clear_game_logs();
  add_log("Connecting ...");
  character_id = c;
  socket.emit("auth", {
    user: a,
    character: c,
    auth: b,
    width: screen.width,
    height: screen.height,
    scale: scale
  })
}

function disconnect() {
  var a = "DISCONNECTED";
  game_loaded = false;
  if (window.disconnect_reason == "limits") {
    a = "REJECTED";
    add_log("Hey there, Adventurer! To make the game fun for everyone, as requested by our community, you can only connect with 3 characters to the game. If you wish to support our game, a 'Stone of Wisdom' currently allows you to bypass limitations for the wearer.", "#83BDCF");
    add_log("Ps. This is the second version of our prototype limits enforcer. If it's unfair, please email hello@adventure.land", "#CF888A")
  } else {
    if (window.disconnect_reason) {
      add_log("Disconnect Reason: " + window.disconnect_reason, "gray")
    }
  }
  $("body").children().each(function() {
    if (this.tagName != "CANVAS" && this.id != "bottomrightcorner" && this.id != "bottomleftcorner2") {
      $(this).remove()
    } else {
      if (this.id == "bottomrightcorner" || this.id == "bottomleftcorner2") {
        this.style.zIndex = 2000
      }
    }
  });
  $("body").append("<div style='position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; z-index: 999; background: rgba(0,0,0,0.85); text-align: center'><div onclick='refresh_page()' class='gamebutton clickable' style='margin-top: " + (round(height / 2) - 10) + "px'>" + a + "</div></div>");
  if (socket) {
    socket = null, socket.disconnect()
  }
}

function position_map() {
  if (character) {
    map.real_x = character.real_x, map.real_y = character.real_y
  }
  var a = width / 2 - map.real_x * scale,
    c = height / 2 - map.real_y * scale,
    b = false;
  a = c_round(a);
  c = c_round(c);
  if (map.x != a) {
    map.x = a, b = true
  }
  if (map.y != c) {
    map.y = c, b = true
  }
  if (b && dtile_size && window.dtile) {
    dtile.x = round(map.real_x - width / 4);
    dtile.y = round(map.real_y - height / 4);
    dtile.x = ceil(dtile.x / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1);
    dtile.y = ceil(dtile.y / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1)
  }
  if (character) {
    if (manual_centering) {
      character.x = c_round(width / 2), character.y = c_round(height / 2)
    } else {
      character.x = c_round(character.real_x), character.y = c_round(character.real_y)
    }
  }
}
var rendered_target = {},
  last_target_cid = null,
  dialogs_target = null;

function reset_topleft() {
  var a = "NO TARGET";
  if (ctarget && ctarget.dead && (!ctarget.died || ssince(ctarget.died) > 3)) {
    ctarget = null
  }
  if (ctarget != rendered_target) {
    last_target_cid = null;
    reset_inventory(1)
  }
  if (dialogs_target && dialogs_target != ctarget) {
    $("#topleftcornerdialog").html(""), dialogs_target = null
  }
  if (ctarget && topleft_npc) {
    topleft_npc = false;
    reset_inventory()
  }
  send_target_logic();
  if (ctarget && ctarget.type == "monster" && last_target_cid != ctarget.cid) {
    var c = ctarget;
    var a = G.monsters[c.mtype].name;
    if (c.dead) {
      a += " X", c.hp = 0
    }
    var e = [{
      line: a,
      color: "gray"
    }, {
      name: "HP",
      color: colors.hp,
      value: c.hp + "/" + c.max_hp,
      cursed: c.cursed
    }, {
      name: "XP",
      color: "green",
      value: c.xp
    }, {
      name: "ATT",
      color: "#316EE6",
      value: c.attack,
      stunned: c.stunned
    }, ];
    if (c.target) {
      e.push({
        name: "TRG",
        color: "orange",
        value: c.target
      })
    }
    render_info(e)
  } else {
    if (ctarget && ctarget.npc) {
      var e = [{
        name: "NPC",
        color: "gray",
        value: ctarget.name
      }, {
        name: "LEVEL",
        color: "orange",
        value: ctarget.level
      }, ];
      render_info(e)
    } else {
      if (ctarget && ctarget.type == "character" && last_target_cid != ctarget.cid) {
        var b = ctarget;
        var e = [{
            name: b.gm && "GM" || "NAME",
            color: b.gm && "#E14F8B" || "gray",
            value: b.name
          }, {
            name: "LEVEL",
            color: "orange",
            value: b.level,
            afk: b.afk
          }, {
            name: "HP",
            color: colors.hp,
            value: b.hp + "/" + b.max_hp
          }, {
            name: "MP",
            color: "#365DC5",
            value: b.mp + "/" + b.max_mp
          }, {
            name: (b.ctype == "priest" && "HEAL" || "ATT"),
            color: "green",
            value: round(b.attack),
            cursed: b.cursed
          }, {
            name: "ATTSPD",
            color: "gray",
            value: round(b.frequency * 100)
          }, {
            name: "RANGE",
            color: "gray",
            value: b.range
          }, {
            name: "RUNSPD",
            color: "gray",
            value: round(b.speed)
          }, {
            name: "ARMOR",
            color: "gray",
            value: b.armor || 0
          }, {
            name: "RESIST.",
            color: "gray",
            value: b.resistance || 0
          }, ],
          d = [];
        if (b.code) {
          e.push({
            name: "CODE",
            color: "gold",
            value: "Active"
          })
        }
        if (b.party) {
          e.push({
            name: "PARTY",
            color: "#FF4C73",
            value: b.party
          })
        } else {
          if (character && !ctarget.me && (!character.party || character.name == character.party) && !ctarget.stand) {
            d.push({
              name: "PARTY",
              onclick: "socket.emit('party',{event:'invite',id:'" + ctarget.id + "'})",
              color: "#6F3F87"
            })
          }
        }
        if (character && !ctarget.me && (character.party && character.name == character.party && ctarget.party == character.party)) {
          d.push({
            name: "KICK",
            onclick: "socket.emit('party',{event:'kick',name:'" + ctarget.name + "'})",
            color: "#875045"
          })
        }
        if (ctarget.me && !character.stand && character.trades) {
          d.push({
            name: "HIDE",
            onclick: "socket.emit('trade',{event:'hide'});",
            color: "#A99A5B"
          })
        }
        if (ctarget.me && !character.stand && !character.trades) {
          d.push({
            name: "SHOW",
            onclick: "socket.emit('trade',{event:'show'});",
            color: "#A99A5B"
          })
        }
        if (ctarget.stand) {
          d.push({
            name: "TOGGLE",
            onclick: "$('.cmerchant').toggle()",
            color: "#A99A5B"
          })
        }
        render_info(e, d);
        render_slots(b)
      } else {
        if (!ctarget && rendered_target != null) {
          $("#topleftcornerui").html('<div class="gamebutton">NO TARGET</div>')
        }
      }
    }
  }
  rendered_target = ctarget;
  last_target_cid = ctarget && ctarget.cid
}

function get_entity(a) {
  if (a == character_id) {
    return character
  }
  return entities[a]
}

function sync_entity(c, a) {
  adopt_soft_properties(c, a);
  if (c.resync) {
    c.real_x = a.x;
    c.real_y = a.y;
    if (a.moving) {
      c.engaged_move = -1, c.move_num = 0
    } else {
      c.engaged_move = c.move_num = a.move_num, c.angle = ((a.angle === undefined && 90) || a.angle), set_direction(c)
    }
    c.resync = c.moving = false
  }
  if (a.abs && !c.abs) {
    c.abs = true;
    c.moving = false
  }
  if (c.move_num != c.engaged_move) {
    var b = 1,
      d = simple_distance({
        x: c.real_x,
        y: c.real_y
      }, a);
    if (d > 120) {
      c.real_x = a.x;
      c.real_y = a.y;
      if (log_game_events) {
        console.log("manual x,y correction for: " + (c.name || c.server_id))
      }
    }
    b = simple_distance({
      x: c.real_x,
      y: c.real_y
    }, {
      x: a.going_x,
      y: a.going_y
    }) / (simple_distance(a, {
      x: a.going_x,
      y: a.going_y
    }) + EPS);
    if (b > 1.25 && log_flags.timers) {
      console.log(c.server_id + " speedm: " + b)
    }
    c.moving = true;
    c.abs = false;
    c.engaged_move = c.move_num;
    c.from_x = c.real_x;
    c.from_y = c.real_y;
    c.going_x = a.going_x;
    c.going_y = a.going_y;
    calculate_vxy(c, b)
  }
}

function process_entities() {
  for (var f in future_entities.monsters) {
    var b = future_entities.monsters[f];
    var d = entities[b.id];
    if (!d) {
      if (b.dead) {
        continue
      }
      if (gtest) {
        return
      }
      try {
        d = entities[b.id] = add_monster(b)
      } catch (c) {
        console.log("EMAIL HELLO@ADVENTURE.LAND WITH THIS: " + JSON.stringify(b))
      }
      d.drawn = false;
      d.resync = true
    }
    if (b.dead) {
      d.dead = true;
      continue
    }
    sync_entity(d, b);
    (b.events || []).forEach(function(g) {
      if (g.type == "mhit") {
        var h = get_entity(g.p),
          e = get_entity(g.m);
        if (!h) {
          return
        }
        if (e) {
          direction_logic(e, h)
        }
        d_text("-" + g.d, h, {
          color: "damage"
        });
        start_animation(h, d.hit || "slash0");
        d_line(d, h);
        if (in_arr(d.hit, ["explode_a", "explode_c"])) {
          sfx("explosion")
        } else {
          sfx("monster_hit")
        }
        if (!g.k) {} else {
          start_animation(h, "spark0")
        }
      }
    })
  }
  for (var f in future_entities.players) {
    var a = future_entities.players[f];
    var d = entities[a.id];
    if (character && a.id + "" == character_id + "") {
      continue
    }
    if (!d) {
      if (a.dead) {
        continue
      }
      a.external = true;
      a.player = true;
      d = entities[a.id] = add_character(a);
      d.drawn = false;
      d.resync = true
    }
    if (a.dead) {
      d.dead = true;
      continue
    }
    sync_entity(d, a)
  }
}

function adopt_soft_properties(a, b) {
  if (a.me && a.moving && a.speed && b.speed && a.speed != b.speed) {
    a.speed = b.speed;
    calculate_vxy(a)
  }
  if (a.me && b.abs) {
    a.moving = false
  }
  for (prop in b) {
    if (in_arr(prop, ["x", "y", "vx", "vy", "moving", "abs", "going_x", "going_y", "from_x", "from_y", "width", "height", "type", "events", "angle", "skin"])) {
      continue
    }
    a[prop] = b[prop]
  }
  if (a.slots) {
    a.g10 = a.g9 = a.g8 = undefined;
    for (var c in a.slots) {
      if ((c == "chest" || c == "mainhand") && a.slots[c]) {
        if (a.slots[c].level == 10) {
          a.g10 = true
        }
        if (a.slots[c].level == 9) {
          a.g9 = true
        }
        if (a.slots[c].level == 8) {
          a.g8 = true
        }
      }
    }
    if (a.g10) {
      a.g9 = a.g8 = undefined
    }
    if (a.g9) {
      a.g8 = undefined
    }
  }
}

function reposition_ui() {
  if (character) {
    $("#topmid").css("right", round(($("html").width() - $("#topmid").outerWidth()) / 2));
    $("#bottommid").css("right", round(($("html").width() - $("#bottommid").outerWidth()) / 2))
  }
}

function update_overlays() {
  if (mode.dom_tests) {
    return
  }
  if (character) {
    if (!cached("att", character.attack)) {
      $(".attackui").html((character.ctype == "priest" && "HEAL " || "ATT ") + character.attack)
    }
    if (!cached("inv", character.esize + "|" + character.isize)) {
      $(".invui").html("INV " + (character.isize - character.esize) + "/" + character.isize)
    }
    if (!cached("hptop", character.hp, character.max_hp)) {
      $("#hptext").html(character.hp + "/" + character.max_hp);
      $("#hpslider").css("width", (character.hp * 100 / character.max_hp) + "%")
    }
    if (!cached("mptop", character.mp, character.max_mp)) {
      $("#mptext").html(character.mp + "/" + character.max_mp);
      $("#mpslider").css("width", (character.mp * 100 / character.max_mp) + "%")
    }
    var a = floor(character.xp / character.max_xp * 100);
    if (!cached("xptop", character.level + "|" + a)) {
      $("#xpui").html("LV" + character.level + " " + a + "%");
      $("#xpslider").css("width", (character.xp * 100 / character.max_xp) + "%")
    }
    if (inventory && !cached("igold", character.gold)) {
      $(".goldnum").html(to_pretty_num(character.gold))
    }
    if (inventory && !cached("icash", character.cash)) {
      $(".cashnum").html(to_pretty_num(character.cash))
    }
    if (!cached("coord", round(map.real_x) + "|" + round(map.real_y))) {
      $(".coords").html(round(map.real_x) + "," + round(map.real_y))
    }
    if (!topleft_npc) {
      reset_topleft()
    }
    if (topright_npc == "character" && !cached("chcid", character.cid)) {
      render_character_sheet()
    }
  }
}

function on_load_progress(a, b) {
  $("#progressui").html(round(a.progress) + "%")
}

function the_game() {
  width = $(window).width();
  height = $(window).height();
  if (retina_mode) {
    renderer = new PIXI.autoDetectRenderer(width, height, {
      antialias: antialias,
      transparent: false,
      resolution: window.devicePixelRatio,
      autoResize: true
    })
  } else {
    if (force_webgl) {
      renderer = new PIXI.WebGLRenderer(width, height, {
        antialias: antialias,
        transparent: false
      })
    } else {
      if (force_canvas) {
        renderer = new PIXI.CanvasRenderer(width, height, {
          antialias: antialias,
          transparent: false
        })
      } else {
        renderer = new PIXI.autoDetectRenderer(width, height, {
          antialias: antialias,
          transparent: false
        })
      }
    }
  }
  if (high_precision) {
    PIXI.PRECISION.DEFAULT = PIXI.PRECISION.HIGH
  }
  if (renderer.type == PIXI.RENDERER_TYPE.WEBGL) {
    console.log("WebGL Mode")
  } else {
    console.log("Canvas Mode")
  }
  document.body.appendChild(renderer.view);
  $("canvas").css("position", "fixed").css("top", "0px").css("left", "0px").css("z-index", 1);
  stage = new PIXI.Container();
  inner_stage = new PIXI.Container();
  if (bw_mode) {
    var b = new PIXI.filters.ColorMatrixFilter();
    stage.filters = [b];
    b.desaturate()
  }
  stage.addChild(inner_stage);
  if (PIXI.DisplayList) {
    if (window.inner_stage) {
      inner_stage.displayList = new PIXI.DisplayList()
    } else {
      stage.displayList = new PIXI.DisplayList()
    }
    map_layer = new PIXI.DisplayGroup(0, true);
    text_layer = new PIXI.DisplayGroup(3, true);
    chest_layer = new PIXI.DisplayGroup(2, true);
    monster_layer = new PIXI.DisplayGroup(1, function(d) {
      var c = 0;
      if (d.stand) {
        c = -3
      }
      if ("real_y" in d) {
        d.zOrder = -d.real_y + c
      } else {
        d.zOrder = -d.position.y + c
      }
    });
    player_layer = monster_layer;
    chest_layer = monster_layer
  }
  frame_ms = 16;
  C = PIXI.utils.BaseTextureCache;
  FC = {};
  D = {};
  T = {};
  loader = PIXI.loader;
  loader.on("progress", on_load_progress);
  for (name in G.animations) {
    loader.add(G.animations[name].file)
  }
  for (name in G.tilesets) {
    loader.add(G.tilesets[name])
  }
  for (name in G.sprites) {
    var a = G.sprites[name];
    if (a.skip) {
      continue
    }
    loader.add(a.file)
  }
  if (mode.bitmapfonts) {
    loader.add("/css/fonts/m5x7.xml")
  }
  init_socket()
}

function init_socket() {
  if (!server_addr) {
    add_log("Welcome");
    add_log("No live server found", "red");
    add_log("Please check again in 2-3 minutes");
    add_log("Spend this time in our Discord chat room", "#3386CF");
    add_update_notes();
    return
  }
  if (window.socket) {
    window.socket.destroy()
  }
  window.socket = io(server_addr + ":" + server_port);
  socket.on("welcome", function(data) {
    is_pvp = data.pvp;
    server_name = server_names[data.region] + " " + data.name;
    clear_game_logs();
    add_log("Welcome to " + server_names[data.region] + " " + data.name);
    add_update_notes();
    M = G.maps[data.map].data;
    current_map = data.map;
    reflect_music();
    $(".servername").html(server_name);
    $(".mapname").html(G.maps[current_map].name || "Unknown");
    if (!game_loaded) {
      load_game()
    } else {
      create_map();
      socket.emit("loaded", {
        success: 1,
        width: screen.width,
        height: screen.height,
        scale: scale
      })
    }
    pvp_warning("welcome")
  });
  socket.on("new_map", function(data) {
    var create = false;
    if (current_map != data.name) {
      create = true;
      topleft_npc = false
    }
    current_map = data.name;
    reflect_music();
    M = G.maps[current_map].data;
    $(".mapname").html(G.maps[current_map].name || "Unknown");
    character.real_x = data.x;
    character.real_y = data.y;
    character.moving = false;
    character.direction = data.direction || 0;
    character.map = current_map;
    character["in"] = data["in"];
    if (data.effect) {
      character.tp = true
    }
    if (create) {
      create_map()
    }
    pull_all = true;
    position_map();
    pvp_warning("map")
  });
  socket.on("start", function(data) {
    $("#progressui").remove();
    $("#content").html("");
    $("#topmid,#bottommid,#toprightcorner,#bottomleftcorner2,#bottomleftcorner").show();
    $(".xpsui").show();
    $("body").append('<input id="chatinput" onkeypress="if(event.keyCode==13) say($(this).rfval())" placeholder=""/>');
    if (gtest) {
      $("body").children().each(function() {
        if (this.tagName != "CANVAS") {
          $(this).remove()
        }
      })
    }
    inside = "game";
    character = add_character(data, 1);
    if (character.level == 1) {
      show_modal($("#gameguide").html())
    }
    clear_game_logs();
    add_log("Connected!");
    $(".charactername").html(character.name);
    reposition_ui();
    update_overlays();
    if (character.map != current_map) {
      current_map = character.map;
      reflect_music();
      M = G.maps[current_map].data;
      $(".mapname").html(G.maps[current_map].name || "Unknown");
      create_map();
      pull_all = true
    }
    if (!gtest) {
      if (manual_centering) {
        if (window.inner_stage) {
          inner_stage.addChild(character)
        } else {
          stage.addChild(character)
        }
      } else {
        map.addChild(character)
      }
    }
    position_map();
    rip_logic();
    pvp_warning("start")
  });
  socket.on("ping_ack", function() {
    add_log("Ping: " + mssince(ping_sent) + "ms", "gray")
  });
  socket.on("requesting_ack", function() {
    socket.emit("requested_ack", {})
  });
  socket.on("game_error", function(data) {
    draw_trigger(function() {
      if (is_string(data)) {
        ui_error(data)
      } else {
        ui_error(data.message)
      }
    })
  });
  socket.on("game_log", function(data) {
    draw_trigger(function() {
      if (is_string(data)) {
        ui_log(data, "gray")
      } else {
        if (data.sound) {
          sfx(data.sound)
        }
        ui_log(data.message, data.color)
      }
    })
  });
  socket.on("game_chat_log", function(data) {
    draw_trigger(function() {
      if (is_string(data)) {
        add_chat("", data)
      } else {
        add_chat("", data.message, data.color)
      }
    })
  });
  socket.on("chat_log", function(data) {
    draw_trigger(function() {
      var entity = get_entity(data.id);
      if (entity) {
        d_text(data.message, entity, {
          size: S.chat
        })
      }
      sfx("chat");
      add_chat(data.owner, data.message)
    })
  });
  socket.on("upgrade", function(data) {
    draw_trigger(function() {
      map_npcs.forEach(function(npc) {
        if (data.type == "upgrade" && npc.role == "shrine" || npc.role == data.type) {
          if (npc.role == "exchange") {
            start_animation(npc, "exchange")
          } else {
            if (data.success) {
              start_animation(npc, "success")
            } else {
              start_animation(npc, "failure")
            }
          }
        }
      })
    })
  });
  socket.on("server_message", function(data) {
    console.log(data.message);
    add_chat("", data.message, data.color || "orange")
  });
  socket.on("notice", function(data) {
    add_chat("SERVER", data.message, data.color || "orange")
  });
  socket.on("chest_opened", function(data) {
    draw_trigger(function() {
      if (chests[data.id]) {
        destroy_sprite(chests[data.id]);
        delete chests[data.id];
        sfx("coins")
      }
    })
  });
  socket.on("cm", function(data) {
    get_code_function("on_code_message")(data.name, data.args)
  });
  socket.on("pm", function(data) {
    draw_trigger(function() {
      var entity = get_entity(data.id);
      if (entity) {
        d_text(data.message, entity, {
          size: S.chat,
          color: "#BA6B88"
        })
      }
      sfx("chat");
      add_chat(data.owner, data.message, "#CD7879")
    })
  });
  socket.on("partym", function(data) {
    draw_trigger(function() {
      var entity = get_entity(data.id);
      if (entity) {
        d_text(data.message, entity, {
          size: S.chat,
          color: "#5B8DB0"
        })
      }
      sfx("chat");
      add_chat(data.owner, data.message, "#46A0C6")
    })
  });
  socket.on("drop", function(data) {
    draw_trigger(function() {
      chest = add_chest(data)
    })
  });
  socket.on("reopen", function(data) {
    u_scroll = c_scroll = e_item = null;
    draw_trigger(function() {
      if (rendered_target == "upgrade") {
        render_upgrade_shrine()
      } else {
        if (rendered_target == "compound") {
          render_compound_shrine()
        } else {
          if (rendered_target == "exchange") {
            render_exchange_shrine()
          } else {
            if (rendered_target == "gold") {
              render_gold_npc()
            } else {
              if (rendered_target == "items") {
                render_items_npc()
              }
            }
          }
        }
      }
      if (inventory) {
        reset_inventory()
      }
      if (exchange_animations) {
        $(".ering").css("border-color", "gray");
        exchange_animations = false
      }
    })
  });
  socket.on("simple_eval", function(data) {
    eval(data.code)
  });
  socket.on("eval", function(data) {
    smart_eval(data.code, data.args)
  });
  socket.on("player", function(data) {
    if (character) {
      adopt_soft_properties(character, data), rip_logic()
    }
  });
  socket.on("end", function(data) {});
  socket.on("disconnect", function() {
    socket.destroy();
    window.socket = null;
    disconnect()
  });
  socket.on("disconnect_reason", function(reason) {
    window.disconnect_reason = reason
  });
  socket.on("hit", function(data) {
    draw_trigger(function() {
      var entity = get_entity(data.id),
        owner = get_entity(data.hid);
      if (owner && entity && owner != entity) {
        direction_logic(owner, entity)
      }
      if (entity && data.anim) {
        start_animation(entity, data.anim);
        if (in_arr(data.anim, ["explode_a", "explode_c"])) {
          sfx("explosion")
        } else {
          sfx("monster_hit")
        }
      }
      if (entity && data.damage !== undefined) {
        var color = "red";
        if (data.anim == "taunt") {
          d_line(owner, entity, {
            color: "taunt"
          })
        } else {
          if (data.anim == "burst") {
            d_line(owner, entity, {
              color: "burst"
            }), color = "burst"
          } else {
            if (data.anim == "supershot") {
              d_line(owner, entity, {
                color: "supershot"
              })
            } else {
              if (data.anim == "curse") {
                d_line(owner, entity, {
                  color: "curse"
                }), start_animation(entity, "curse")
              } else {
                if (owner.me) {
                  if (sd_lines) {
                    d_line(owner, entity, {
                      color: "my_hit"
                    })
                  }
                } else {
                  if (owner) {
                    d_line(owner, entity)
                  }
                }
              }
            }
          }
        }
        if (data.anim != "curse") {
          d_text("-" + data.damage, entity, {
            color: color
          })
        }
      }
      if (entity && data.heal !== undefined) {
        if (owner) {
          d_line(owner, entity, {
            color: "heal"
          })
        }
        data.heal = abs(data.heal);
        d_text("+" + data.heal, entity, {
          color: "#EE4D93"
        })
      }
    })
  });
  socket.on("disappearing_text", function(data) {
    draw_trigger(function() {
      if (!data.args) {
        data.args = {}
      }
      if (data.args.sz) {
        data.args.size = data.args.sz
      }
      if (data.args.c) {
        data.args.color = data.args.c
      }
      var entity = (data.id && get_entity(data.id));
      if (entity) {
        d_text(data.message, entity, data.args)
      } else {
        d_text(data.message, data.x, data.y, data.args)
      }
    })
  });
  socket.on("death", function(data) {
    if (entities[data.id]) {
      entities[data.id].dead = true
    }
  });
  var erec = 0;
  socket.on("entities", function(data) {
    erec++;
    if (data.type == "all") {
      console.log("all entities " + new Date())
    }
    if (erec % 20 == 1) {}
    if (erec % 100 == 1 && window.pako) {
      window.lastentities = data;
      var rs = rough_size(data),
        ms;
      var cs = new Date();
      var enc = pako.deflate(msgpack.encode(data));
      ms = mssince(cs);
      console.log("entities%100 rough_size: " + rs + " enc_length: " + enc.length + " enc_in: " + ms + "ms")
    }
    if (!pull_all) {
      for (var i = 0; i < data.players.length; i++) {
        future_entities.players[data.players[i].id] = data.players[i]
      }
      for (var i = 0; i < data.monsters.length; i++) {
        var old_events = future_entities.players[data.monsters[i].id] && future_entities.players[data.monsters[i].id].events;
        future_entities.monsters[data.monsters[i].id] = data.monsters[i];
        if (old_events) {
          future_entities.monsters[data.monsters[i].id].events = old_events + future_entities.monsters[data.monsters[i].id].events
        }
      }
    }
  });
  socket.on("disappear", function(data) {
    if (entities[data.id]) {
      if (data.invis) {
        assassin_smoke(entities[data.id].real_x, entities[data.id].real_y)
      }
      if (data.effect) {
        start_animation(entities[data.id], "transport")
      }
      entities["DEAD" + data.id] = entities[data.id];
      entities[data.id].dead = true;
      delete entities[data.id];
      if (future_entities.players[data.id]) {
        delete future_entities.players[data.id]
      }
      if (future_entities.monsters[data.id]) {
        delete future_entities.monsters[data.id]
      }
    } else {
      if (character && character_id + "" == data.id + "") {
        if (data.invis) {
          assassin_smoke(character.real_x, character.real_y)
        }
      }
    }
  });
  socket.on("info", function(info) {
    render_info(info)
  });
  socket.on("test", function(data) {
    console.log(data.date)
  });
  socket.on("invite", function(data) {
    draw_trigger(function() {
      add_invite(data.name)
    })
  });
  socket.on("party_update", function(data) {
    if (data.message) {
      if (data.leave) {
        add_log(data.message, "#875045")
      } else {
        add_log(data.message, "#703987")
      }
    }
    render_party(data.list);
    party_list = data.list || []
  });
  socket.on("blocker", function(data) {
    if (data.type == "pvp") {
      if (data.allow) {
        add_chat("Ace", "Be careful in there!", "#62C358");
        draw_trigger(function() {
          var npc = get_npc("pvpblocker");
          if (npc) {
            map_npcs.splice(map_npcs.indexOf(get_npc("pvpblocker")), 1);
            draw_timeout(fade_away(1, npc), 30, 1)
          }
        })
      } else {
        add_chat("Ace", "I will leave when there are 6 adventurers around.", "#C36348")
      }
    }
  });
  socket.on("trade_history", function(data) {
    data.forEach(function(h) {
      var item = G.items[h[2].name].name;
      if (h[2].level) {
        item += " +" + h[2].level
      }
      if (h[0] == "buy") {
        add_log("- Bought '" + item + "' from " + h[1] + " for " + to_pretty_num(h[3]) + " gold", "gray")
      } else {
        add_log("- Sold '" + item + "' to " + h[1] + " for " + to_pretty_num(h[3]) + " gold", "gray")
      }
    });
    if (!data.length) {
      add_log("No trade recorded yet.", "gray")
    }
  })
}

function player_click(a) {
  ctarget = this;
  a.stopPropagation()
}

function player_attack(a) {
  ctarget = this;
  direction_logic(character, ctarget);
  if (!character || distance(this, character) > character.range) {
    draw_trigger(function() {
      d_text("TOO FAR", character)
    })
  } else {
    socket.emit("click", {
      type: "player_attack",
      id: this.server_id,
      button: "right"
    })
  }
  if (a) {
    a.stopPropagation()
  }
}

function player_heal(a) {
  if (this != character) {
    ctarget = this
  }
  if (this != character) {
    direction_logic(character, ctarget)
  }
  if (!character || distance(this, character) > character.range) {
    draw_trigger(function() {
      d_text("TOO FAR", character)
    })
  } else {
    socket.emit("click", {
      type: "player_heal",
      id: this.server_id,
      button: "right"
    })
  }
  if (a) {
    a.stopPropagation()
  }
}

function player_right_click(b) {
  if (this.npc && this.id == "pvp") {
    if (this.allow) {
      var a = "Be careful in there!";
      add_chat("Ace", a);
      d_text(a, this, {
        size: S.chat
      })
    } else {
      var a = "I will guard this entrance until there are 6 adventurers around.";
      add_chat("Ace", a);
      d_text(a, this, {
        size: S.chat
      })
    }
  } else {
    if (character.ctype == "priest") {
      if (!pvp || character.party && this.party == character.party) {
        player_heal.call(this)
      } else {
        if (pvp) {
          player_attack.call(this)
        } else {
          return
        }
      }
    } else {
      if (!pvp || character.party && this.party == character.party) {
        return
      } else {
        if (pvp) {
          player_attack.call(this)
        } else {
          return
        }
      }
    }
  }
  if (b) {
    b.stopPropagation()
  }
}

function monster_click(a) {
  if (ctarget == this) {
    map_click(a)
  }
  ctarget = this;
  last_monster_click = new Date();
  if (a) {
    a.stopPropagation()
  }
}

function monster_attack(a) {
  ctarget = this;
  direction_logic(character, ctarget);
  if (!character || distance(this, character) > character.range) {
    draw_trigger(function() {
      d_text("TOO FAR", character)
    })
  } else {
    socket.emit("click", {
      type: "monster",
      id: this.server_id,
      button: "right"
    })
  }
  if (a) {
    a.stopPropagation()
  }
}

function map_click(e) {
  var a = e.data.global.x,
    f = e.data.global.y;
  var d = a - width / 2,
    c = f - height / 2;
  if (manual_centering && character) {
    d = a - character.x, c = f - character.y
  }
  d /= scale;
  c /= scale;
  if (character && can_walk(character)) {
    var b = calculate_move(M, character.real_x, character.real_y, character.real_x + d, character.real_y + c);
    character.from_x = character.real_x;
    character.from_y = character.real_y;
    character.going_x = b.x;
    character.going_y = b.y;
    character.moving = true;
    calculate_vxy(character);
    socket.emit("move", {
      x: character.real_x,
      y: character.real_y,
      going_x: character.going_x,
      going_y: character.going_y
    })
  }
  topleft_npc = false
}

function map_click_release() {}

function draw_entities() {
  for (entity in entities) {
    var a = entities[entity];
    if (character && !within_xy_range(character, a)) {
      a.dead = true
    }
    if (a.dead || pull_all) {
      a.dead = true;
      a.cid++;
      a.died = new Date();
      a.interactive = false;
      if (a.drawn) {
        draw_timeout(fade_away(1, a), 30, 1)
      } else {
        destroy_sprite(entities[entity], "just")
      }
      delete entities[entity];
      continue
    } else {
      if (!a.drawn) {
        a.drawn = true;
        map.addChild(a)
      }
    }
    a.x = round(a.real_x);
    a.y = round(a.real_y);
    if (!round_entities_xy) {
      a.x = a.real_x
    }
    a.y = a.real_y;
    update_sprite(a)
  }
  if (pull_all && socket) {
    if (ctarget && ctarget.id) {
      prepull_target_id = ctarget.id
    }
    pull_all = false;
    socket.emit("send_updates", {})
  } else {
    if (prepull_target_id) {
      ctarget = get_entity(prepull_target_id);
      prepull_target_id = null
    }
  }
}

function update_sprite(d) {
  if (!d || !d.stype) {
    return
  }
  for (name in (d.animations || {})) {
    update_sprite(d.animations[name])
  }
  if (d.stype == "static") {
    return
  }
  hp_bar_logic(d);
  name_logic(d);
  if (border_mode) {
    border_logic(d)
  }
  if (d.type == "character") {
    player_rclick_logic(d);
    player_effects_logic(d)
  }
  if (d.type == "character" || d.type == "monster") {
    effects_logic(d)
  }
  if (d.stype == "full") {
    var g = false,
      c = 1,
      b = 0;
    if (d.type == "monster" && G.monsters[d.mtype].aa) {
      g = true
    }
    if (d.npc && !d.moving && d.allow) {
      d.direction = 2
    }
    if (d.npc && !d.moving && !d.allow) {
      d.direction = 0
    }
    if ((d.moving || g) && !d.walking) {
      d.walking = 1
    } else {
      if (!(d.moving || g)) {
        d.walking = 0
      }
    }
    if (ms_check(d, "walk", 325) && d.walking) {
      d.walking = (d.walking % 3) + 1
    }
    if (d.moving) {
      set_direction(d)
    }
    if (d.direction !== undefined) {
      b = d.direction
    }
    if (!g && d.stunned) {
      c = 1
    } else {
      if (d.walking == 2) {
        c = 2
      } else {
        if (d.walking == 3) {
          c = 0
        }
      }
    }
    if (d.stand && !d.standed) {
      var f = new PIXI.Sprite(stand0_texture);
      f.y = 3;
      f.anchor.set(0.5, 1);
      d.addChild(f);
      d.standed = f;
      d.speed = 10
    } else {
      if (d.standed && !d.stand) {
        d.standed.destroy();
        d.standed = false
      }
    }
    if (d.rip && !d.rtexture) {
      d.cskin = null;
      d.rtexture = true;
      d.texture = rip_texture
    } else {
      if (!d.rip) {
        d.rtexture = false;
        set_texture(d, c, b)
      }
    }
    if (d.charge && ms_check(d, "clone", 80)) {
      disappearing_clone(d)
    }
  }
  if (d.stype == "animation") {
    var a = (d.aspeed == "slow" && 3) || 2;
    if (ms_check(d, "anim", a * 16.5)) {
      d.frame += 1
    }
    if (d.frame >= d.frames && d.continuous) {
      d.frame = 0
    } else {
      if (d.frame >= d.frames) {
        var e = d.parent;
        if (e) {
          destroy_sprite(d);
          delete e.animations[d.skin]
        }
        return
      }
    }
    set_texture(d, d.frame)
  }
  if (d.stype == "emote") {
    var a = (d.aspeed == "slow" && 17) || 10;
    if (ms_check(d, "anim", a * 16.5) && d.atype != "once") {
      d.frame = (d.frame + 1) % 3
    }
    set_texture(d, d.frame)
  }
  update_filters(d);
  d.updates += 1
}

function add_monster(d) {
  var b = new_sprite(d.type, "full"),
    c = G.monsters[d.type];
  adopt_soft_properties(b, d);
  b.displayGroup = monster_layer;
  b.walking = 0;
  b.animations = {};
  b.server_id = d.id;
  b.move_num = d.move_num;
  b.x = b.real_x = round(d.x);
  b.y = b.real_y = round(d.y);
  b.vx = d.vx || 0;
  b.vy = d.vy || 0;
  b.anchor.set(0.5, 1);
  b.speed = d.speed;
  b.type = "monster";
  b.mtype = d.type;
  if (c.hit) {
    b.hit = c.hit
  }
  if (c.size) {
    b.height *= c.size, b.width *= c.size, b.mscale = 2, b.hpbar_wdisp = -5
  }
  b.interactive = true;
  b.buttonMode = true;
  b.on("mousedown", monster_click).on("touchstart", monster_click).on("rightdown", monster_attack);
  if (0 && G.actual_dimensions[d.type]) {
    var e = G.actual_dimensions[d.type],
      a = b.anchor;
    b.hitArea = new PIXI.Rectangle(-e[0] * a.x - 2, -e[1] * a.y - 2, e[0] + 4, e[1] + 4);
    b.awidth = e[0];
    b.aheight = e[1]
  }
  return b
}

function update_filters(a) {
  if (a.glow8) {
    if (a.updates % 3) {
      return
    }
    var b = a.filter_glow8;
    if (b.b > 1.2) {
      b.step = -abs(b.step)
    }
    if (b.b < 0.9) {
      b.step = abs(b.step)
    }
    b.b += b.step;
    if (a.stand || a.charge) {
      b.b = 1.05
    }
    b.brightness(b.b)
  }
  if (a.glow9) {
    if (a.updates % 3) {
      return
    }
    var b = a.filter_glow9;
    if (b.b > 1.3) {
      b.step = -abs(b.step)
    }
    if (b.b < 1.2) {
      b.step = abs(b.step)
    }
    b.b += b.step;
    if (a.stand || a.charge) {
      b.b = 1.075
    }
    b.brightness(b.b)
  }
  if (a.glow10) {
    if (a.updates % 3) {
      return
    }
    var b = a.filter_glow10;
    if (b.b > 1.4) {
      b.step = -abs(b.step)
    }
    if (b.b < 1.3) {
      b.step = abs(b.step)
    }
    b.b += b.step;
    if (a.stand || a.charge) {
      b.b = 1.2
    }
    b.brightness(b.b)
  }
  if (a.appearing) {
    a.alpha += 0.05;
    if (a.alpha >= 1) {
      a.appearing = a.tp = false;
      a.alpha = 1;
      stop_animation(a, "transport")
    }
  }
}

function start_filter(b, a) {
  var c = new PIXI.filters.ColorMatrixFilter();
  if (!b.filter_list) {
    b.filter_list = [c]
  } else {
    b.filter_list.push(c)
  }
  b.filters = b.filter_list;
  b["filter_" + a] = c;
  b[a] = true;
  c.step = 0.01;
  c.b = 1;
  if (a == "curse") {
    c.hue(20)
  }
}

function stop_filter(b, a) {
  b.filter_list.splice(b.filter_list.indexOf(b["filter_" + a]), 1);
  if (!b.filter_list.length) {
    b.filters = null
  } else {
    b.filters = b.filter_list
  }
  delete b["filter_" + a];
  delete b[a]
}

function player_effects_logic(a) {
  if (a.g10 && !a.filter_glow10) {
    start_filter(a, "glow10")
  } else {
    if (!a.g10 && a.filter_glow10) {
      stop_filter(a, "glow10")
    } else {
      if (a.g9 && !a.filter_glow9) {
        start_filter(a, "glow9")
      } else {
        if (!a.g9 && a.filter_glow9) {
          stop_filter(a, "glow9")
        } else {
          if (a.g8 && !a.filter_glow8) {
            start_filter(a, "glow8")
          } else {
            if (!a.g8 && a.filter_glow8) {
              stop_filter(a, "glow8")
            }
          }
        }
      }
    }
  }
  if (a.invis && (!a.invis_effect || a.alpha != 0.5)) {
    a.invis_effect = true;
    a.alpha = 0.5
  } else {
    if (!a.invis && a.invis_effect) {
      a.invis_effect = false;
      a.alpha = 1
    }
  }
  if (a.stunned && !a.stunned_effect) {
    a.stunned_effect = true;
    start_animation(a, "stunned", "stun")
  } else {
    if (!a.stunned && a.stunned_effect) {
      a.stunned_effect = false;
      stop_animation(a, "stunned")
    }
  }
  if (a.invincible && !a.invincible_effect) {
    a.invincible_effect = true;
    start_animation(a, "invincible");
    a.alpha = 0.9
  } else {
    if (!a.invincible && a.invincible_effect) {
      a.invincible_effect = false;
      stop_animation(a, "invincible");
      a.alpha = 1
    }
  }
  if (a.tp && !a.appearing) {
    a.appearing = true;
    a.alpha = 0.5;
    start_animation(a, "transport")
  }
}

function effects_logic(a) {
  if (a.cursed && !a.cursed_effect) {
    a.cursed_effect = true;
    start_filter(a, "curse")
  } else {
    if (!a.cursed && a.cursed_effect) {
      a.cursed_effect = false;
      stop_filter(a, "curse")
    }
  }
}

function add_character(e, d) {
  if (log_game_events) {
    console.log("add character " + e.id)
  }
  var a = (d && manual_centering && 2) || 1;
  if (!D[e.skin]) {
    e.skin = "tf_template"
  }
  var c = new_sprite(e.skin, "full");
  if (a != 1) {
    c.scale = new PIXI.Point(a, a)
  }
  adopt_soft_properties(c, e);
  c.displayGroup = player_layer;
  c.walking = 0;
  c.animations = {};
  c.x = c.real_x = round(e.x);
  c.y = c.real_y = round(e.y);
  c.anchor.set(0.5, 1);
  c.type = "character";
  c.me = d;
  c.awidth = c.width / a;
  c.aheight = c.height / a;
  if (!(d && manual_centering)) {
    c.interactive = true;
    c.on("mousedown", player_click);
    if (!d && pvp) {
      c.defaultCursor = "crosshair"
    }
  }
  if (manual_centering && 0) {
    var f = [c.awidth, c.aheight],
      b = c.anchor;
    c.hitArea = new PIXI.Rectangle(-f[0] * b.x - 2, -f[1] * b.y - 2, f[0] + 4, f[1] + 4)
  }
  return c
}

function add_chest(f) {
  var g = D[f.chest];
  var c = new PIXI.Rectangle(g[0], g[1], g[2], g[3]);
  var e = new PIXI.Texture(C[FC[f.chest]], c);
  var a = new PIXI.Sprite(e);
  a.displayGroup = chest_layer;
  a.x = round(f.x);
  a.y = round(f.y);
  a.items = f.items;
  a.anchor.set(0.5, 1);
  a.type = "chest";
  a.interactive = true;
  a.buttonMode = true;
  a.defaultCursor = "help";
  var b = function() {
    socket.emit("open_chest", {
      id: f.id
    })
  };
  a.on("mousedown", b).on("touchstart", b).on("rightdown", b);
  chests[f.id] = a;
  map.addChild(a)
}

function get_npc(b) {
  var a = null;
  map_npcs.forEach(function(c) {
    if (c.npc_id == b) {
      a = c
    }
  });
  return a
}

function add_npc(d, a, c, g) {
  var e;
  if (d.type == "static") {
    e = new_sprite(d.skin, "static")
  } else {
    if (d.type == "fullstatic") {
      e = new_sprite(d.skin, "full")
    } else {
      e = new_sprite(d.skin, "emote")
    }
  }
  e.npc_id = g;
  e.displayGroup = player_layer;
  e.interactive = true;
  e.buttonMode = true;
  e.x = round(a[0]);
  e.y = round(a[1]);
  e.anchor.set(0.5, 1);
  e.type = "npc";
  e.animations = {};
  adopt_soft_properties(e, d);
  if (e.stype == "emote") {
    var h = [26, 35],
      b = e.anchor;
    e.hitArea = new PIXI.Rectangle(-h[0] * b.x - 2, -h[1] * b.y - 2, h[0] + 4, h[1] + 4);
    e.awidth = h[0];
    e.aheight = h[1];
    if (d.atype) {
      e.atype = d.atype;
      e.frame = e.stopframe || e.frame
    }
  }

  function f(j) {
    last_npc_right_click = new Date();
    $("#topleftcornerdialog").html("");
    if (this.role != "shrine" && this.role != "compound" && this.role != "blocker") {
      d_text(d.says || "Yes", this, {
        color: d.color
      })
    }
    if (this.role == "blocker") {
      socket.emit("blocker", {
        type: "pvp"
      })
    }
    if (this.role == "merchant") {
      render_merchant(this);
      if (!inventory) {
        render_inventory()
      }
    }
    if (this.role == "gold") {
      render_gold_npc();
      if (!inventory) {
        render_inventory()
      }
    }
    if (this.role == "items") {
      render_items_npc(this.pack);
      if (!inventory) {
        render_inventory()
      }
    }
    if (this.role == "exchange") {
      render_exchange_shrine();
      if (!inventory) {
        render_inventory()
      }
    }
    if (this.role == "shrine") {
      render_upgrade_shrine();
      if (!inventory) {
        render_inventory()
      }
    }
    if (this.role == "compound") {
      render_compound_shrine();
      if (!inventory) {
        render_inventory()
      }
    }
    if (this.role == "transport") {
      render_transports_npc();
      if (0) {
        show_transports()
      }
    }
    try {
      if (j) {
        j.stopPropagation()
      }
    } catch (k) {}
  }
  e.on("mousedown", f).on("touchstart", f).on("rightdown", f);
  e.onrclick = f;
  return e
}

function add_door(b) {
  var c = new PIXI.Sprite();
  c.displayGroup = player_layer;
  c.interactive = true;
  c.buttonMode = true;
  c.x = round(b[0]);
  c.y = round(b[1]);
  c.hitArea = new PIXI.Rectangle(0, 0, round(b[2]), round(b[3]));
  c.type = "door";

  function a() {
    if (distance(character, {
        x: b[0] + b[2] / 2,
        y: b[1] + b[3] / 2
      }) > 100) {
      add_log("Get closer", "gray");
      return
    }
    socket.emit("transport", {
      to: b[4],
      s: b[5]
    })
  }
  if (is_mobile) {
    c.on("mousedown", a).on("touchstart", a)
  }
  c.on("rightdown", a);
  c.onrclick = a;
  return c
}

function add_sign(a) {
  var b = new PIXI.Sprite();
  b.displayGroup = player_layer;
  b.interactive = true;
  b.buttonMode = true;
  b.defaultCursor = "help";
  b.x = round(a[0]);
  b.y = round(a[1]);
  b.hitArea = new PIXI.Rectangle(0, 0, round(a[2]), round(a[3]));
  b.type = "sign";

  function c() {
    add_log('Sign reads: "' + a[4] + '"', "gray")
  }
  b.on("rightdown", c);
  return b
}

function create_map() {
  if (window.map) {
    if (window.inner_stage) {
      inner_stage.removeChild(window.map)
    } else {
      stage.removeChild(window.map)
    }
    free_children(map);
    map.destroy();
    map_entities.forEach(function(h) {
      h.destroy({
        children: true
      })
    });
    if (dtile) {
      dtile.destroy(), dtile = null
    }
    if (tiles) {
      tiles.destroy(), tiles = null
    }(window.rtextures || []).forEach(function(h) {
      if (h) {
        h.destroy()
      }
    });
    (window.dtextures || []).forEach(function(h) {
      if (h) {
        h.destroy()
      }
    })
  }
  map_npcs = [];
  map_doors = [];
  map_tiles = [];
  map_entities = [];
  water_tiles = [];
  entities = {};
  if (!tile_sprites[current_map]) {
    tile_sprites[current_map] = {}, sprite_last[current_map] = []
  }
  dtile_size = M["default"] && M["default"][3];
  if (dtile_size && is_array(dtile_size)) {
    dtile_size = dtile_size[0]
  }
  map = new PIXI.Container();
  pvp = G.maps[current_map].pvp || is_pvp;
  map.real_x = map.real_y = 0;
  map.speed = 80;
  map.hitArea = new PIXI.Rectangle(-20000, -20000, 40000, 40000);
  if (scale) {
    map.scale = new PIXI.Point(scale, scale)
  }
  map.interactive = true;
  map.on("mousedown", map_click).on("mouseup", map_click_release).on("mouseupoutside", map_click_release).on("touchstart", map_click).on("touchend", map_click_release).on("touchendoutside", map_click_release);
  if (window.inner_stage) {
    inner_stage.addChild(map)
  } else {
    stage.addChild(map)
  }
  if (G.maps[current_map].filter == "halloween") {
    var e = new PIXI.filters.ColorMatrixFilter();
    e.saturate(-0.1);
    stage.filters = [e]
  }
  if (cached_map) {
    for (var s = 0; s <= M.tiles.length; s++) {
      if (s == M.tiles.length) {
        element = M["default"]
      } else {
        element = M.tiles[s]
      }
      sprite_last[current_map][s] = 0;
      if (!tile_sprites[current_map][s]) {
        tile_sprites[current_map][s] = [];
        if (!element) {
          continue
        }
        if (element[3].length) {
          element[4] = element[3][1], element[3] = element[3][0]
        } else {
          element[4] = element[3]
        }
        var A = new PIXI.Rectangle(element[1], element[2], element[3], element[4]);
        var n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
        element[5] = n;
        if (element[0] == "water") {
          element[5].type = "water";
          A = new PIXI.Rectangle(element[1] + 48, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[6] = n;
          A = new PIXI.Rectangle(element[1] + 48 + 48, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[7] = n
        }
        if (element[0] == "puzzle" || element[0] == "custom_a") {
          element[5].type = "water";
          A = new PIXI.Rectangle(element[1] + 16, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[6] = n;
          A = new PIXI.Rectangle(element[1] + 16 + 16, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[7] = n
        }
      }
    }
    window.rtextures = [0, 0, 0];
    window.dtextures = [0, 0, 0];
    for (var b = 0; b < 3; b++) {
      rtextures[b] = PIXI.RenderTexture.create(M.max_x - M.min_x, M.max_y - M.min_y, PIXI.SCALE_MODES.NEAREST, 1);
      if (dtile_size) {
        var r = new PIXI.extras.TilingSprite(M["default"][5 + b] || M["default"][5], screen.width / scale + 3 * dtile_size, screen.height / scale + 3 * dtile_size);
        dtextures[b] = PIXI.RenderTexture.create(screen.width + 4 * dtile_size, screen.height + 4 * dtile_size, PIXI.SCALE_MODES.NEAREST, 1);
        renderer.render(r, dtextures[b]);
        r.destroy()
      }
      var a = new PIXI.Container();
      for (var s = 0; s < M.placements.length; s++) {
        var B = M.placements[s];
        if (B[3] === undefined) {
          var m = M.tiles[B[0]],
            d = m[3],
            t = m[4];
          if (sprite_last[current_map][B[0]] >= tile_sprites[current_map][B[0]].length) {
            tile_sprites[current_map][B[0]][sprite_last[current_map][B[0]]] = new_map_tile(m)
          }
          var f = tile_sprites[current_map][B[0]][sprite_last[current_map][B[0]]++];
          if (f.textures) {
            f.texture = f.textures[b], water_tiles.push(f)
          }
          f.x = B[1] - M.min_x;
          f.y = B[2] - M.min_y;
          a.addChild(f)
        } else {
          var m = M.tiles[B[0]],
            d = m[3],
            t = m[4];
          for (var c = B[1]; c <= B[3]; c += d) {
            for (y = B[2]; y <= B[4]; y += t) {
              if (sprite_last[current_map][B[0]] >= tile_sprites[current_map][B[0]].length) {
                tile_sprites[current_map][B[0]][sprite_last[current_map][B[0]]] = new_map_tile(m)
              }
              var f = tile_sprites[current_map][B[0]][sprite_last[current_map][B[0]]++];
              if (f.textures) {
                f.texture = f.textures[b], water_tiles.push(f)
              }
              f.x = c - M.min_x;
              f.y = y - M.min_y;
              a.addChild(f)
            }
          }
        }
      }
      a.x = 0;
      a.y = 0;
      renderer.render(a, rtextures[b]);
      a.destroy()
    }
    if (dtile_size) {
      window.dtile = new PIXI.Sprite(dtextures[1]), dtile.x = -500, dtile.y = -500
    }
    window.tiles = new PIXI.Sprite(rtextures[0]);
    tiles.x = M.min_x;
    tiles.y = M.min_y;
    if (dtile_size) {
      map.addChild(dtile)
    }
    map.addChild(tiles)
  } else {
    for (var s = 0; s <= M.tiles.length; s++) {
      if (s == M.tiles.length) {
        element = M["default"]
      } else {
        element = M.tiles[s]
      }
      sprite_last[current_map][s] = 0;
      if (!tile_sprites[current_map][s]) {
        tile_sprites[current_map][s] = [];
        if (!element) {
          continue
        }
        if (element[3].length) {
          element[4] = element[3][1], element[3] = element[3][0]
        } else {
          element[4] = element[3]
        }
        var A = new PIXI.Rectangle(element[1], element[2], element[3], element[4]);
        var n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
        element[5] = n;
        if (element[0] == "water") {
          element[5].type = "water";
          A = new PIXI.Rectangle(element[1] + 48, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[6] = n;
          A = new PIXI.Rectangle(element[1] + 48 + 48, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[7] = n
        }
        if (element[0] == "puzzle" || element[0] == "custom_a") {
          element[5].type = "water";
          A = new PIXI.Rectangle(element[1] + 16, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[6] = n;
          A = new PIXI.Rectangle(element[1] + 16 + 16, element[2], element[3], element[4]);
          n = new PIXI.Texture(C[G.tilesets[element[0]]], A);
          element[7] = n
        }
        tile_sprites[current_map][s][sprite_last[current_map][s]] = new_map_tile(element)
      }
    }
  }
  if (M.groups) {
    for (var o = 0; o < M.groups.length; o++) {
      if (!M.groups[o].length) {
        continue
      }
      var k = new PIXI.Container();
      k.type = "group";
      var j = 999999999,
        l = 99999999,
        u = -999999999;
      for (var s = 0; s < M.groups[o].length; s++) {
        var B = M.groups[o][s],
          m = M.tiles[B[0]];
        if (B[1] < l) {
          l = B[1]
        }
        if (B[2] < j) {
          j = B[2]
        }
        if (B[2] + m[4] > u) {
          u = B[2] + m[4]
        }
      }
      for (var s = 0; s < M.groups[o].length; s++) {
        var B = M.groups[o][s];
        var f = new PIXI.Sprite(M.tiles[B[0]][5]);
        f.x = B[1] - l;
        f.y = B[2] - j;
        if (B[2] < j) {
          j = B[2]
        }
        k.addChild(f)
      }
      k.x = l;
      k.y = j;
      k.real_x = l;
      k.real_y = u;
      k.displayGroup = player_layer;
      map.addChild(k);
      map_entities.push(k)
    }
  }
  map_info = G.maps[current_map];
  npcs = map_info.npcs;
  for (var s = 0; s < npcs.length; s++) {
    var v = npcs[s],
      m = G.npcs[v.id];
    if (m.type == "full") {
      continue
    }
    console.log("NPC: " + v.name);
    var g = add_npc(m, v.position, v.name, v.id);
    map.addChild(g);
    map_npcs.push(g);
    map_entities.push(g)
  }
  doors = map_info.doors || [];
  for (var s = 0; s < doors.length; s++) {
    var q = doors[s];
    var g = add_door(q);
    console.log("Door: " + q);
    map.addChild(g);
    map_doors.push(g);
    map_entities.push(g)
  }
  signs = map_info.signs || [];
  for (var s = 0; s < signs.length; s++) {
    var z = signs[s];
    var g = add_sign(z);
    console.log("Sign: " + z);
    map.addChild(g);
    map_entities.push(g)
  }
  console.log("Map created: " + current_map)
}

function retile_the_map() {
  if (cached_map) {
    if (last_water_frame != water_frame()) {
      last_water_frame = water_frame();
      tiles.texture = rtextures[last_water_frame];
      if (dtile_size) {
        dtile.texture = dtextures[last_water_frame]
      }
    }
    return
  }
  var o = mdraw_border * scale,
    n = [],
    b = 0,
    p = {},
    a = new Date(),
    m = 0,
    l = 0;
  var d = map.real_x,
    c = map.real_y,
    k = d - width / scale / 2 - o,
    B = d + width / scale / 2 + o,
    g = c - height / scale / 2 - o,
    A = c + height / scale / 2 + o;
  if (!(map.last_max_y == undefined || abs(map.last_max_y - A) >= o || abs(map.last_max_x - B) >= o)) {
    if (last_water_frame != water_frame()) {
      last_water_frame = water_frame();
      for (var q = 0; q < water_tiles.length; q++) {
        water_tiles[q].texture = water_tiles[q].textures[last_water_frame]
      }
      if (mdraw_tiling_sprites) {
        default_tiling.texture = default_tiling.textures[last_water_frame]
      }
    }
    return
  }
  map.last_max_y = A;
  map.last_max_x = B;
  for (var q = 0; q < map_tiles.length; q++) {
    var f = map_tiles[q];
    if (mdraw_mode == "redraw" || f.x > B || f.y > A || f.x + f.width < k || f.y + f.height < g) {
      f.to_delete = true;
      m++
    } else {
      n.push(f);
      p[f.tid] = true
    }
  }
  if (0) {
    start_timer("remove_sprite");
    for (var q = 0; q < map_tiles.length; q++) {
      if (map_tiles[q].to_delete) {
        remove_sprite(map_tiles[q])
      }
    }
    stop_timer("remove_sprite")
  } else {
    if (map_tiles.length) {
      map.removeChildren(map.children.indexOf(map_tiles[0]), map.children.indexOf(map_tiles[map_tiles.length - 1]))
    }
  }
  for (var q = 0; q <= M.tiles.length; q++) {
    sprite_last[current_map][q] = 0
  }
  map_tiles = n;
  water_tiles = [];
  last_water_frame = water_frame();
  if (M["default"] && !mdraw_tiling_sprites) {
    for (var d = k; d <= B + 10; d += M["default"][3]) {
      for (var c = g; c <= A + 10; c += M["default"][4]) {
        var z = floor(d / M["default"][3]),
          v = floor(c / M["default"][4]),
          u = "d" + z + "-" + v;
        if (p[u]) {
          continue
        }
        if (sprite_last[current_map][M.tiles.length] >= tile_sprites[current_map][M.tiles.length].length) {
          tile_sprites[current_map][M.tiles.length][sprite_last[current_map][M.tiles.length]] = new_map_tile(M["default"]), l++
        }
        var f = tile_sprites[current_map][M.tiles.length][sprite_last[current_map][M.tiles.length]++];
        if (f.textures) {
          f.texture = f.textures[last_water_frame], water_tiles.push(f)
        }
        f.x = z * M["default"][3];
        f.y = v * M["default"][4];
        if (mdraw_mode != "redraw") {
          f.displayGroup = map_layer
        }
        f.zOrder = 0;
        f.tid = u;
        map.addChild(f);
        map_tiles.push(f)
      }
    }
  } else {
    if (M["default"]) {
      if (!window.default_tiling) {
        default_tiling = new PIXI.extras.TilingSprite(M["default"][5], floor((B - k) / 32) * 32 + 32, floor((A - g) / 32) * 32 + 32)
      }
      default_tiling.x = floor(k / M["default"][3]) * M["default"][3];
      default_tiling.y = floor(g / M["default"][4]) * M["default"][4];
      default_tiling.textures = [M["default"][5], M["default"][6], M["default"][7]];
      map.addChild(default_tiling);
      map_tiles.push(default_tiling)
    }
  }
  for (var q = 0; q < M.placements.length; q++) {
    var E = M.placements[q];
    if (E[3] === undefined) {
      if (p["p" + q]) {
        continue
      }
      var j = M.tiles[E[0]],
        e = j[3],
        t = j[4];
      if (E[1] > B || E[2] > A || E[1] + e < k || E[2] + t < g) {
        continue
      }
      if (sprite_last[current_map][E[0]] >= tile_sprites[current_map][E[0]].length) {
        tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]] = new_map_tile(j), l++
      }
      var f = tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]++];
      if (f.textures) {
        f.texture = f.textures[last_water_frame], water_tiles.push(f)
      }
      f.x = E[1];
      f.y = E[2];
      if (mdraw_mode != "redraw") {
        f.displayGroup = map_layer
      }
      f.zOrder = -(q + 1);
      f.tid = "p" + q;
      map.addChild(f);
      map_tiles.push(f)
    } else {
      var j = M.tiles[E[0]],
        e = j[3],
        t = j[4];
      if (!mdraw_tiling_sprites) {
        for (var d = E[1]; d <= E[3]; d += e) {
          if (d > B || d + e < k) {
            continue
          }
          for (c = E[2]; c <= E[4]; c += t) {
            if (c > A || c + t < g) {
              continue
            }
            if (sprite_last[current_map][E[0]] >= tile_sprites[current_map][E[0]].length) {
              tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]] = new_map_tile(j), l++
            }
            var f = tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]++];
            if (f.textures) {
              f.texture = f.textures[last_water_frame], water_tiles.push(f)
            }
            f.x = d;
            f.y = c;
            f.tid = "p" + q + "-" + d + "-" + c;
            map.addChild(f);
            map_tiles.push(f)
          }
        }
      } else {
        if (!window["defP" + q]) {
          window["defP" + q] = new PIXI.extras.TilingSprite(j[5], E[3] - E[1] + e, E[4] - E[2] + t)
        }
        var f = window["defP" + q];
        f.x = E[1];
        f.y = E[2];
        map.addChild(f);
        map_tiles.push(f)
      }
    }
  }
  drawings.forEach(function(s) {
    try {
      var r = s && s.parent;
      if (r) {
        r.removeChild(s);
        r.addChild(s)
      }
    } catch (h) {
      console.log("User drawing exception: " + h)
    }
  });
  console.log("retile_map ms: " + mssince(a) + " min_x: " + k + " max_x: " + B + " entities: " + map_tiles.length + " removed: " + m + " new: " + l)
}
var fps_counter = null,
  frames = 0,
  last_count = null,
  last_frame, fps = 0;

function calculate_fps() {
  if (mode.dom_tests_pixi) {
    return
  }
  frames += 1;
  if (!last_count) {
    last_count = new Date(), last_frame = frames, frequency = 500
  }
  if (mssince(last_count) >= frequency) {
    last_count = new Date(), fps = (frames - last_frame) * (1000 / frequency), last_frame = frames
  }
  fps_counter.text = "" + round(fps);
  fps_counter.position.set(width - 340, height)
}

function load_game(a) {
  loader.load(function(m, c) {
    if (mode_nearest) {
      for (file in PIXI.utils.BaseTextureCache) {
        PIXI.utils.BaseTextureCache[file].scaleMode = PIXI.SCALE_MODES.NEAREST
      }
    }
    for (name in G.sprites) {
      var f = G.sprites[name];
      if (f.skip) {
        continue
      }
      var d = 4,
        k = "full";
      if (f.type == "animation") {
        d = 1, k = "animation"
      }
      var l = f.matrix;
      var b = C[f.file].width / (f.columns * 3);
      var n = C[f.file].height / (f.rows * d);
      for (var g = 0; g < l.length; g++) {
        for (var e = 0; e < l[g].length; e++) {
          if (!l[g][e]) {
            continue
          }
          FC[l[g][e]] = f.file;
          D[l[g][e]] = [e * 3 * b, g * d * n, b, n];
          T[l[g][e]] = k
        }
      }
    }
    var h = G.positions.stone;
    rip_texture = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[h[0]]], new PIXI.Rectangle(h[1], h[2], h[3], h[4]));
    var h = G.positions.stand0t;
    stand0_texture = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[h[0]]], new PIXI.Rectangle(h[1], h[2], h[3], h[4]));
    create_map();
    for (name in G.animations) {
      generate_textures(name, "animation")
    }
    if (!mode.dom_tests_pixi) {
      fps_counter = new PIXI.Text("0", {
        fontFamily: "sans-serif",
        fontSize: 32,
        fill: "green"
      });
      fps_counter.position.set(10, 10);
      fps_counter.anchor.set(1, 1);
      fps_counter.displayGroup = chest_layer;
      fps_counter.zOrder = -999999999;
      if (window.inner_stage) {
        inner_stage.addChild(fps_counter)
      } else {
        stage.addChild(fps_counter)
      }
    }
    draw();
    game_loaded = true;
    socket.emit("loaded", {
      success: 1,
      width: screen.width,
      height: screen.height,
      scale: scale
    })
  })
}

function draw(a, b) {
  if (manual_stop) {
    return
  }
  draws++;
  if (window.last_draw) {
    frame_ms = mssince(last_draw)
  }
  last_draw = new Date();
  start_timer("draw");
  draw_timeouts_logic(2);
  stop_timer("draw", "timeouts");
  calculate_fps();
  if (!(character && mouse_only) && 0) {
    var e = map.speed;
    if (character) {
      e = character.speed
    }
    e *= frame_ms / 1000;
    if ((left_pressed || right_pressed) && (down_pressed || up_pressed)) {
      e /= 1.41
    }
    if (left_pressed < right_pressed) {
      map.real_x += e
    }
    if (left_pressed > right_pressed) {
      map.real_x -= e
    }
    if (up_pressed < down_pressed) {
      map.real_y += e
    }
    if (up_pressed > down_pressed) {
      map.real_y -= e
    }
  }
  process_entities();
  future_entities = {
    players: {},
    monsters: {}
  };
  stop_timer("draw", "entities");
  if (gtest && character) {
    map.real_x -= 0.1, map.real_y -= 0.001
  }
  var d = frame_ms;
  if (d > 40) {
    console.log("cframe_ms is " + d)
  }
  while (d > 0) {
    var c = false;
    if (character && character.moving) {
      c = true;
      if (character.vx) {
        character.real_x += character.vx * min(d, 50) / 1000
      }
      if (character.vy) {
        character.real_y += character.vy * min(d, 50) / 1000
      }
      stop_logic(character)
    }
    for (i in entities) {
      entity = entities[i];
      if (entity && !entity.dead && entity.moving) {
        c = true;
        entity.real_x += entity.vx * min(d, 50) / 1000;
        entity.real_y += entity.vy * min(d, 50) / 1000;
        stop_logic(entity)
      }
    }
    d -= 50;
    if (!c) {
      break
    }
  }
  stop_timer("draw", "movements");
  draw_entities();
  stop_timer("draw", "draw_entities");
  position_map();
  get_code_function("on_draw")();
  retile_the_map();
  stop_timer("draw", "retile");
  if (character) {
    update_sprite(character)
  }
  map_npcs.forEach(function(f) {
    update_sprite(f)
  });
  stop_timer("draw", "sprites");
  update_overlays();
  if (exchange_animations) {
    exchange_animation_logic()
  }
  stop_timer("draw", "uis");
  tint_logic();
  draw_timeouts_logic();
  stop_timer("draw", "before_render");
  if (!b) {
    renderer.render(stage)
  }
  stop_timer("draw", "after_render");
  if (!b) {
    requestAnimationFrame(draw)
  }
};
