import mongoose from 'mongoose';

const bar = new mongoose.Schema({
    upload_logo: {
        type: String,
        default : ""
    },
    upload_coverPhoto: {
        type: String,
        default : ""
    },
    color: {
        type: String,
        default : ""
    },
    barName: {
        type: String,
        default : ""
    },
    address: {
        type: String,
        default : ""
    },
    city: {
        type: String,
        default : ""
    },
    state: {
        type: String,
        default : ""
    },
    phone: {
        type: Number,
        default : 0
    },
    url: {
        type: String,
        default : ""
    },
    upload_document: {
        type: String,
        default : ""
    },
    barHours: [{
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String }
    },
    {
        default : []
    }

    ],
    followers : [
        {
            type : mongoose.Types.ObjectId,
            ref : "users",
            default : null

        }
    ],
    barHashtag: [
        {
            type: String
        },
        {
            default : []
        }
    ],
    ownerAge: {
        type: Number,
        default : 0
    },
    drinkSize: {
        type: Number,
        default : 0
    },
    drinkShot: {
        type: Number,
        default : 0
    },
    rock_neat: {
        type: Number,
        default : 0
    },
    active: {
        type: Boolean,
        default: 'true'
    },
    events: [
        {
            type: String,
            ref: 'event'
        },
        {
            default : []
        }
    ],
    owner : {
        type :mongoose.Types.ObjectId,
        ref : "bars",
        default : null
    },
    rating:{
        type : Number,
        default : 5
    },
    fbUrl:{
        type : String,
        default : ''
    },
    instagramUrl:{
        type : String,
        default : ''
    },
    twitterUrl:{
        type : String,
        default : ''
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
    geometry: {
        type: {
          type: String,
          enum: ['Polygon'],
        },
        coordinates: {
          type: [[[Number]]], // Coordinates of the polygon
        },
        default : []
      },

},
{   
    timestamps : true
});

bar.index({location:"2dsphere"});
export default mongoose.model('bar', bar);
