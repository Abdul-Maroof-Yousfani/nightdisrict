import mongoose from 'mongoose';

const menu = new mongoose.Schema({
    barId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'bars',
        default : null
    },
    item : {
        type: mongoose.Schema.Types.ObjectId, ref: 'supermenus',
        default : null
    },
    variation : [
        {
            type :{
                type : mongoose.Schema.Types.ObjectId, ref: 'pourtypes',
                default : null
            },
            price : {
                type : Number,
                default : 0
            }
        }
    ]
    // name: {
    //     type: String
    // },
    // description: {
    //     type: [String]
    // },
    // category: {
    //     type: String
    // },
    // subCategory: {
    //     type: String
    // },
    // image:{
    //     type: String
    // },
    // galleryImages:[{
    //     path: {type: String}
    // }],
    // qtyPrice: {
    //     type: Number
    // },
    // shotPrice: {
    //     type: Number
    // },
    // rocksPrice: {
    //     type: Number
    // },
    // reviews: [{
    //     id: {type: String}
    // }],
    // tipOnItem: [{
    //     bartender: {type: String}
    // }]
});
export default mongoose.model('menu', menu);
