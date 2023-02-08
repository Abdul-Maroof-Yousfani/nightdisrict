import mongoose from 'mongoose';

const bar = new mongoose.Schema({
    upload_logo: {
        type: String
    },
    upload_coverPhoto: {
        type: String
    },
    color: {
        type: String
    },
    barName: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    phone: {
        type: Number
    },
    url: {
        type: String
    },
    upload_document: {
        type: String
    },
    barHours: [{
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String }
    }],
    barHashtag: [
        {
            type: String
        }
    ],
    ownerAge: {
        type: Number
    },
    drinkSize: {
        type: Number
    },
    drinkShot: {
        type: Number
    },
    rock_neat: {
        type: Number
    },
    active: {
        type: Boolean,
        default: 'true'
    },
    events: [
        {
            type: String,
            ref: 'event'
        }
    ]
});
export default mongoose.model('bar', bar);
