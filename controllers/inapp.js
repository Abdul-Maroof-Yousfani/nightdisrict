
import serviceAccount from "../config/serviceAccount.js";
import Verifier from "google-play-billing-validator";
import inapp from "../models/inapp.js";

import admin from 'firebase-admin';
import automationlogs from "../models/automationlogs.js";


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const options = {
    email: serviceAccount.client_email,
    key: serviceAccount.private_key
  };

const verifier = new Verifier(options);


const acknowledge = async(req,res) =>
{   
    try
    {  
        const verifier = new Verifier(options);

        //  create a record and update Verification status
        let checkData = await inapp.findOne({
            productid : req.body.productid,
            purchaseToken : req.body.purchaseToken
        })
        if(checkData) return res.status(409).json({
            status : 409,
            message : "Already Applied",
            data : {}
        })

        let data = new inapp(req.body)
        data = await data.save()
       

        const receipt = {
            packageName: req.body.packageName,
            productId: req.body.productid,
            purchaseToken: req.body.purchaseToken
            
        };


        let promiseData = await verifier.verifyINAPP(receipt)
        if(promiseData.isSuccessful)
        {
            await inapp.findByIdAndUpdate({
                _id : data._id,
            },{
                $set : {
                    isAcknowledged : true
                }
            })
        }

        return res.status(200).json({
            status : 200,
            message  : "success",
            data : promiseData
        })


        // if verification is Successfull, create an Invoice Method

        // if status  is 204, send FCM notification


    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message  : error.message,
        })
    }
}

const confirm = async(req,res) => {
    try
    {
        let logs = [];

        let inAppLogs = new automationlogs({
            status : "success"
        });

        await inAppLogs.save();

        let data = await inapp.find({
            isConfirm : false
        })

        await Promise.all(data.map(async(e) =>{
            let receipt = {
                packageName: e.packageName,
                productId: e.productid,
                purchaseToken: e.purchaseToken,
                developerPayload: ""
            };

            
            

            let promiseData2 = await verifier.verifyINAPP(receipt)
                if(promiseData2.payload.code == 204)
                {
                    await inapp.findByIdAndUpdate({_id:e._id},{
                        $set : {
                            isConfirm : true,
                            updated : new Date()
                        }
                    },{
                        new:true
                    })

                    // send notification

                    const payload = {
                        notification: {
                            title: "In App Purchase",
                            body: promiseData2.payload.message,
                        },
                    };

                    const response = await admin.messaging().sendToDevice(e.fcm, payload);

                    logs.push({
                        "product" : e.productid,
                        "status" : promiseData2.payload.message
                    })
                    
                }
                else

                {
                    logs.push({
                        "product" : e.productid,
                        "status" : promiseData2.payload.message
                    })
                }

        }))

       

        return res.json({
            logs
        })

    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error,
            data : {}
        })
    }
}


export  default{
    acknowledge,
    confirm
}