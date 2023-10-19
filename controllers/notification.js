import SimpleSchema from 'simpl-schema';
import menuCategory from "../models/menuCategory.js";
import Role from "../models/roles.js";
import User from "../models/users.js";
import Menu from '../models/menu.js';
import helpers from '../utils/helpers.js';
import reviews from '../models/reviews.js';
import serviceAccount from "../config/nd.js";
import Notification from '../models/notification.js';

import admin2 from 'firebase-admin';
import order from '../models/order.js';





const  testNotification = async(req,res) =>
{
    try
    {

        // admin2.initializeApp({
        //     credential: admin2.credential.cert(serviceAccount)
        // });
      
        admin2.initializeApp({
            credential: admin2.credential.cert(serviceAccount)
        });
    
    
        
        


        const payload = {
            data: {
                title: 'test',
                body: 'test',
            },
        };



        const response = await admin2.messaging().sendToDevice('c0yIY7URa0KirgJTrvxAhE:APA91bG2qQjGSiYs6XlFob5vfku_GA3XQHgv93ka8mer6mIbi2oRZBFM1d5Vp7SK7sIwAj8ceqrWAdzgINA0ieCJuW4fl1AObr0aG5DjGnMmJsIa-o4BzI3x8hD2olQJ0Y07WkNaClkt', payload);
        console.log(response);
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
            notify.user = await helpers.getUserById(notify.user);
        }
        return notify;
      }));
      return res.json({
          status: 200,
          message: 'success',
          data : notification,
          pagination : newData.totalPages
      });
    } catch (error) {
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
export default {
    testNotification,
    all,
    store
}