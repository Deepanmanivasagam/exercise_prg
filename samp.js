const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/samp")
.then(()=>console.log("mongodb connected successfully"))
.catch((error)=>console.log(error))

const playerSchema = new Schema({
    playerName: {
        type: String,
    },
    age: {
        type: Number,
    },
    currentTeam: {
        type: String,
    },
    teams: [
        {
            team: { type: String },
            yearsPlayed: [
                {
                    from: { type: Number },
                    to: { type: Number },
                }
            ]
        }
    ],
    strikeRate: {
        type: String,
    },
    runs:{
        type:Number,
        required:true,
    },
    matches:{
        type:Number,
    },
    average:{
        type:String
    },
    performance:{
        type:String,
    },
    isActive:{
        type:Boolean,
        default:true,
    }
},
{versionKey:false}
);

playerSchema.pre('save', function(next){
    this.average = this.runs / this.matches;
    this.average < 25 ? "below average" : this.average < 35 ? "average" : "excellent";
    next()
})

const Player = mongoose.model("Player",playerSchema);

module.exports = Player