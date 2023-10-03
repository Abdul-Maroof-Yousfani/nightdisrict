
import order from '../models/order.js';
import users from '../models/users.js';
import Attendance from '../models/attendance.js';
import ticket from '../models/ticket.js';
import helpers from '../utils/helpers.js';
import Event from '../models/event.js';


const attendance = async(req,res) =>
{
    let {event,Order,customer} = req.body;

    // get bar id


    

    try
    {
        // check event and bouncers are from the same bar

        let checkEvent = await Event.findOne({
            bar : req.user.related_bar,
            _id : event
        })
        if(!checkEvent)
        {
            return res.status(200).json({
                status : 500,
                message : 'Event not Related to Specific Bar',
                data : null
            }) 
        }


        let checkAttendance = await Attendance.findOne({
            order:Order,
            customer
        })



        
        if(checkAttendance)
        {
            return res.status(200).json({
                status : 500,
                message : 'attendance Already Marked',
                data : checkAttendance
            })   
        }


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


        return res.status(200).json({
            status : 200,
            message : 'success',
            data : userData
        })
    }
    catch(error)
    {
        console.log(error);
        return res.status(200).json({
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
        let data = await Attendance.find({
            bouncer : req.user._id
        }).lean()
        data = await Promise.all(data.map(async(e) =>{

            
            e.count = await (await order.find({ "items.item" : e.event })).length
            e.scanned = await (await Attendance.find({ "event" : e.event })).length


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
        return res.json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const forget = async(req,res) =>
{
    try
    {
        return res.json({
            status : 200,
            message : "Requesting generated Successfully!",
            data : {} 
        })
    }
    catch(error)
    {
        return res.json({
            status : 500,
            message : error.message,
            data : {} 
        })
    }
}

export  default{
    attendance,
    tickets,
    forget
}