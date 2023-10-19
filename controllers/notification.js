import SimpleSchema from 'simpl-schema';
import menuCategory from "../models/menuCategory.js";
import Role from "../models/roles.js";
import User from "../models/users.js";
import Menu from '../models/menu.js';
import helpers from '../utils/helpers.js';
import reviews from '../models/reviews.js';
import serviceAccount from "../config/nd.js";
import admin from 'firebase-admin';




const  testNotification = async(req,res) =>
{
    try
    {

        const payload = {
            data: {
                title: 'test123',
                body: 'test123',
            },
        };



        const response = await admin.messaging().sendToDevice('c0yIY7URa0KirgJTrvxAhE:APA91bG2qQjGSiYs6XlFob5vfku_GA3XQHgv93ka8mer6mIbi2oRZBFM1d5Vp7SK7sIwAj8ceqrWAdzgINA0ieCJuW4fl1AObr0aG5DjGnMmJsIa-o4BzI3x8hD2olQJ0Y07WkNaClkt', payload);

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



export default {
    testNotification
}