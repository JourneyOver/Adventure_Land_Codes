var mode = 1; //0 is Legacy, 1 is Current, anything else is testing
//Settings

var prevx = 0;
var prevy = 0;
//Previous coords

var angle;
var flipcd = 0;
var stuck = 2;
//Distance Maintainence Variables

var grind = false;

//show_json(character);
//show_json(get_targeted_monster());
//show_json(parent.M);
//show_json(parent.G.monsters);
//JSONs

parent.addEventListener("keypress", keyboard, false);

function keyboard(e)
{
	var key = e.keyCode;
	set_message(key);
	//Convert to keycodes

	if(key == 32 && !grind)
	{
		grind = true;
		set_message(grind);
		grind();
	}
	else
		grind = false;
	//Press Spacebar - Grind Activation
}

{	if(!grind)
	return;
setInterval(function(){

	if(character.hp/character.max_hp < 0.3)
	{
		parent.use('hp');
		if(character.hp <= 100)
			parent.socket.emit("transport",{to:"main"});
		//Panic Button
	}

	if(character.mp/character.max_mp < 0.3)
		parent.use('mp');
	//Constrained Healing

	var charx = character.real_x;
	var chary = character.real_y;
	//Character Location

	var target = get_targeted_monster();
	if(!target)
	{
		target = get_nearest_monster({min_xp:1000, max_att:100});
		if(target)
		{
			change_target(target);
			angle = Math.atan2(target.real_y - chary,target.real_x - charx);
		}
		else if(!target)
		{
			target = get_nearest_monster({min_xp:500, max_att:50});
			if(target)
			{
				change_target(target);
				angle = Math.atan2(target.real_y - chary,target.real_x - charx);
			}
			else
				return;
		}
	}
	var enemydist = parent.G.monsters[target.mtype].range + 20
	//Monster Searching

	loot();
	//Loot Chests

	if(can_attack(target))
		attack(target);
	//Attack

	var parmem = get_nearest_player();
	if(parmem)
		parent.socket.emit("party",{event:'invite',name:parmem.name});
	//Invite to Party

	var distx = target.real_x - charx;
	var disty = target.real_y - chary;
	if(!angle && target)
		angle = Math.atan2(disty,distx);
	//Enemy Distance and Angle

	set_message("Location:\n" + Math.ceil(charx) + "," + Math.ceil(chary));
	//Output

	if(mode === 0)
	{
		if(distx > 0) //Player is left of enemy
			move(target.real_x - enemydist, chary);
		if(distx < 0) //Player is right of enemy
			move(target.real_x + enemydist, chary);
		if(disty > 0) //Player is below enemy
			move(charx, target.real_y - enemydist);
		if(disty < 0) //Player is above enemy
			move(charx, target.real_y + enemydist);
	}
	else if(mode == 1)
	{
		var chx = charx - prevx;
		var chy = chary - prevy;
		var distmov = Math.sqrt( chx*chx + chy*chy );

		if(distmov < stuck)
			angle = angle + Math.PI*2*0.125;
		if(parent.distance(character, target) <= enemydist && flipcd > 18)
		{
			angle = angle + Math.PI*2*0.35;
			flipcd = 0;
		}
		flipcd++;
		//Stuck Code

		var new_x = target.real_x + enemydist * Math.cos(angle);
		var new_y = target.real_y + enemydist * Math.sin(angle);
		move(new_x, new_y);
		//Credit to /u/idrum4316
	}
	//Following/Maintaining Distance


	prevx = Math.ceil(charx);
	prevy = Math.ceil(chary);
	//Sets new coords to prev coords

},200); // Loop Delay}

function isBetween(num, compare, range)
{
    return num >= compare-range && num <= compare+range;
}
function get_nearest_player()
{
	var min_d=999999, target=null;
	for(var id in parent.entities)
	{
		var current = parent.entities[id];
		if(current.type!="character" || current.dead)
			continue;
		var c_dist=parent.distance(character,current);
		if(c_dist<min_d) min_d=c_dist,target=current;
	}
	return target;
}

//Unusable:
//sleep()
//while loops

//By ishaan1rgb(40,24,186)
