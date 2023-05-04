import order from "../../models/order.js";
import orderreserved from "../../models/orderreserved.js";

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
    let {order,customer}  = req.body;
    try
    {
        // check if a bartender is already assigned this order

        let checkOrderExist = await orderreserved.find({order,bar}).lean();
        if(checkOrderExist) return res.status(409).json({
            status : 409,
            message : 'already assigned to a bartender',
            data : {}
        })

        // Add Order in the reservedQue to connect it with a specific bartender in bar
    






    }
    catch(error)
    {

    }
}


export  default {
    orders,
    prepare
}