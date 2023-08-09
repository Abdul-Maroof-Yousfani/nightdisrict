import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import roles from '../models/roles.js';
import subscriptiontype from '../models/subscriptiontype.js';
import User from '../models/users.js';
import bar from '../models/bar.js';
import event from '../models/event.js';
import menuCategory from '../models/menuCategory.js';
import menu from '../models/menu.js';
import superMenu from '../models/superMenu.js';
import promotion from '../models/promotion.js';
import hashtag from '../models/hashtag.js';
function validateUsername(username) {
    /* 
      Usernames can only have: 
      - Lowercase Letters (a-z) 
      - Numbers (0-9)
      - Dots (.)
      - Underscores (_)
    */
    const res = /^[a-z0-9_\.]+$/.exec(username);
    const valid = !!res;
    return valid;
}

const fileValidation = (file, allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i) =>{
    let allow = false;
    try
    {   
        
        if(allowedExtensions.exec(file.name)){
            allow = true;
        }
        return allow;
    }
    catch(error)
    {
        return false;
    }
}
const checkPaymentType = async(code) =>
{
    try
    {
        let payment = await subscriptiontype.findOne({code : code});
        return payment;
    }
    catch(error)
    {
        return res.status(500).json({
          message : "",
          data : {}
        })
    } 
}
function validateEmail(email) {
    let pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(email);
}

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ");
        req.token = bearerToken[1];
        next();
    } else {
        res.status(401).json({ message: "Please use a sign-in token to access this request.", data: null });
    }
}

async function verifyAdminAuthToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined") {
        req.token = bearerHeader.split(" ")[1];

        // Validating Token
        let invalidToken = false;
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                invalidToken = true;
                return res.status(401).json({ status: "error", message: "Malformed sign-in token! Please use a valid sign-in token to continue.", data: null });
            }
        });
        if (invalidToken) return;

        // Checking and Adding user to req object.
        req.user = await admin.findOne({ verificationToken: req.token }).lean();
        if (!req.user) return res.status(404).json({
            status: "error",
            message: "Invalid sign-in token! Please log-in again to continue.",
            data: null
        });
        // req.user.preferences = await preferredTags(req.user._id);
        // req.user.followedChannels = await followedChannels(req.user._id);
        next();
    } else {
        return res.status(401).json({ status: "error", message: "Please use a sign-in token to access this request.", data: null });
    }
}

async function verifyAuthToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined") {
        req.token = bearerHeader.split(" ")[1];

        // Validating Token
        let invalidToken = false;
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                invalidToken = true;
                return res.status(401).json({ status: "error", message: "Malformed sign-in token! Please use a valid sign-in token to continue.", data: null });
            }
        });
        if (invalidToken) return;

        // Checking and Adding user to req object.
        req.user = await User.findOne({ verificationToken: req.token }).lean();
        if (!req.user) return res.status(403).json({
            status: "error",
            message: "Invalid sign-in token! Please log-in again to continue.",
            data: null
        });
        // req.user.preferences = await preferredTags(req.user._id);
        // req.user.followedChannels = await followedChannels(req.user._id);
        next();
    } else {
        return res.status(401).json({ status: "error", message: "Please use a sign-in token to access this request.", data: null });
    }
}

// async function preferredTags(userid) {
//     if (!userid) throw new Error(`Expected a userid but got ${typeof userid}`);
//     const views = await Views.find({ userid }, { userid: 0, videoId: 0, created: 0, _id: 0 }).lean();
//     return Array.from(new Set(_.pluck(views, 'videoTags').flat(1)));
// }

// async function followedChannels(userid) {
//     if (!userid) throw new Error(`Expected a userid but got ${typeof userid}`);
//     const followedChannels = await Follows.find({ userid }, { _id: 0, userid: 0, created: 0 }).lean();
//     return Array.from(new Set(_.pluck(followedChannels, 'following')));
// }

function regexSearch(query) {
    let search = '.*' + query + '.*';
    let value = new RegExp(["^", search, "$"].join(""), "i");
    return value;
}

function distance(lat1, lon1, lat2, lon2, unit) {

    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}

function sort(arr, property, sortType) {
    if (!Array.isArray(arr)) throw new Error(`Expected array in arr but got ${typeof arr}`);
    if (typeof property !== "string") throw new Error(`Expected string in property but got ${typeof property}`);
    if (typeof sortType !== "number") throw new Error(`Expected number in sortType but got ${typeof sortType}`);
    let result = _.sortBy(arr, property);
    if (sortType < 0) result = result.reverse();
    return result;
}

function filterCoordinates(poslat, poslng, range_in_meter, data) {
    var cord = [];
    for (var i = 0; i < data.length; i++) {
        if (distance(poslat, poslng, data[i].location.lat, data[i].location.lng, "K") <= range_in_meter) {
            cord.push(data[i]._id);
        }
    }
    return cord;
}

function sendResetPasswordEmail(num, email, name, callback) {
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    var mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: "Code for reset password",
        html: " Hi <strong>" + `${name}` + "</strong> <br /><br /> Your verification code is <strong>" + `${num}` + "</strong>. <br /> Enter this code in our app to reset your password.",
    };
    return transporter.sendMail(mailOptions, callback)
}

function notificationHelper(fcmToken, title, body, data, payloadData, daterId) {
    var fcm = new FCM(process.env.FCM_KEY);
    var message = {
        to: fcmToken,
        collapse_key: 'your_collapse_key',

        notification: {
            title: title,
            body: body
        },
        data: data
    };

    notifications.create({
        daterId: daterId,
        title: title,
        body: body,
        data: payloadData,
        readStatus: 0
    });

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

function paginate(records, page = 1, limit = 10) {
    page = isNaN(parseInt(page)) ? 1 : parseInt(page),
        limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit);

    const results = {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    if (endIndex < records.length) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }
    results.totalPages = {
        page: Math.ceil(records.length / limit),
        limit: limit,
        totalRecords: records.length
    };

    results.result = records.slice(startIndex, endIndex);
    return results;
}

async function showMacroMonitor(userid) {
    try {
        const user = await User.findById(userid).lean();
        const ateFood = await Food.find({ userid, createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() } }).lean();
        let fats = 0, proteins = 0, carbs = 0, calories = 0, water = 0;
        ateFood.forEach(foodList => {
            foodList.foodItems.forEach(foodItem => {
                if (foodItem.type !== "Water") {
                    fats += foodItem.fat;
                    proteins += foodItem.protein;
                    carbs += foodItem.carbs;
                    calories += foodItem.calories;
                }
                else {
                    water++;
                }
            })
        });

        return {
            fats,
            proteins,
            carbs,
            calories,
            water,
            caloriesGoal: user.caloriesGoal
        }
    } catch (err) {
        console.log(err);
    }
}
const getRole = async(role) =>
{
    let data = await roles.findOne({name : role}).select('name');
    return data
}

const checkRole = async(id) =>{

    try
    {
        let data =  await roles.findOne({_id:id}).select('name');
        return data
    }
    catch(error)
    {
        return error.message
    }

}

const nearbyBars = async(longitude,latitude) =>{
    try
    {   
        let data  = await bar.find({location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 10000
            }
        }}).select({ "barName": 1 , "location" : 1 , "upload_logo" : 1 ,  "address" : 1});
        return data

    }
    catch(error)
    {
        console.log(error);
    }

}


// Events

const getHastags = async(_id) =>{
    try
    {
        let hastag = await hashtag.findOne({_id});
        return hastag
    }
    catch(error)
    {
        return error
    }
}

// const getEventById = async(event) =>{

//     try
//     {   

//     }
//     catch(error)
//     {

//     }

// }


// Writing Code Related To Menu and Categories Setup

// get item details

const getItemById = async(id) => {
    try
    {
        let data = await superMenu.findOne({
            _id : id
        }).lean()
        // update category and Subcateogry
        if(data.category)
        {
            data.category = await menuCategory.findOne({_id :data.category })
        }
        
        if(data.subCategory)
        {
            data.subCategory = await menuCategory.findOne({_id :data.subCategory })
        }
        
        console.log(data)
        return data
    }
    catch(error)
    {
        
        return error.message
    }
}

const getMenuByBarId = async(bar) =>{
    try
    {
        
        let data = await menuCategory.find({}).limit(4).lean();
        // get subcategories and items

        await Promise.all(data.map( async (e) =>{
            // add sub categories
            let sub = await menuCategory.find({parent : e._id}).lean()
            e.categories = sub
            if(sub.length)
            {
                
                e.categories = await Promise.all(e.categories.map( async (subCategory) =>{
                    let items = await menu.find({
                        subCategory : subCategory._id,
                        barId : bar
                    })

                    subCategory.items = items;

                    return subCategory
                    
                }))
            }

            return e
            

        }))


        return data;
        // data = await Promise.all(data.map( async (e) =>{
        //         console.log(e);
        //         retur
        // }))
        
    }
    catch(error)
    {

    }
}




const favouriteDrinks = async(bar) =>
{
    try
    {
        let data = await menu.find({}).limit(4);
        return data
    }
    catch(error)
    {
        return error
    }
}
const promotions = async(bar) => {
    try
    {
        let data = await promotion.find({
            bar : bar
        })
        return data;
    }
    catch(error)
    {
        return error;
    }
}

const getBarById = async(id,loggedInUser="") =>{
    let events = []
    let menus = []
    let favDrinks = [];
    let promos = [];
    try
    {
        // 
        let data = await bar.findById({_id : id}).lean()

        // get followers

        data.followers = []


        // get events
        events = await event.find({bar : data._id}).sort({ _id: -1 }).limit(4)
        data.events = events

        

        // get Menu

        menus = await getMenuByBarId(data._id)
        data.menus = menus
        // 

        // house of Favourites
        favDrinks =   await favouriteDrinks(data._id);
        data.favDrinks = favDrinks

        // promotions for the bar

        promos = await promotions(data._id);
        data.promotions = promos

      
        return data;
    }   
    catch(error)
    {
        return error;
    }
}


// Ending Code for Menu

export default {
    validateUsername,
    validateEmail,
    verifyToken,
    verifyAuthToken,
    regexSearch,
    filterCoordinates,
    sendResetPasswordEmail,
    notificationHelper,
    paginate,
    sort,
    showMacroMonitor,
    verifyAdminAuthToken,
    checkPaymentType,
    getRole,
    nearbyBars,
    checkRole,
    fileValidation,
    getBarById,
    getHastags,
    getItemById

}

