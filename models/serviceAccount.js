import mongoose, { Mongoose } from 'mongoose';

const serviceAccount = new mongoose.Schema({

    type : {
        type : String,
        default : ""
    },
    project_id : {
        type: String,
        default :""
    },
    private_key_id : {
        type: String,
        default :""
    },
    private_key : {
        type: String,
        default :""
    },
    client_email : {
        type: String,
        default :""
    },
    client_id : {
        type: String,
        default :""
    },
    auth_uri : {
        type: String,
        default :""
    },
    token_uri : {
        type: String,
        default :""
    },
    auth_provider_x509_cert_url : {
        type: String,
        default :""
    },
    client_x509_cert_url :{
        type : String,
        default : ""
    },
    universe_domain:{
        type : String,
        default : ""
    }
},
{
    timestamps :true
});
export default mongoose.model('serviceaccount', serviceAccount);
