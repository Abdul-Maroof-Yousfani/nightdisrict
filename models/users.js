import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    firstname:{
        type: String
    },
    lastname:{
        type: String
    },
    about:{
        type: String
    },
    profile_picture:{
        type: String,
        default : ""
    },
    username: {
        type: String,
        required: [true, "Username is required"], 
    },
    password: {
        type: String,
        min: [8,"Password must be 8 characters"],
        required: true
    },
    dateofbirth: {
        type: Date,
    },
    email: {
        type: String,
    },
    provider_name: {
        type: String,
        required: false
    },
    provider_id: {
        type: String,
        required: false
    },
    verificationToken: {
        type: String,
        expires: '60',
    },
    role:{
        type: String
    },
    membership:{
        type : mongoose.Types.ObjectId,
        default : null
    },
    cardDetail:[{
        cardHolderName : {type: String},
        cardNumber : {type: Number,min: 12},
        exp_month : {type: String},
        exp_year : {type: String},
        CVCNumber : {type: Number, min:3},
        customerId : {type:String},
        cardType: {type: String},
        active: {type: Boolean , default: 'true'}
    }],
    paymentStatus:{
        type: String,
        default: "Paid"
    },
    barInfo:{
        type: mongoose.Types.ObjectId,
        ref : "bars",
        default : null
    },
    agree_checkbox:{
        type: Boolean,
        default: 'true'
    },
    currently_active_card  : {
        type : mongoose.Types.ObjectId,
        default : null
    },
    email_notification : {
        type : Boolean,
        default : false
    },
    overviewReport : {
        type : Boolean,
        default : false
    },
    status : {
        type : Number,
        default : 1
        //1 active, 2 delete, 4 inactive
    },
    otp:[{
        code : {
            type : String,
            default : ""
        },
        isActive : {
            type :Boolean,
            default : true
        }
    },
    {
        default : []
    }
    ]
});


usersSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  });

export default mongoose.model('users',usersSchema);