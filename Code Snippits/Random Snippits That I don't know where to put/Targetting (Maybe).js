    // BEGIN TARGETING CODE
    let all_enemies = Object.values(parent.entities).filter(entity => !parent.party_list.includes(entity.name));
    if (!parent.G.maps[character.map].pvp || character.goldm != 1) { all_enemies = filter_monster_only(all_enemies); }
    
    // SCORE ENEMIES
    let enemy_scores = all_enemies.map(m => {
        // SHORT CIRCUIT PARTY MEMBERS
        if (m.name && parent.party_list.includes(m.name))           { return [0, null];  }
        
        let score = 0;
        // TARGET SCORING
        if ((parent.G.maps[character.map].pvp || character.goldm != 1)
            && m.type && m.type == "character")                        { score |= 0b100000; }