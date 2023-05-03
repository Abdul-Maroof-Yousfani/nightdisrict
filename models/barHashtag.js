import mongoose from 'mongoose';

const barHashtag = new mongoose.Schema({
    name: {
        type: String
    }
});
export default mongoose.model('barHashtag', barHashtag);
