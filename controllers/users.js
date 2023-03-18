import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import SimpleSchema from 'simpl-schema';
import User from '../models/users.js'; 
import Role from '../models/roles.js';
import Membership from '../models/membership.js';

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
        
        const isPassword = await bcrypt.compare(password, user.password);
        if (isPassword) {
            
            // check user is paid, 
            
            const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
            delete user.password;
            delete user.verificationToken;
            delete user.fcm;
            user.verificationToken = token;
            user.fcm = fcm;
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
        let result = await User.findByIdAndUpdate({userId} , {$set:{membership:req.body.membership}});
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

export default{
    home,
    register,
    login,
    selectMembership,
    cardDetail
};