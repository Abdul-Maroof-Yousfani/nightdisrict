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



        const response = await admin.messaging().sendToDevice('66616B652D61706E732D746F6B656E2D666F722D73696D756C61746F72', payload);

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