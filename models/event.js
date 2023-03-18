import mongoose, { Mongoose } from 'mongoose';

const event = new mongoose.Schema({
    name: {
        type: String,
        default : ''
    },
    picture: {
        type: String,
        default : ""
    },
    date: {
        type: Date,
        default : Date.now()
    },
    
    price: {
        type: Number,
        default : 0
    },
    hashtags:[
        {
            user:{
                type : mongoose.Schema.Types.ObjectId,
                ref :"hashtags",
                default : []
            },
        },
        {default:[]}        
    ],
  
    repeat : {
        type:Boolean,
        default : false
    },

    ticket : {
        type : mongoose.Types.ObjectId,
        ref : 'tickettype',
        default : null
    },
    
    active: {
        type: Boolean,
        default: 'true'
    },

    user : {
        type : mongoose.Types.ObjectId,
        ref : "users",
        default : null
    },
    dj:{
        
        type : mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default:null
        
    },
    
});
export default mongoose.model('events', event);
