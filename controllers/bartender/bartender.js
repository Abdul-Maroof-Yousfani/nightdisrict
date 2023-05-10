import mongoose from "mongoose";
import order from "../../models/order.js";
import orderreserved from "../../models/orderreserved.js";
import menuCategory from "../../models/menuCategory.js";
import users from '../../models/users.js';

const orders = async(req,res) =>{
    try
    {
        let data = await order.find({});
        return res.json({
            status : 200,
            message: "success",
            data
        })
    }
    catch(error)
    {
        return res.status(404).json({
            status : 404,
            message: error.message,
            data: []
        })
    }
}
const processOrder = async(req,res) =>{
    try
    {
        let data = await order.find({});
        return res.json({
            status : 200,
            message: "success",
            data
        })
    }
    catch(error)
    {
        return res.status(404).json({
            status : 404,
            message: error.message,
            data: []
        })
    }
}
const prepare = async(req,res) =>{
    let {orderid,bar}  = req.body;
    
    try
    {
        // check if a bartender is already assigned this order

        let checkOrderExist = await orderreserved.findOne({orderid,bar}).lean();
        if(checkOrderExist) return res.status(409).json({
            status : 409,
            message : 'already assigned to a bartender',
            data : {}
        })

        // Add Order in the reservedQue to connect it with a specific bartender in bar
     
        let orderQue  = new orderreserved(req.body);
        await orderQue.save();

        // update Order Status to preparing

 
        let orderdata = await order.findByIdAndUpdate({_id: req.body.orderid},{$set:{ "orderStatus" : "preparing" , bartender : req.user._id }},{new:true});


        return res.status(200).json({
            status : 200,
            message : "success",
            data : orderdata
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
const updateStatus = async(req,res) =>{
    let {orderid,orderStatus}  = req.body;
    try
    {
        // update Order Status to Completed

        let orderdata = await order.findByIdAndUpdate({_id: mongoose.Types.ObjectId(orderid)},{$set:{ "orderStatus" : orderStatus}},{new:true});


        return res.status(200).json({
            status : 200,
            message : "success",
            data : orderdata
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

const tips = async(req,res) =>
{
    let totalEarning = 0;
    try
    {
        let current = await order.find({"status" : "completed"}).select({"customer" : 1 , status : 1 , type : 1 , tip:1 , orderStatus :1 , orderNo : 1}).lean();
        current  = await Promise.all((current.map(async(e) =>{
            // add type
            
            let type = await menuCategory.findById({_id : e.type}).select({ "name" : 1 }).lean()
           

            // get order 
            e.customer = await users.findOne({_id : e.customer}).select({"username" : 1 , "profile_picture" : 1 }).lean()
            e.customer = e.customer? e.customer.username : {}
            totalEarning = totalEarning +  e.tip
            return e;

        })))
        return res.status(200).json({
            status : 200,
            message : 'success',
            data: {totalEarning,data : current}
        })

    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : "error",
            data : []
        })
    }
}

export  default {
    orders,
    prepare,
    updateStatus,
    tips
    
}