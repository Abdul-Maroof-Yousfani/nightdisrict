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
import Webhook from '../models/webhook.js';
import webhooks from '../models/webhooks.js';
import event from '../models/event.js';
import purchases from '../models/purchases.js';
import mongoose from 'mongoose';





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
    try {

        console.log("webhok hi");


        const jwsToken = req.body.signedPayload; // Replace this with the JWS token from the App Store

        // The JWS payload includes three parts: the header, the payload, and the signature.
        // They are separated by dots. We need to split the token into these parts.
        const tokenParts = jwsToken.split('.');

        // The payload is in the second part, which is base64-encoded JSON.
        const payload = Buffer.from(tokenParts[1], 'base64').toString('utf8');
        const decodedPayload = JSON.parse(payload);

        console.log("Decoded Payload");
        console.log(decodedPayload);
    

        // The header is in the first part, which is also base64-encoded JSON.
        const header = Buffer.from(tokenParts[0], 'base64').toString('utf8');
        const decodedHeader = JSON.parse(header);

        // The signature is in the third part.
        const signature = tokenParts[2];

        // The key or secret used to verify the signature should come from the App Store. It's used to validate the JWS signature.
        const appStorePublicKeyOrSecret = '72fca38faa574393979df7a0cf326d2d';


     


            console.log('JWS verification successful');
            console.log('Decoded Payload:', decodedPayload);
            console.log('Decoded Header:', decodedHeader);
            console.log('Decoded Signature:', signature);

            var data = await Webhook({
                notificationType:decodedPayload.notificationType,
                notificationUUID: decodedPayload.notificationUUID,
                appAppleId: decodedPayload.data.appAppleId,
                signedTransactionInfo: decodedPayload.data.signedTransactionInfo,
                signedRenewalInfo: decodedPayload.data.signedRenewalInfo,
                status : decodedPayload.data.status
            });
            await data.save();


                   // store transaction history

    


        // Verify the JWS signature
        // jwt.verify(jwsToken, appStorePublicKeyOrSecret, async (err, decoded) => {
        // if (err) {
        //     console.error('JWS verification failed:', err);
        //     var data = await Webhook({
        //         err: err,
        //     });
        // } else {
            
        // }
        // });
    
        return res.json({
            status : 200,
            message : "success",
        })
    }
    catch(error)
    {   

        console.log("Error");
        console.log(error);

        return res.json({
            status : 500,
            message : error.message,
        })
    }
}
const newWebhook = async (req, res) => {
    try {

        

        const jwsToken = req.body.signedPayload; // Replace this with the JWS token from the App Store

        // The JWS payload includes three parts: the header, the payload, and the signature.
        // They are separated by dots. We need to split the token into these parts.
        const tokenParts = jwsToken.split('.');

        // The payload is in the second part, which is base64-encoded JSON.
        const payload = Buffer.from(tokenParts[1], 'base64').toString('utf8');
        const decodedPayload = JSON.parse(payload);

        // console.log("Decoded Payload");
        // console.log(decodedPayload);
    

        // The header is in the first part, which is also base64-encoded JSON.
        const header = Buffer.from(tokenParts[0], 'base64').toString('utf8');
        const decodedHeader = JSON.parse(header);

        // The signature is in the third part.
        const signature = tokenParts[2];

        // The key or secret used to verify the signature should come from the App Store. It's used to validate the JWS signature.
        const appStorePublicKeyOrSecret = '72fca38faa574393979df7a0cf326d2d';


            // console.log('JWS verification successful');
            // console.log('Decoded Payload:', decodedPayload);
            // console.log('Decoded Header:', decodedHeader);
            // console.log('Decoded Signat ure:', signature);




            var data = await webhooks({
                notificationHeader:header,
                notificationPayload: payload,
                notificationCertificate : signature
            });
            await data.save();

            

        // Verify the JWS signature
        // jwt.verify(jwsToken, appStorePublicKeyOrSecret, async (err, decoded) => {
        // if (err) {
        //     console.error('JWS verification failed:', err);
        //     var data = await Webhook({
        //         err: err,
        //     });
        // } else {
            
        // }
        // });
    
        return res.json({
            status : 200,
            message : "success",
        })
    }
    catch(error)
    {   

        console.log("Error");
        console.log(error);

        return res.json({
            status : 500,
            message : error.message,
        })
    }
}
const androidWebhook = async (req, res) => {
    // st
    let data = JSON.stringify(req.body,true);
    new webhooks({
        notificationPayload : data
    }).save();
    return res.json({
        status : 200,
        message : "success",
        data

    })
}

// payload conversion

let conversion = async(signature='e883ff9f7f33488584b5e5dabbef5477',keys) =>
{
    try
    {

        // The JWS payload includes three parts: the header, the payload, and the signature.
        // They are separated by dots. We need to split the token into these parts.
        const tokenParts = keys.split('.');

        // The payload is in the second part, which is base64-encoded JSON.
        const payload = Buffer.from(tokenParts[1], 'base64').toString('utf8');
        const decodedPayload = JSON.parse(payload);
        return decodedPayload;

        
    }
    catch(error)
    {
        return error;
    }
}

const bartenderLogs = async(req,res) =>
{
    try
    {
        let keys = 'eyJhbGciOiJFUzI1NiIsIng1YyI6WyJNSUlFTURDQ0E3YWdBd0lCQWdJUWZUbGZkMGZOdkZXdnpDMVlJQU5zWGpBS0JnZ3Foa2pPUFFRREF6QjFNVVF3UWdZRFZRUURERHRCY0hCc1pTQlhiM0pzWkhkcFpHVWdSR1YyWld4dmNHVnlJRkpsYkdGMGFXOXVjeUJEWlhKMGFXWnBZMkYwYVc5dUlFRjFkR2h2Y21sMGVURUxNQWtHQTFVRUN3d0NSell4RXpBUkJnTlZCQW9NQ2tGd2NHeGxJRWx1WXk0eEN6QUpCZ05WQkFZVEFsVlRNQjRYRFRJek1Ea3hNakU1TlRFMU0xb1hEVEkxTVRBeE1URTVOVEUxTWxvd2daSXhRREErQmdOVkJBTU1OMUJ5YjJRZ1JVTkRJRTFoWXlCQmNIQWdVM1J2Y21VZ1lXNWtJR2xVZFc1bGN5QlRkRzl5WlNCU1pXTmxhWEIwSUZOcFoyNXBibWN4TERBcUJnTlZCQXNNSTBGd2NHeGxJRmR2Y214a2QybGtaU0JFWlhabGJHOXdaWElnVW1Wc1lYUnBiMjV6TVJNd0VRWURWUVFLREFwQmNIQnNaU0JKYm1NdU1Rc3dDUVlEVlFRR0V3SlZVekJaTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEEwSUFCRUZFWWUvSnFUcXlRdi9kdFhrYXVESENTY1YxMjlGWVJWLzB4aUIyNG5DUWt6UWYzYXNISk9OUjVyMFJBMGFMdko0MzJoeTFTWk1vdXZ5ZnBtMjZqWFNqZ2dJSU1JSUNCREFNQmdOVkhSTUJBZjhFQWpBQU1COEdBMVVkSXdRWU1CYUFGRDh2bENOUjAxREptaWc5N2JCODVjK2xrR0taTUhBR0NDc0dBUVVGQndFQkJHUXdZakF0QmdnckJnRUZCUWN3QW9ZaGFIUjBjRG92TDJObGNuUnpMbUZ3Y0d4bExtTnZiUzkzZDJSeVp6WXVaR1Z5TURFR0NDc0dBUVVGQnpBQmhpVm9kSFJ3T2k4dmIyTnpjQzVoY0hCc1pTNWpiMjB2YjJOemNEQXpMWGQzWkhKbk5qQXlNSUlCSGdZRFZSMGdCSUlCRlRDQ0FSRXdnZ0VOQmdvcWhraUc5Mk5rQlFZQk1JSCtNSUhEQmdnckJnRUZCUWNDQWpDQnRneUJzMUpsYkdsaGJtTmxJRzl1SUhSb2FYTWdZMlZ5ZEdsbWFXTmhkR1VnWW5rZ1lXNTVJSEJoY25SNUlHRnpjM1Z0WlhNZ1lXTmpaWEIwWVc1alpTQnZaaUIwYUdVZ2RHaGxiaUJoY0hCc2FXTmhZbXhsSUhOMFlXNWtZWEprSUhSbGNtMXpJR0Z1WkNCamIyNWthWFJwYjI1eklHOW1JSFZ6WlN3Z1kyVnlkR2xtYVdOaGRHVWdjRzlzYVdONUlHRnVaQ0JqWlhKMGFXWnBZMkYwYVc5dUlIQnlZV04wYVdObElITjBZWFJsYldWdWRITXVNRFlHQ0NzR0FRVUZCd0lCRmlwb2RIUndPaTh2ZDNkM0xtRndjR3hsTG1OdmJTOWpaWEowYVdacFkyRjBaV0YxZEdodmNtbDBlUzh3SFFZRFZSME9CQllFRkFNczhQanM2VmhXR1FsekUyWk9FK0dYNE9vL01BNEdBMVVkRHdFQi93UUVBd0lIZ0RBUUJnb3Foa2lHOTJOa0Jnc0JCQUlGQURBS0JnZ3Foa2pPUFFRREF3Tm9BREJsQWpFQTh5Uk5kc2twNTA2REZkUExnaExMSndBdjVKOGhCR0xhSThERXhkY1BYK2FCS2pqTzhlVW85S3BmcGNOWVVZNVlBakFQWG1NWEVaTCtRMDJhZHJtbXNoTnh6M05uS20rb3VRd1U3dkJUbjBMdmxNN3ZwczJZc2xWVGFtUllMNGFTczVrPSIsIk1JSURGakNDQXB5Z0F3SUJBZ0lVSXNHaFJ3cDBjMm52VTRZU3ljYWZQVGp6Yk5jd0NnWUlLb1pJemowRUF3TXdaekViTUJrR0ExVUVBd3dTUVhCd2JHVWdVbTl2ZENCRFFTQXRJRWN6TVNZd0pBWURWUVFMREIxQmNIQnNaU0JEWlhKMGFXWnBZMkYwYVc5dUlFRjFkR2h2Y21sMGVURVRNQkVHQTFVRUNnd0tRWEJ3YkdVZ1NXNWpMakVMTUFrR0ExVUVCaE1DVlZNd0hoY05NakV3TXpFM01qQXpOekV3V2hjTk16WXdNekU1TURBd01EQXdXakIxTVVRd1FnWURWUVFERER0QmNIQnNaU0JYYjNKc1pIZHBaR1VnUkdWMlpXeHZjR1Z5SUZKbGJHRjBhVzl1Y3lCRFpYSjBhV1pwWTJGMGFXOXVJRUYxZEdodmNtbDBlVEVMTUFrR0ExVUVDd3dDUnpZeEV6QVJCZ05WQkFvTUNrRndjR3hsSUVsdVl5NHhDekFKQmdOVkJBWVRBbFZUTUhZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUNJRFlnQUVic1FLQzk0UHJsV21aWG5YZ3R4emRWSkw4VDBTR1luZ0RSR3BuZ24zTjZQVDhKTUViN0ZEaTRiQm1QaENuWjMvc3E2UEYvY0djS1hXc0w1dk90ZVJoeUo0NXgzQVNQN2NPQithYW85MGZjcHhTdi9FWkZibmlBYk5nWkdoSWhwSW80SDZNSUgzTUJJR0ExVWRFd0VCL3dRSU1BWUJBZjhDQVFBd0h3WURWUjBqQkJnd0ZvQVV1N0Rlb1ZnemlKcWtpcG5ldnIzcnI5ckxKS3N3UmdZSUt3WUJCUVVIQVFFRU9qQTRNRFlHQ0NzR0FRVUZCekFCaGlwb2RIUndPaTh2YjJOemNDNWhjSEJzWlM1amIyMHZiMk56Y0RBekxXRndjR3hsY205dmRHTmhaek13TndZRFZSMGZCREF3TGpBc29DcWdLSVltYUhSMGNEb3ZMMk55YkM1aGNIQnNaUzVqYjIwdllYQndiR1Z5YjI5MFkyRm5NeTVqY213d0hRWURWUjBPQkJZRUZEOHZsQ05SMDFESm1pZzk3YkI4NWMrbGtHS1pNQTRHQTFVZER3RUIvd1FFQXdJQkJqQVFCZ29xaGtpRzkyTmtCZ0lCQkFJRkFEQUtCZ2dxaGtqT1BRUURBd05vQURCbEFqQkFYaFNxNUl5S29nTUNQdHc0OTBCYUI2NzdDYUVHSlh1ZlFCL0VxWkdkNkNTamlDdE9udU1UYlhWWG14eGN4ZmtDTVFEVFNQeGFyWlh2TnJreFUzVGtVTUkzM3l6dkZWVlJUNHd4V0pDOTk0T3NkY1o0K1JHTnNZRHlSNWdtZHIwbkRHZz0iLCJNSUlDUXpDQ0FjbWdBd0lCQWdJSUxjWDhpTkxGUzVVd0NnWUlLb1pJemowRUF3TXdaekViTUJrR0ExVUVBd3dTUVhCd2JHVWdVbTl2ZENCRFFTQXRJRWN6TVNZd0pBWURWUVFMREIxQmNIQnNaU0JEWlhKMGFXWnBZMkYwYVc5dUlFRjFkR2h2Y21sMGVURVRNQkVHQTFVRUNnd0tRWEJ3YkdVZ1NXNWpMakVMTUFrR0ExVUVCaE1DVlZNd0hoY05NVFF3TkRNd01UZ3hPVEEyV2hjTk16a3dORE13TVRneE9UQTJXakJuTVJzd0dRWURWUVFEREJKQmNIQnNaU0JTYjI5MElFTkJJQzBnUnpNeEpqQWtCZ05WQkFzTUhVRndjR3hsSUVObGNuUnBabWxqWVhScGIyNGdRWFYwYUc5eWFYUjVNUk13RVFZRFZRUUtEQXBCY0hCc1pTQkpibU11TVFzd0NRWURWUVFHRXdKVlV6QjJNQkFHQnlxR1NNNDlBZ0VHQlN1QkJBQWlBMklBQkpqcEx6MUFjcVR0a3lKeWdSTWMzUkNWOGNXalRuSGNGQmJaRHVXbUJTcDNaSHRmVGpqVHV4eEV0WC8xSDdZeVlsM0o2WVJiVHpCUEVWb0EvVmhZREtYMUR5eE5CMGNUZGRxWGw1ZHZNVnp0SzUxN0lEdll1VlRaWHBta09sRUtNYU5DTUVBd0hRWURWUjBPQkJZRUZMdXczcUZZTTRpYXBJcVozcjY5NjYvYXl5U3JNQThHQTFVZEV3RUIvd1FGTUFNQkFmOHdEZ1lEVlIwUEFRSC9CQVFEQWdFR01Bb0dDQ3FHU000OUJBTURBMmdBTUdVQ01RQ0Q2Y0hFRmw0YVhUUVkyZTN2OUd3T0FFWkx1Tit5UmhIRkQvM21lb3locG12T3dnUFVuUFdUeG5TNGF0K3FJeFVDTUcxbWloREsxQTNVVDgyTlF6NjBpbU9sTTI3amJkb1h0MlFmeUZNbStZaGlkRGtMRjF2TFVhZ002QmdENTZLeUtBPT0iXX0.eyJub3RpZmljYXRpb25UeXBlIjoiRElEX1JFTkVXIiwibm90aWZpY2F0aW9uVVVJRCI6IjUxODhkY2RjLWU2NDAtNDQ0MS05NzE4LWI3YzI5ZjAzYmRiYyIsImRhdGEiOnsiYXBwQXBwbGVJZCI6NjQ0Mzc0MDA4NCwiYnVuZGxlSWQiOiJjb20uaW5ub3ZhdGl2ZS5hcHBCYXJ0ZW5kZXIiLCJidW5kbGVWZXJzaW9uIjoiMyIsImVudmlyb25tZW50IjoiU2FuZGJveCIsInNpZ25lZFRyYW5zYWN0aW9uSW5mbyI6ImV5SmhiR2NpT2lKRlV6STFOaUlzSW5nMVl5STZXeUpOU1VsRlRVUkRRMEUzWVdkQmQwbENRV2RKVVdaVWJHWmtNR1pPZGtaWGRucERNVmxKUVU1eldHcEJTMEpuWjNGb2EycFBVRkZSUkVGNlFqRk5WVkYzVVdkWlJGWlJVVVJFUkhSQ1kwaENjMXBUUWxoaU0wcHpXa2hrY0ZwSFZXZFNSMVl5V2xkNGRtTkhWbmxKUmtwc1lrZEdNR0ZYT1hWamVVSkVXbGhLTUdGWFduQlpNa1l3WVZjNWRVbEZSakZrUjJoMlkyMXNNR1ZVUlV4TlFXdEhRVEZWUlVOM2QwTlNlbGw0UlhwQlVrSm5UbFpDUVc5TlEydEdkMk5IZUd4SlJXeDFXWGswZUVONlFVcENaMDVXUWtGWlZFRnNWbFJOUWpSWVJGUkplazFFYTNoTmFrVTFUbFJGTVUweGIxaEVWRWt4VFZSQmVFMVVSVFZPVkVVeFRXeHZkMmRhU1hoUlJFRXJRbWRPVmtKQlRVMU9NVUo1WWpKUloxSlZUa1JKUlRGb1dYbENRbU5JUVdkVk0xSjJZMjFWWjFsWE5XdEpSMnhWWkZjMWJHTjVRbFJrUnpsNVdsTkNVMXBYVG14aFdFSXdTVVpPY0ZveU5YQmliV040VEVSQmNVSm5UbFpDUVhOTlNUQkdkMk5IZUd4SlJtUjJZMjE0YTJReWJHdGFVMEpGV2xoYWJHSkhPWGRhV0VsblZXMVdjMWxZVW5CaU1qVjZUVkpOZDBWUldVUldVVkZMUkVGd1FtTklRbk5hVTBKS1ltMU5kVTFSYzNkRFVWbEVWbEZSUjBWM1NsWlZla0phVFVKTlIwSjVjVWRUVFRRNVFXZEZSME5EY1VkVFRUUTVRWGRGU0VFd1NVRkNSVVpGV1dVdlNuRlVjWGxSZGk5a2RGaHJZWFZFU0VOVFkxWXhNamxHV1ZKV0x6QjRhVUl5Tkc1RFVXdDZVV1l6WVhOSVNrOU9ValZ5TUZKQk1HRk1ka28wTXpKb2VURlRXazF2ZFhaNVpuQnRNalpxV0ZOcVoyZEpTVTFKU1VOQ1JFRk5RbWRPVmtoU1RVSkJaamhGUVdwQlFVMUNPRWRCTVZWa1NYZFJXVTFDWVVGR1JEaDJiRU5PVWpBeFJFcHRhV2M1TjJKQ09EVmpLMnhyUjB0YVRVaEJSME5EYzBkQlVWVkdRbmRGUWtKSFVYZFpha0YwUW1kbmNrSm5SVVpDVVdOM1FXOVphR0ZJVWpCalJHOTJUREpPYkdOdVVucE1iVVozWTBkNGJFeHRUblppVXprelpESlNlVnA2V1hWYVIxWjVUVVJGUjBORGMwZEJVVlZHUW5wQlFtaHBWbTlrU0ZKM1QyazRkbUl5VG5walF6Vm9ZMGhDYzFwVE5XcGlNakIyWWpKT2VtTkVRWHBNV0dReldraEtiazVxUVhsTlNVbENTR2RaUkZaU01HZENTVWxDUmxSRFEwRlNSWGRuWjBWT1FtZHZjV2hyYVVjNU1rNXJRbEZaUWsxSlNDdE5TVWhFUW1kbmNrSm5SVVpDVVdORFFXcERRblJuZVVKek1VcHNZa2RzYUdKdFRteEpSemwxU1VoU2IyRllUV2RaTWxaNVpFZHNiV0ZYVG1oa1IxVm5XVzVyWjFsWE5UVkpTRUpvWTI1U05VbEhSbnBqTTFaMFdsaE5aMWxYVG1wYVdFSXdXVmMxYWxwVFFuWmFhVUl3WVVkVloyUkhhR3hpYVVKb1kwaENjMkZYVG1oWmJYaHNTVWhPTUZsWE5XdFpXRXByU1VoU2JHTnRNWHBKUjBaMVdrTkNhbUl5Tld0aFdGSndZakkxZWtsSE9XMUpTRlo2V2xOM1oxa3lWbmxrUjJ4dFlWZE9hR1JIVldkalJ6bHpZVmRPTlVsSFJuVmFRMEpxV2xoS01HRlhXbkJaTWtZd1lWYzVkVWxJUW5sWlYwNHdZVmRPYkVsSVRqQlpXRkpzWWxkV2RXUklUWFZOUkZsSFEwTnpSMEZSVlVaQ2QwbENSbWx3YjJSSVVuZFBhVGgyWkROa00weHRSbmRqUjNoc1RHMU9kbUpUT1dwYVdFb3dZVmRhY0ZreVJqQmFWMFl4WkVkb2RtTnRiREJsVXpoM1NGRlpSRlpTTUU5Q1FsbEZSa0ZOY3poUWFuTTJWbWhYUjFGc2VrVXlXazlGSzBkWU5FOXZMMDFCTkVkQk1WVmtSSGRGUWk5M1VVVkJkMGxJWjBSQlVVSm5iM0ZvYTJsSE9USk9hMEpuYzBKQ1FVbEdRVVJCUzBKblozRm9hMnBQVUZGUlJFRjNUbTlCUkVKc1FXcEZRVGg1VWs1a2MydHdOVEEyUkVaa1VFeG5hRXhNU25kQmRqVktPR2hDUjB4aFNUaEVSWGhrWTFCWUsyRkNTMnBxVHpobFZXODVTM0JtY0dOT1dWVlpOVmxCYWtGUVdHMU5XRVZhVEN0Uk1ESmhaSEp0YlhOb1RuaDZNMDV1UzIwcmIzVlJkMVUzZGtKVWJqQk1kbXhOTjNad2N6SlpjMnhXVkdGdFVsbE1OR0ZUY3pWclBTSXNJazFKU1VSR2FrTkRRWEI1WjBGM1NVSkJaMGxWU1hOSGFGSjNjREJqTW01MlZUUlpVM2xqWVdaUVZHcDZZazVqZDBObldVbExiMXBKZW1vd1JVRjNUWGRhZWtWaVRVSnJSMEV4VlVWQmQzZFRVVmhDZDJKSFZXZFZiVGwyWkVOQ1JGRlRRWFJKUldONlRWTlpkMHBCV1VSV1VWRk1SRUl4UW1OSVFuTmFVMEpFV2xoS01HRlhXbkJaTWtZd1lWYzVkVWxGUmpGa1IyaDJZMjFzTUdWVVJWUk5Ra1ZIUVRGVlJVTm5kMHRSV0VKM1lrZFZaMU5YTldwTWFrVk1UVUZyUjBFeFZVVkNhRTFEVmxaTmQwaG9ZMDVOYWtWM1RYcEZNMDFxUVhwT2VrVjNWMmhqVGsxNldYZE5la1UxVFVSQmQwMUVRWGRYYWtJeFRWVlJkMUZuV1VSV1VWRkVSRVIwUW1OSVFuTmFVMEpZWWpOS2MxcElaSEJhUjFWblVrZFdNbHBYZUhaalIxWjVTVVpLYkdKSFJqQmhWemwxWTNsQ1JGcFlTakJoVjFwd1dUSkdNR0ZYT1hWSlJVWXhaRWRvZG1OdGJEQmxWRVZNVFVGclIwRXhWVVZEZDNkRFVucFplRVY2UVZKQ1owNVdRa0Z2VFVOclJuZGpSM2hzU1VWc2RWbDVOSGhEZWtGS1FtZE9Wa0pCV1ZSQmJGWlVUVWhaZDBWQldVaExiMXBKZW1vd1EwRlJXVVpMTkVWRlFVTkpSRmxuUVVWaWMxRkxRemswVUhKc1YyMWFXRzVZWjNSNGVtUldTa3c0VkRCVFIxbHVaMFJTUjNCdVoyNHpUalpRVkRoS1RVVmlOMFpFYVRSaVFtMVFhRU51V2pNdmMzRTJVRVl2WTBkalMxaFhjMHcxZGs5MFpWSm9lVW8wTlhnelFWTlFOMk5QUWl0aFlXODVNR1pqY0hoVGRpOUZXa1ppYm1sQllrNW5Xa2RvU1dod1NXODBTRFpOU1VnelRVSkpSMEV4VldSRmQwVkNMM2RSU1UxQldVSkJaamhEUVZGQmQwaDNXVVJXVWpCcVFrSm5kMFp2UVZWMU4wUmxiMVpuZW1sS2NXdHBjRzVsZG5JemNuSTVja3hLUzNOM1VtZFpTVXQzV1VKQ1VWVklRVkZGUlU5cVFUUk5SRmxIUTBOelIwRlJWVVpDZWtGQ2FHbHdiMlJJVW5kUGFUaDJZakpPZW1ORE5XaGpTRUp6V2xNMWFtSXlNSFppTWs1NlkwUkJla3hYUm5kalIzaHNZMjA1ZG1SSFRtaGFlazEzVG5kWlJGWlNNR1pDUkVGM1RHcEJjMjlEY1dkTFNWbHRZVWhTTUdORWIzWk1NazU1WWtNMWFHTklRbk5hVXpWcVlqSXdkbGxZUW5kaVIxWjVZakk1TUZreVJtNU5lVFZxWTIxM2QwaFJXVVJXVWpCUFFrSlpSVVpFT0hac1EwNVNNREZFU20xcFp6azNZa0k0TldNcmJHdEhTMXBOUVRSSFFURlZaRVIzUlVJdmQxRkZRWGRKUWtKcVFWRkNaMjl4YUd0cFJ6a3lUbXRDWjBsQ1FrRkpSa0ZFUVV0Q1oyZHhhR3RxVDFCUlVVUkJkMDV2UVVSQ2JFRnFRa0ZZYUZOeE5VbDVTMjluVFVOUWRIYzBPVEJDWVVJMk56ZERZVVZIU2xoMVpsRkNMMFZ4V2tka05rTlRhbWxEZEU5dWRVMVVZbGhXV0cxNGVHTjRabXREVFZGRVZGTlFlR0Z5V2xoMlRuSnJlRlV6Vkd0VlRVa3pNM2w2ZGtaV1ZsSlVOSGQ0VjBwRE9UazBUM05rWTFvMEsxSkhUbk5aUkhsU05XZHRaSEl3YmtSSFp6MGlMQ0pOU1VsRFVYcERRMEZqYldkQmQwbENRV2RKU1V4aldEaHBUa3hHVXpWVmQwTm5XVWxMYjFwSmVtb3dSVUYzVFhkYWVrVmlUVUpyUjBFeFZVVkJkM2RUVVZoQ2QySkhWV2RWYlRsMlpFTkNSRkZUUVhSSlJXTjZUVk5aZDBwQldVUldVVkZNUkVJeFFtTklRbk5hVTBKRVdsaEtNR0ZYV25CWk1rWXdZVmM1ZFVsRlJqRmtSMmgyWTIxc01HVlVSVlJOUWtWSFFURlZSVU5uZDB0UldFSjNZa2RWWjFOWE5XcE1ha1ZNVFVGclIwRXhWVVZDYUUxRFZsWk5kMGhvWTA1TlZGRjNUa1JOZDAxVVozaFBWRUV5VjJoalRrMTZhM2RPUkUxM1RWUm5lRTlVUVRKWGFrSnVUVkp6ZDBkUldVUldVVkZFUkVKS1FtTklRbk5hVTBKVFlqSTVNRWxGVGtKSlF6Qm5VbnBOZUVwcVFXdENaMDVXUWtGelRVaFZSbmRqUjNoc1NVVk9iR051VW5CYWJXeHFXVmhTY0dJeU5HZFJXRll3WVVjNWVXRllValZOVWsxM1JWRlpSRlpSVVV0RVFYQkNZMGhDYzFwVFFrcGliVTExVFZGemQwTlJXVVJXVVZGSFJYZEtWbFY2UWpKTlFrRkhRbmx4UjFOTk5EbEJaMFZIUWxOMVFrSkJRV2xCTWtsQlFrcHFjRXg2TVVGamNWUjBhM2xLZVdkU1RXTXpVa05XT0dOWGFsUnVTR05HUW1KYVJIVlhiVUpUY0ROYVNIUm1WR3BxVkhWNGVFVjBXQzh4U0RkWmVWbHNNMG8yV1ZKaVZIcENVRVZXYjBFdlZtaFpSRXRZTVVSNWVFNUNNR05VWkdSeFdHdzFaSFpOVm5wMFN6VXhOMGxFZGxsMVZsUmFXSEJ0YTA5c1JVdE5ZVTVEVFVWQmQwaFJXVVJXVWpCUFFrSlpSVVpNZFhjemNVWlpUVFJwWVhCSmNWb3pjalk1TmpZdllYbDVVM0pOUVRoSFFURlZaRVYzUlVJdmQxRkdUVUZOUWtGbU9IZEVaMWxFVmxJd1VFRlJTQzlDUVZGRVFXZEZSMDFCYjBkRFEzRkhVMDAwT1VKQlRVUkJNbWRCVFVkVlEwMVJRMFEyWTBoRlJtdzBZVmhVVVZreVpUTjJPVWQzVDBGRldreDFUaXQ1VW1oSVJrUXZNMjFsYjNsb2NHMTJUM2RuVUZWdVVGZFVlRzVUTkdGMEszRkplRlZEVFVjeGJXbG9SRXN4UVROVlZEZ3lUbEY2TmpCcGJVOXNUVEkzYW1Ka2IxaDBNbEZtZVVaTmJTdFphR2xrUkd0TVJqRjJURlZoWjAwMlFtZEVOVFpMZVV0QlBUMGlYWDAuZXlKMGNtRnVjMkZqZEdsdmJrbGtJam9pTWpBd01EQXdNRFEwT1Rnd09UUTFPU0lzSW05eWFXZHBibUZzVkhKaGJuTmhZM1JwYjI1SlpDSTZJakl3TURBd01EQXpOVGMyTnpjME1EUWlMQ0ozWldKUGNtUmxja3hwYm1WSmRHVnRTV1FpT2lJeU1EQXdNREF3TURRd09USTJNamt6SWl3aVluVnVaR3hsU1dRaU9pSmpiMjB1YVc1dWIzWmhkR2wyWlM1aGNIQkNZWEowWlc1a1pYSWlMQ0p3Y205a2RXTjBTV1FpT2lJMk16RXhNamhoWm1aall6YzNNelk1Wm1ZeFkyVXdNRGtpTENKemRXSnpZM0pwY0hScGIyNUhjbTkxY0Vsa1pXNTBhV1pwWlhJaU9pSXlNVE0xTlRVeU9TSXNJbkIxY21Ob1lYTmxSR0YwWlNJNk1UWTVPRGt4T0RjMU9UQXdNQ3dpYjNKcFoybHVZV3hRZFhKamFHRnpaVVJoZEdVaU9qRTJPRGM0TkRZd05USXdNREFzSW1WNGNHbHlaWE5FWVhSbElqb3hOams0T1RFNU1EVTVNREF3TENKeGRXRnVkR2wwZVNJNk1Td2lkSGx3WlNJNklrRjFkRzh0VW1WdVpYZGhZbXhsSUZOMVluTmpjbWx3ZEdsdmJpSXNJbWx1UVhCd1QzZHVaWEp6YUdsd1ZIbHdaU0k2SWxCVlVrTklRVk5GUkNJc0luTnBaMjVsWkVSaGRHVWlPakUyT1RnNU1UZzNOREl3TXpFc0ltVnVkbWx5YjI1dFpXNTBJam9pVTJGdVpHSnZlQ0lzSW5SeVlXNXpZV04wYVc5dVVtVmhjMjl1SWpvaVVrVk9SVmRCVENJc0luTjBiM0psWm5KdmJuUWlPaUpRUVVzaUxDSnpkRzl5WldaeWIyNTBTV1FpT2lJeE5ETTBOemNpTENKd2NtbGpaU0k2TVRNd01EQXdNQ3dpWTNWeWNtVnVZM2tpT2lKUVMxSWlmUS5VNEZPZFhfWFoyeVVxZHE5T1NBNEExMlVTQkVKekxHc29Ca3VDMFpFbE8tNXMwYU1ndFNBM201eXJuMXJERjFILXM5Rk1pdi1CZ2MzODJmREhjRWxUQSIsInNpZ25lZFJlbmV3YWxJbmZvIjoiZXlKaGJHY2lPaUpGVXpJMU5pSXNJbmcxWXlJNld5Sk5TVWxGVFVSRFEwRTNZV2RCZDBsQ1FXZEpVV1pVYkdaa01HWk9ka1pYZG5wRE1WbEpRVTV6V0dwQlMwSm5aM0ZvYTJwUFVGRlJSRUY2UWpGTlZWRjNVV2RaUkZaUlVVUkVSSFJDWTBoQ2MxcFRRbGhpTTBweldraGtjRnBIVldkU1IxWXlXbGQ0ZG1OSFZubEpSa3BzWWtkR01HRlhPWFZqZVVKRVdsaEtNR0ZYV25CWk1rWXdZVmM1ZFVsRlJqRmtSMmgyWTIxc01HVlVSVXhOUVd0SFFURlZSVU4zZDBOU2VsbDRSWHBCVWtKblRsWkNRVzlOUTJ0R2QyTkhlR3hKUld4MVdYazBlRU42UVVwQ1owNVdRa0ZaVkVGc1ZsUk5RalJZUkZSSmVrMUVhM2hOYWtVMVRsUkZNVTB4YjFoRVZFa3hUVlJCZUUxVVJUVk9WRVV4VFd4dmQyZGFTWGhSUkVFclFtZE9Wa0pCVFUxT01VSjVZakpSWjFKVlRrUkpSVEZvV1hsQ1FtTklRV2RWTTFKMlkyMVZaMWxYTld0SlIyeFZaRmMxYkdONVFsUmtSemw1V2xOQ1UxcFhUbXhoV0VJd1NVWk9jRm95TlhCaWJXTjRURVJCY1VKblRsWkNRWE5OU1RCR2QyTkhlR3hKUm1SMlkyMTRhMlF5Ykd0YVUwSkZXbGhhYkdKSE9YZGFXRWxuVlcxV2MxbFlVbkJpTWpWNlRWSk5kMFZSV1VSV1VWRkxSRUZ3UW1OSVFuTmFVMEpLWW0xTmRVMVJjM2REVVZsRVZsRlJSMFYzU2xaVmVrSmFUVUpOUjBKNWNVZFRUVFE1UVdkRlIwTkRjVWRUVFRRNVFYZEZTRUV3U1VGQ1JVWkZXV1V2U25GVWNYbFJkaTlrZEZocllYVkVTRU5UWTFZeE1qbEdXVkpXTHpCNGFVSXlORzVEVVd0NlVXWXpZWE5JU2s5T1VqVnlNRkpCTUdGTWRrbzBNekpvZVRGVFdrMXZkWFo1Wm5CdE1qWnFXRk5xWjJkSlNVMUpTVU5DUkVGTlFtZE9Wa2hTVFVKQlpqaEZRV3BCUVUxQ09FZEJNVlZrU1hkUldVMUNZVUZHUkRoMmJFTk9VakF4UkVwdGFXYzVOMkpDT0RWaksyeHJSMHRhVFVoQlIwTkRjMGRCVVZWR1FuZEZRa0pIVVhkWmFrRjBRbWRuY2tKblJVWkNVV04zUVc5WmFHRklVakJqUkc5MlRESk9iR051VW5wTWJVWjNZMGQ0YkV4dFRuWmlVemt6WkRKU2VWcDZXWFZhUjFaNVRVUkZSME5EYzBkQlVWVkdRbnBCUW1ocFZtOWtTRkozVDJrNGRtSXlUbnBqUXpWb1kwaENjMXBUTldwaU1qQjJZakpPZW1ORVFYcE1XR1F6V2toS2JrNXFRWGxOU1VsQ1NHZFpSRlpTTUdkQ1NVbENSbFJEUTBGU1JYZG5aMFZPUW1kdmNXaHJhVWM1TWs1clFsRlpRazFKU0N0TlNVaEVRbWRuY2tKblJVWkNVV05EUVdwRFFuUm5lVUp6TVVwc1lrZHNhR0p0VG14SlJ6bDFTVWhTYjJGWVRXZFpNbFo1WkVkc2JXRlhUbWhrUjFWbldXNXJaMWxYTlRWSlNFSm9ZMjVTTlVsSFJucGpNMVowV2xoTloxbFhUbXBhV0VJd1dWYzFhbHBUUW5aYWFVSXdZVWRWWjJSSGFHeGlhVUpvWTBoQ2MyRlhUbWhaYlhoc1NVaE9NRmxYTld0WldFcHJTVWhTYkdOdE1YcEpSMFoxV2tOQ2FtSXlOV3RoV0ZKd1lqSTFla2xIT1cxSlNGWjZXbE4zWjFreVZubGtSMnh0WVZkT2FHUkhWV2RqUnpsellWZE9OVWxIUm5WYVEwSnFXbGhLTUdGWFduQlpNa1l3WVZjNWRVbElRbmxaVjA0d1lWZE9iRWxJVGpCWldGSnNZbGRXZFdSSVRYVk5SRmxIUTBOelIwRlJWVVpDZDBsQ1JtbHdiMlJJVW5kUGFUaDJaRE5rTTB4dFJuZGpSM2hzVEcxT2RtSlRPV3BhV0Vvd1lWZGFjRmt5UmpCYVYwWXhaRWRvZG1OdGJEQmxVemgzU0ZGWlJGWlNNRTlDUWxsRlJrRk5jemhRYW5NMlZtaFhSMUZzZWtVeVdrOUZLMGRZTkU5dkwwMUJORWRCTVZWa1JIZEZRaTkzVVVWQmQwbElaMFJCVVVKbmIzRm9hMmxIT1RKT2EwSm5jMEpDUVVsR1FVUkJTMEpuWjNGb2EycFBVRkZSUkVGM1RtOUJSRUpzUVdwRlFUaDVVazVrYzJ0d05UQTJSRVprVUV4bmFFeE1TbmRCZGpWS09HaENSMHhoU1RoRVJYaGtZMUJZSzJGQ1MycHFUemhsVlc4NVMzQm1jR05PV1ZWWk5WbEJha0ZRV0cxTldFVmFUQ3RSTURKaFpISnRiWE5vVG5oNk0wNXVTMjByYjNWUmQxVTNka0pVYmpCTWRteE5OM1p3Y3pKWmMyeFdWR0Z0VWxsTU5HRlRjelZyUFNJc0lrMUpTVVJHYWtORFFYQjVaMEYzU1VKQlowbFZTWE5IYUZKM2NEQmpNbTUyVlRSWlUzbGpZV1pRVkdwNllrNWpkME5uV1VsTGIxcEplbW93UlVGM1RYZGFla1ZpVFVKclIwRXhWVVZCZDNkVFVWaENkMkpIVldkVmJUbDJaRU5DUkZGVFFYUkpSV042VFZOWmQwcEJXVVJXVVZGTVJFSXhRbU5JUW5OYVUwSkVXbGhLTUdGWFduQlpNa1l3WVZjNWRVbEZSakZrUjJoMlkyMXNNR1ZVUlZSTlFrVkhRVEZWUlVObmQwdFJXRUozWWtkVloxTlhOV3BNYWtWTVRVRnJSMEV4VlVWQ2FFMURWbFpOZDBob1kwNU5ha1YzVFhwRk0wMXFRWHBPZWtWM1YyaGpUazE2V1hkTmVrVTFUVVJCZDAxRVFYZFhha0l4VFZWUmQxRm5XVVJXVVZGRVJFUjBRbU5JUW5OYVUwSllZak5LYzFwSVpIQmFSMVZuVWtkV01scFhlSFpqUjFaNVNVWktiR0pIUmpCaFZ6bDFZM2xDUkZwWVNqQmhWMXB3V1RKR01HRlhPWFZKUlVZeFpFZG9kbU50YkRCbFZFVk1UVUZyUjBFeFZVVkRkM2REVW5wWmVFVjZRVkpDWjA1V1FrRnZUVU5yUm5kalIzaHNTVVZzZFZsNU5IaERla0ZLUW1kT1ZrSkJXVlJCYkZaVVRVaFpkMFZCV1VoTGIxcEplbW93UTBGUldVWkxORVZGUVVOSlJGbG5RVVZpYzFGTFF6azBVSEpzVjIxYVdHNVlaM1I0ZW1SV1NrdzRWREJUUjFsdVowUlNSM0J1WjI0elRqWlFWRGhLVFVWaU4wWkVhVFJpUW0xUWFFTnVXak12YzNFMlVFWXZZMGRqUzFoWGMwdzFkazkwWlZKb2VVbzBOWGd6UVZOUU4yTlBRaXRoWVc4NU1HWmpjSGhUZGk5RldrWmlibWxCWWs1bldrZG9TV2h3U1c4MFNEWk5TVWd6VFVKSlIwRXhWV1JGZDBWQ0wzZFJTVTFCV1VKQlpqaERRVkZCZDBoM1dVUldVakJxUWtKbmQwWnZRVlYxTjBSbGIxWm5lbWxLY1d0cGNHNWxkbkl6Y25JNWNreEtTM04zVW1kWlNVdDNXVUpDVVZWSVFWRkZSVTlxUVRSTlJGbEhRME56UjBGUlZVWkNla0ZDYUdsd2IyUklVbmRQYVRoMllqSk9lbU5ETldoalNFSnpXbE0xYW1JeU1IWmlNazU2WTBSQmVreFhSbmRqUjNoc1kyMDVkbVJIVG1oYWVrMTNUbmRaUkZaU01HWkNSRUYzVEdwQmMyOURjV2RMU1ZsdFlVaFNNR05FYjNaTU1rNTVZa00xYUdOSVFuTmFVelZxWWpJd2RsbFlRbmRpUjFaNVlqSTVNRmt5Um01TmVUVnFZMjEzZDBoUldVUldVakJQUWtKWlJVWkVPSFpzUTA1U01ERkVTbTFwWnprM1lrSTROV01yYkd0SFMxcE5RVFJIUVRGVlpFUjNSVUl2ZDFGRlFYZEpRa0pxUVZGQ1oyOXhhR3RwUnpreVRtdENaMGxDUWtGSlJrRkVRVXRDWjJkeGFHdHFUMUJSVVVSQmQwNXZRVVJDYkVGcVFrRllhRk54TlVsNVMyOW5UVU5RZEhjME9UQkNZVUkyTnpkRFlVVkhTbGgxWmxGQ0wwVnhXa2RrTmtOVGFtbERkRTl1ZFUxVVlsaFdXRzE0ZUdONFptdERUVkZFVkZOUWVHRnlXbGgyVG5KcmVGVXpWR3RWVFVrek0zbDZka1pXVmxKVU5IZDRWMHBET1RrMFQzTmtZMW8wSzFKSFRuTlpSSGxTTldkdFpISXdia1JIWnowaUxDSk5TVWxEVVhwRFEwRmpiV2RCZDBsQ1FXZEpTVXhqV0RocFRreEdVelZWZDBObldVbExiMXBKZW1vd1JVRjNUWGRhZWtWaVRVSnJSMEV4VlVWQmQzZFRVVmhDZDJKSFZXZFZiVGwyWkVOQ1JGRlRRWFJKUldONlRWTlpkMHBCV1VSV1VWRk1SRUl4UW1OSVFuTmFVMEpFV2xoS01HRlhXbkJaTWtZd1lWYzVkVWxGUmpGa1IyaDJZMjFzTUdWVVJWUk5Ra1ZIUVRGVlJVTm5kMHRSV0VKM1lrZFZaMU5YTldwTWFrVk1UVUZyUjBFeFZVVkNhRTFEVmxaTmQwaG9ZMDVOVkZGM1RrUk5kMDFVWjNoUFZFRXlWMmhqVGsxNmEzZE9SRTEzVFZSbmVFOVVRVEpYYWtKdVRWSnpkMGRSV1VSV1VWRkVSRUpLUW1OSVFuTmFVMEpUWWpJNU1FbEZUa0pKUXpCblVucE5lRXBxUVd0Q1owNVdRa0Z6VFVoVlJuZGpSM2hzU1VWT2JHTnVVbkJhYld4cVdWaFNjR0l5TkdkUldGWXdZVWM1ZVdGWVVqVk5VazEzUlZGWlJGWlJVVXRFUVhCQ1kwaENjMXBUUWtwaWJVMTFUVkZ6ZDBOUldVUldVVkZIUlhkS1ZsVjZRakpOUWtGSFFubHhSMU5OTkRsQlowVkhRbE4xUWtKQlFXbEJNa2xCUWtwcWNFeDZNVUZqY1ZSMGEzbEtlV2RTVFdNelVrTldPR05YYWxSdVNHTkdRbUphUkhWWGJVSlRjRE5hU0hSbVZHcHFWSFY0ZUVWMFdDOHhTRGRaZVZsc00wbzJXVkppVkhwQ1VFVldiMEV2Vm1oWlJFdFlNVVI1ZUU1Q01HTlVaR1J4V0d3MVpIWk5WbnAwU3pVeE4wbEVkbGwxVmxSYVdIQnRhMDlzUlV0TllVNURUVVZCZDBoUldVUldVakJQUWtKWlJVWk1kWGN6Y1VaWlRUUnBZWEJKY1ZvemNqWTVOall2WVhsNVUzSk5RVGhIUVRGVlpFVjNSVUl2ZDFGR1RVRk5Ra0ZtT0hkRVoxbEVWbEl3VUVGUlNDOUNRVkZFUVdkRlIwMUJiMGREUTNGSFUwMDBPVUpCVFVSQk1tZEJUVWRWUTAxUlEwUTJZMGhGUm13MFlWaFVVVmt5WlROMk9VZDNUMEZGV2t4MVRpdDVVbWhJUmtRdk0yMWxiM2xvY0cxMlQzZG5VRlZ1VUZkVWVHNVROR0YwSzNGSmVGVkRUVWN4Yldsb1JFc3hRVE5WVkRneVRsRjZOakJwYlU5c1RUSTNhbUprYjFoME1sRm1lVVpOYlN0WmFHbGtSR3RNUmpGMlRGVmhaMDAyUW1kRU5UWkxlVXRCUFQwaVhYMC5leUp2Y21sbmFXNWhiRlJ5WVc1ellXTjBhVzl1U1dRaU9pSXlNREF3TURBd016VTNOamMzTkRBMElpd2lZWFYwYjFKbGJtVjNVSEp2WkhWamRFbGtJam9pTmpNeE1USTRZV1ptWTJNM056TTJPV1ptTVdObE1EQTVJaXdpY0hKdlpIVmpkRWxrSWpvaU5qTXhNVEk0WVdabVkyTTNOek0yT1dabU1XTmxNREE1SWl3aVlYVjBiMUpsYm1WM1UzUmhkSFZ6SWpveExDSnphV2R1WldSRVlYUmxJam94TmprNE9URTROelF5TURNeExDSmxiblpwY205dWJXVnVkQ0k2SWxOaGJtUmliM2dpTENKeVpXTmxiblJUZFdKelkzSnBjSFJwYjI1VGRHRnlkRVJoZEdVaU9qRTJPVGc1TVRZd05Ua3dNREFzSW5KbGJtVjNZV3hFWVhSbElqb3hOams0T1RFNU1EVTVNREF3ZlEud005T0swTzBfMk8zS3lvdFpGckEwbHdKYnAtczNIUHItV2cwSFlTdHRHWHZlUVJMOXVzYmZRRHpmX1pEZHJtR05qLWhUd1EwbGh1NzFDLS10cUhUS0EiLCJzdGF0dXMiOjF9LCJ2ZXJzaW9uIjoiMi4wIiwic2lnbmVkRGF0ZSI6MTY5ODkxODc0MjA0OH0.uyEUSeX-EAZsGCu48QxQHeKRYqzm8wM9JzriG1E2rK1h2cjsfHyfI7vyaig6uaFrI8cLaryehrbhOWXGve_mAA'

       let decodedPayload = await conversion('e883ff9f7f33488584b5e5dabbef5477',keys);

        

        console.log(decodedPayload.data.signedRenewalInfo);

        // signedRenewwal Info

        let signedTransactionInfo = await conversion('e883ff9f7f33488584b5e5dabbef5477',decodedPayload.data.signedTransactionInfo);

        // 

        let signedRenewalInfo = await conversion('e883ff9f7f33488584b5e5dabbef5477',decodedPayload.data.signedRenewalInfo);


        // check transaction from original User
        let user;
        let checkPayments = await purchases.findOne({
            originalTransactionId : signedTransactionInfo.originalTransactionId
        })
        if(checkPayments)
        {
            user = checkPayments.userid

            // update the User Expiry and PaymnentStatus, if payment is Cancelled, the system should update the payment status Accordingly!
        }

  
        let purchase = new purchases({
            originalTransactionId : signedTransactionInfo.originalTransactionId,
            transactionId : signedTransactionInfo.transactionId,
            productId : signedTransactionInfo.productId,
            userid : user,
            type : signedTransactionInfo.transactionReason,
            platform : "IOS"
        })

        await purchase.save();


        return res.json({
            mainPayload : decodedPayload.data,
            signedTransactionInfo,
            signedRenewalInfo

        });

    }
    catch(error)
    {
        return res.json(error);
    }
}

export default {
    testNotification,
    all,
    store,
    getSingleNotification,
    iosWebhook,
    newWebhook,
    androidWebhook,
    bartenderLogs
}