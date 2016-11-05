var up_pressed = 0,
  down_pressed = 0,
  left_pressed = 0,
  right_pressed = 0,
  z_pressed = 0,
  x_pressed = 0,
  y_pressed = 0,
  cmd_pressed = 0,
  c_pressed = 0,
  f_pressed = 0,
  n_pressed = 0,
  v_pressed = 0;
var pressed = {};
var last_press = 1,
  total_mousemoves = 0;

function keyboard_logic() {
  window.addEventListener("keydown", function(a) {
    last_interaction = new Date();
    if ($("input:focus").length > 0 || $("textarea:focus").length > 0 || a.target && a.target.hasAttribute("contenteditable")) {
      if (!(a.keyCode == 27 && window.character)) {
        return
      }
    }
    if (in_arr(a.keyCode, [87, 38])) {
      up_pressed = last_press++
    }
    if (in_arr(a.keyCode, [83, 40])) {
      down_pressed = last_press++
    }
    if (in_arr(a.keyCode, [65, 37])) {
      left_pressed = last_press++
    }
    if (in_arr(a.keyCode, [68, 39])) {
      right_pressed = last_press++
    }
    if (a.keyCode == 90) {
      z_pressed = last_press++
    }
    if (a.keyCode == 89) {
      y_pressed = last_press++
    }
    if (a.keyCode == 88) {
      x_pressed = last_press++
    }
    if (a.keyCode == 67) {
      c_pressed = last_press++
    }
    if (a.keyCode == 78) {
      n_pressed = last_press++;
      show_names = 1 - show_names
    }
    if (a.keyCode == 86) {
      v_pressed = last_press++
    }
    if (a.keyCode == 70) {
      f_pressed = last_press++
    }
    if (a.keyCode == 91) {
      cmd_pressed = true
    }
    if (window.character && !pressed[a.keyCode]) {
      if (a.keyCode == 65) {
        attack_click()
      }
      if (a.keyCode == 81 && character.ctype == "warrior" && ctarget) {
        socket.emit("ability", {
          name: "taunt",
          id: ctarget.id
        })
      }
      if (a.keyCode == 82 && character.ctype == "warrior") {
        socket.emit("ability", {
          name: "charge"
        })
      }
      if (a.keyCode == 82 && character.ctype == "rogue") {
        socket.emit("ability", {
          name: "invis"
        })
      }
      if (a.keyCode == 82 && character.ctype == "ranger" && ctarget) {
        socket.emit("ability", {
          name: "supershot",
          id: ctarget.id
        })
      }
      if (a.keyCode == 82 && character.ctype == "priest" && ctarget) {
        socket.emit("ability", {
          name: "curse",
          id: ctarget.id
        })
      }
      if (a.keyCode == 82 && character.ctype == "mage" && ctarget) {
        socket.emit("ability", {
          name: "burst",
          id: ctarget.id
        })
      }
      if (a.keyCode == 49) {
        use("hp")
      }
      if (a.keyCode == 50) {
        use("mp")
      }
      if (a.keyCode == 73) {
        render_inventory()
      }
      if (a.keyCode == 67) {
        toggle_character()
      }
      if (a.keyCode == 27) {
        esc_pressed()
      }
      if (a.keyCode == 70) {
        npc_focus()
      }
      if ((a.keyCode == 220 || a.keyCode == 9000) && window.toggle_runner) {
        toggle_runner()
      }
    }
    if (a.keyCode == 27 && window.map_editor && set) {
      destroy_tileset()
    }
    if (a.keyCode == 13 && window.character && !window.inventory) {
      $(":focus").blur();
      $("#chatinput").focus();
      a.preventDefault()
    }
    pressed[a.keyCode] = last_press++;
    if (!cmd_pressed) {
      stpr(a)
    }
  }, false);
  window.addEventListener("keyup", function(a) {
    if ($("input:focus").length > 0 || $("textarea:focus").length > 0 || a.target && a.target.hasAttribute("contenteditable")) {
      return
    }
    if (in_arr(a.keyCode, [87, 38])) {
      up_pressed = 0
    }
    if (in_arr(a.keyCode, [83, 40])) {
      down_pressed = 0
    }
    if (in_arr(a.keyCode, [65, 37])) {
      left_pressed = 0
    }
    if (in_arr(a.keyCode, [68, 39])) {
      right_pressed = 0
    }
    if (a.keyCode == 90) {
      z_pressed = 0
    }
    if (a.keyCode == 89) {
      y_pressed = 0
    }
    if (a.keyCode == 88) {
      x_pressed = 0
    }
    if (a.keyCode == 67) {
      c_pressed = 0
    }
    if (a.keyCode == 78) {
      n_pressed = 0
    }
    if (a.keyCode == 86) {
      v_pressed = 0
    }
    if (a.keyCode == 70) {
      f_pressed = 0
    }
    if (a.keyCode == 91) {
      cmd_pressed = false
    }
    pressed[a.keyCode] = 0;
    if (!cmd_pressed) {
      stpr(a)
    }
  }, false);
  window.addEventListener("mousemove", function(a) {
    if (mm_afk) {
      last_interaction = new Date()
    }
  }, false)
};
