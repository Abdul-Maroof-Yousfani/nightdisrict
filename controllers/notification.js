import SimpleSchema from 'simpl-schema';
import menuCategory from "../models/menuCategory.js";
import Role from "../models/roles.js";
import User from "../models/users.js";
import Menu from '../models/menu.js';
import helpers from '../utils/helpers.js';
import reviews from '../models/reviews.js';
import Notification from '../models/notification.js';
import ApplicationLogs from '../models/applicationLogs.js';

import admin from 'firebase-admin';
import order from '../models/order.js';
import ticket from '../models/ticket.js';
import attendance from '../models/attendance.js';
import promotion from '../models/promotion.js';
import notification from '../models/notification.js';
import event from '../models/event.js';





// admin2.initializeApp({
//     credential: admin2.credential.cert(serviceAccount)
// });



const  testNotification = async(req,res) =>
{
    try
    {

        // admin2.initializeApp({
        //     credential: admin2.credential.cert(serviceAccount)
        // });
      
        // admin2.initializeApp({
        //     credential: admin2.credential.cert(serviceAccount)
        // });

        const payload = {
            notification: {
                title: 'waqas',
                body: 'test',
            },
        };



        const response = await admin2.messaging().sendToDevice('c0yIY7URa0KirgJTrvxAhE:APA91bG2qQjGSiYs6XlFob5vfku_GA3XQHgv93ka8mer6mIbi2oRZBFM1d5Vp7SK7sIwAj8ceqrWAdzgINA0ieCJuW4fl1AObr0aG5DjGnMmJsIa-o4BzI3x8hD2olQJ0Y07WkNaClkt', payload);
        return res.json({
            response
        })

    }
    catch(error)
    {
        console.log(error)

        return res.json({
            status : 500,
            error : "con"
        })

    }
}

const all = async (req, res) => {
    try {
      let notification = await Notification.find({user: req.user._id}).sort({ date: -1 }).lean();
      let newData = helpers.paginate(notification,req.query.page,req.query.limit);
      notification = await Promise.all(newData.result.map(async(notify)=>{
        if( notify.type == 'drink_order' || notify.type == 'event_order'  || notify.type == 'event_scan')
        {
            let Order  = await order.findById(notify.notification_for).lean();
            notify.data = await helpers.getOrderById(Order);
        }
        else if(notify.type == 'event_reminder')
        {
            // let findTicket = await event.findById({_id : notify.notification_for}).lean()
            // console.log(notify.notification_for);
            // console.log(findTicket);
            // return
            let Ticket  = await ticket.findById({_id : notify.notification_for}).lean();
            if(Ticket)
            {
                Ticket.event = await helpers.getEventById(Ticket.event)
                Ticket.user = await helpers.getUserById(Ticket.user)
            }
            notify.data = Ticket?Ticket:null

        }
        else if(notify.type == 'promotion')
        {
            let getPromotion = await promotion.findById({
                _id : notify.notification_for
            }).lean()
            let newPromotions  = await helpers.getPromotionById(getPromotion,getPromotion.bar)
            notify.data = newPromotions;

        }
        notify.user = await helpers.getUserById(notify.user);

        return notify;
      }));
      return res.json({
          status: 200,
          message: 'success',
          data : notification,
          pagination : newData.totalPages
      });
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            message: error.message,
            data : []
        });
    }
  }


const store = async (req, res) => {
    
    try {
      let data = new Notification(req.body);
      data = await data.save();
      return res.json({
          status: 200,
          message: 'success',
          data
      });
    } catch (error) {
        return res.json({
            status: 500,
            message: error.message,
            data : []
        });
    }
  }

const getSingleNotification = async(req,res) =>
{
    let {_id} = req.params;
    try
    {
        let notify  = await notification.findById(
            {_id,
            user : req.user._id}
        ).lean();
        if( notify.type == 'drink_order' || notify.type == 'event_order'  || notify.type == 'event_scan')
        {
            let Order  = await order.findById(notify.notification_for).lean();
            notify.data = await helpers.getOrderById(Order);
            notify.user = await helpers.getUserById(notify.user);
        }
        else if(notify.type == 'event_reminder')
        {
            let Ticket  = await ticket.findById({_id : notify.notification_for}).lean();
            Ticket.event = await helpers.getEventById(Ticket.event)
            notify.user = await helpers.getUserById(notify.user);

            Ticket.user = await helpers.getUserById(Ticket.user)

            notify.data = Ticket

   
        }
        else if(notify.type == 'promotion')
        {
            let getPromotion = await promotion.findById({
                _id : notify.notification_for
            }).lean()
            let newPromotions  = await helpers.getPromotionById(getPromotion,getPromotion.bar)
            notify.data = newPromotions;
            notify.user = await helpers.getUserById(notify.user);

        }
        return res.json({
            status : 200,
            message : "success",
            data : notify
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

const iosWebhook = async (req, res) => {
    try{
        var data = await ApplicationLogs({
            string: JSON.stringify(res.body)
        });
        await data.save();
    
        return res.json({
            status : 200,
            message : "success",
        })
    }
    catch(error)
    {   
        return res.json({
            status : 500,
            message : error.message,
        })
    }
}
const androidWebhook = async (req, res) => {
    return res.json({
        status : 200,
        message : "success",
    })
}

export default {
    testNotification,
    all,
    store,
    getSingleNotification,
    iosWebhook,
    androidWebhook
}