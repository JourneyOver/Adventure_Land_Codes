var ui_gamelog = function() {
    var gamelog_data = {
        kills: {
            show: true,
            regex: /killed/,
            tab_name: 'Kills'
        },
        gold: {
            show: true,
            regex: /gold/,
            tab_name: 'Gold'
        },
        party: {
            show: true,
            regex: /party/,
            tab_name: 'Party'
        },
        items: {
            show: true,
            regex: /found/,
            tab_name: 'Items'
        },
        upgrade_and_compound: {
            show: true,
            regex: /(upgrade|combination)/,
            tab_name: 'Upgr.'
        },
        errors: {
            show: true,
            regex: /(error|line|column)/i,
            tab_name: 'Errors'
        }
    };

    // filter buttons are alternating lighter and darker for aesthetic effect
    // colours in order are: dark blue, light blue, white, dark gray, light gray, lighter gray
    var filter_colours = {
        on_dark: '#151342',
        on_light: '#1D1A5C',
        on_text: '#FFF',
        off_dark: '#222',
        off_light: '#333',
        off_text: '#999'
    };

    var $ = parent.$;

    init_timestamps();
    init_gamelog_filter();

    function init_gamelog_filter() {

        //$('#bottomrightcorner').find('#goldui')[0].style.lineHeight = '30px';
        $('#bottomrightcorner').find('#gamelog-tab-bar').remove();

        let gamelog_tab_bar = $('<div id="gamelog-tab-bar" class="enableclicks" />').css({
            border: '5px solid gray',
            height: '24px',
            background: 'black',
            margin: '-5px 0',
            display: 'flex',
            fontSize: '20px',
            fontFamily: 'pixel'
        });

        let gamelog_tab = $('<div class="gamelog-tab enableclicks" />').css({
            height: '100%',
            width: 'calc(100% / 6)',
            textAlign: 'center',
            lineHeight: '24px',
            cursor: 'default'
        });

        for (let key in gamelog_data) {
            if (!gamelog_data.hasOwnProperty(key)) continue;
            let filter = gamelog_data[key];
            gamelog_tab_bar.append(
                gamelog_tab
                .clone()
                .attr('id', `gamelog-tab-${key}`)
                .css({
                    background: gamelog_tab_bar.children().length % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light
                })
                .text(filter.tab_name)
                .click(function() {
                    toggle_gamelog_filter(key);
                })
            );
        }
        $('#gamelog').before(gamelog_tab_bar);
    }

    function filter_gamelog() {
        $('.gameentry').each(function() {
            for (let filter of Object.values(gamelog_data)) {
                if (filter.regex.test(this.innerHTML)) {
                    this.style.display = filter.show ? 'block' : 'none';
                    return;
                }
            }
        });
    }

    function toggle_gamelog_filter(filter) {
        gamelog_data[filter].show = !gamelog_data[filter].show;
        console.log(JSON.stringify(gamelog_data));
        let tab = $(`#gamelog-tab-${filter}`);
        if (gamelog_data[filter].show) {
            tab.css({
                background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light,
                color: filter_colours.on_text
            });
        } else {
            tab.css({
                background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.off_dark : filter_colours.off_dark,
                color: filter_colours.off_text
            });
        }
        filter_gamelog();
        $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
    }

    function pad(num, pad_amount_) {
        pad_amount = pad_amount_ || 2;
        return ("0".repeat(pad_amount) + num).substr(-pad_amount, pad_amount);
    }

    function add_log_filtered(c, a) {
        if (parent.mode.dom_tests || parent.inside == "payments") {
            return;
        }
        if (parent.game_logs.length > 1000) {
            var b = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
            parent.game_logs = parent.game_logs.slice(-720);
            parent.game_logs.forEach(function(d) {
                b += "<div class='gameentry' style='color: " + (d[1] || "white") + "'>" + d[0] + "</div>"
            });
            $("#gamelog").html(b)
        }
        parent.game_logs.push([c, a]);

        let display_mode = 'block';

        for (let filter of Object.values(gamelog_data)) {
            if (filter.regex.test(c)) {
                display_mode = filter.show ? 'block' : 'none';
                break;
            }
        }

        $("#gamelog").append(`<div class='gameentry' style='color: ${a || "white"}; display: ${display_mode};'>${c}</div>`);
        $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
    }

    function init_timestamps() {
        if (parent.socket.hasListeners("game_log")) {
            parent.socket.removeListener("game_log");
            parent.socket.on("game_log", data => {
                parent.draw_trigger(function() {
                    let now = new Date();
                    if (is_string(data)) {
                        add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data}`, "gray");
                    } else {
                        if (data.sound) sfx(data.sound);
                        add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data.message}`, data.color);
                    }
                })
            });
        }
    }
}();