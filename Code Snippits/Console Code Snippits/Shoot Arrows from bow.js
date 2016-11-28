// Shoot Arrows from bow
// Run in firefox/chrome dev console (not the code screen in-game)
// Courtesy of: Draivin

var def_d_line = d_line;
function d_line(owner, entity, properties) {
    if (properties && properties.color === 'my_hit') {
        let x1 = gx(owner);
        let y1 = gy(owner) - owner.aheight / 2;
        let x2 = gx(entity);
        let y2 = gy(entity) - entity.height / 2;

        let dx = x2 - x1;
        let dy = y2 - y1;

        let dist = Math.sqrt(dx * dx + dy * dy);
        let lifetime = (dist / 700) * 1000;

        let arrow_sprite = new PIXI.Sprite.fromImage('http://i.imgur.com/LrLyKz9.png');
        let angle = Math.atan2(dy, dx) + Math.PI * 3/4;
        arrow_sprite.rotation = angle;

        map.addChild(arrow_sprite);

        let start_time = Date.now();
        let arrow_interval = setInterval(() => {
            let t = (Date.now() - start_time) / lifetime;
            if (t > 1) {
                arrow_sprite.destroy();
                clearInterval(arrow_interval);
                return;
            }

            arrow_sprite.x = x1 + t * dx;
            arrow_sprite.y = y1 + t * dy;
        }, 10);
    } else {
        def_d_line(owner, entity, properties);
    }
}