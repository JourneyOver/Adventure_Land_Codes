var c_version = 2;
var EPS = 1e-16;
var colors = {
  range: "#93A6A2",
  armor: "#5C5D5E",
  resistance: "#6A5598",
  attack: "#DB2900",
  str: "#F07F2F",
  "int": "#3E6EED",
  dex: "#44B75C",
  speed: "#36B89E",
  cash: "#5DAC40",
  hp: "#FF2E46",
  mp: "#365DC5",
  gold: "gold",
  male: "#43A1C6",
  female: "#C06C9B",
  server_success: "#85C76B",
  ability: "#ff9100",
};
var trade_slots = [];
for (var i = 1; i <= 16; i++) {
  trade_slots.push("trade" + i)
}

function within_xy_range(c, b) {
  if (c["in"] != b["in"]) {
    return false
  }
  if (!c.vision) {
    return false
  }
  var a = b.x,
    f = b.y,
    e = c.x,
    d = c.y;
  if ("real_x" in c) {
    e = c.real_x, d = c.real_y
  }
  if (e - c.vision[0] < a && a < e + c.vision[0] && d - c.vision[1] < f && f < d + c.vision[1]) {
    return true
  }
  return false
}

function distance(l, j) {
  if ("width" in l && "width" in j) {
    var f = 99999999,
      n = l.width,
      e = l.height,
      d = j.width,
      h = j.height,
      g;
    if ("awidth" in l) {
      n = l.awidth, e = l.aheight
    }
    if ("awidth" in j) {
      d = j.awidth, h = j.aheight
    }
    var m = l.x,
      k = l.y,
      c = j.x,
      o = j.y;
    if ("real_x" in l) {
      m = l.real_x, k = l.real_y
    }
    if ("real_y" in j) {
      c = j.real_x, o = j.real_y
    }[{
      x: m - n / 2,
      y: k
    }, {
      x: m + n / 2,
      y: k
    }, {
      x: m + n / 2,
      y: k - e
    }, {
      x: m - n / 2,
      y: k - e
    }].forEach(function(a) {
      [{
        x: c - d / 2,
        y: o
      }, {
        x: c + d / 2,
        y: o
      }, {
        x: c + d / 2,
        y: o - h
      }, {
        x: c - d / 2,
        y: o - h
      }].forEach(function(b) {
        g = simple_distance(a, b);
        if (g < f) {
          f = g
        }
      })
    });
    return f
  }
  return simple_distance(l, j)
}

function can_walk(a) {
  return !is_disabled(a)
}

function is_disabled(a) {
  if (!a || a.rip || a.stunned) {
    return true
  }
}

function calculate_item_grade(b, a) {
  if (!(b.upgrade || b.compound)) {
    return 0
  }
  if ((a && a.level || 0) >= (b.grades || [11, 12])[1]) {
    return 2
  }
  if ((a && a.level || 0) >= (b.grades || [11, 12])[0]) {
    return 1
  }
  return 0
}

function calculate_item_value(a) {
  if (a.gift) {
    return 1
  }
  var c = G.items[a.name],
    b = c.cash && c.g || c.g * 0.6,
    d = 1;
  if (c.compound && a.level) {
    b *= Math.pow(3.2, a.level)
  }
  if (c.upgrade && a.level && a.level >= 4) {
    b *= Math.pow(2, a.level - 4)
  }
  if (a.expires) {
    d = 2
  }
  return round(b / d)
}

function calculate_item_properties(d, c) {
  var f = {
    "int": 0,
    str: 0,
    dex: 0,
    hp: 0,
    mp: 0,
    attack: 0,
    range: 0,
    armor: 0,
    resistance: 0,
    stat: 0,
    speed: 0,
    level: 0,
    evasion: 0,
    reflection: 0,
    lifesteal: 0,
    attr0: 0,
    attr1: 0,
    rpiercing: 0,
    apiercing: 0,
  };
  if (d.upgrade || d.compound) {
    var b = d.upgrade || d.compound;
    level = c.level || 0;
    f.level = level;
    for (var a = 1; a <= level; a++) {
      var e = 1;
      if (d.upgrade) {
        if (a == 7) {
          e = 1.25
        }
        if (a == 8) {
          e = 1.5
        }
        if (a == 9) {
          e = 2
        }
        if (a == 10) {
          e = 3
        }
      } else {
        if (d.compound) {
          if (a == 5) {
            e = 1.25
          }
          if (a == 6) {
            e = 1.5
          }
          if (a == 7) {
            e = 2
          }
          if (a >= 8) {
            e = 3
          }
        }
      }
      for (p in b) {
        if (p == "stat") {
          f[p] += round(b[p] * e)
        } else {
          f[p] += b[p] * e
        }
        if (p == "stat" && a >= 7) {
          f.stat++
        }
      }
    }
  }
  for (p in d) {
    if (f[p] != undefined) {
      f[p] += d[p]
    }
  }
  for (p in f) {
    if (!in_arr(p, ["evasion", "reflection", "lifesteal", "attr0", "attr1"])) {
      f[p] = round(f[p])
    }
  }
  if (d.stat && c.stat_type) {
    f[c.stat_type] += f.stat;
    f.stat = 0
  }
  return f
}

function to_pretty_num(a) {
  if (!a) {
    return "0"
  }
  a = round(a);
  var b = "";
  while (a) {
    var c = a % 1000;
    if (!c) {
      c = "000"
    } else {
      if (c < 10 && c != a) {
        c = "00" + c
      } else {
        if (c < 100 && c != a) {
          c = "0" + c
        }
      }
    }
    if (!b) {
      b = c
    } else {
      b = c + "," + b
    }
    a = (a - a % 1000) / 1000
  }
  return "" + b
}

function e_array(a) {
  var c = [];
  for (var b = 0; b < a; b++) {
    c.push(null)
  }
  return c
}

function gx(a) {
  if ("real_x" in a) {
    return a.real_x
  }
  return a.x
}

function gy(a) {
  if ("real_y" in a) {
    return a.real_y
  }
  return a.y
}

function simple_distance(e, d) {
  var c = e.x,
    h = e.y,
    g = d.x,
    f = d.y;
  if ("real_x" in e) {
    c = e.real_x, h = e.real_y
  }
  if ("real_y" in d) {
    g = d.real_x, f = d.real_y
  }
  return Math.sqrt((c - g) * (c - g) + (h - f) * (h - f))
}

function calculate_vxy(a, c) {
  if (!c) {
    c = 1
  }
  a.ref_speed = a.speed;
  var b = 0.0001 + sq(a.going_x - a.from_x) + sq(a.going_y - a.from_y);
  b = sqrt(b);
  a.vx = a.speed * c * (a.going_x - a.from_x) / b;
  a.vy = a.speed * c * (a.going_y - a.from_y) / b;
  if (is_game || 1) {
    a.angle = Math.atan2(a.going_y - a.from_y, a.going_x - a.from_x) * 180 / Math.PI
  }
}

function recalculate_vxy(a) {
  if (a.moving && a.ref_speed != a.speed) {
    if (is_server) {
      a.move_num++
    }
    calculate_vxy(a)
  }
}

function is_in_front(b, a) {
  var c = Math.atan2(gy(a) - gy(b), gx(a) - gx(b)) * 180 / Math.PI;
  if (b.angle !== undefined && Math.abs(b.angle - c) <= 45) {
    return true
  }
  return false
}

function calculate_move(f, c, j, a, h) {
  var e, g = j < h,
    b = c < a;
  for (var d = 0; d < (f.x_lines || []).length; d++) {
    var k = f.x_lines[d];
    if (!(c <= k[0] && k[0] <= a || a <= k[0] && k[0] <= c)) {
      continue
    }
    e = j + (h - j) * (k[0] - c) / (a - c + EPS);
    if (!(k[1] <= e && e <= k[2])) {
      continue
    }
    if (g) {
      h = min(h, e)
    } else {
      h = max(h, e)
    }
    if (b) {
      a = min(a, k[0] - 3)
    } else {
      a = max(a, k[0] + 3)
    }
  }
  for (var d = 0; d < (f.y_lines || []).length; d++) {
    var k = f.y_lines[d];
    if (!(j <= k[0] && k[0] <= h || h <= k[0] && k[0] <= j)) {
      continue
    }
    e = c + (a - c) * (k[0] - j) / (h - j + EPS);
    if (!(k[1] <= e && e <= k[2])) {
      continue
    }
    if (b) {
      a = min(a, e)
    } else {
      a = max(a, e)
    }
    if (g) {
      h = min(h, k[0] - 3)
    } else {
      h = max(h, k[0] + 7)
    }
  }
  for (var d = 0; d < (f.x_lines || []).length; d++) {
    var k = f.x_lines[d];
    if (!(c <= k[0] && k[0] <= a || a <= k[0] && k[0] <= c)) {
      continue
    }
    e = j + (h - j) * (k[0] - c) / (a - c + EPS);
    if (!(k[1] <= e && e <= k[2])) {
      continue
    }
    if (g) {
      h = min(h, e)
    } else {
      h = max(h, e)
    }
    if (b) {
      a = min(a, k[0] - 3)
    } else {
      a = max(a, k[0] + 3)
    }
  }
  return {
    x: a,
    y: h
  }
}

function calculate_move(x, j, h, e, d) {
  var r = h < d;
  var y = j < e;
  var k = x.x_lines || [];
  var u = x.y_lines || [];
  var q = min(j, e);
  var w = max(j, e);
  var o = min(h, d);
  var v = max(h, d);
  var n = e - j;
  var m = d - h;
  var f = m / (n + EPS);
  var s = 1 / f;
  for (var t = 0; t < k.length; t++) {
    var l = k[t];
    var b = l[0];
    if (w < b || q > b || v < l[1] || o > l[2]) {
      continue
    }
    var g = h + (b - j) * f;
    if (g < l[1] || g > l[2]) {
      continue
    }
    if (r) {
      d = min(d, g);
      v = d
    } else {
      d = max(d, g);
      o = d
    }
    if (y) {
      e = min(e, b - 3);
      w = e
    } else {
      e = max(e, b + 3);
      q = e
    }
  }
  for (var t = 0; t < u.length; t++) {
    var l = u[t];
    var a = l[0];
    if (v < a || o > a || w < l[1] || q > l[2]) {
      continue
    }
    var c = j + (a - h) * s;
    if (c < l[1] || c > l[2]) {
      continue
    }
    if (y) {
      e = min(e, c);
      w = e
    } else {
      e = max(e, c);
      q = e
    }
    if (r) {
      d = min(d, a - 3);
      v = d
    } else {
      d = max(d, a + 7);
      o = d
    }
  }
  return {
    x: e,
    y: d
  }
}

function recalculate_move(a) {
  var c = a.x,
    e = a.y,
    b = a.going_x,
    d = a.going_y;
  if ("real_x" in a) {
    c = a.real_x, e = a.real_y
  }
  move = calculate_move(G.maps[a.map].data || {}, c, e, b, d);
  a.going_x = move.x;
  a.going_y = move.y
}

function can_move(f) {
  var e = G.maps[f.map].data || {};
  var b = f.x,
    h = f.y,
    a = f.going_x,
    g = f.going_y,
    d;
  if (simple_distance({
      x: b,
      y: h
    }, {
      x: a,
      y: g
    }) < 10) {
    return true
  }
  for (var c = 0; c < (e.x_lines || []).length; c++) {
    var j = e.x_lines[c];
    if (!(b <= j[0] && j[0] <= a || a <= j[0] && j[0] <= b)) {
      continue
    }
    d = h + (g - h) * (j[0] - b) / (a - b + EPS);
    if (!(j[1] <= d && d <= j[2])) {
      continue
    }
    return false
  }
  for (var c = 0; c < (e.y_lines || []).length; c++) {
    var j = e.y_lines[c];
    if (!(h <= j[0] && j[0] <= g || g <= j[0] && j[0] <= h)) {
      continue
    }
    d = b + (a - b) * (j[0] - h) / (g - h + EPS);
    if (!(j[1] <= d && d <= j[2])) {
      continue
    }
    return false
  }
  return true
}

function stop_logic(b) {
  if (!b.moving) {
    return
  }
  var a = b.x,
    c = b.y;
  if ("real_x" in b) {
    a = b.real_x, c = b.real_y
  }
  if (((b.from_x <= b.going_x && a >= b.going_x - 0.1) || (b.from_x >= b.going_x && a <= b.going_x + 0.1)) && ((b.from_y <= b.going_y && c >= b.going_y - 0.1) || (b.from_y >= b.going_y && c <= b.going_y + 0.1))) {
    b.moving = false;
    b.vx = b.vy = 0;
    if ("real_x" in b) {
      b.real_x = b.going_x, b.real_y = b.going_y
    } else {
      b.x = b.going_x, b.y = b.going_y
    }
  }
}

function trigger(a) {
  setTimeout(a, 0)
}

function to_number(a) {
  try {
    a = round(a);
    if (a < 0) {
      return 0
    }
    if (!a) {
      a = 0
    }
  } catch (b) {
    a = 0
  }
  return a
}

function is_string(b) {
  try {
    return Object.prototype.toString.call(b) == "[object String]"
  } catch (a) {}
  return false
}

function is_array(b) {
  try {
    if (b instanceof Array) {
      return true
    }
  } catch (c) {}
  return false
}

function is_function(b) {
  try {
    var a = {};
    return b && a.toString.call(b) === "[object Function]"
  } catch (c) {}
  return false
}

function is_object(b) {
  try {
    return b !== null && typeof b === "object"
  } catch (a) {}
  return false
}

function clone(d, b) {
  if (!b) {
    b = {}
  }
  if (!b.seen && b.seen !== []) {
    b.seen = []
  }
  if (null == d) {
    return d
  }
  if (b.simple_functions && is_function(d)) {
    return "[clone]:" + d.toString().substring(0, 40)
  }
  if ("object" != typeof d) {
    return d
  }
  if (d instanceof Date) {
    var e = new Date();
    e.setTime(d.getTime());
    return e
  }
  if (d instanceof Array) {
    b.seen.push(d);
    var e = [];
    for (var c = 0; c < d.length; c++) {
      e[c] = clone(d[c], b)
    }
    return e
  }
  if (d instanceof Object) {
    b.seen.push(d);
    var e = {};
    for (var a in d) {
      if (d.hasOwnProperty(a)) {
        if (b.seen.indexOf(d[a]) !== -1) {
          e[a] = "circular_attribute[clone]";
          continue
        }
        e[a] = clone(d[a], b)
      }
    }
    return e
  }
  throw "type not supported"
}

function smart_eval(code, args) {
  if (!code) {
    return
  }
  if (args && !is_array(args)) {
    args = [args]
  }
  if (is_function(code)) {
    if (args) {
      code.apply(this, clone(args))
    } else {
      code()
    }
  } else {
    if (is_string(code)) {
      eval(code)
    }
  }
}

function is_substr(d, c) {
  if (is_array(c)) {
    for (var f = 0; f < c.length; f++) {
      try {
        if (d && d.toLowerCase().indexOf(c[f].toLowerCase()) != -1) {
          return true
        }
      } catch (g) {}
    }
  } else {
    try {
      if (d && d.toLowerCase().indexOf(c.toLowerCase()) != -1) {
        return true
      }
    } catch (g) {}
  }
  return false
}

function to_title(a) {
  return a.replace(/\w\S*/g, function(b) {
    return b.charAt(0).toUpperCase() + b.substr(1).toLowerCase()
  })
}

function ascending_comp(d, c) {
  return d - c
}

function delete_indices(c, a) {
  a.sort(ascending_comp);
  for (var b = a.length - 1; b >= 0; b--) {
    c.splice(a[b], 1)
  }
}

function in_arr(b, d) {
  if (is_array(b)) {
    for (var a = 0; a < b.length; a++) {
      for (var c in d) {
        if (b[a] == d[c]) {
          return true
        }
      }
    }
  }
  for (var c in d) {
    if (b == d[c]) {
      return true
    }
  }
  return false
}

function c_round(a) {
  if (window.floor_xy) {
    return Math.floor(a)
  }
  if (!window.round_xy) {
    return a
  }
  return Math.round(a)
}

function round(a) {
  return Math.round(a)
}

function sq(a) {
  return a * a
}

function sqrt(a) {
  return Math.sqrt(a)
}

function floor(a) {
  return Math.floor(a)
}

function ceil(a) {
  return Math.ceil(a)
}

function abs(a) {
  return Math.abs(a)
}

function min(d, c) {
  return Math.min(d, c)
}

function max(d, c) {
  return Math.max(d, c)
}

function randomStr(a) {
  var e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
    c = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var f = "";
  for (var d = 0; d < a; d++) {
    if (d == 0) {
      var b = Math.floor(Math.random() * c.length);
      f += c.substring(b, b + 1)
    } else {
      var b = Math.floor(Math.random() * e.length);
      f += e.substring(b, b + 1)
    }
  }
  return f
}
String.prototype.replace_all = function(c, a) {
  var b = this;
  return b.replace(new RegExp(c.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), a)
};

function html_escape(a) {
  var d = a;
  var b = [
    [/&/g, "&amp;"],
    [/</g, "&lt;"],
    [/>/g, "&gt;"],
    [/"/g, "&quot;"]
  ];
  for (var c in b) {
    d = d.replace(b[c][0], b[c][1])
  }
  return d
}

function he(a) {
  return html_escape(a)
}

function future_ms(a) {
  var b = new Date();
  b.setMilliseconds(b.getMilliseconds() + a);
  return b
}

function future_s(a) {
  var b = new Date();
  b.setSeconds(b.getSeconds() + a);
  return b
}

function mssince(a, b) {
  if (!b) {
    b = new Date()
  }
  return b.getTime() - a.getTime()
}

function ssince(a, b) {
  return mssince(a, b) / 1000
}

function msince(a, b) {
  return mssince(a, b) / 60000
}

function hsince(a, b) {
  return mssince(a, b) / 3600000
}

function randomStr(a) {
  var e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
    c = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var f = "";
  for (var d = 0; d < a; d++) {
    if (d == 0) {
      var b = Math.floor(Math.random() * c.length);
      f += c.substring(b, b + 1)
    } else {
      var b = Math.floor(Math.random() * e.length);
      f += e.substring(b, b + 1)
    }
  }
  return f
}

function rough_size(d) {
  var c = [];
  var a = [d];
  var b = 0;
  while (a.length) {
    var f = a.pop();
    if (typeof f === "boolean") {
      b += 4
    } else {
      if (typeof f === "string") {
        b += f.length * 2
      } else {
        if (typeof f === "number") {
          b += 8
        } else {
          if (typeof f === "object" && c.indexOf(f) === -1) {
            c.push(f);
            for (var e in f) {
              a.push(f[e])
            }
          }
        }
      }
    }
  }
  return b
};
