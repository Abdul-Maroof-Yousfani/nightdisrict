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
import users from '../models/users.js';
import menu from '../models/menu.js';
import reviews from '../models/reviews.js';
import order from '../models/order.js';
import superMenu from '../models/superMenu.js';
import payments from '../models/payments.js';

const home = (req, res) => {
    res.send('Hello From Home');
}

const social = async(req,res) =>{
    try
    {
        let schema = Joi.object({
            email : Joi.string(),
            username : Joi.string(),
            fcm : Joi.string(),
            role : Joi.string()
        })


        const { error, value } = schema.validate(req.body);
        if(error) return res.status(400).json({ status : 400,message : error.message })



        // checking Role of the User

        let result = await Role.findOne({name: req.body.role});

       
        let data = await  User.findOne({
            email : req.body.email,
            isActive : true
        }).lean()

        if(!data)
        {
            data = new User({
                email  : req.body.email,
                username  : req.body.username,
                password : "122",
                role : result._id,
                fcm : req.body.fcm
                
            })
            data = await data.save()
        }

        // update FCM TOKEN!

        const token = jwt.sign({ id: data._id, username: data.username }, process.env.JWT_SECRET);
        delete data.password;
        delete data.verificationToken;
        delete data.fcm;
        data.verificationToken = token;
        data.fcm = req.body.fcm;

        data = await User.findByIdAndUpdate({_id : data._id},{
            $set : {
                email : data.email,
                username : data.username,
                fcm : data.fcm,
                verificationToken : data.verificationToken
            }
        },{
            new:true
        }).lean()

        console.log(data);


        let myEvents = await helpers.getUserEvents(data._id);
        data.partiesAttended = myEvents.length?myEvents:[];


        // check user id

        let dataRole = await Role.findById({_id: data.role});

        // if user.role is matching the request comming from the login

        if(dataRole.name != req.body.role)
        {
            return res.status(403).json({ status : 403,message : "Only Customers are allowed to logged In!"})
        }
        


        return res.json({ status : 200, message : "success" , data })


        return res.status(200).json({
            status : 200,
            message : error.message,
            data : {}
        })

    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message
        })
    }
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
            address : {type : String, required : false},
            longitude : {type : String, required : false},
            latitude : {type : String, required : false}
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

        let location = {
            type : "Point",
            coordinates:[0,0]
        }

        if(body.longitude && body.latitude)
        {
            location = {
                type : "Point",
                coordinates:[body.longitude,body.latitude]
            }
            
        }
        body.location = location

      
        
        new User(body).save().then(inserted => {
            inserted.verificationToken = jwt.sign({ id: inserted._id, username: inserted.username, role: inserted.role}, process.env.JWT_SECRET , {expiresIn : 3600});
            inserted.save();
            return res.json({
                status: "success",
                message: "User Added Successfully",
                data: inserted,
            });
        }).catch(error => {
            return res.status(500).json({
                status: "error",
                message: "An unexpected error occurred while proceeding your request.",
                data: null,
                trace: error.message
            });
        });
    } catch (error) {
        
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
        let { username, password , fcm , role} = req.body;
        const loginSchema = new SimpleSchema({
            username: String,
            password: String,
            role : String,
            fcm  :String,
        }).newContext();
        
        if (!loginSchema.validate({ username, password,role,fcm })) {
            return res.status(400).json({
                status: "error",
                message: "Username or Password is missing.",
                data: null,
                trace: `{username: ${username}, password: ${password}}`
            });
        }
        
        let user = {};
        user = await  User.findOne({
        $or: [{ email: username }, { username: username }],
        active : true
          }).lean();
        


        if (!user) {
            return res.status(404).json({
                status: "error",
                message: `User: ${username} doesn't exists.`,
                data: null,
                trace: `{username: ${username}, password: ${password}}`
            });
        }
        // check role
        let roleCheck = await Role.findOne({name : req.body.role})

        // if(user.role.toString() != roleCheck._id.toString())
        // {
        //     return res.status(403).json({
        //         status : 403,
        //         message : "Only Customers are allowed to logged In!",
        //         data : {}
        //     })
        // }
        

        if(!user.status) return res.status(403).json({
            status : 403,
            message : "Your Account is deactivated, please contact the Administration, to reactive the account",
            data : {}
        })

        const isPassword = await bcrypt.compare(password, user.password);
        // console.log(isPassword);

        if (user) {
            
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

            // add user attended Parties in the Code

            if(user.barInfo)
            {
                user.todayOrder  = 0;
                user.todayAttendance  = 0;
                user.menuSales  = 0;
                user.drinkRating  = 0;
                user.eventRating  = 0;
            }


            let myEvents = await helpers.getUserEvents(user._id);
            user.partiesAttended = myEvents;

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
        console.log(error);
        console.log(error.message);
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
            confirmPassword : Joi.string().valid(Joi.ref('password')).label("confirm password should match the password"),
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

        // helpers.sendResetPasswordEmail(otp,req.body.email,"Abdul Maroof");
        helpers.sendResetPasswordMail(otp , user.email,(error,response) => {
            if (error) {return res.status(400).json({message:error.message})}
            result = {
                _id: result._id,
                email:result.email,
                code: code
            }
            return res.json({result})
        });

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
        console.log(error);
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
const profile = async(req,res) =>{
    let {_id} = req.user
    let {longitude,latitude} =  req.body;

    try
    {
        const schema = Joi.object({
            password: Joi.string(),
            phone: Joi.string(),
            longitude  : Joi.string(),
            address: Joi.string(),
            latitude: Joi.string(),
        });
        const { error, value } = schema.validate(req.body);

        if(error) return res.status(400).json({
              status: 400,
              message: error.message,
              data: {}
        })
        
        
    
        let data = await User.findById({
            _id : req.user._id
        })

    

        if(!data) return res.status(404).json({
            status : 404,
            message : "User not found",
            data  : {}
        })

        // checking if user has uploaded profile picture
        
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
        
        // update user password if added

        if(req.body.password)
        {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }


        // setup location

        let location = {
            type : "Point",
            coordinates:[0,0]
        }

        if(req.body.longitude && req.body.latitude)
        {
            location = {
                type : "Point",
                coordinates:[req.body.longitude,req.body.latitude]
            }
            
        }
        req.body.location = location

 
     

        data = await User.findByIdAndUpdate({
            _id
        },{$set: req.body},{
            new:true
        })

        return res.status(200).json({
            status : 200,
            message : "success",
            data 
        })


    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : []
        })
    }
}

const favourite = async(req,res) =>
{

    let { Bar , type , item , latitude , longitude } = req.body;
    let newDrinkdata = []
    try
    {
         //  add bar to the Favourites
        let data = await users.findById({
            _id : req.user._id
        })
   
        if(!data)  return res.status(404).json({
            status : 404,
            message : "user not found",
            data : {}
        })


        let bardata = await bar.findById({
            _id : Bar
        })
   
        if(!bardata)  return res.status(404).json({
            status : 404,
            message : "bar not found",
            data : {}
        })

        // get user detail

      

        if( type == "drink")
        {
         
             
            const index = data.favouriteDrinks.findIndex(favoriteBar => favoriteBar.bar.toString() === Bar &&  favoriteBar.item.toString() == item);

            if (index === -1) {
                // Bar is not in favorites, so add it
                data.favouriteDrinks.push({bar:Bar , item});
              } else {
                // Bar is in favorites, so remove it
                data.favouriteDrinks.splice(index, 1);
              }

            // let getElement = await superMenu.findById({
            //     _id : item
            // }).lean()
            // get nearby bars
            // let nearbybars = await helpers.nearbyBars(longitude,latitude);
            // nearbybars = await Promise.all(nearbybars.map( async (e) =>{
            //     let itemcheck = await menu.findOne({
            //         item : item,
            //         barId : e._id

            //     })
            //     if(itemcheck)
            //     {
            //         e.item = await helpers.getItemById(item,e._id)
            //         newDrinkdata.push(e.item);
            //     }
                
                
            // }))
            
            // getElement.nearbybars = newDrinkdata



            await data.save();

            let barinfo = await helpers.getUserById(req.user._id);

      
            return res.status(200).json({
                status : 200,
                message : "success",
                data : barinfo
            })
        
        }
        else if(type == "bar")
        {

            // check if already in Favourites ?

            const index = data.favouriteBars.findIndex(favoriteBar => favoriteBar.bar.toString() === Bar);

            if (index === -1) {
                // Bar is not in favorites, so add it
                data.favouriteBars.push({bar:Bar});
              } else {
                // Bar is in favorites, so remove it
                data.favouriteBars.splice(index, 1);
              }

              await data.save();

              let barinfo = await helpers.getUserById(req.user._id);

              return res.status(200).json({
                    status : 200,
                    message : "success",
                    data : barinfo
                })
            

            // await users.findByIdAndUpdate({_id : req.user._id},{
            //     $push: { "favouriteBars" : { Bar} } 
            // },{new:true})

            // await bar.findByIdAndUpdate({
            //     _id : Bar
            // },
            // {
            //     $push: { "followers" : { "user" : req.user._id } } 
            // })
        }

        
    }
    catch(error)
    {
        console.log(error)
        return res.status(200).json({
            status : 500,
            message :error.message,
            data  : {}
        })
    }
}

const favouritebars = async(req,res) =>{
    let {bar,type} = req.body;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; 
    let barData = []
    try
    {
        //  add bar to the Favourites
        let data = await users.findById({
            _id : req.user._id
        },{favouriteBars: 1})

        if(!data) return res.status(404).json({
            status : 404,
            message : "not found",
            data : {}
        })

        // const totalBars = data.favouriteBars.length;
        // const totalPages = Math.ceil(totalBars / pageSize);

        // const startIndex = (page - 1) * pageSize;
        // const endIndex = Math.min(startIndex + pageSize, totalBars);

        // data = data.favouriteBars.slice(startIndex, endIndex);
        let result = await helpers.paginate(data.favouriteBars,req.params.page,req.params.limit);

        
        data = await Promise.all(result.result.map( async (e) =>{
            let details =  await helpers.getBarData(e.bar)
            barData.push(details)

        }))
        
        return res.status(200).json({
            status : 200,
            message : "success",
            data  : barData,
            paginate : result.totalPages
            
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message :error.message,
            data  : {}
        })
    }
}
const favouriteDrinks = async(req,res) =>{
    let barData = []
    let newDrinkdata = []
    let {longitude,latitude} =  req.body;
    try
    {
        //  add bar to the Favourites
        let data = await users.findById({
            _id : req.user._id
        },{favouriteDrinks: 1}).lean()
     

        if(!data) return res.status(404).json({
            status : 404,
            message : "not found",
            data : {}
        })

        let result = await helpers.paginate(data.favouriteDrinks,req.query.page,req.query.limit);


      
        data.favouriteDrinks = await Promise.all(result.result.map( async (e) =>{

            // let barDetails = await superMenu.findById({_id : e.item}).lean()

        

            let getElement = await helpers.getItemById(e.item,e.bar)
          
            // get nearby bars
            let nearbybars = await helpers.nearbyBars(longitude,latitude);
            nearbybars = await Promise.all(nearbybars.map( async (newBarData) =>{
                
                let itemcheck = await menu.findOne({
                    item : e.item,
                    barId : newBarData._id

                })
                if(itemcheck)
                {
                    // check if bar has this item then get apply the method
                    console.log(itemcheck)
                    
                    e.item = await helpers.getItemById(e.item,newBarData._id)
                    newDrinkdata.push(e.item);
                }
                
                
            }))
            
            getElement.nearbybars = newDrinkdata

            barData.push(getElement)

        }))
        
        return res.status(200).json({
            status : 200,
            message : "success",
            data  : barData,
            paginate : result.totalPages
        })
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            status : 500,
            message :error.message,
            data  : {}
        })
    }
}

// adding reviews to the bar items


const review  = async(req,res) =>{
    let {item,variation,customer,rating,bar,message,Order} = req.body;
    let body = req.body;

    try
    {
        // check item, if item exists
        
        // get customer from the access token

   
        body.customer = req.user._id;

        // add dat to the req.body

        let checkMenu = await menu.findOne({
            item,
            barId : bar
        }).lean()

        // check review if already given

        let checkReview = await reviews.findOne({
            customer : req.user._id,
            item,
            bar
        })

 
        if(checkReview) return res.status(409).json({
            status : 409,
            message : "review already given",
        })

        


    

        // check menu





      


        // adding a review to  a drink

        let drink = new reviews(req.body);
        drink = await drink.save();

 


        // // getProductByID





        // if (newIndex === -1) {
        //     // Bar is not in favorites, so add it
        //     checkMenu.reviews.push({customer:req.user._id , review :  drink._id});
        // } 
        // else 
        // {
        //     // Bar is in favorites, so remove it
        //     checkMenu.reviews.splice(newIndex, 1);
        // }


        // checkMenu = await checkMenu.save();


        // update
        let newData = await menu.findOneAndUpdate({
            item,
            barId: bar
        },
        {
            $push : {
                "reviews" : {
                    customer : req.user._id,
                    review : drink._id
                },
                
            }
        },{
            new: true
        })

        // const index = data.favouriteDrinks.findIndex(favoriteBar => favoriteBar.bar.toString() === Bar &&  favoriteBar.item.toString() == item);

        //     if (index === -1) {
        //         // Bar is not in favorites, so add it
        //         data.favouriteDrinks.push({bar:Bar , item});
        //       } else {
        //         // Bar is in favorites, so remove it
        //         data.favouriteDrinks.splice(index, 1);
        //       }


        // get drink data

        drink = await reviews.findById({
            _id : drink._id
        }).lean()

        drink = await helpers.getBasicReview(drink)
        
        

        return res.status(200).json({
            status : 200,
            message : 'success',
            data : drink
        })
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const myOrders = async(req,res) =>
{
    try
    {
        let orders = await order.find({customer : req.user._id}).lean();
        orders = helpers.paginate(
            orders,
            req.query.page,
            req.query.limit
            
          );
      
        let Order = await Promise.all(orders.result.map( async (e) =>{
            // check order type it
            // check type of order
            return helpers.getOrderById(e);
        }))
        return res.status(200).json({
            status : 200,
            message : "success",
            data  : Order,
            pagination : orders.totalPages
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data  : []
        })
    }
    
}

const all = async(req,res) =>
{
    try
    {
 
        let data = await User.find({},{
            username : 1,email: 1, dateofbirth: 1
        }).lean()
        let result = await helpers.paginate(data,req.params.page,req.params.limit);

        let activities = [{
            "Total Members" : data.length
        },
        {
            "Total Active Members" : data.length
        },
        {
            "Total Blocked Members" : data.length
        }]

        // let totalMembers = data.length;
        // let totalActiveMembers = data.length;
        // let totalBlockedMembers = data.length;


        return res.status(200).json({
            status : 200,
            message : "success",
            data : {activities,activeMembers:result.result , blockedMembers : result.result},
            paginate : result.totalPages
        })
    }
    catch(error)
    {

    }
}


const orders = async(req,res) =>
{
    try
    {
 
        let data = await User.find({},{
            username : 1,email: 1, dateofbirth: 1
        }).lean()
        let result = await helpers.paginate(data,req.params.page,req.params.limit);

        let activities = [{
            "Total Members" : data.length
        },
        {
            "Total Active Members" : data.length
        },
        {
            "Total Blocked Members" : data.length
        }]

        // let totalMembers = data.length;
        // let totalActiveMembers = data.length;
        // let totalBlockedMembers = data.length;


        return res.status(200).json({
            status : 200,
            message : "success",
            data : {activities,activeMembers:result.result , blockedMembers : result.result},
            paginate : result.totalPages
        })
    }
    catch(error)
    {

    }
}


const details = async(req,res) =>
{
    let {id} =  req.params;
    try
    {
        let data = await helpers.getUserById({
            _id  : id
        })
        let getOrders = await order.find({
            customer : id
        }).lean()
        let results = await helpers.paginate(getOrders,req.query.page,req.query.limit)
        let newOrders = await Promise.all(results.result.map(  async (e) =>{
            e  = await helpers.getOrderById(e)
            e.transaction = await payments.findOne({
                order  : e._id 
            })
            return e;
        }))
        return res.json({
            status : 200,
            message : "success",
            data : newOrders,
            paginate : results.totalPages
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

const setNotification = async(req,res)=>{
    try {
        const result = await users.findByIdAndUpdate({_id: req.user._id},{$set: {notification: req.body.notification}}, {new: true});
        return res.json({
            status : 200,
            message : "success",
            data : result
        })
    } catch (error) {
        return res.status(500).json({
            status : 500,
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
    activities,
    profile,
    favourite,
    favouritebars,
    favouriteDrinks,
    social,
    review,
    myOrders,
    all,
    orders,
    details,
    setNotification
};