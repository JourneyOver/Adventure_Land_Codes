var u_item = null,
  u_scroll = null,
  u_offering = null,
  c_items = e_array(3),
  c_scroll = null,
  c_offering = null,
  c_last = 0,
  e_item = null;
var skillmap = {
    "1": {
      name: "use_hp"
    },
    "2": {
      name: "use_mp"
    },
    R: {
      name: "skill_burst"
    }
  },
  skillbar = [];
var settings_shown = 0;

function show_settings() {
  var a = "<div id='pagewrapper' style='z-index:9999; background: rgba(0,0,0,0.6)' onclick='hide_settings()'>";
  a += "<div id='pagewrapped'>";
  a += $("#settingshtml").html();
  a += "</div>";
  a += "</div>";
  $("#content").html(a);
  $("#pagewrapped").css("margin-top", Math.floor(($(window).height() - $("#pagewrapped").height()) / 2) + "px");
  resize()
}
var docked = [],
  cwindows = [];

function close_chat_window(a, c) {
  var b = a + (c || "");
  $("#chatw" + b).remove();
  array_delete(docked, b);
  array_delete(cwindows, b);
  redock()
}

function toggle_chat_window(a, c) {
  var b = a + (c || "");
  if (in_arr(b, docked)) {
    array_delete(docked, b);
    $(".chatb" + b).html("#");
    $("#chatw" + b).css("bottom", "auto");
    $("#chatw" + b).css("top", 400);
    $("#chatw" + b).css("left", 400);
    $("#chatw" + b).css("z-index", 70 + cwindows.length - docked.length);
    $("#chatw" + b).draggable();
    $("#chatt" + b).removeClass("newmessage")
  } else {
    $(".chatb" + b).html("+");
    $("#chatw" + b).draggable("destroy");
    $("#chatw" + b).css("top", "auto");
    $("#chatw" + b).css("left", 0);
    docked.push(b)
  }
  redock()
}

function chat_title_click(a, c) {
  var b = a + (c || "");
  if (in_arr(b, docked)) {
    toggle_chat_window(a, c)
  }
}

function redock() {
  for (var a = 0; a < docked.length; a++) {
    var b = docked[a];
    $("#chatw" + b).css("bottom", 15 + a * 32);
    $("#chatw" + b).css("z-index", 70 - a)
  }
}

function open_chat_window(e, h, b) {
  if (!h) {
    h = ""
  }
  var a = h,
    g = e + h,
    d = 70 + cwindows.length - docked.length,
    f = 'last_say="' + g + '"; if(event.keyCode==13) private_say("' + h + '",$(this).rfval())';
  if (e == "party") {
    a = "Party", f = 'last_say="' + g + '"; if(event.keyCode==13) party_say($(this).rfval())'
  }
  var c = "<div style='position:fixed; bottom: 0px; left: 0px; background: black; border: 5px solid gray; z-index: " + d + "' id='chatw" + g + "' onclick='last_say=\"" + g + "\"'>";
  c += "<div style='border-bottom: 5px solid gray; text-align: center; font-size: 24px; line-height: 24px; padding: 2px 6px 2px 6px;'><span style='float:left' class='clickable chatb" + g + "'		 onclick='toggle_chat_window(\"" + e + '","' + h + "\")'>+</span> <span id='chatt" + g + "' onclick='chat_title_click(\"" + e + '","' + h + "\")'>" + a + "</span> <span style='float: right' class='clickable' onclick='close_chat_window(\"" + e + '","' + h + "\")'>x</span></div>";
  c += "<div id='chatd" + g + "' class='chatlog'></div>";
  c += "<div style=''><input type='text' class='chatinput' id='chati" + g + "' onkeypress='" + f + "'/></div>";
  c += "</div>";
  $("body").append(c);
  docked.push(g);
  cwindows.push(g);
  if (b) {
    toggle_chat_window(e, h)
  }
  redock()
}

function hide_settings() {
  $("#content").html("");
  settings_shown = 0
}

function prop_line(e, d, b) {
  var a = "",
    c = "";
  if (!b) {
    b = {}
  }
  if (b.bold) {
    c = "font-weight: bold;"
  }
  if (is_string(b)) {
    a = b, b = {}
  }
  if (!a) {
    a = b.color || "grey"
  }
  return "<div><span style='color: " + a + "; " + c + "'>" + e + "</span>: " + d + "</div>"
}

function bold_prop_line(c, b, a) {
  if (!a) {
    a = {}
  }
  if (is_string(a)) {
    a = {
      color: a
    }
  }
  if (is_bold) {
    a.bold = true
  }
  return prop_line(c, b, a)
}

function render_party(b) {
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 6px; font-size: 24px; display: inline-block' class='enableclicks'>";
  if (b) {
    a += "<div class='slimbutton block'>PARTY</div>";
    b.forEach(function(c) {
      a += "<div class='slimbutton block mt5' style='border-color:#703987' onclick='party_click(\"" + c + "\")'>" + c + "</div>"
    });
    a += "<div class='slimbutton block mt5'";
    a += 'onclick=\'socket.emit("party",{event:"leave"})\'>LEAVE</div>'
  }
  a += "</div>";
  $("#partylist").html(a);
  if (!b.length) {
    $("#partylist").hide()
  } else {
    $("#partylist").css("display", "inline-block")
  }
}

function render_character_sheet() {
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top; text-align: left' class='enableclicks'>";
  a += "<div><span style='color:gray'>Class:</span> " + to_title(character.ctype) + "</div>";
  a += "<div><span style='color:gray'>Level:</span> " + character.level + "</div>";
  a += "<div><span style='color:gray'>XP:</span> " + to_pretty_num(character.xp) + " / " + to_pretty_num(character.max_xp) + "</div>";
  if (character.ctype == "priest") {
    a += "<div><span style='color:gray'>Heal:</span> " + character.attack + "</div>";
    a += "<div><span style='color:gray'>Attack:</span> " + round(character.attack * 0.4) + "</div>"
  } else {
    a += "<div><span style='color:gray'>Attack:</span> " + character.attack + "</div>"
  }
  a += "<div><span style='color:gray'>Attack Speed:</span> " + round(character.frequency * 100) + "</div>";
  a += "<div><span style='color:gray'>Strength:</span> " + character.stats.str + "</div>";
  a += "<div><span style='color:gray'>Intelligence:</span> " + character.stats["int"] + "</div>";
  a += "<div><span style='color:gray'>Dexterity:</span> " + character.stats.dex + "</div>";
  a += "<div><span style='color:gray'>Armor:</span> " + character.armor + "</div>";
  a += "<div><span style='color:gray'>Resistance:</span> " + character.resistance + "</div>";
  a += "<div><span style='color:gray'>Speed:</span> " + character.speed + "</div>";
  a += "<div><span style='color:gray'>MP Cost:</span> " + character.mp_cost + "</div>";
  if (character.goldm != 1) {
    a += "<div><span style='color:gray'>Gold:</span> " + round(character.goldm * 100) + "%</div>"
  }
  if (character.xpm != 1) {
    a += "<div><span style='color:gray'>Experience:</span> " + round(character.xpm * 100) + "%</div>"
  }
  if (character.luckm != 1) {
    a += "<div><span style='color:gray'>Luck:</span> " + round(100 / character.luckm) + "%</div>"
  }
  a += "</div>";
  $("#rightcornerui").html(a);
  topright_npc = "character"
}

function render_abilities() {}

function render_info(h, f) {
  if (!f) {
    f = []
  }
  var e = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top'>";
  for (var d = 0; d < h.length; d++) {
    var g = h[d],
      a = "";
    var b = g.color || "white";
    if (g.afk) {
      a = " <span class='gray'>[AFK]</span>"
    }
    if (g.cursed) {
      a = " <span style='color: #7D4DAA'>[C]</span>"
    }
    if (g.stunned) {
      a = " <span style='color: #FF9601'>[STUN]</span>"
    }
    if (g.line) {
      e += "<span class='cbold' style='color: " + b + "'>" + g.line + "</span>" + a + "<br />"
    } else {
      e += "<span class='cbold' style='color: " + b + "'>" + g.name + "</span>: " + g.value + a + "<br />"
    }
  }
  for (var d = 0; d < f.length; d++) {
    var c = f[d];
    var b = c.color || "white";
    e += "<span style='color: " + b + "' class='clickable cbold' onclick=\"" + c.onclick + '">' + c.name + "</span><br />"
  }
  e += "</div>";
  $("#topleftcornerui").html(e)
}

function render_slots(f) {
  function c(m, g, l) {
    if (f.slots[m]) {
      var j = f.slots[m];
      var k = "item" + randomStr(10),
        h = G.items[j.name],
        i = j.skin || h.skin;
      if (j.expires) {
        i = h.skin_a
      }
      e += item_container({
        skin: i,
        onclick: "slot_click('" + m + "')",
        def: h,
        id: k,
        draggable: f.me,
        sname: f.me && m,
        shade: g,
        s_op: l,
        slot: m
      }, j)
    } else {
      e += item_container({
        size: 40,
        draggable: f.me,
        shade: g,
        s_op: l,
        slot: m
      })
    }
  }
  var a = f.me;
  var e = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top; margin-left: 5px'>";
  if (f.stand) {
    e += "<div class='cmerchant'>";
    for (var d = 0; d < 4; d++) {
      e += "<div>";
      for (var b = 0; b < 4; b++) {
        c("trade" + ((d * 4) + b + 1), "shade_gold")
      }
      e += "</div>"
    }
    e += "</div>"
  }
  if (f.stand) {
    e += "<div class='cmerchant hidden'>"
  }
  e += "<div>";
  c("earring1", "shade_earring");
  c("helmet", "shade_helmet");
  c("earring2", "shade_earring");
  c("amulet", "shade_amulet");
  e += "</div>";
  e += "<div>";
  c("mainhand", "shade_mainhand");
  c("chest", "shade_chest");
  c("offhand", "shade_offhand");
  c("cape", "shade20_cape");
  e += "</div>";
  e += "<div>";
  c("ring1", "shade_ring");
  c("pants", "shade_pants", 0.3);
  c("ring2", "shade_ring");
  c("orb", "shade20_orb");
  e += "</div>";
  e += "<div>";
  c("belt", "shade_belt");
  c("shoes", "shade_shoes");
  c("gloves", "shade_gloves");
  c("elixir", "shade20_elixir");
  e += "</div>";
  if (f.trades && !f.stand) {
    e += "<div>";
    c("trade1", "shade_gold");
    c("trade2", "shade_gold");
    c("trade3", "shade_gold");
    c("trade4", "shade_gold");
    e += "</div>"
  }
  if (f.stand) {
    e += "</div>"
  }
  e += "</div>";
  $("#topleftcornerui").append(e)
}

function render_transports_npc() {
  reset_inventory(1);
  topleft_npc = "transports";
  rendered_target = topleft_npc;
  e_item = null;
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top;'>";
  a += "<div class='clickable' onclick='transport_to(\"main\",6)'>&gt; Islands</div>";
  a += "<div class='clickable' onclick='transport_to(\"halloween\",1)'>&gt; Spooky Forest</div>";
  a += "<div class='clickable' onclick='transport_to(\"underworld\")'>&gt; Underworld</div>";
  a += "<div class='clickable' onclick='transport_to(\"desert\")'>&gt; Desertland <span style='color: #D2CB7E'>[Soon!]</span></div>";
  a += "</div>";
  $("#topleftcornerui").html(a)
}

function render_gold_npc() {
  reset_inventory(1);
  topleft_npc = "gold";
  rendered_target = topleft_npc;
  e_item = null;
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top; text-align: center' onclick='stpr(event); cfocus(\".npcgold\")'>";
  a += "<div style='font-size: 36px; margin-bottom: 10px'><span style='color:gold'>GOLD:</span> " + (character.user && to_pretty_num(character.user.gold) || "Unavailable") + "</div>";
  a += "<div style='font-size: 36px; margin-bottom: 10px'><span style='color:gray'>Amount:</span> <div contenteditable='true' class='npcgold inline-block'>0</div></div>";
  a += "<div><div class='gamebutton clickable' onclick='deposit()'>DEPOSIT</div><div class='gamebutton clickable ml5' onclick='withdraw()'>WITHDRAW</div></div>";
  a += "</div>";
  $("#topleftcornerui").html(a);
  cfocus(".npcgold")
}
var last_rendered_items = "items0";

function render_items_npc(l) {
  if (!l) {
    l = last_rendered_items
  }
  last_rendered_items = l;
  reset_inventory(1);
  topleft_npc = "items";
  rendered_target = topleft_npc;
  var g = [],
    m = 0,
    k = character.user[l] || [];
  var e = "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block' class='dcontain'>";
  for (var d = 0; d < Math.ceil(max(character.isize, k.length) / 7); d++) {
    e += "<div>";
    for (var c = 0; c < 7; c++) {
      var h = null;
      if (m < k.length) {
        h = k[m++]
      } else {
        m++
      }
      if (h) {
        var a = "citem" + (m - 1),
          o = G.items[h.name],
          n = o.skin;
        if (h.expires) {
          n = o.skin_a
        }
        e += item_container({
          skin: n,
          def: o,
          id: "str" + a,
          draggable: true,
          strnum: m - 1,
          snum: m - 1
        }, h);
        g.push({
          id: a,
          item: o,
          name: h.name,
          actual: h,
          num: m - 1
        })
      } else {
        e += item_container({
          size: 40,
          draggable: true,
          strnum: m - 1
        })
      }
    }
    e += "</div>"
  }
  e += "</div><div id='storage-item' style='display: inline-block; vertical-align: top; margin-left: 5px'></div>";
  $("#topleftcornerui").html(e);
  for (var d = 0; d < g.length; d++) {
    var b = g[d];

    function f(i) {
      return function() {
        render_item("#storage-item", i)
      }
    }
    $("#str" + b.id).on("click", f(b)).addClass("clickable")
  }
}

function render_inventory() {
  var g = 0,
    b = "text-align: right";
  if (inventory) {
    $("#bottomleftcorner").html("");
    $("#theinventory").remove();
    inventory = false;
    return
  }
  var e = "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block' class='dcontain'>";
  if (c_enabled) {
    e += "<div style='padding: 4px; display: inline-block' class='clickable' onclick='shells_click()'>";
    e += "<span class='cbold' style='color: " + colors.cash + "'>SHELLS</span>: <span class='cashnum'>" + to_pretty_num(character.cash || 0) + "</span></div>";
    b = " display: inline-block; float: right"
  }
  e += "<div style='padding: 4px;" + b + "'><span class='cbold' style='color: gold'>GOLD</span>: <span class='goldnum'>" + to_pretty_num(character.gold) + "</span></div>";
  e += "<div style='border-bottom: 5px solid gray; margin-bottom: 2px; margin-left: -5px; margin-right: -5px'></div>";
  for (var d = 0; d < Math.ceil(max(character.isize, character.items.length) / 7); d++) {
    e += "<div>";
    for (var c = 0; c < 7; c++) {
      var f = null;
      if (g < character.items.length) {
        f = character.items[g++]
      } else {
        g++
      }
      if (f) {
        var a = "citem" + (g - 1),
          k = G.items[f.name],
          h = f.skin || k.skin;
        if (f.expires) {
          h = k.skin_a
        }
        e += item_container({
          skin: h,
          onclick: "inventory_click(" + (g - 1) + ")",
          def: k,
          id: a,
          draggable: true,
          num: g - 1,
          cnum: g - 1
        }, f)
      } else {
        e += item_container({
          size: 40,
          draggable: true,
          cnum: g - 1
        })
      }
    }
    e += "</div>"
  }
  e += "</div><div id='inventory-item' style='display: inline-block; vertical-align: top; margin-left: 5px'></div>";
  inventory = true;
  $("body").append("<div id='theinventory' style='position: fixed; z-index: 100; bottom: 0px; left: 0px'></div>");
  $("#theinventory").html(e)
}

function render_exchange_shrine() {
  reset_inventory(1);
  topleft_npc = "exchange";
  rendered_target = topleft_npc;
  e_item = null;
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top; text-align: center'>";
  a += "<div class='ering ering1 mb10'>";
  a += "<div class='ering ering2'>";
  a += "<div class='ering ering3'>";
  a += item_container({
    shade: "shade_exchange",
    cid: "eitem",
    s_op: 0.3,
    draggable: false,
    droppable: true
  });
  a += "</div>";
  a += "</div>";
  a += "</div>";
  a += "<div><div class='gamebutton clickable' onclick='exchange()'>EXCHANGE</div></div>";
  a += "</div>";
  $("#topleftcornerui").html(a)
}

function render_upgrade_shrine() {
  reset_inventory(1);
  topleft_npc = "upgrade";
  rendered_target = topleft_npc;
  u_item = null, u_scroll = null, u_offering = null;
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top'>";
  a += "<div class='mb5' align='center'>";
  a += "<div>";
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_uweapon",
    cid: "uweapon"
  });
  a += "</div>";
  a += "<div>";
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_offering",
    cid: "uoffering",
    s_op: 0.24
  });
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_scroll",
    cid: "uscroll"
  });
  a += "</div>";
  a += "</div>";
  a += "<div class='gamebutton clickable' onclick='draw_trigger(function(){ render_upgrade_shrine(); reset_inventory(); });'>RESET</div>";
  a += "<div class='gamebutton clickable ml5' onclick='upgrade()'>UPGRADE</div>";
  a += "</div>";
  $("#topleftcornerui").html(a)
}

function render_compound_shrine() {
  reset_inventory(1);
  topleft_npc = "compound";
  rendered_target = topleft_npc;
  c_items = e_array(3), c_scroll = null, c_offering = null;
  c_last = 0;
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 20px; font-size: 24px; display: inline-block; vertical-align: top'>";
  a += "<div class='mb5' align='center'>";
  a += "<div>";
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_cring",
    cid: "compound0"
  });
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_cring",
    cid: "compound1"
  });
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_cring",
    cid: "compound2"
  });
  a += "</div>";
  a += "<div>";
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_offering",
    cid: "coffering",
    s_op: 0.24
  });
  a += item_container({
    draggable: false,
    droppable: true,
    shade: "shade_cscroll",
    cid: "cscroll"
  });
  a += "</div>";
  a += "</div>";
  a += "<div class='gamebutton clickable' onclick='draw_trigger(function(){ render_compound_shrine(); reset_inventory(); });'>RESET</div>";
  a += "<div class='gamebutton clickable ml5' onclick='compound()'>COMBINE</div>";
  a += "</div>";
  $("#topleftcornerui").html(a)
}

function render_merchant(k) {
  reset_inventory(1);
  topleft_npc = "merchant";
  rendered_target = topleft_npc;
  var l = 0,
    g = [];
  var e = "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block'>";
  for (var d = 0; d < 4; d++) {
    e += "<div>";
    for (var c = 0; c < 5; c++) {
      if (l < k.items.length && k.items[l++] && (c_enabled || !G.items[k.items[l - 1]].cash)) {
        var h = k.items[l - 1];
        var a = "item" + randomStr(10),
          m = G.items[h];
        e += item_container({
          skin: m.skin_a || m.skin,
          def: m,
          id: a,
          draggable: false,
          on_rclick: "buy('" + h + "')"
        });
        g.push({
          id: a,
          item: m,
          name: h,
          value: m.g,
          cash: m.cash
        })
      } else {
        e += item_container({
          size: 40,
          draggable: false,
          droppable: true
        })
      }
    }
    e += "</div>"
  }
  e += "</div><div id='merchant-item' style='display: inline-block; vertical-align: top; margin-left: 5px'></div>";
  $("#topleftcornerui").html(e);
  for (var d = 0; d < g.length; d++) {
    var b = g[d];

    function f(i) {
      return function() {
        render_item("#merchant-item", i)
      }
    }
    $("#" + b.id).on("click", f(b)).addClass("clickable")
  }
}

function render_computer(a) {
  var b = "";
  b += '<div style="color: #32A3B0">CONNECTED.</div>';
  b += "<div onclick='render_upgrade_shrine()' class='clickable' style='color: #E4E4E4'><span style='color: #BA61A4'>&gt;</span> UPGRADE</div>";
  b += "<div onclick='render_compound_shrine()' class='clickable' style='color: #E4E4E4'><span style='color: #BA61A4'>&gt;</span> COMPOUND</div>";
  b += "<div onclick='render_exchange_shrine()' class='clickable' style='color: #E4E4E4'><span style='color: #BA61A4'>&gt;</span> EXCHANGE</div>";
  b += "<div onclick='render_merchant(G.npcs.pots)' class='clickable' style='color: #E4E4E4'><span style='color: #BA61A4'>&gt;</span> POTIONS</div>";
  b += "<div onclick='render_merchant(G.npcs.scrolls)' class='clickable' style='color: #E4E4E4'><span style='color: #BA61A4'>&gt;</span> SCROLLS</div>";
  a.html(b)
}

function render_item(e, i) {
  var n = i.item,
    c = i.name,
    f = "gray",
    l = i.value,
    j = i.cash,
    k = n.name;
  var m = i && i.actual;
  var b = calculate_item_properties(n, m || {}),
    d = calculate_item_grade(n, m || {});
  var g = "";
  g += "<div style='background-color: black; border: 5px solid gray; font-size: 24px; display: inline-block; padding: 20px; line-height: 24px; max-width: 240px; " + (i.styles || "") + "' class='buyitem'>";
  if (!n) {
    g += "ITEM"
  } else {
    f = "#E4E4E4";
    if (n.grade == "mid") {
      f = "blue"
    }
    if (b.level) {
      k += " +" + b.level
    }
    g += "<div style='color: " + f + "; display: inline-block; border-bottom: 2px dashed gray; margin-bottom: 3px' class='cbold'>" + k + "</div>";
    (n.gives || []).forEach(function(o) {
      g += "<div>+" + o[1] + " " + o[0].toUpperCase() + "</div>"
    });
    if (b.lifesteal) {
      g += bold_prop_line("Lifesteal", b.lifesteal + "%", "#9A1D27")
    }
    if (b.evasion) {
      g += bold_prop_line("Evasion", b.evasion + "%", "#7AC0F5")
    }
    if (b.reflection) {
      g += bold_prop_line("Reflection", b.reflection + "%", "#B484E5")
    }
    if (b.attack) {
      g += bold_prop_line("Damage", b.attack, colors.attack)
    }
    if (b.range) {
      g += bold_prop_line("Range", "+" + b.range, colors.range)
    }
    if (b.hp) {
      g += bold_prop_line("Health", b.hp, colors.hp)
    }
    if (b.str) {
      g += bold_prop_line("Strength", b.str, colors.str)
    }
    if (b["int"]) {
      g += bold_prop_line("Intelligence", b["int"], colors["int"])
    }
    if (b.dex) {
      g += bold_prop_line("Dexterity", b.dex, colors.dex)
    }
    if (b.stat) {
      g += bold_prop_line("Stat", b.stat)
    }
    if (b.armor) {
      g += bold_prop_line("Armor", b.armor, colors.armor)
    }
    if (b.apiercing) {
      g += bold_prop_line("A.Piercing", b.apiercing, colors.armor)
    }
    if (b.resistance) {
      g += bold_prop_line("Resistance", b.resistance, colors.resistance)
    }
    if (b.speed) {
      g += bold_prop_line("Speed", ((b.speed > 0) && "+" || "") + b.speed, colors.speed)
    }
    if (n.wspeed == "slow") {
      g += bold_prop_line("Speed", "Slow", "gray")
    }
    if (d == 1) {
      g += bold_prop_line("Grade", "High", "#696354")
    }
    if (d == 2) {
      g += bold_prop_line("Grade", "Rare", "#6668AC")
    }
    if (n.ability) {
      if (n.ability == "bash") {
        g += bold_prop_line("Ability", "Bash", colors.ability);
        g += "<div style='color: #C3C3C3'>Stuns the opponent for " + b.attr1 + " seconds with " + b.attr0 + "% chance.</div>"
      }
    }
    if (n.explanation) {
      g += "<div style='color: #C3C3C3'>" + n.explanation + "</div>"
    }
    if (i.trade) {
      g += "<div style='margin-top: 5px'>";
      g += "<div><span style='color:gold'>GOLD:</span> <div class='inline-block sellprice editable' contenteditable=true>1</div></div>";
      g += "<div><span class='clickable' onclick='trade(\"" + i.slot + '","' + i.num + '",$(".sellprice").html())\'>PUT UP FOR SALE</span></div>';
      g += "</div>"
    }
    if (in_arr(i.slot, trade_slots) && m && m.price && i.from_player) {
      g += "<div style='color: gold'>" + to_pretty_num(m.price) + " GOLD</div>";
      g += "<div><span class='clickable' onclick='trade_buy(\"" + i.slot + '","' + i.from_player + "\")'>BUY</span></div>"
    }
    if (l) {
      if (n.days) {
        g += "<div style='color: #C3C3C3'>Lasts 30 days</div>"
      }
      if (j) {
        g += "<div style='color: " + colors.cash + "'>" + to_pretty_num(G.items[c].cash) + " SHELLS</div>"
      } else {
        g += "<div style='color: gold'>" + to_pretty_num(l) + " GOLD</div>"
      }
      if (j && character && G.items[c].cash >= character.cash) {
        g += "<div style='border-top: solid 2px gray; margin-bottom: 2px; margin-top: 3px; margin-left: -1px; margin-right: -1px'></div>";
        g += "<div style='color: #C3C3C3'>You can find SHELLS from gems, monsters. In future, from achievements. For the time being, to receive SHELLS and support our game:</div>";
        g += "<span class='clickable' style='color: #EB8D3F' onclick='shells_click(); $(this).parent().remove()'>BUY or EARN SHELLS</span> "
      } else {
        if (n.s) {
          var a = 1;
          if (n.gives) {
            a = 100
          }
          g += "<div style='margin-top: 5px'><!--<input type='number' value='1' class='buynum itemnumi'/> -->";
          g += "<span class='gray'>Q:</span> <div class='inline-block buynum' contenteditable=true data-q='" + a + "'>" + a + "</div> <span class='gray'>|</span> ";
          g += "<span class='clickable' onclick='buy(\"" + c + '",parseInt($(".buynum").html()))\'>BUY</span> ';
          g += "</div>"
        } else {
          g += "<div><span class='clickable' onclick='buy(\"" + c + "\")'>BUY</span></div>"
        }
      }
    }
    if (i.sell && m) {
      var l = calculate_item_value(m);
      g += "<div style='color: gold'>" + to_pretty_num(l) + " GOLD</div>";
      if (n.s && m.q) {
        var a = m.q;
        g += "<div style='margin-top: 5px'>";
        g += "<span class='gray'>Q:</span> <div class='inline-block sellnum' contenteditable=true data-q='" + a + "'>" + a + "</div> <span class='gray'>|</span> ";
        g += "<span class='clickable' onclick='sell(\"" + i.num + '",parseInt($(".sellnum").html()))\'>SELL</span> ';
        g += "</div>"
      } else {
        g += "<div><span class='clickable' onclick='sell(\"" + i.num + "\")'>SELL</span></div>"
      }
    }
    if (i.cancel) {
      g += "<div class='clickable' onclick='$(this).parent().remove()'>CLOSE</div>"
    }
    if (m && in_arr(m.name, ["stoneofxp", "stoneofgold", "stoneofluck"]) && m.expires) {
      var h = round((-msince(new Date(m.expires))) / (6 * 24)) / 10;
      g += "<div style='color: #C3C3C3'>" + h + " days</div>"
    }
    if (m && m.name == "computer" && (i.sell || m.charges !== 0)) {
      g += "<div style='color: #C3C3C3'>CHARGES: " + (m.charges === undefined && 2 || m.charges) + "</div>"
    }
    if (!l && !i.sell && m && !i.from_player && !i.trade) {
      if (in_arr(m.name, ["stoneofxp", "stoneofgold", "stoneofluck"]) && !m.expires) {
        g += "<div class='clickable' onclick='stone(\"" + i.num + '","activate"); $(this).parent().remove()\' style="color: #438EE2">ACTIVATE</div>'
      }
      if (n.type == "stand") {
        g += "<div class='clickable' onclick='socket.emit(\"trade_history\",{}); $(this).parent().remove()' style=\"color: #44484F\">TRADE HISTORY</div>"
      }
      if (n.type == "computer" && (m.charges === undefined || m.charges)) {
        g += '<div class=\'clickable\' onclick=\'socket.emit("unlock",{name:"code",num:"' + i.num + '"});\' style="color: #BA61A4">UNLOCK</div>'
      }
      if (n.type == "computer") {
        g += "<div class='clickable' onclick='render_computer($(this).parent())' style=\"color: #32A3B0\">NETWORK</div>"
      }
      if (n.type == "stand" && !character.stand) {
        g += "<div class='clickable' onclick='open_merchant(\"" + i.num + '"); $(this).parent().remove()\' style="color: #8E5E2C">OPEN</div>'
      }
      if (n.type == "stand" && character.stand) {
        g += "<div class='clickable' onclick='close_merchant(); $(this).parent().remove()' style=\"color: #8E5E2C\">CLOSE</div>"
      }
      if (in_arr(m.name, ["stoneofxp", "stoneofgold", "stoneofluck"]) && m.expires) {
        g += "<div class='clickable' onclick='stone(\"" + i.num + '","morph"); $(this).parent().remove()\' style="color: #438EE2">MORPH</div>'
      }
    }
  }
  g += "</div>";
  if (e == "html") {
    return g
  } else {
    $(e).html(g)
  }
}

function on_skill(b) {
  var a = {
    name: b
  };
  if (skillmap[b]) {
    a = skillmap[b]
  }
  if (a.name == "use_hp") {
    use("hp")
  } else {
    if (a.name == "use_mp") {
      use("mp")
    }
  }
}

function allow_drop(a) {
  a.preventDefault()
}

function on_drag_start(a) {
  last_drag_start = new Date();
  a.dataTransfer.setData("text", a.target.id)
}

function on_rclick(g) {
  var b = $(g),
    a = b.data("inum"),
    f = b.data("snum"),
    c = b.data("sname"),
    h = b.data("onrclick");
  if (h) {
    smart_eval(h)
  } else {
    if (c !== undefined) {
      socket.emit("unequip", {
        slot: c
      })
    } else {
      if (f !== undefined) {
        socket.emit("bank", {
          operation: "swap",
          inv: -1,
          str: f,
          pack: last_rendered_items
        })
      } else {
        if (a !== undefined) {
          if (topleft_npc == "items") {
            socket.emit("bank", {
              operation: "swap",
              inv: a,
              str: -1,
              pack: last_rendered_items
            })
          } else {
            if (topleft_npc == "merchant") {
              var i = character.items[parseInt(a)];
              if (!i) {
                return
              }
              render_item("#merchant-item", {
                item: G.items[i.name],
                name: i.name,
                actual: i,
                sell: 1,
                num: parseInt(a)
              })
            } else {
              if (topleft_npc == "exchange") {
                var g = character.items[a],
                  d = null;
                if (g) {
                  d = G.items[g.name]
                }
                if (!d) {
                  return
                }
                if (d.e) {
                  if (e_item !== null) {
                    return
                  }
                  e_item = a;
                  var e = $("#citem" + a).all_html();
                  $("#citem" + a).parent().html("");
                  $("#eitem").html(e)
                }
              } else {
                if (topleft_npc == "upgrade") {
                  var g = character.items[a],
                    d = null;
                  if (g) {
                    d = G.items[g.name]
                  }
                  if (!d) {
                    return
                  }
                  if (d.upgrade) {
                    if (u_item !== null) {
                      return
                    }
                    u_item = a;
                    var e = $("#citem" + a).all_html();
                    $("#citem" + a).parent().html("");
                    $("#uweapon").html(e)
                  }
                  if (d.type == "uscroll" || d.type == "pscroll") {
                    if (u_scroll !== null) {
                      return
                    }
                    u_scroll = a;
                    var e = $("#citem" + a).all_html();
                    if ((character.items[a].q || 1) < 2) {
                      $("#citem" + a).parent().html("")
                    }
                    $("#uscroll").html(e)
                  }
                  if (d.type == "offering") {
                    if (u_offering !== null) {
                      return
                    }
                    u_offering = a;
                    var e = $("#citem" + a).all_html();
                    if ((character.items[a].q || 1) < 2) {
                      $("#citem" + a).parent().html("")
                    }
                    $("#uoffering").html(e)
                  }
                } else {
                  if (topleft_npc == "compound") {
                    var g = character.items[a],
                      d = null;
                    if (g) {
                      d = G.items[g.name]
                    }
                    if (!d) {
                      return
                    }
                    if (d.compound && c_last < 3) {
                      c_items[c_last] = a;
                      var e = $("#citem" + a).all_html();
                      $("#citem" + a).parent().html("");
                      $("#compound" + c_last).html(e);
                      c_last++
                    }
                    if (d.type == "cscroll") {
                      if (c_scroll !== null) {
                        return
                      }
                      c_scroll = a;
                      var e = $("#citem" + a).all_html();
                      if ((character.items[a].q || 1) < 2) {
                        $("#citem" + a).parent().html("")
                      }
                      $("#cscroll").html(e)
                    }
                    if (d.type == "offering") {
                      if (c_offering !== null) {
                        return
                      }
                      c_offering = a;
                      var e = $("#citem" + a).all_html();
                      if ((character.items[a].q || 1) < 2) {
                        $("#citem" + a).parent().html("")
                      }
                      $("#coffering").html(e)
                    }
                  } else {
                    a = parseInt(a, 10), socket.emit("equip", {
                      num: a
                    })
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function on_drop(m) {
  m.preventDefault();
  var r = m.dataTransfer.getData("text"),
    j = false,
    l = false;
  var c = $(document.getElementById(r)),
    q = $(m.target);
  while (q && q.parent() && q.attr("ondrop") == undefined) {
    q = q.parent()
  }
  var b = q.data("cnum"),
    d = q.data("slot"),
    a = q.data("strnum"),
    o = q.data("trigrc"),
    h = q.data("skillid");
  var s = c.data("inum"),
    p = c.data("sname"),
    i = c.data("snum");
  if (s !== undefined && h !== undefined) {
    s = parseInt(s);
    if ((s || s === 0) && character.items[s] && G.items[character.items[s].name].gives) {
      skillmap[h] = {
        type: "item",
        name: character.items[s].name
      };
      render_skillbar()
    }
  } else {
    if (o != undefined && s != undefined) {
      on_rclick(c.get(0))
    } else {
      if (i != undefined && a != undefined) {
        socket.emit("bank", {
          operation: "move",
          a: i,
          b: a,
          pack: last_rendered_items
        });
        j = true
      } else {
        if (a != undefined && s != undefined) {
          socket.emit("bank", {
            operation: "swap",
            inv: s,
            str: a,
            pack: last_rendered_items
          });
          l = true
        } else {
          if (b != undefined && i != undefined) {
            socket.emit("bank", {
              operation: "swap",
              inv: b,
              str: i,
              pack: last_rendered_items
            });
            l = true
          } else {
            if (b !== undefined && b == s) {
              if (is_mobile && mssince(last_drag_start) < 300) {
                inventory_click(parseInt(s))
              }
            } else {
              if (b != undefined && s != undefined) {
                socket.emit("imove", {
                  a: b,
                  b: s
                });
                j = true
              } else {
                if (p !== undefined && p == d) {
                  if (is_mobile && mssince(last_drag_start) < 300) {
                    slot_click(d)
                  }
                } else {
                  if (b != undefined && p != undefined) {
                    socket.emit("unequip", {
                      slot: p,
                      position: b
                    })
                  } else {
                    if (d != undefined && s != undefined) {
                      if (in_arr(d, trade_slots)) {
                        if (character.slots[d]) {
                          return
                        }
                        try {
                          var k = character.items[parseInt(s)];
                          render_item("#topleftcornerdialog", {
                            trade: 1,
                            item: G.items[k.name],
                            actual: k,
                            num: parseInt(s),
                            slot: d
                          });
                          $(".editable").focus();
                          dialogs_target = ctarget
                        } catch (n) {
                          console.log("TRADE-ERROR: " + n)
                        }
                      } else {
                        socket.emit("equip", {
                          num: s,
                          slot: d
                        }), l = true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (j) {
    var g = c.all_html(),
      f = q.html();
    q.html("");
    c.parent().html(f);
    q.html(g)
  }
  if (l) {
    q.html(c.all_html())
  }
}

function item_container(r, l) {
  var g = "",
    d = "",
    q = 3,
    h = "",
    c = "",
    m = "",
    a = "",
    n = r.bcolor || "gray",
    s = "",
    j = r.size || 40;
  if (r.level && r.level > 8) {
    n = "#C5C5C5"
  }
  if (r.draggable || !("draggable" in r)) {
    h += " draggable='true' ondragstart='on_drag_start(event)'";
    c += "ondrop='on_drop(event)' ondragover='allow_drop(event)'"
  }
  if (r.droppable) {
    r.trigrc = true;
    c += "ondrop='on_drop(event)' ondragover='allow_drop(event)'"
  }
  if (r.onclick) {
    c += ' onclick="' + r.onclick + '" class="clickable" '
  }
  if (r.cnum != undefined) {
    a = "data-cnum='" + r.cnum + "' "
  }
  if (r.trigrc != undefined) {
    a = "data-trigrc='1'"
  }
  if (r.strnum != undefined) {
    a = "data-strnum='" + r.strnum + "' "
  }
  if (r.slot != undefined) {
    a = "data-slot='" + r.slot + "' "
  }
  if (r.cid) {
    c += " id='" + r.cid + "' "
  }
  g += "<div " + a + "style='position: relative; display:inline-block; border: 2px solid " + n + "; margin: 2px; height: " + (j + 2 * q) + "px; width: " + (j + 2 * q) + "px; background: black; vertical-align: top' " + c + ">";
  if (r.skid && !r.skin) {
    g += "<div class='truui' style='border-color: gray; color: white'>" + r.skid + "</div>"
  }
  if (r.shade) {
    var o = G.itemsets[G.positions[r.shade][0] || "pack_1a"],
      b = j / o.size;
    var k = G.positions[r.shade][1],
      i = G.positions[r.shade][2];
    g += "<div style='position: absolute; top: -2px; left: -2px; padding:" + (q + 2) + "px'>";
    g += "<div style='overflow: hidden; height: " + (j) + "px; width: " + (j) + "px;'>";
    g += "<img style='width: " + (o.columns * o.size * b) + "px; height: " + (o.rows * o.size * b) + "px; margin-top: -" + (i * j) + "px; margin-left: -" + (k * j) + "px; opacity: " + (r.s_op || 0.2) + ";' src='" + o.file + "' draggable='false' />";
    g += "</div>";
    g += "</div>"
  }
  if (r.skin) {
    var p = G.itemsets[G.positions[r.skin][0] || "pack_1a"],
      f = G.positions[r.skin][1],
      e = G.positions[r.skin][2];
    var t = j / p.size;
    if (r.level && r.level > 7) {
      s += " glow" + r.level
    }
    if (r.num != undefined) {
      m = "class='rclick" + s + "' data-inum='" + r.num + "'"
    }
    if (r.snum != undefined) {
      m = "class='rclick" + s + "' data-snum='" + r.snum + "'"
    }
    if (r.sname != undefined) {
      m = "class='rclick" + s + "' data-sname='" + r.sname + "'"
    }
    if (r.on_rclick) {
      m = "class='rclick" + s + "' data-onrclick=\"" + r.on_rclick + '"'
    }
    g += "<div " + m + " style='background: black; position: absolute; bottom: -2px; left: -2px; border: 2px solid " + n + ";";
    g += "padding:" + (q) + "px; overflow: hidden' id='" + r.id + "' " + h + ">";
    g += "<div style='overflow: hidden; height: " + (j) + "px; width: " + (j) + "px;'>";
    g += "<img style='width: " + (p.columns * p.size * t) + "px; height: " + (p.rows * p.size * t) + "px; margin-top: -" + (e * j) + "px; margin-left: -" + (f * j) + "px;' src='" + p.file + "' draggable='false' />";
    g += "</div>";
    if (l) {
      if (l.q && l.q != 1) {
        g += "<div class='iqui'>" + l.q + "</div>"
      }
      if (l.level) {
        g += "<div class='iuui level" + l.level + "' style='border-color: " + n + "'>" + (l.level == 10 && "X" || l.level) + "</div>"
      }
    }
    if (r.slot && in_arr(r.slot, trade_slots)) {
      g += "<div class='truui' style='border-color: " + n + ";'>$</div>"
    }
    if (r.skid) {
      g += "<div class='skidloader" + r.skid + "' style='position: absolute; bottom: 0px; right: 0px; width: 4px; height: 0px; background-color: yellow'></div>";
      g += "<div class='truui' style='border-color: gray; color: white'>" + r.skid + "</div>"
    }
    g += "</div>"
  }
  g += "</div>";
  return g
}

function load_skills() {
  if (0) {} else {
    if (character.ctype == "warrior") {
      skillbar = ["1", "2", "3", "Q", "R"]
    } else {
      if (character.ctype == "merchant") {
        skillbar = ["1", "2", "3", "4", "5"]
      } else {
        skillbar = ["1", "2", "3", "4", "R"]
      }
    }
    if (character.ctype == "warrior") {
      skillmap = {
        "1": {
          name: "use_hp"
        },
        "2": {
          name: "use_mp"
        },
        Q: {
          name: "skill_taunt"
        },
        R: {
          name: "skill_charge"
        }
      }
    } else {
      if (character.ctype == "mage") {
        skillmap = {
          "1": {
            name: "use_hp"
          },
          "2": {
            name: "use_mp"
          },
          R: {
            name: "skill_burst"
          }
        }
      } else {
        if (character.ctype == "priest") {
          skillmap = {
            "1": {
              name: "use_hp"
            },
            "2": {
              name: "use_mp"
            },
            R: {
              name: "skill_curse"
            }
          }
        } else {
          if (character.ctype == "ranger") {
            skillmap = {
              "1": {
                name: "use_hp"
              },
              "2": {
                name: "use_mp"
              },
              R: {
                name: "skill_supershot"
              }
            }
          } else {
            if (character.ctype == "rogue") {
              skillmap = {
                "1": {
                  name: "use_hp"
                },
                "2": {
                  name: "use_mp"
                },
                R: {
                  name: "skill_invis"
                }
              }
            } else {
              if (character.ctype == "merchant") {
                skillmap = {
                  "1": {
                    name: "use_hp"
                  },
                  "2": {
                    name: "use_mp"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function render_skillbar(b) {
  if (b) {
    $("#skillbar").html("").hide();
    return
  }
  var a = "<div style='background-color: black; border: 5px solid gray; padding: 2px; display: inline-block' class='enableclicks'>";
  skillbar.forEach(function(d) {
    var c = skillmap[d];
    if (c) {
      a += item_container({
        skid: d,
        skin: c.name,
        draggable: false
      }, c)
    } else {
      a += item_container({
        skid: d,
        draggable: false
      })
    }
    a += "<div></div>"
  });
  a += "</div>";
  $("#skillbar").html(a).css("display", "inline-block")
}

function render_skills() {
  var e = 0,
    a = "text-align: right";
  if (skillsui) {
    $("#theskills").remove();
    skillsui = false;
    render_skillbar();
    return
  }
  var d = "<div id='skills-item' style='display: inline-block; vertical-align: top; margin-right: 5px'></div>";
  d += "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block'>";
  d += "<div class='textbutton' style='margin-left: 5px'>SLOTS</div>";
  d += "<div>";
  ["1", "2", "3", "4", "5", "6", "7"].forEach(function(f) {
    d += item_container({
      skid: f,
      skin: skillmap[f] && skillmap[f].name
    }, skillmap[f])
  });
  d += "</div>";
  d += "<div>";
  ["Q", "W", "E", "R", "TAB", "X", "8"].forEach(function(f) {
    d += item_container({
      skid: f,
      skin: skillmap[f] && skillmap[f].name
    }, skillmap[f])
  });
  d += "</div>";
  d += "<div class='textbutton' style='margin-left: 5px'>ABILITIES <span style='float:right; color: #99D9B9; margin-right: 5px'>WORK IN PROGRESS!</span></div>";
  for (var c = 0; c < 2; c++) {
    d += "<div>";
    for (var b = 0; b < 7; b++) {
      d += item_container({})
    }
    d += "</div>"
  }
  d += "<div class='textbutton' style='margin-left: 5px'>SKILLS</div>";
  d += "<div>";
  for (var b = 0; b < 7; b++) {
    d += item_container({})
  }
  d += "</div>";
  d += "</div>";
  skillsui = true;
  render_skillbar(1);
  $("body").append("<div id='theskills' style='position: fixed; z-index: 310; bottom: 0px; right: 0px'></div>");
  $("#theskills").html(d)
}

function load_class_info(a, c) {
  if (!a) {
    a = window.chartype
  }
  if (!c) {
    c = "male"
  }
  var b = "";
  if (window.gendertype) {
    c = gendertype
  }
  if (a == "warrior") {
    if (c == "male") {
      b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-left: -" + (52 * 1) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/custom1.png'/></div>"
    } else {
      b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-top: -" + (72 * 4) + "px; margin-left: -" + (52 * 4) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/chara7.png'/></div>"
    }
    b += "<div><span style='color: white'>Class:</span> <span style='color: " + colors[c] + "'>Warrior</span></div>";
    b += "<div><span style='color: white'>Primary Attribute:</span> <span style='color: " + colors.str + "'>Strength</span></div>";
    b += "<div><span style='color: white'>Description:</span> <span style='color: gray'>Warriors are strong melee characters. Ideal for both PVE and PVP. Can't go wrong with a warrior.</span></div>"
  } else {
    if (a == "mage") {
      if (c == "female") {
        b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='width: 624px; height: 576px; margin-left: -" + (52 * 7) + "px' src='/images/tiles/characters/chara7.png'/></div>"
      } else {
        b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-top: -" + (72 * 4) + "px; margin-left: -" + (52 * 7) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/custom1.png'/></div>"
      }
      b += "<div><span style='color: white'>Class:</span> <span style='color: " + colors[c] + "'>Mage</span></div>";
      b += "<div><span style='color: white'>Primary Attribute:</span> <span style='color: " + colors["int"] + "'>Intelligence</span></div>";
      b += "<div><span style='color: white'>Description:</span> <span style='color: gray'>Mage's are the ideal characters for beginners. They are easy and fun to play. Both PVE and PVP.</span></div>"
    } else {
      if (a == "priest") {
        if (c == "male") {
          b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-top: -" + (72 * 4) + "px; margin-left: -" + (52 * 4) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/chara5.png'/></div>"
        } else {
          b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-left: -" + (52 * 7) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/custom1.png'/></div>"
        }
        b += "<div><span style='color: white'>Class:</span> <span style='color: " + colors[c] + "'>Priest</span></div>";
        b += "<div><span style='color: white'>Primary Attribute:</span> <span style='color: " + colors["int"] + "'>Intelligence</span></div>";
        b += "<div><span style='color: white'>Description:</span> <span style='color: gray'>Priest's are the healers of the realm. They are not ideal for beginners or solo players. They can't inflict a lot of damage. However, thanks to their Curse ability, they might even bring down a strong warrior in PVP. Every serious party needs at least one priest.</span></div>"
      } else {
        if (a == "rogue") {
          if (c == "male") {
            b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-top: -" + (72 * 4) + "px; margin-left: -" + (52 * 7) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/chara6.png'/></div>"
          } else {
            b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-top: -" + (72 * 4) + "px; margin-left: -" + (52 * 7) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/chara3.png'/></div>"
          }
          b += "<div><span style='color: white'>Class:</span> <span style='color: " + colors[c] + "'>Rogue</span></div>";
          b += "<div><span style='color: white'>Primary Attribute:</span> <span style='color: " + colors.dex + "'>Dexterity</span></div>";
          b += "<div><span style='color: white'>Description:</span> <span style='color: gray'>Rogue's are the ideal assassins. Their invis ability makes them super-fun for PVP. They are fast. Not ideal for beginners.</span></div>"
        } else {
          if (a == "ranger") {
            if (c == "male") {
              b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-left: -" + (52 * 4) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/custom1.png'/></div>"
            } else {
              b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-left: -" + (52 * 7) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/chara3.png'/></div>"
            }
            b += "<div><span style='color: white'>Class:</span> <span style='color: " + colors[c] + "'>Ranger</span></div>";
            b += "<div><span style='color: white'>Primary Attribute:</span> <span style='color: " + colors.dex + "'>Dexterity</span></div>";
            b += "<div><span style='color: white'>Description:</span> <span style='color: gray'>Rangers are for the most advanced players. They are mainly archers. Early on they are very weak and hard to play. But a strong ranger can probably rule all other classes. +Work in progress!</span></div>"
          } else {
            if (a == "merchant") {
              if (c == "male") {
                b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-left: -" + (52 * 7) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/npc5.png'/></div>"
              } else {
                b += "<div style='float: left; margin-right: 10px; margin-top: -10px; width: 52px; height: 72px; overflow: hidden'><img style='margin-left: -" + (52 * 4) + "px; width: 624px; height: 576px;' src='/images/tiles/characters/npc6.png'/></div>"
              }
              b += "<div><span style='color: white'>Class:</span> <span style='color: " + colors[c] + "'>Merchant</span></div>";
              b += "<div><span style='color: white'>Primary Attribute:</span> <span style='color: #804000'>None</span></div>";
              b += "<div><span style='color: white'>Description:</span> <span style='color: gray'>While your main characters are out there adventuring, merchants can wait in town and market your loots. Server and character limits don't apply to merchants. They gain experience when they sell or buy something.</span></div>"
            } else {
              return
            }
          }
        }
      }
    }
  }
  $("#features").css("height", 208).html(b)
};