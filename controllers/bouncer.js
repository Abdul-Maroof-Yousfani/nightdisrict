
import order from '../models/order.js';
import users from '../models/users.js';
import Attendance from '../models/attendance.js';
import ticket from '../models/ticket.js';
import helpers from '../utils/helpers.js';


const attendance = async(req,res) =>
{
    let {event,Order,customer} = req.body;

    // get bar id


    

    try
    {
        let orderData = await order.findById({
            _id : Order
        })



        let data  = await Attendance({
            event,
            order:Order,
            bar: orderData.bar,
            customer: customer,
            bouncer: req.user._id
        });
        data = await data.save();
        // get user data

        let userData = await users.findById({
            _id : customer
        },{
            profile_picture :1,
            username : 1,
            email : 1,
            address : 1

        })

        console.log(userData);

        return res.status(200).json({
            status : 200,
            message : userData
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

const tickets = async(req,res) =>
{
    try
    {
        let data = await Attendance.find({}).lean()
        data = await Promise.all(data.map(async(e) =>{

            // order id
            e.ticket = await ticket.findOne({
                order : e.order
            })
            e.user = await users.findOne({
                _id : e.customer
            })
            e.event = await helpers.getEventById(e.event)

            // get order data
            return e;


        }))
      
        return res.status(200).json({
            status : 200,
            message : 'success',
            data
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 200,
            message : error.message,
            data : {}
        })
    }
}


export  default{

    attendance,
    tickets
}