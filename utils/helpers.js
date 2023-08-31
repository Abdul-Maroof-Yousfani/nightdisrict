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

const getBarData = async(id) => {
    try
    {
        let data = await bar.findById(id).select({ "barName": 1 , "location" : 1 , "upload_logo" : 1 ,  "address" : 1, "rating": 1 , "geometry" : 1}).lean();
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
        let data  = await bar.find({location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 10000
            }
        }}).select({ "barName": 1 , "location" : 1 , "upload_logo" : 1 ,  "address" : 1, "rating" :1 , 'geometry' : 1 }).lean();
        
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
        let data  = await event.find({location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 100
            }
        }}).lean();
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
        console.log(error);
        return error.message
    }
}


// promotion

const getPromotionById = async(data,bar='') =>
{
    try
    {
        // check item category


        let category = await menuCategory.findById({
            _id : data.category
        })
        data.category = category.name

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
                $maxDistance: 100
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

const getReviewById = async(id) =>
{
    try
    {
        let drink = await reviews.findById({
            _id : id
        }).lean()


        await menu.findOneAndUpdate({
            item : drink.item
        },{
            $push: { "reviews" : { "customer" : drink.item , "review" : drink._id } } 
        },{
            new : true
        }).lean()

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
        console.log(order);
        
        // check order type only get orders which has Drinks
        if(order.subscriptionType.toString() == '642a6f6e17dc8bc505021545')
        {
            await Promise.all(order.items.map( async (e) =>{
                orders = await getItemById(e.item,order.bar,e.variant);
             }))
        }

        return orders;

   
        

    }
    catch(error)
    {
        return error
    }   
}

const getOrderById = async(data) => {
    try
    {
        // let data = await order.findById(id).lean();

        data.subscriptionType = await orderType(data.subscriptionType);
        data.customer = await getUserById(data.customer);

        
        // get items details in order

        data.items = await Promise.all(data.items.map(async(e) =>{
            if(data.subscriptionType == 'buy_ticket')
            {
                return await getEventById(e.item)
            }
            else if(data.subscriptionType == 'buy_drink')
            {
    
                return await getItemById(e.item,data.bar,e.variant)
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
        console.log(error);
        console.log(error.message)
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
        // get dj

        data.dj = await getUserById(data.dj);

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

const  getItemById = async(id,bar,bought='') => {
    try
    {
        let data = await menu.findOne({
            item : id,
            barId : bar
        }).select({favDrinks :0}).lean()

        data.superItem = id
        if(data.reviews)
        {
            data.reviews = await Promise.all(data.reviews.map( async (e) =>
            {
                return await getReviewById(e.review);
            }))
        }
        else
        {
            data.reviews = []
        }

 
      
      
       
        // add reviews to the item

        // if(data.reviews)

        // get item from super categories

        data.min = 10;
        data.max = 50;
        data.barDetail = await getBarData(bar);
        

           // // update category and Subcateogry
        if(data.category)
        {
            let category = await menuCategory.findOne({_id :data.category })
            data.category = category
        }
        
        if(data.subCategory)
        {
            let subCategory = await menuCategory.findOne({_id :data.subCategory })
            data.subCategory = subCategory
        }
    

        data.item = await superMenu.findById({
            _id : data.item
        })
        data.name = data.item.menu_name
        data.description = data.item.menu_name
        data.description = data.item.description
        data.pictures = data.item.pictures

        data.buy = bought

        
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
        return error.message
    }
}

const getMenuByBarId = async(bar) =>{
    try
    {
        // get data based on bar

        let data = await menu.find({
            barId : bar 
        }).lean()
        data = await Promise.all(data.map( async (mainCategory) =>{
            mainCategory.category = await menuCategory.find({
                _id : mainCategory.category
            }).limit(4).lean();

            // get sub categories

            mainCategory.category = await Promise.all(mainCategory.category.map(async(subCategory) =>{
                 let newSub = await menuCategory.find({parent : subCategory._id , _id : mainCategory.subCategory}).lean();
                 subCategory.subcategories = newSub

                 if(newSub)
                 {
                    subCategory.subcategories = await Promise.all(subCategory.subcategories.map( async (item) =>{
                        let newItems = await superMenu.find({
                            category : mainCategory.category,
                            subCategory : mainCategory.subCategory
                        })
                        newItems =  await Promise.all(newItems.map( async (itemData) =>{
                            return await getItemById(itemData._id);
                        }))
                        return newItems;
                    }))
                 }



                 return subCategory
                
            }))
            

            return mainCategory;
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
                subCategory : e._id
             }).lean()
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
            barId : bar
        }).limit(5).lean();
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
        events = await event.find({bar : data._id}).sort({ _id: -1 }).limit(4).lean()
        events = await Promise.all(events.map(async(e) =>{
            return getEventById(e._id)
        }))
        
        data.events = events



        // house of Favourites
        // favDrinks =   await favouriteDrinks(data._id);
        // data.favDrinks = favDrinks

        houseOfFav = []


        houseOfFav =   await houseOffavourites(id);
        data.houseOfFav = houseOfFav

        // category wise items

        let categorizedMenus = await categoryWiseItems(id)
        data.categorizedMenus = categorizedMenus


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

        promos = await promotion.find({bar : data._id}).lean();

        promos = await Promise.all(promos.map( async (e) =>{
            return await getPromotionById(e,id)
        }))
        data.promotions = promos

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
    

}

