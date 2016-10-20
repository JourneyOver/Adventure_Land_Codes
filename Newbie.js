// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode = true

setInterval(function()
{
    if (character.hp < character.max_hp - 200 || character.mp < character.max_mp - 500)
    {
        use_hp_or_mp();
    }
    loot();

    if (!attack_mode || character.moving) return;

    var target = get_targeted_monster();
    if (!target)
    {
        target = get_nearest_monster(
        {
            min_xp: 100,
            max_att: 40
        });
        if (target) change_target(target);
        else
        {
            set_message("No Monsters");
            return;
        }
    }

    if (!in_attack_range(target))
    {
        move(
            character.real_x + (target.real_x - character.real_x) / 2,
            character.real_y + (target.real_y - character.real_y) / 2
        );
        // Walk half the distance
    }
    else if (can_attack(target))
    {
        set_message("Attacking");
        attack(target);
    }

}, 1000 / 4); // Loops every 1/4 seconds.

// NOTE: If the tab isn't focused, browsers slow down the game
// Learn Javascript: https://www.codecademy.com/learn/javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
