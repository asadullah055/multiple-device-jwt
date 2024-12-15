const { Schema, model } = require("mongoose");

const  user_login_schema = new Schema({

    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    user_agent:{
        type: String,
        require: true
    },
    ip:{
        type: String,
        require: true
    },
    time:{
        type: String,
        require: true
    },
    token:{
        type: String,
        require: true,
        unique: true,
    },
    device_info:{
        type: Object,
       default: {},
    }
}, {timestamps: true})

module.exports = model('loginInfo', user_login_schema)