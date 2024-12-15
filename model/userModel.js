const { Schema, model } = require("mongoose");

const  user_schema = new Schema({

    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    }
}, {timestamps: true})

module.exports = model('users', user_schema)