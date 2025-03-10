const joi = require('joi')

const playervalidation = joi.object({
    playerName:joi.string().required(),
    age:joi.number().min(1).max(45).required(),
    currentTeam:joi.string().required(),
    teams:joi.array().items(
        joi.object({
            teams:joi.string().required(),
            yearsPlayed:joi.array().items({
                from:joi.number().min(2009).required(),
                to:joi.number().min(2009).required(),
            })
        })),
    strikeRate:joi.number().min(100).max(400).required(),   
    runs:joi.number().min(1).max(20000).required(),
    matches:joi.number().min(1).max(400).required(),  
    isActive:joi.boolean().required()
    })

    module.exports = playervalidation;