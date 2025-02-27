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
import users from '../models/users.js';
import order from '../models/order.js';
import pourtype from '../models/pourtype.js';
import mongoose from 'mongoose';
import reviews from '../models/reviews.js';
import notification from '../models/notification.js';
import serviceAccount from "../config/nd.js";
import Admin from 'firebase-admin';
import ordersequence from '../models/ordersequence.js';
import moment from 'moment-timezone';
import attendance from '../models/attendance.js';



Admin.initializeApp({
    credential: Admin.credential.cert(serviceAccount)
});


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
        return res.status(200).json({
            status : 500,
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
        jwt.verify(req.token, process.env.JWT_SECRET,async (err, authData) => {

            if (err) {
                invalidToken = true;
                return res.status(401).json({ status: "error", message: "Malformed sign-in token! Please use a valid sign-in token to continue.", data: null });
            }else{
                req.user = await User.findOne({ username: authData.username }).lean();
                
                if (!req.user) return res.status(403).json({
                    status: "error",
                    message: "Invalid sign-in token! Please log-in again to continue.",
                    data: null
                });
                next();
            }
        });
        if (invalidToken) return;
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
        jwt.verify(req.token, process.env.JWT_SECRET,async (err, authData) => {

            if (err) {
                invalidToken = true;
                return res.status(401).json({ status: "error", message: "Malformed sign-in token! Please use a valid sign-in token to continue.", data: null });
            }else{
                req.user = await User.findOne({ username: authData.username }).lean();
                
                if (!req.user) return res.status(403).json({
                    status: "error",
                    message: "Invalid sign-in token! Please log-in again to continue.",
                    data: null
                });
                next();
            }
        });
        if (invalidToken) return;
        // Checking and Adding user to req object.
        // if (!req.isActive) return res.status(403).json({
        //     status: "error",
        //     message: "Your Account has been Deleted",
        //     data: null
        // });
        // req.user.preferences = await preferredTags(req.user._id);
        // req.user.followedChannels = await followedChannels(req.user._id);

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

const sendResetPasswordMail = (code,email,callback) => {
    let transportor = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWAORD
        }
    })
    let mailOption = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: "code for reset password",
        text: `${code}`
    }
    return transportor.sendMail(mailOption,callback)
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

// GET BAR DATA

// get best selling items

const bestSellingDrink = async() =>
{
    try
    {
        let data = await order.find({
            subscriptionType : "642a6f6e17dc8bc505021545"
        });
        const itemCounts = {};

        for (const order of data) {
        for (const itemEntry of order.items) {
            const itemName = itemEntry.item.toString(); // Convert to string for consistency
            if (itemCounts[itemName]) {
            itemCounts[itemName]++;
            } else {
            itemCounts[itemName] = 1;
            }
        }
        }

        return itemCounts;

    }
    catch(error)
    {
        console.error("Error while calculating best selling items:", error);
        return {}
    }
}


const getBarData = async(id) => {
    try
    {
        let data = await bar.findById(id).select({ "barName": 1 , "location" : 1 , "upload_logo" : 1 ,  "address" : 1, "rating": 1 , "geometry" : 1 , "active" : 1 , "city" : 1 , "country" : 1  , state :1}).lean();
        return data;
    }
    catch(error)
    {
        return error;
    }
}

const nearbyBars = async(longitude,latitude) =>{
    try
    {   
        let data  = await bar.find({
            active : true,
            location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 200000
            }
        }}).limit(15).sort({createdAt:-1}).select({ "barName": 1 , "location" : 1 , "upload_logo" : 1 ,  "address" : 1, "rating" :1 , 'geometry' : 1 , createdAt:1 }).lean();

        
        return data

    }
    catch(error)
    {
        console.log(error);
    }

}

const nearbyEvents = async(longitude,latitude) =>{
    try
    {   
        let data  = await event.find({date: {$gt: new Date()},location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 200000
            }
        }}).limit(10).lean();
        data = await Promise.all(data.map( async (e) =>{
            return getEventById(e._id);
            
        }))
        return data

    }
    catch(error)
    {
        console.log(error);
    }

}


const getBarMenus = async(bar,category = '',subCategory = '') =>
{
    try
    {
        // update user data

        const filters = [];

        filters.push({ bar });

        if (category) {
            filters.category = category;
        }
        if (subCategory) {
            filters.subCategory = subCategory;
        }

        let results = await menu.find({
            $and: filters
        });
        

        return results;
    }
    catch(error)
    {
        console.log(error);
        return error;
    }
}


// const getBarFollowers = async(bar) =>
// {
//     try
//     {
//         let data = awa

//     }
//     catch(error)
//     {

//     }
// }

// User iformation


const getBasicUserData = async(id) =>
{
    let data = await users.findById({_id : id}).select({profile_picture : 1,username :1, state:1})
    return data;
}

const getUserById = async(id) => {
    try
    {
        let data = await users.findById({_id : id})
        return data;

    }
    catch(error)
    {
        return error.message
    }
}

// user attended parties

const getUserEvents = async(id) =>{
    try
    {
        let myEvents = [];
        let data = await order.find({
            customer : id,
            subscriptionType : mongoose.Types.ObjectId('642a7e9917dc8bc505021552')
        }).limit(5)
        await Promise.all(data.map( async (e) =>{

            // 
            await Promise.all(e.items.map( async (party) =>{

                let eventData = await getEventById(party.item);
                if(eventData)
                {
                    myEvents.push(eventData)
                }

            }))

        }))
        

        return myEvents;
        
    }
    catch(error)
    {
        return error.message
    }
}


// promotion

const getPromotionById = async(data,bar='') =>
{
    try
    {
        // check item category

        if(data.category)
        {
            let category = await menuCategory.findById({
                _id : data.category
            })
            data.category = category.name
        }
        data.bar = await getBarData(data.bar)

        data.menu = await Promise.all(data.menu.map( async (e) =>{
            return await getItemById(e.item,bar)
        }))
   
        
        return data;
    }
    catch(error)
    {
        console.log(error);
        return;
    }
}

const nearbyPromotion = async(longitude,latitude,bar='') =>{
    try
    {   
        let data  = await promotion.find({location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 200000
            }
        }}).lean();
        data = await Promise.all(data.map( async (e) =>{
            return getPromotionById(e,bar);
        }))
        return data

    }
    catch(error)
    {
        console.log(error);
    }

}

// end Promotion
// Events


const getHastags = async(_id) =>{
    try
    {
        return await hashtag.findOne({_id});
    }
    catch(error)
    {
        return error
    }
}


// Order Type

const orderType = async(id) =>
{
    try
    {
        let data = await subscriptiontype.findById({_id : id}).lean();
        return data.code;
    }
    catch(error)
    {
        return error.message;
    }
}


// customer reviews on any item

const getBasicReview = async(review) =>
{
    try
    {
        review.customer = await getBasicUserData(review.customer);
        delete review.Order;
        delete review.variation;
        delete review.bar;
        delete review.type;
        delete review.item;
        delete review.review;

        return review;
    }
    catch(error)
    {
        return error.message
    }
}

const getReviewById = async(id) =>
{
    try
    {
        let drink = await reviews.findById({
            _id : id
        }).lean()


        // await menu.findOneAndUpdate({
        //     item : drink.item
        // },{
        //     $push: { "reviews" : { "customer" : drink.item , "review" : drink._id } } 
        // },{
        //     new : true
        // }).lean()

        // update the response
        
        // drink.item = await getItemById(drink.item,drink.bar,drink.variation)
        // console.log(drink.item);
        // return;
        // get order data
        let orderDetail = await order.findById({
            _id : drink.Order
        }).lean()
        drink.Order = await getOrderById(orderDetail)
        // drink.bar = await getBarData(drink.bar)
        // drink.customer = await getUserById(drink.customer)

        return drink;
    }
    catch(error)
    {
        console.log(error)
        return error.message;
    }
}


// ending customer Reviews


// Order items only




const getItems = async(order) =>
{
    try
    {
        let orders = [];
       
        await Promise.all(order.items.map( async (e) =>{
            orders = await getItemById(e.item,order.bar,e.variant);
       }))
      

        return orders;

    }
    catch(error)
    {
        return error
    }   
}

const getSocketOrders = async() =>
{
    try
    {
            let newOrder = []
            let totalOrders = []
            let completed = []
            let delivered = []
            let preparing = []
            try
            {
                let orders = await order.find({}).lean()
                await Promise.all(orders.map(async(e) =>{
                    let orderstatus = await helpers.getOrderById(e);
                    console.log("Order Statu")

                    console.log(orderstatus);
                    if(orderstatus.orderStatus == 'new')
                    {
                        console.log(orderstatus.orderStatus)
                        newOrder.push(orderstatus)
                    }
                    if(orderstatus.orderStatus == 'preparing')
                    {
                        preparing.push(orderstatus)
                    }
                    if(orderstatus.orderStatus == 'completed')
                    {
                        completed.push(orderstatus)
                    }
                    if(orderstatus.orderStatus == 'delivered')
                    {
                        delivered.push(orderstatus)
                    }
                }))
                let data = {newOrder:newOrder,preparing : preparing,completed:completed,delivered:delivered} 
                return data;
            }
            catch(error)
            {
                return error.messgae;
            } 
    }
    catch(error)
    {
        return error.message
    }
}

const getOrderById = async(data) => {
    try
    {
        // let data = await order.findById(id).lean();

        data.subscriptionType = await orderType(data.subscriptionType);
        data.bar = await getBarData(data.bar)
        data.customer = await getUserById(data.customer);


    

        // adding Review to Root of the Order
        let orderReviews = await reviews.findOne({
            Order : data._id
        }).lean();
        if(orderReviews)
        {
            data.review = await getBasicReview(orderReviews)
        }
        else
        {
            data.review = null
        }

        
        // get items details in order

        data.items = await Promise.all(data.items.map(async(e) =>{
            e.orderedMixtures = [];
            if(data.subscriptionType == 'buy_ticket')
            {
                return await getEventById(e.item)
            }
            else if(data.subscriptionType == 'buy_drink')
            {
                let orderData = await getItemById(e.item,data.bar,e.variant,e.qty,data._id)
                orderData.orderedMixtures = e.mixers
                return orderData;
            }
            else if(data.subscriptionType == 'promotion')
            {
    
                let promotionData = await promotion.findById({
                    _id : e.item
                }).lean()
                return await getPromotionById(promotionData,data.bar)
            }
            

        }))

        return data;
    }
    catch(error)
    {
       return error;
    }
}

const getEventById = async(id) =>{

    try
    {   
        let data = await event.findById({
            _id : id
        }).lean()
        data.hashtags  = await Promise.all(data.hashtags.map( async (e) =>{
            
            let data = await getHastags(e)
            return  data?data:[]
            
        }))
        // data.participants  = await Promise.all(data.participants.map( async (e) =>{
            
        //     let data = await getUserById(e.user)
        //     return  data?data:[]
            
        // }))
        // get dj

        data.participants = [];
        // get attendances
        let attendances = await attendance.find({
            event : id
        }).select({customer: 1})
        data.participants = await Promise.all(attendances.map( async (e) =>{
            return await getUserById(e.customer)
        }))


        data.dj = {}

        // get bar details

        data.bar = await getBarData(data.bar)

        return data;

    }
    catch(error)
    {
        return error.message;
    }

}


// Writing Code Related To Menu and Categories Setup

// get item details


const createMenu = async(data) =>
{
    try
    {

    }
    catch(error)
    {

    }
}

const findCategory = async(category) =>
{
    try
    {
        let data = await menuCategory.findOne({
            name : category
        })
        return data;
    }
    catch(error)
    {
        return error.message
    }
}

const createCategory = async(data) =>
{
    try
    {   
        // check if category already exists
        let checkCat = await findCategory(data.colE)
        if(checkCat)
        {
            console.log(checkCat)
            return;
        }
        let subcategories = []
        let category = checkCat?checkCat._id:""
        if(!checkCat)
        {   
            // create a new Category
            let categoryData = new menuCategory({
                name : data.colE
            })
            categoryData = await categoryData.save();  
            category = categoryData._id;
        }
        

        // create child Categories

        let checkChildCategory1 = await findCategory(data.colG)
        if(!checkChildCategory1)
        {
            let subCategory1 = new menuCategory({
                name : data.colE,
                parent : category
            })
            subCategory1 = await subCategory1.save();  
            subcategories.push(subCategory1._id)
        }
        let checkChildCategory2 = await findCategory(data.colI)
        if(!checkChildCategory2)
        {
            let subCategory2 = new menuCategory({
                name : data.colI,
                parent : category
            })
            subCategory2 = await subCategory2.save();  
            subcategories.push(subCategory2._id)
        }

        console.log(`category ${category}`);
        console.log(`subcategories ${subcategories}`);
        return 
     
    }
    catch(error)
    {
        console.log(error);
        return error.message
    }
}

const getMixers = async(bar) =>
{
    try
    {
        let data = await menu.find({
            category :  "6554af01295c67c81fb6ceeb",
            barId : bar
        }).select({item:1 , variation : 1}).limit(10).lean()
        data = await Promise.all(data.map(async(e) =>{

            let itemDat = await superMenu.findById({
                _id : e.item
            }).select({
                price : 1,
                menu_name  :1,
                description : 1,
                
            }).lean()
            e.superItem = e.item;
            e.price = e.variation[0].price;
            e.name = itemDat.menu_name;
            e.description = itemDat.description;

            delete e.item
            delete e.variation


            return e;
        }))
        return data
    }
    catch(error)
    {
        return error.message
    }
}


const getItemById2 =  async(id) =>
{
    try
    {   
        let data = await superMenu.findById({
            _id : id
        });
        return data;
    }
    catch(error)
    {

    }
}

const getPromotionItems = async(bar,item) =>
{
    try
    {

        const currentTime = new Date();

        let data = await promotion.findOne({
            from: { $lte: currentTime },
            to: { $gte: currentTime },
            'menu.item': item,
            bar
          }) 


        return data?data.discount : 0
    }
    catch(error)
    {
        console.log(error);
        return 0

    }
}

const  getItemById = async(id,bar,bought='',totalQuantity = 0,orderId='') => {
    try
    {

        let data = await menu.findOne({
            item : id,
            barId : bar
        }).select({favDrinks :0}).lean()

        // check if item is in the Discount List

        data.discount = await getPromotionItems(bar,id)


        data.orderedMixtures = []

        data.superItem = id

        // check if review is given to the specific item
        data.review = null;
        if(orderId)
        {
            let reviewItem = await reviews.findOne({
                Order : orderId,
                item : id,
                variation : bought,
                bar : bar

            }).lean()
            if(reviewItem)
            {
                data.review = await getBasicReview(reviewItem);

            }
        
        }
        

        if(data.reviews)
        {
            data.reviews = await Promise.all(data.reviews.map( async (e) =>
            {
                let newReview = await reviews.findById({
                    _id : e.review
                }).lean()
                return await getBasicReview(newReview);
            }))
        }
        else
        {
            data.reviews = []
        }

 
      
      
       
        // add reviews to the item

        // if(data.reviews)

        // get item from super categories

        data.min = data.variation[0].price;
        data.max = data.variation[data.variation.length -1].price;
        data.barDetail = await getBarData(bar);
        data.mixers = [];
        data.boughtMixers;

           // // update category and Subcateogry
        if(data.category)
        {
            let category = await menuCategory.findOne({_id :data.category })
            data.category = category


            if(category.name == 'Spirits')
            {
                console.log(bar);
                data.mixers = await getMixers(bar);
                console.log(data.mixers);
            }

        }
        
        if(data.subCategory)
        {
            let subCategory = await menuCategory.findOne({_id :data.subCategory })
            data.subCategory = subCategory
        }

        // update categories

        let categories = [];
        categories = await Promise.all(data.categories.map(async(cat) =>{
            return await menuCategory.findById({ _id :cat.category });
        }))
        data.categories = categories;
    

        data.item = await superMenu.findById({
            _id : data.item
        })
        if(!data.item)
        {
            console.log(id);
        }
        // data.name = data.item.menu_name
        // data.description = data.item.menu_name
        // data.description = data.item.description
        data.pictures = data.item.pictures

        data.buy = bought
        data.totalQuantity = totalQuantity

        
        delete data.item;
        
        

        data.variation = await Promise.all(data.variation.map(async(e) =>{
            let itemTypes = await pourtype.findById({_id : e.variant}).lean()
            itemTypes.price = e.price
            return itemTypes;
        }))


     
        return data;
        
     
    }
    catch(error)
    {
        console.log(error);
        return error.message
    }
}

const  getSuperItem = async(id) => {
    try
    {

        let data = await superMenu.findOne({
            _id : id
        }).select({favDrinks :0}).lean()

        // check if item is in the Discount List

        // data.discount = await getPromotionItems(bar,id)
        // data.orderedMixtures = []

        // data.superItem = data._id
        // if(data.reviews)
        // {
        //     data.reviews = await Promise.all(data.reviews.map( async (e) =>
        //     {
        //         let newReview = await reviews.findById({
        //             _id : e.review
        //         }).lean()
        //         return await getBasicReview(newReview);
        //     }))
        // }
        // else
        // {
        //     data.reviews = []
        // }

 
      
      
       
        // add reviews to the item

        // if(data.reviews)

        // get item from super categories

        // data.min = 0;
        // data.max = 0;
        // data.barDetail = null
        // data.mixers = [];
        // data.boughtMixers;

        //    // // update category and Subcateogry
        // if(data.category)
        // {
        //     let category = await menuCategory.findOne({_id :data.category })
        //     data.category = category

        //     if(category.name == 'Beer')
        //     {
        //         data.mixers = await getMixers(bar);
        //     }

        // }

        // if(data.subCategory)
        // {
        //     let subCategory = await menuCategory.findOne({_id :data.subCategory })
        //     data.subCategory = subCategory
        // }
        delete data.subCategory;
        delete data.category;
        // update categories

        let categories = [];
        if(!data.categories)
        {
            console.log(data.categories);
        }
        // categories = await Promise.all(data.categories.map(async(cat) =>{
        //     return await menuCategory.findById({ _id :cat });
        // }))
        data.categories = categories;

        let subCategories = [];
        let subData = [];
        // subCategories = await Promise.all(data.subCategories.map(async(cat) =>{

        //     if(cat)
        //     {
        //         subData.push(await menuCategory.findById({ _id :cat }));
        //     }
        //     return cat;
            
        // }))
        data.subCategories = subData

    

        // // data.item = await superMenu.findById({
        // //     _id : data.item
        // // })
        // // if(!data.item)
        // // {
        // //     console.log(id);
        // // }
        // // data.name = data.item.menu_name
        // // data.description = data.item.menu_name
        // // data.description = data.item.description
        // // data.pictures = data.item.pictures

        // // data.buy = bought
        // // data.totalQuantity = totalQuantity

        
        // delete data.item;
        
        

        // data.variation = await Promise.all(data.variation.map(async(e) =>{
        //     let itemTypes = await pourtype.findById({_id : e.variant}).lean()
        //     itemTypes.price = e.price
        //     return itemTypes;
        // }))


     
        return data;
        
     
    }
    catch(error)
    {
        console.log(error);
        return error.message
    }
}

const getMenuByBarId = async(bar,limit=1,page=1) =>{
    try
    {
        // get data based on bar

        let data = await menu.find({
            barId : bar ,
            onSale : true
        }).limit(10).lean();

        data = await Promise.all(data.map( async (e) =>{
            return await getItemById(e.item,bar)
        }))



        // console.log(data);

        // data = await menuCategory.find({}).limit(4).lean();
        // get subcategories and items

        // await Promise.all(data.map( async (e) =>{
        //     // add sub categories
        //     let sub = await menuCategory.find({parent : e._id}).lean()
        //     e.categories = sub
        //     if(sub.length)
        //     {
                
        //         e.categories = await Promise.all(e.categories.map( async (subCategory) =>{
        //             let items = await menu.find({
        //                 subCategory : subCategory._id,
        //                 barId : bar
        //             })

        //             subCategory.items = items;

        //             // get item Details

        //             subCategory.items = await Promise.all(subCategory.items.map( async (e) =>{
        //                 return await getItemById(e.item,bar)
        //             }))

        //             return subCategory
                    
        //         }))
        //     }

        //     return e
            

        // }))


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

const getItemByCategory = async(req,res) =>
{
    try
    {

    }
    catch(error)
    {

    }
}

const categoryWiseItems = async(id) =>
{
    try
    {
        let data = await menuCategory.find({parent:{$ne:null}}).limit(3).lean();
        data = await Promise.all(data.map( async (e) =>{
            e.items = await menu.find({
                barId : id,
                subCategory : e._id,
                onSale : true
             }).limit(3).sort({ menu_name: 1 }).lean()
             e.items = await Promise.all(e.items.map( async (it) =>{
                    return await getItemById(it.item,id);
             }))
            return e;
        }))
        return data;
    }
    catch(error)
    {
        return error.message
    }
}

const houseOffavourites = async(bar) =>
{
    try
    {
       let data = await menu.find({
        barId: bar,
        onSale : true
    }).limit(5).sort({ menu_name: 1 }).lean();
        data = await Promise.all(data.map( async (e) =>
        {
            return await getItemById(e.item,bar)
        }))

        return data;
    }
    catch(error)
    {
        return error.message
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
    let houseOfFav = []
    const currentTimeInEastern = moment().tz('America/New_York'); // Adjust the time zone accordingly
    try
    {
        // 
        let data = await bar.findById({_id : id}).select({"favDrinks" : 0}).lean()

       

        // get parent Categories

        let parent = await menuCategory.find({parent : null});

        data.categories = parent;

      
        // get followers

        // data.followers = []


        // get events
        events = await event.find({bar : data._id  , createdAt: { $gt: currentTimeInEastern } } ).sort({ _id: -1 }).limit(4).lean()
        events = await Promise.all(events.map(async(e) =>{
            return getEventById(e._id)
        }))
        
        data.events = events

        






        // house of Favourites
        // favDrinks =   await favouriteDrinks(data._id);
        // data.favDrinks = favDrinks

        // houseOfFav = []


        // houseOfFav =   await houseOffavourites(id);
        // data.houseOfFav = houseOfFav

            



        // // category wise items

        // let categorizedMenus = await categoryWiseItems(id)
        // data.categorizedMenus = categorizedMenus

    




        // get list of fovourites

        // check if bar has favourites

        let followers = data.followers;
        if(data.followers)
        {
            data.followers = await Promise.all(data.followers.map( async (e) =>{
                e =  await getUserById(e.user)
                return e;
            }))
        }




        







        // promotions for the bar

        promos = await promotion.find({bar : data._id}).limit(4).lean();

        promos = await Promise.all(promos.map( async (e) =>{
            return await getPromotionById(e,id)
        }))
        data.promotions = promos

        data.drinks = await getMenuByBarId(id)



        // get menu by id

        // menus = await getMenuByBarId(id) 
        // data.menus = menus

      
        return data;
    }   
    catch(error)
    {
        return error;
    }
}


// Ending Code for Menu


// coding for user notifications



let createNotification = async(req,user) =>
{
    try
    {
       
        let data = new notification(req);
        
        data = await data.save();


        const payload = {
            notification: {
              title: req.title,
              body: req.body,
              sound: 'default',
            },
            data: {
              notification_id: data._id.toString(), // Convert _id to a string
            },
          };

        const response = await Admin.messaging().sendToDevice(user.fcm, payload);
        return data;
    }
    catch(error)
    {
        console.log(error);
        return error.message
    }
}


// Websockets Order System


const getLatestOrder = async(bar) =>
{
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    try
    {
        const startOfDay = new Date(currentDate);
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999); // Set the time to the end of the current day


        const lastDeliveredOrder = await order.findOne({
            bar: bar,
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),
            createdAt: { $gte: startOfDay, $lte: endOfDay }, // Match orders created within the current day
          }).sort({ createdAt: -1 });
        return lastDeliveredOrder;
    }
    catch(error)
    {   
        return {}
    }
}

const calculateNextBartender = (bartenders) => {
    if (deliveredOrderSequence.length === 0) {
      // If no orders have been delivered yet, start with the first bartender
      return bartenders[0];
    }
  
    const lastDeliveredOrder = deliveredOrderSequence[deliveredOrderSequence.length - 1];
    const indexOfLastDeliveredOrder = bartenders.findIndex((b) => b === lastDeliveredOrder.bartender);
  
    // Calculate the index of the next bartender in a circular manner
    const nextIndex = (indexOfLastDeliveredOrder + 1) % bartenders.length;
  
    return bartenders[nextIndex];
  };




let getBartenders = async(bar) =>                                                                                                                   
{
    try
    {
        let bartenders = await users
        .find({ related_bar: bar , role : mongoose.Types.ObjectId('63ff34f1a14c840a057407cc') })
        .select({ username: 1 })
        .sort({ username: 1 }) // Sort by the 'username' field in ascending order
        .lean();

        return bartenders;
    }
    catch(error)
    {
        return []
    }
}

const getLastOrder = async(bar) =>
{
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    try
    {
        const startOfDay = new Date(currentDate);
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999); // Set the time to the end of the current day


        const lastDeliveredOrder = await ordersequence.findOne({
            bar: bar,
            subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545'),

            createdAt: { $gte: startOfDay, $lte: endOfDay }, // Match orders created within the current day
          }).sort({ createdAt: -1 });


        return lastDeliveredOrder;
    }
    catch(error)
    {
        return {}
    }
}

// Ending Websocket Ordering System


export default {
    validateUsername,
    validateEmail,
    verifyToken,
    verifyAuthToken,
    regexSearch,
    filterCoordinates,
    sendResetPasswordMail,
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
    getItemById,
    getSuperItem,
    getEventById,
    getUserById,
    nearbyEvents,
    getOrderById,
    orderType,
    getUserEvents,
    getPromotionById,
    nearbyPromotion,
    getBarData,
    getItems,
    getReviewById,
    getBarMenus,
    houseOffavourites,
    categoryWiseItems,
    getItemByCategory,
    // getBarFollowers
    bestSellingDrink,
    getItemById2,
    getBasicReview,
    getBasicUserData,
    getSocketOrders,
    getPromotionItems,
    createCategory,
    
    // notifications

    createNotification,
    getBartenders,
    getLatestOrder,
    getLastOrder,
    getMenuByBarId

}

