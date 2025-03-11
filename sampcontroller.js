const Player = require('./samp');
const express = require('express');
const app = express();
const router = express.Router()
const bodyparser = require('body-parser');
const playervalidation = require('./samjoi');

app.use(bodyparser.json()); 

router.post('/post',async(req,res)=>{
    try{
        const {error} = playervalidation.validate(req.body);
        if(error){
            res.status(400).json({message:error.message});
        }
    // console.log(req.body)
    const {playerName,age,currentTeam,teams,strikeRate,runs,matches} = req.body;

    const average = runs/matches;
     
    let performance
    if(average < 25){
        performance = 'below average';
    }else if(average >= 25 && average <= 30){
        performance = 'average';
    }else if(average >30 && average <40){
        performance = 'excellent'
    }else{
        performance = 'masterful'
    }
    console.log(average);
    const newplayer = new Player({
        playerName,
        age,
        currentTeam,
        teams,
        strikeRate,
        runs,
        matches,
        average,
        performance
    })
    // console.log(newplayer)
    await newplayer.save();
    res.status(200).json({message:'player added successfully',result:newplayer});
}catch(error){
   res.status(400).json({message:error.message});
}
})

router.get('/get',async(req,res)=>{
    try{
      const yera = await Player.find({isActive:true});
    //   console.log(yera);

    //   const newget = yera.map(players=>({
    //           playerName:players.playerName,
    //           teams:players.teams.map(y=>({
    //             team:y.team,
    //            yearsPlayed:y.yearsPlayed.map(year=>({
    //             from:year.from,
    //             to:year.to,
    //            }))
    //           }))
    //   }));

    const newget = yera.map(players=>{
        if(players.playerName.length>0){
            const newplay = players.playerName;
            const newage = players.age;

           const newyear = players.teams.map(team=>{
            if(team.yearsPlayed && team.yearsPlayed.length>0){
                const played = team.yearsPlayed[0]
                // console.log(played,'played');
                return `${played.from} - ${played.to}`
            }
            return "no data"
            })
            return {
                playerName:newplay,
                age:newage,
                yearsPlayed:newyear,
            }
        }
    })

    //   console.log(newget)
      res.status(200).json({message:'added successfully',result:newget})
    }catch(error){
     res.status(400).json({message:error.message});
    }
})



router.put('/update/:id',async(req, res)=>{
    try {
        const {id} = req.params;
        const {playerName,age,currentTeam,teams,strikeRate,runs,matches} = req.body;
        const average = runs / matches;
        let performance;

        if(average < 25){
            performance = 'below average';
        }else if(average >= 25 && average <= 30){
            performance = 'average';
        }else if(average > 30 && average < 40){
            performance = 'excellent';
        }else{
            performance = 'masterful';
        }

        const updatedPlayer = await Player.findByIdAndUpdate(
            id,{playerName,age,currentTeam,teams,strikeRate,runs,matches,average,performance},{new:true}
        );
        res.status(200).json({ message: 'Player updated successfully', result: updatedPlayer });
    }catch(error){
        res.status(400).json({ message: error.message });
    }
});


router.get('/getter',async(req,res)=>{
    try{
    let {page,limit}= req.query;
    page = parseInt(page) || 1
    limit = parseInt(limit) || 10

   const limited = await Player.find().skip((page-1)*limit).limit(limit)

   totalplayers = Player.countDocuments
   res.status(200).json({
    result:limited,
    currentpage:page,
    totalpages:Math.ceil(totalplayers/limit)
})
}catch(error){
    res.status(400).json({message:error.message});
}
})

// router.post('/filter',async(req,res)=>{
//     try{
//     const {playedFrom} = req.body;
 
//      const filter = await Player.find();
//      const wholefilter = filter.map(whole=>{
//         const playername = whole.playerName;
//         whole.teams.map(team=>{
//             const teamname = team.team;
//             const finalyea = team.yearsPlayed.map(year=>{
//                  if(year.from>=`${playedFrom}`){
//                    const last = year.from;
//                    return last
//                  }
//                  return{
//                      playedFrom:finalyea
//                     } 
//                     console.log(finalyea);
//             })
//         })
//      })
//      console.log(wholefilter)
     
//     let dbfilter = {};
//     dbfilter.wholefilter
//     if(playedFrom){
//         dbfilter >= playedFrom
//     }

//     const playerfilter = await Player.find(dbfilter)
//     console.log(playerfilter);
//     res.status(200).json({message:'filtered successfully',result:playerfilter});
// }catch(error){
//     res.status(400).json({message:error.message})
// }})

router.delete('/delete/:id',async(req,res)=>{
    try{
    const {id} = req.params;
    const deleted = await Player.findByIdAndUpdate(id,{isActive:false},{new:true});
    res.status(200).json({message:'deleted successfully',result:deleted})
}catch(error){
    res.status(400).json({message:error.message});
}
});

router.get('/deleted',async(req,res)=>{
    try{
        const deleted = await Player.find({isActive:false});
        res.status(200).json({result:deleted});
    }catch(error){
        res.status(400).json({message:error.message});
    }
})


router.get('/best', async (req, res) => {
    try {
        const stats = await Player.aggregate([
            {
                $group:{
                    _id: '$performance',
                    totalPlayers:{$sum:1},
                    averageRuns:{$avg:'$runs'}, 
                    averageMatches:{$avg:'$matches'},
                    totalRuns:{$sum:'$runs'},
                    playerNames:{$push:'$playerName'} 
                }
            },
            {$sort:{totalPlayers:-1}}
        ]);

        res.status(200).json({message:'Statistics retrieved successfully',result:stats});
    }catch(error){
        res.status(400).json({message:error.message});
    }
});


router.post('/filter', async (req, res) => {
    try {
        const { playedFrom ,playedto} = req.body;
        const playedFromNumber = Number(playedFrom);

        const dbfilter = {
            "teams.yearsPlayed.from": { $gte: playedFromNumber,$lte:playedto }
        };

        // const dbfilter = {
        //     "teams.yearsPlayed.from": { $gte: playedFromNumber }
        // };

        const playerfilter = await Player.find(dbfilter);

        // const play = playerfilter.map(player=>{
        //     const newplayer = player.playerName;
        //     return {
        //        playerName:newplayer
        //     }
        //    })
        // console.log(playerfilter);
        res.status(200).json({ message: 'Filtered successfully', result: playerfilter });
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});





// router.post('/post',addplayer);
// router.post('get',getplayer);
app.use('/',router);

app.listen(2000,()=>{
    console.log('http://localhost:2000');
});