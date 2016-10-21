
var mode = 1;
var targetting = 1;
var grind = false;
var buypot = true;
var upgrade = false;
//Automation Stoppers / Defaults

var potmin = 50;
var pot2buy = 1000;
//Pot Mainainence

var prevx = 0;
var prevy = 0;
//Previous coords

var angle;
var flipcd = 0;
var stuck = 1;
//Distance Maintainence Variables

//show_json(character);
//show_json(get_targeted_monster());
//show_json(parent.M);
//show_json(parent.G.monsters);
//JSONs

parent.addEventListener("keydown", keyboard, false);
//Listen for keypresses

function keyboard(e)
{
	var key = e.keyCode;
	//console.log(e.keyCode); //Logging Keypress
	//Convert to keycodes
	
	if(key == 32 && !grind)
	{
		grind = true;
		console.log("Grind Mode Started");
	}
	else if(key == 32)
	{
	    grind = false;
	    console.log("Grind Mode Stopped");
	}
	//Press Spacebar - Grind Activation
	
	if(key == 81 && buypot)
	{
	    buypot = false;
	}
	else if(key == 81 && !buypot)
	{
	    buypot = true;
	}
	/*
	if(key == 85 && !upgrade)
		upgrade = true;
	else if(key == 85)
		upgrade = false;
	//Press U - Upgrade Activation
	*/// Future Plans
	
	if(key == 116 && targetting == 1)
	{
	    targetting = 0;
	   console.log("Monster Range Mode");
	}
	else if(key == 116 && targetting === 0)
	{
	    targetting = 1;
	    console.log("Player Range Mode");
	}
	//Press T - Targetting Switch
	
	if(key == 48) //0 Key
	{
	    mode = 0;
	    console.log("Legacy Distancing");
	}
	else if(key == 49) //1 Key
	{
	    mode = 1;
	    console.log("Circular Distancing");
	}
	else if(key == 50) //2 Key
	{
	    mode = 3;
	    console.log("Tank Distancing");
	}
	else if(key == 51) //3 Key
	{}
	else if(key == 52) //4 Key
	{}
	else if(key == 53) //5 Key
	{}
	else if(key == 54) //6 Key
	{}
	else if(key == 55) //7 Key
	{}
	else if(key == 56) //8 Key
	{}
	else if(key == 57) //9 Key
	{}
	//Press # Keys - Mode control //For Now
	
	if(key == 37) //Left
	    move(character.real_x - 20, character.real_y);
	if(key == 38) //Up
	    move(character.real_x, character.real_y - 20);
	if(key == 39) //Right
	    move(character.real_x + 20, character.real_y);
	if(key == 40) //Down
	    move(character.real_x, character.real_y + 20);
	//Press arrow keys - Manual Movement
}

//Grinding Subscript Below -------------------------------------------------
setInterval(function()
{
	
	if(buypot)
	{
	    if (character.items[0].q < potmin)
	    	parent.buy("hpot0", pot2buy);
	    if (character.items[1].q < potmin)
    	    parent.buy("mpot0", pot2buy);
	}
	
	if(character.hp/character.max_hp < 0.4)
	{
		parent.use('hp');
		if(character.hp <= 100)
			parent.socket.emit("transport",{to:"main"});
		//Panic Button
	}

	if(character.mp/character.max_mp < 0.3)
		parent.use('mp');
	//Constrained Healing
	
	loot();
	//Loot Chests

	var charx = character.real_x;
	var chary = character.real_y;
	//Character Location
	
	if(!grind)
	{
    	set_message("Not Grinding");
		return;
	}
	else
	{
	    set_message("Grinding...");
	}
	//Leaves loop if disabled

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
	//Monster Searching
	
	var enemydist;
	if(targetting === 0)
    	enemydist = parent.G.monsters[target.mtype].range + 20;
    else if(targetting == 1)
        enemydist = character.range - 10;
	//Targetting

	if(can_attack(target))
		attack(target);
	//Attack

	var parmem = get_nearest_solo_player();
	if(parmem)
		parent.socket.emit("party",{event:'invite',id:parmem.id});
	//Invite to Party

	var distx = target.real_x - charx;
	var disty = target.real_y - chary;
	if(!angle && target)
		angle = Math.atan2(disty,distx);
	//Enemy Distance and Angle

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
	else if(mode == 3)
	{
	    move(target.real_x, target.real_y + 5);
	}
	//Following/Maintaining Distance

	prevx = Math.ceil(charx);
	prevy = Math.ceil(chary);
	//Sets new coords to prev coords

},200); // Loop Delay}
//Grinding Subscript Above ------------------------------------------------

function is_between(num, compare, range)
{
    return num >= compare-range && num <= compare+range;
}

function get_nearest_solo_player() {
	var min_d = 999999, target = null;
	for (id in parent.entities) 
	{
		var current = parent.entities[id];
		if (current.player === false || current.dead || current.party) 
			continue;
		var c_dist = parent.distance(character, current);
		if (c_dist < min_d) 
			min_d = c_dist, target = current;
		else if (current.player === true)
			target = current;
	}
	return target;
	//Credit to /u/Sulsaries
}

function search_for_item(name)
{
	var inv = character.items; //Character Inventory
	var fstEmpty;
	
	for(id in inv){
		if(inv[id] && inv[id].name == name){ // Search for the item.
			return id; //Return Item
		}
		else if (!fstEmpty && !inv[id])
			fstEmpty = id;
	}
	return fstEmpty;
}

//Unusable:
//sleep()
//while loops

//By ishaan1
