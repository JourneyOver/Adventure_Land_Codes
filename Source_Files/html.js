var u_item = null,
  u_scroll = null,
  u_offering = null,
  c_items = e_array(3),
  c_scroll = null,
  c_offering = null,
  c_last = 0,
  e_item = null;
var slots = [null, {
  type: "utility",
  name: "use_hp"
}, {
  type: "utility",
  name: "use_mp"
}, ];
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

function open_chat_window(b, c) {
  var a = "<div style='position:fixed; bottom: 400px; left: 400px' id='chatw" + b + (c || "") + "'>";
  a += "</div>";
  $("body").append(a)
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
  var a = "";
  if (b) {
    a += "<div class='gamebutton block'>PARTY</div>";
    b.forEach(function(c) {
      a += "<div class='gamebutton block mt5 enableclicks' style='border-color:#703987' onclick='party_click(\"" + c + "\")'>" + c + "</div>"
    });
    a += "<div class='gamebutton block mt5' class='enableclicks'";
    a += 'onclick=\'socket.emit("party",{event:"leave"})\'>LEAVE</div>'
  }
  $("#partylist").html(a);
  if (!a) {
    $("#partylist").hide()
  } else {
    $("#partylist").show()
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
  function c(n, h, m) {
    if (f.slots[n]) {
      var j = f.slots[n],
        k = false;
      if (in_arr(n, trade_slots)) {
        k = true
      }
      var l = "item" + randomStr(10),
        i = G.items[j.name],
        g = G.positions[i.skin];
      if (j.expires) {
        g = G.positions[i.skin_a]
      }
      e += item_container({
        pack: g[0],
        x: g[1],
        y: g[2],
        size: 40,
        skin: j.skin,
        onclick: "slot_click('" + n + "')",
        def: i,
        id: l,
        draggable: f.me,
        quantity: j.q,
        level: j.level,
        upgrade: i.upgrade,
        sname: f.me && n,
        shade: h,
        s_op: m,
        slot: n,
        trade: k
      })
    } else {
      e += item_container({
        size: 40,
        draggable: f.me,
        shade: h,
        s_op: m,
        slot: n
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
  c("orb1", "shade_orb");
  e += "</div>";
  e += "<div>";
  c("ring1", "shade_ring");
  c("pants", "shade_pants", 0.3);
  c("ring2", "shade_ring");
  c("orb2", "shade_orb");
  e += "</div>";
  e += "<div>";
  c("belt", "shade_belt");
  c("shoes", "shade_shoes");
  c("gloves", "shade_gloves");
  c("orb3", "shade_orb");
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

function skills_bar() {
  function b(h, d) {
    if (0 && player.slots[h]) {
      var f = player.slots[h];
      var g = "item" + randomStr(10),
        e = G.items[f.name],
        c = G.positions[e.skin];
      a += item_container({
        pack: c[0],
        x: c[1],
        y: c[2],
        size: 40,
        def: e,
        id: g,
        draggable: player.me,
        quantity: f.q,
        level: f.level,
        upgrade: e.upgrade,
        sname: player.me && h,
        shade: shade,
        s_op: op
      });
      collection.push({
        id: g,
        item: e,
        name: f.name,
        actual: f
      })
    } else {
      a += item_container({
        size: 40
      })
    }
  }
  var a = "";
  a += "<div>";
  b("Q");
  a += "</div><div>";
  b("W");
  a += "</div><div>";
  b("E");
  a += "</div><div>";
  b("R");
  a += "</div>";
  return a
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

function render_items_npc(m) {
  if (!m) {
    m = last_rendered_items
  }
  last_rendered_items = m;
  reset_inventory(1);
  topleft_npc = "items";
  rendered_target = topleft_npc;
  var h = [],
    n = 0,
    l = character.user[m] || [];
  var f = "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block' class='dcontain'>";
  for (var d = 0; d < Math.ceil(max(character.isize, l.length) / 7); d++) {
    f += "<div>";
    for (var c = 0; c < 7; c++) {
      var k = null;
      if (n < l.length) {
        k = l[n++]
      } else {
        n++
      }
      if (k) {
        var a = "citem" + (n - 1),
          o = G.items[k.name],
          e = G.positions[o.skin];
        if (k.expires) {
          e = G.positions[o.skin_a]
        }
        f += item_container({
          pack: e[0],
          x: e[1],
          y: e[2],
          size: 40,
          def: o,
          id: "str" + a,
          draggable: true,
          quantity: k.q,
          strnum: n - 1,
          snum: n - 1,
          level: k.level,
          upgrade: o.upgrade
        });
        h.push({
          id: a,
          item: o,
          name: k.name,
          actual: k,
          num: n - 1
        })
      } else {
        f += item_container({
          size: 40,
          draggable: true,
          strnum: n - 1
        })
      }
    }
    f += "</div>"
  }
  f += "</div><div id='storage-item' style='display: inline-block; vertical-align: top; margin-left: 5px'></div>";
  $("#topleftcornerui").html(f);
  for (var d = 0; d < h.length; d++) {
    var b = h[d];

    function g(i) {
      return function() {
        render_item("#storage-item", i)
      }
    }
    $("#str" + b.id).on("click", g(b)).addClass("clickable")
  }
}

function render_inventory() {
  var h = 0,
    b = "text-align: right";
  if (inventory) {
    $("#bottomleftcorner").html("");
    $("#theinventory").remove();
    inventory = false;
    return
  }
  var f = "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block' class='dcontain'>";
  if (c_enabled) {
    f += "<div style='padding: 4px; display: inline-block' class='clickable' onclick='shells_click()'>";
    f += "<span class='cbold' style='color: " + colors.cash + "'>SHELLS</span>: <span class='cashnum'>" + to_pretty_num(character.cash || 0) + "</span></div>";
    b = " display: inline-block; float: right"
  }
  f += "<div style='padding: 4px;" + b + "'><span class='cbold' style='color: gold'>GOLD</span>: <span class='goldnum'>" + to_pretty_num(character.gold) + "</span></div>";
  f += "<div style='border-bottom: 5px solid gray; margin-bottom: 2px; margin-left: -5px; margin-right: -5px'></div>";
  for (var d = 0; d < Math.ceil(max(character.isize, character.items.length) / 7); d++) {
    f += "<div>";
    for (var c = 0; c < 7; c++) {
      var g = null;
      if (h < character.items.length) {
        g = character.items[h++]
      } else {
        h++
      }
      if (g) {
        var a = "citem" + (h - 1),
          k = G.items[g.name],
          e = G.positions[k.skin];
        if (g.expires) {
          e = G.positions[k.skin_a]
        }
        f += item_container({
          pack: e[0],
          x: e[1],
          y: e[2],
          size: 40,
          onclick: "inventory_click(" + (h - 1) + ")",
          skin: g.skin,
          def: k,
          id: a,
          draggable: true,
          quantity: g.q,
          num: h - 1,
          cnum: h - 1,
          level: g.level,
          upgrade: k.upgrade
        })
      } else {
        f += item_container({
          size: 40,
          draggable: true,
          cnum: h - 1
        })
      }
    }
    f += "</div>"
  }
  f += "</div><div id='inventory-item' style='display: inline-block; vertical-align: top; margin-left: 5px'></div>";
  inventory = true;
  $("body").append("<div id='theinventory' style='position: fixed; z-index: 100; bottom: 0px; left: 0px'></div>");
  $("#theinventory").html(f)
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
    size: 40,
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
    size: 40,
    draggable: false,
    droppable: true,
    shade: "shade_uweapon",
    cid: "uweapon"
  });
  a += "</div>";
  a += "<div>";
  a += item_container({
    size: 40,
    draggable: false,
    droppable: true,
    shade: "shade_offering",
    cid: "uoffering",
    s_op: 0.24
  });
  a += item_container({
    size: 40,
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
    size: 40,
    draggable: false,
    droppable: true,
    shade: "shade_cring",
    cid: "compound0"
  });
  a += item_container({
    size: 40,
    draggable: false,
    droppable: true,
    shade: "shade_cring",
    cid: "compound1"
  });
  a += item_container({
    size: 40,
    draggable: false,
    droppable: true,
    shade: "shade_cring",
    cid: "compound2"
  });
  a += "</div>";
  a += "<div>";
  a += item_container({
    size: 40,
    draggable: false,
    droppable: true,
    shade: "shade_offering",
    cid: "coffering",
    s_op: 0.24
  });
  a += item_container({
    size: 40,
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

function render_merchant(l) {
  reset_inventory(1);
  topleft_npc = "merchant";
  rendered_target = topleft_npc;
  var m = 0,
    h = [];
  var f = "<div style='background-color: black; border: 5px solid gray; padding: 2px; font-size: 24px; display: inline-block'>";
  for (var d = 0; d < 4; d++) {
    f += "<div>";
    for (var c = 0; c < 5; c++) {
      if (m < l.items.length && l.items[m++] && (c_enabled || !G.items[l.items[m - 1]].cash)) {
        var k = l.items[m - 1];
        var a = "item" + randomStr(10),
          n = G.items[k],
          e = G.positions[n.skin];
        f += item_container({
          pack: e[0],
          x: e[1],
          y: e[2],
          size: 40,
          def: n,
          id: a,
          draggable: false,
          on_rclick: "buy('" + k + "')"
        });
        h.push({
          id: a,
          item: n,
          name: k,
          value: n.g,
          cash: n.cash
        })
      } else {
        f += item_container({
          size: 40,
          draggable: false,
          droppable: true
        })
      }
    }
    f += "</div>"
  }
  f += "</div><div id='merchant-item' style='display: inline-block; vertical-align: top; margin-left: 5px'></div>";
  $("#topleftcornerui").html(f);
  for (var d = 0; d < h.length; d++) {
    var b = h[d];

    function g(i) {
      return function() {
        render_item("#merchant-item", i)
      }
    }
    $("#" + b.id).on("click", g(b)).addClass("clickable")
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
    i = q.data("skillnum");
  var s = c.data("inum"),
    p = c.data("sname"),
    h = c.data("snum");
  if (s !== undefined && i !== undefined) {
    s = parseInt(s);
    if ((s || s === 0) && character.items[s] && G.items[character.items[s].name].gives) {
      slots[parseInt(i)] = {
        type: "item",
        name: character.items[s].name
      };
      load_skills()
    }
  } else {
    if (o != undefined && s != undefined) {
      on_rclick(c.get(0))
    } else {
      if (h != undefined && a != undefined) {
        socket.emit("bank", {
          operation: "move",
          a: h,
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
          if (b != undefined && h != undefined) {
            socket.emit("bank", {
              operation: "swap",
              inv: b,
              str: h,
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
                          num: s
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

function item_container(o) {
  var e = "",
    p = "",
    a = 3,
    m = o.pack,
    l = "",
    h = "",
    n = "",
    g = "",
    d = o.bcolor || "gray",
    c = "";
  if (o.skin) {
    m = G.positions[o.skin][0], o.x = G.positions[o.skin][1], o.y = G.positions[o.skin][2]
  }
  m = G.itemsets[m || "pack_1a"];
  var b = o.size / m.size;
  if (o.level && o.level > 8) {
    d = "#C5C5C5"
  }
  if (o.draggable || !("draggable" in o)) {
    l += " draggable='true' ondragstart='on_drag_start(event)'";
    h += "ondrop='on_drop(event)' ondragover='allow_drop(event)'"
  }
  if (o.droppable) {
    o.trigrc = true;
    h += "ondrop='on_drop(event)' ondragover='allow_drop(event)'"
  }
  if (o.onclick) {
    h += ' onclick="' + o.onclick + '" class="clickable" '
  }
  if (o.cnum != undefined) {
    g = "data-cnum='" + o.cnum + "' "
  }
  if (o.trigrc != undefined) {
    g = "data-trigrc='1'"
  }
  if (o.strnum != undefined) {
    g = "data-strnum='" + o.strnum + "' "
  }
  if (o.slot != undefined) {
    g = "data-slot='" + o.slot + "' "
  }
  if (o.cid) {
    h += " id='" + o.cid + "' "
  }
  e += "<div " + g + "style='position: relative; display:inline-block; border: 2px solid " + d + "; margin: 2px; height: " + (o.size + 2 * a) + "px; width: " + (o.size + 2 * a) + "px; background: black; vertical-align: top' " + h + ">";
  if (o.shade) {
    var k = G.itemsets[G.positions[o.shade][0] || "pack_1a"],
      f = o.size / k.size;
    var j = G.positions[o.shade][1],
      i = G.positions[o.shade][2];
    e += "<div style='position: absolute; top: -2px; left: -2px; padding:" + (a + 2) + "px'>";
    e += "<div style='overflow: hidden; height: " + (o.size) + "px; width: " + (o.size) + "px;'>";
    e += "<img style='width: " + (k.columns * k.size * f) + "px; height: " + (k.rows * k.size * f) + "px; margin-top: -" + (i * o.size) + "px; margin-left: -" + (j * o.size) + "px; opacity: " + (o.s_op || 0.2) + ";' src='" + k.file + "' draggable='false' />";
    e += "</div>";
    e += "</div>"
  }
  if (o.def) {
    if (o.level && o.level > 7) {
      c += " glow" + o.level
    }
    if (o.num != undefined) {
      n = "class='rclick" + c + "' data-inum='" + o.num + "'"
    }
    if (o.snum != undefined) {
      n = "class='rclick" + c + "' data-snum='" + o.snum + "'"
    }
    if (o.sname != undefined) {
      n = "class='rclick" + c + "' data-sname='" + o.sname + "'"
    }
    if (o.on_rclick) {
      n = "class='rclick" + c + "' data-onrclick=\"" + o.on_rclick + '"'
    }
    e += "<div " + n + " style='background: black; position: absolute; top: -2px; left: -2px; border: 2px solid " + d + ";";
    e += "padding:" + (a) + "px' id='" + o.id + "' " + l + ">";
    e += "<div style='overflow: hidden; height: " + (o.size) + "px; width: " + (o.size) + "px;'>";
    e += "<img style='width: " + (m.columns * m.size * b) + "px; height: " + (m.rows * m.size * b) + "px; margin-top: -" + (o.y * o.size) + "px; margin-left: -" + (o.x * o.size) + "px;' src='" + m.file + "' draggable='false' />";
    e += "</div>";
    if (o.quantity && o.quantity != 1) {
      e += "<div class='iqui'>" + o.quantity + "</div>"
    }
    if (o.level) {
      e += "<div class='iuui level" + o.level + "' style='border-color: " + d + "'>" + (o.level == 10 && "X" || o.level) + "</div>"
    }
    if (o.trade) {
      e += "<div class='truui' style='border-color: " + d + ";'>$</div>"
    }
    e += "</div>"
  }
  e += "</div>";
  return e
}

function skill_container(f) {
  var d = "",
    a = 3,
    i = 40,
    c = 40 / 16,
    b = default_item_pack;
  d += "<div style='position: relative; display:inline-block; border: 2px solid gray; margin: 2px; height: " + (i + 2 * a) + "px; width: " + (i + 2 * a) + "px; background: black; vertical-align: top' data-skillnum='" + f.num + "' ondrop='on_drop(event)' ondragover='allow_drop(event)' >";
  d += "<div class='truui' style='border-color: gray; color: white'>" + f.id + "</div>";
  if (slots[f.num]) {
    var e = slots[f.num],
      h = G.positions[e.name][1],
      g = G.positions[e.name][2];
    d += "<div style='overflow: hidden; height: " + (i) + "px; width: " + (i) + "px;'>";
    d += "<img style='width: " + (256 * c) + "px; height: " + (2048 * c) + "px; margin-top: -" + (g * i) + "px; margin-left: -" + (h * i) + "px;' src='" + b + "' draggable='false' />";
    d += "</div>"
  }
  d += "</div>";
  return d
}

function load_skills() {
  $("#topmid").html("");
  var a = "";
  a += skill_container({
    id: "1",
    num: 1
  });
  a += skill_container({
    id: "2",
    num: 2
  });
  a += skill_container({
    id: "3",
    num: 3
  });
  a += skill_container({
    id: "Q",
    num: 4
  });
  a += skill_container({
    id: "R",
    num: 5
  });
  $("#topmid").show().html(a)
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
              return
            }
          }
        }
      }
    }
  }
  $("#features").css("height", 208).html(b)
};
