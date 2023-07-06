import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import SimpleSchema from 'simpl-schema';
import User from '../models/users.js'; 
import Role from '../models/roles.js';
import Membership from '../models/membership.js';
import mongoose from 'mongoose';
import Joi from 'joi';
import bar from '../models/bar.js';
import helpers from '../utils/helpers.js';

const home = (req, res) => {
    res.send('Hello From Home');
}

const register = async (req, res) => {
    
    try {
        
        let role = req.body.role;


        let result = await Role.findOne({name: role});
        if(!result){
            return res.status(404).json({
                status: "Not Found",
                message: "Entered Role is not found",
                data : result
            })
        }
        req.body.role = result._id;
        
        let body = req.body;
        let userSchema = new SimpleSchema({
            username: {type: String , required: false},
            email: {type: String , required: false},
            password: {type: String , required: true},
        }).newContext();
        
        const userExist = await User.findOne({ $or: [{ email: body.email }, { username: body.username }] });
        if (userExist) {
            
            return res.status(422).json({
                status: "error",
                message: "A user with this username or email already exists.",
                data: null,
                trace: { username: body.username, email: body.email }
            });
        }
        
        if (!helper.validateUsername(body.username)) {
            return res.status(400).json({
                status: "error",
                message: "Username can only have lowercase letters, dots, underscores and numbers.",
                data: null,
            });
        }
        
        if (!helper.validateEmail(body.email)) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a valid email address.",
                data: null,
                trace: `Email Address: ${body.email} is not valid`
            });
        }
        if(req.files)
        {
            let file = req.files.profile_picture;
            let fileName = `public/profiles/${Date.now()}-${file.name.replace(/ /g, '-').toLowerCase()}`;
            file.mv(fileName, async (err) => {
                if (err) return res.status(400).json({ message: err.message });
            });
            fileName = fileName.replace("public", "");
            body.profile_picture = fileName;
        }

        if(body.password !== body.confirm_password){
            return res.json({
                status: 400,
                messsage: "Password not Matched"
            })
        }
        
        body.password = await bcrypt.hash(body.password, 10);
        // body.confirm_password = await bcrypt.hash(body.confirm_password, 10);
        
        
        new User(body).save().then(inserted => {
            inserted.verificationToken = jwt.sign({ id: inserted._id, username: inserted.username, role: inserted.role}, process.env.JWT_SECRET , {expiresIn : 3600});
            inserted.save();
            return res.json({
                status: "success",
                message: "User Added Successfully",
                data: inserted,
            });
        }).catch(error => {
            console.log(error)
            return res.status(500).json({
                status: "error",
                message: "An unexpected error occurred while proceeding your request.",
                data: null,
                trace: error.message
            });
        });
    } catch (error) {
        console.log(error)
        
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        });
    }
}
const login = async (req, res) => {
    try {
        let { username, password , fcm} = req.body;
        const loginSchema = new SimpleSchema({
            username: String,
            password: String
        }).newContext();
        
        if (!loginSchema.validate({ username, password })) {
            return res.status(400).json({
                status: "error",
                message: "Username or Password is missing.",
                data: null,
                trace: `{username: ${username}, password: ${password}}`
            });
        }
        
        let user = {};
        if (!helper.validateEmail(username)) {
            user = await User.findOne({ username }).lean();
        }
        else {
            user = await User.findOne({ email: username }).lean();
        }
        
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: `User: ${username} doesn't exists.`,
                data: null,
                trace: `{username: ${username}, password: ${password}}`
            });
        }

        // check if bar is not banned from the Admin

        if(!user.status) return res.status(403).json({
            status : 403,
            message : "Your Account is deactivated, please contact the Administration, to reactive the account",
            data : {}
        })


        const isPassword = await bcrypt.compare(password, user.password);
        if (isPassword) {
            
            // check user is paid, 
            
            const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
            delete user.password;
            delete user.verificationToken;
            delete user.fcm;
            user.verificationToken = token;
            user.fcm = fcm;

            // get bar info
            let bardetails   = await bar.findOne({_id : user.barInfo}).lean();
            user.barDetails = bardetails
// 
            User.updateOne({ _id: user._id }, { $set: { verificationToken: token, fcm: fcm } }).then(response => {
                return res.json({
                    status: "success",
                    message: `Login Successful! Logged in as ${username}`,
                    data: user
                })
            }).catch(err => {
                return res.status(500).json({
                    status: "error",
                    message: "An unexpected error occurred while proceeding your request.",
                    data: null,
                    trace: err.message
                })
            });
        }
        else {
            return res.status(400).json({
                status: "error",
                message: "Incorrect Password.",
                data: null,
                trace: `Password: ${password} is incorrect`
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        })
    }
}

const selectMembership = async (req,res) =>{
    try {
        let userId = req.user._id;
        let barID;
        // check if user is already Connected with a bar

        let checkBar = await bar.findOne({ owner : userId})
        barID = checkBar?checkBar: await new bar({
            owner : userId
        }).save()
        
        // create an account of Bar

        // let Bar = 
        // // Bar = await Bar.save()

        let result = await User.findByIdAndUpdate({_id : userId} , {$set:{membership:mongoose.Types.ObjectId(req.body.membership) , barInfo:barID._id}},{new:true});

        

        return res.status(200).json({
            status: "success",
            message: "Membership assigned to User Successfully",
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        })
    }
}

const cardDetail = async (req,res) =>{
    try {
        let userId = req.user._id;
        let { cardHolderName,cardNumber,exp_month,exp_year,CVCNumber,customerId,cardType } = req.body;
        let result = await User.findByIdAndUpdate({_id : userId} , {$set : {cardDetail : req.body}} , {new: true});
        return res.status(200).json({
            status: "success",
            message: "Card Details Saved",
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            message : "error",
            data: error.message
        })
    }
}

const update = async(req,res) =>
{
    let {_id} = req.user._id
    let {firstname,lastname,about,password,confirmPassword,dateofbirth,overviewReport,email_notification} = req.body;
    try
    {
        let schema = Joi.object({
            firstname : Joi.string(),
            lastname : Joi.string(),
            about : Joi.string(),
            password : Joi.string(),
            confirmPassword : Joi.string().required().valid(Joi.ref('password')).label("confirm password should match the password"),
            dateofbirth : Joi.string(),
            overviewReport : Joi.boolean(),
            email_notification : Joi.boolean(),
        })
        const { error, value } = schema.validate(req.body);
         if(error) return res.json({message : error.message })
        if(req.files)
        {
            let file = req.files.profile_picture;
            let fileName = `public/profiles/${Date.now()}-${file.name.replace(/ /g, '-').toLowerCase()}`;
            file.mv(fileName, async (err) => {
                if (err) return res.status(400).json({ message: err.message });
            });
            fileName = fileName.replace("public", "");
            req.body.profile_picture = fileName;
        }
        if(req.body.password)
        {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        let data = await User.findByIdAndUpdate({_id},{$set : req.body},{new:true});
        return res.json({
            message : "success",
            data
        })
       
        
    }
    catch(error)
    {
        return res.status(500).json({message : error.message , data : {} })
    }
}

const userByType = async(req,res) =>
{
    let checkRole = await helpers.getRole(req.params.type);
 
    try {
        let data = await User.find({role : checkRole._id}).select('username').lean();
        return res.status(200).json({

            status: 200,
            message: "success",
            data
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data
        })
    }

}
const forgetPassword = async(req,res) =>{
    try
    {
        // check if email exists in the system

        let user = await User.findOne({email : req.body.email})
        if(!user)  return res.status(404).json({ status : 404 , message : "Exist Does not Exist", data : {} })

        // retrun otp code and store it in the users table to maintain user History!

        let otp = Math.floor(1000 + Math.random() * 9000);

        // updating Otp in User

        await User.findByIdAndUpdate({
            _id : user._id
        },{$push: { "otp" : { code : otp,"isActive":true} } })


        return res.status(200).json({
            status : 200,
            message : "otp code has been sent to the provided email",
            data : {
                "otp" : otp
            }
        })
    

    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }

}
const verifyOtp = async(req,res) =>{
    let {email,otp} = req.body
    try
    {
        let user = await User.findOne({email : req.body.email})
        if(!user) return res.status(404).json({ status: 404 , message : "Email Does not Exists", data : {} })
        
        // check the otp 
        let checkOtp = await User.findOne({
            email, 
            "otp.code" : otp 
        })
        if(!checkOtp) return res.status(404).json({ status : 401 , message : "Invalid OTP" , data :{} })
        
        // expire the otp code

        // await User.findByIdAndUpdate({"otp.code" : otp},{$set :{"otp.$" : {"isActive" : false}}})



        return res.json({
            status : 200,
            message : "Verified",
            data : {}
        })
        

    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
    
}
const changePassword = async(req,res) =>{
    let {email,password,cpassword} = req.body;
    try
    {
        let user = await User.findOne({email : email})
        if(!user) return res.status(404).json({status : 404 , message : "", data: {}})

        password = await bcrypt.hash(req.body.password, 10);
        
        // update the password to the user profile

        let data = await User.findByIdAndUpdate({
            _id : user._id
        },{
            $set : { password : password }
        })

        return res.status(200).json({
            status : 200,
            message : "success",
            data

        })
       
    }
    catch(error)
    {
        return res.status(500).json({status : 500 , message : error.message, data: {}})
    }
}

// user dashboard Activities



const activities = async(req,res) =>{
    try
    {
        // set params for the Api
        let users = await User.find({}).lean();
        let activeUsers = await User.find({isActive : true}).lean();
        let blockedUsers = await User.find({isActive : false}).lean();
        return res.status(200).json({
            status:200,
            message : 'success',
            data : [
                {
                    total : users.length,
                    data : users
                },
                {
                    active : activeUsers.length,
                    data : activeUsers
                },
                {
                    blocked : blockedUsers.length,
                    data : blockedUsers
                },
            ]
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status:500,
            message : error.message,
            data : {}
        })
    }
}
export default{
    home,
    register,
    login,
    selectMembership,
    cardDetail,
    update,
    userByType,
    forgetPassword,
    verifyOtp,
    changePassword,
    activities
};