import mongoose from 'mongoose';

const hashtags = new mongoose.Schema({
    name: {
        type: String
    }
});
export default mongoose.model('hashtags', hashtags);
