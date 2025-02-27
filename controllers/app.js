
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
import mongoose from 'mongoose';


const index = async(req,res) =>
{
    // let events = [];
    let orders = [];
    let promotions = [];
    let newData = [];
    let bars = []
    let events = []

    try
    {   
        let bars = await helpers.nearbyBars(req.body.longitude,req.body.latitude);
    
        // events

        let events = await helpers.nearbyEvents(req.body.longitude,req.body.latitude);

        // recent Orders
        let orders = await order.find({customer : req.user._id , subscriptionType : mongoose.Types.ObjectId('642a6f6e17dc8bc505021545')}).lean().limit(3)
        orders = await Promise.all(orders.map( async (e) =>{
            // return helpers.getOrderById(e);
            return await helpers.getItems(e)
        }))

        // get order items only
        // #

        promotions = await Promise.all(bars.map( async (e) =>{
            // get Promotions for a bar
            let promo = await promotion.find({
                bar  :e._id
            }).limit(5).lean()
            if(promo)
            {   
                e.promotions = await Promise.all(promo.map( async (code) =>{
                    e.promotions = await helpers.getPromotionById(code,e._id)
                    newData.push(e)
                    return e.promotions
                }))
                return e;
            }
            return 

           
        }))

        // promotions = await helpers.nearbyPromotion(req.body.longitude,req.body.latitude,req.user.barInfo);

        // orders = await Promise.all(orders)   

        

       


        return res.status(200).json({
            status : 200,
            message : "success",
            data :  { bars ,  events , orders , promotions : newData } 
        })
    }
    catch(error)
    {
        return res.status(200).json({
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
        return res.status(200).json({
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