
import Joi from 'joi';
import helpers from '../utils/helpers.js';
import event from '../models/event.js';
import promotion from '../models/promotion.js';
import hashtag from '../models/hashtag.js';
import users from '../models/users.js';
import bar from '../models/bar.js';
import menu from '../models/menu.js';
import superMenu from '../models/superMenu.js';
import order from '../models/order.js';


const index = async(req,res) =>
{
    // let events = [];
    let orders = [];
    let promotions = [];

    try
    {
        let bars = await helpers.nearbyBars(req.body.longitude,req.body.latitude);
        
        // events

        let events = await helpers.nearbyEvents(req.body.longitude,req.body.latitude);


  
        // recent Orders
        let orders = await order.find({customer : req.user._id}).lean().limit(5)
        orders = await Promise.all(orders.map( async (e) =>{
            // check order type it
            // check type of order
            return helpers.getOrderById(e);
        }))




        promotions = await helpers.nearbyPromotion(req.body.longitude,req.body.latitude,req.user.barInfo);

        // orders = await Promise.all(orders)

       


        return res.status(200).json({
            status : 200,
            message : "success",
            data :  { bars ,  events , orders , promotions } 
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
const mapView = async(req,res) =>
{
    let bars = [];

    try
    {
        let events = await helpers.nearbyBars(req.body.longitude,req.body.latitude);
        events = await Promise.all(events.map( async (e) =>{
            console.log(e)
        }))
        

        


        // // get Events with respect to Bar

        // await Promise.all(bars.map( async (e) =>{
        //     // get near by events
            
        //     events = await event.find({bar:e._id}).limit(5).lean();
        //     await Promise.all(events.map( async (event) =>{

        //         event.dj = await users.findOne({_id : event.dj}).select('username').lean()
        //         event.hashtags = await Promise.all(event.hashtags.map( async (hash) =>{
        //                 return await hashtag.findOne({_id  : hash._id}).select('name').lean()
        //         }))
                
        //         event.bar = await bar.findOne({_id  : event.bar}).select({"barName" : 1}).lean() 
                

        //         return event

                
        //     }))
            

        //     // get neary by promotions

        //     orders = await order.find({customer : req.user._id}).lean().limit(5)
        //     await Promise.all(orders.map( async (order) =>{
                
                
        //         // promotion.bar = await bar.findOne({_id : promotion.bar}).select('barName').lean()
        //         // promotion.menu?promotion.menu = await Promise.all(promotion.menu.map( async (m) =>{
        //         //     return await superMenu.findOne({_id  : m.item}).select({"menu_name" : 1 , "description" : "1" , "picture" : 1}).lean()
        //         // })):[]
        //         // promotion.bar = await bar.findOne({_id  : promotion.bar}).select({"barName" : 1}).lean() 
        //         // return promotion
                
        //     }))
                
        //         return e
        //     })) 
        

        // // recent Orders

        // orders = await Promise.all(orders)

       


        return res.status(200).json({
            status : 200,
            message : "success",
            data  : bars
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


export  default{

    index,
    mapView
}