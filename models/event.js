import mongoose, { Mongoose } from 'mongoose';

const event = new mongoose.Schema({
    name: {
        type: String,
        default : ''
    },
    description: {
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
    enddate: {
        type: Date,
        default : Date.now()
    },
    
    price: {
        type: Number,
        default : 0
    },
    hashtags:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref :"hashtags",
            default : []
        },
        {default:[]}        
    ],
    stock : {
        type : Number,
        default : 0
    },
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
    bar : {
        type : mongoose.Types.ObjectId,
        ref : "bars",
        default : null
    },
    dj:{
        
        type : mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default:null
        
    },
    category : [
        {
            type : mongoose.Types.ObjectId,
            ref : 'menucategories'
        },
        {
            default : []
        }
    ],
    venue : {
        type :String,
        default : ""
    },

    sold: {
        type : Boolean,
        default : false
    },
    address : {
        type : String,
        default : ""
    },
    location:{
        type:{
            type:String,
            enum:['Point'],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            default : [0,0]
        },
    },
    
    
},
{
    timestamps :true
});

event.index({location:"2dsphere"});
export default mongoose.model('events', event);
