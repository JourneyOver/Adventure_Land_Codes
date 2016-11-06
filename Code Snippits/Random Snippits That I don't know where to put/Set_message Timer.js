//Timer for set_messages
var timeout;
var default_message = "Idle";

function temp_message(message, duration) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  set_message(message);
  timeout = setTimeout(function() {
    set_message(default_message);
  }, duration);
}
