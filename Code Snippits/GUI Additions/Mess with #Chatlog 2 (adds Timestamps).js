add_chat = function(b, g, d) {
  var a = "#chatlog",
    c = "";
  if (!window.character) {
    a = "#gamelog"
  }
  if (game_chats.length > 240) {
    var f = "<div class='chatentry' style='color: gray'>- Truncated -</div>";
    game_chats = game_chats.slice(-180);
    game_chats.forEach(function(h) {
      if (h[0]) {
        h[0] = "<span style='color:white'>" + h[0] + ":</span> "
      }
      f += "<div class='chatentry' style='color: " + (h[2] || "gray") + "'>" + (h[0] || "") + html_escape(h[1]) + "</div>"
    });
    $(a).html(f)
  }
  let now = new Date();
  if (b == "") { g = `${pad(now.getHours(), 2)}:${pad(now.getMinutes(), 2)}:${pad(now.getSeconds(), 2)} | ${g}`; } else { b = `${pad(now.getHours(), 2)}:${pad(now.getMinutes(), 2)}:${pad(now.getSeconds(), 2)} | ${b}`; }
  game_chats.push([b, g, d]);
  if (b) {
    c = "<span style='color:white'>" + b + ":</span> "
  }
  $(a).append("<div class='chatentry' style='color: " + (d || "gray") + "'>" + c + html_escape(g) + "</div>");
  $(a).scrollTop($(a)[0].scrollHeight)
}