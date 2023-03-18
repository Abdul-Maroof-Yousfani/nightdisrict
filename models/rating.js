import mongoose from 'mongoose';

const rating = new mongoose.Schema({
    rating: {
        type: Number,
        default  : 0
    },
    comment:{
        type: String,
        default : ""
    }
});
export default mongoose.model('ratings', rating);
