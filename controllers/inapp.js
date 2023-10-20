
import serviceAccount from "../config/serviceAccount.js";
import Verifier from "google-play-billing-validator";
import inapp from "../models/inapp.js";

import admin from 'firebase-admin';
import automationlogs from "../models/automationlogs.js";
import ServiceAccount from "../models/serviceAccount.js";
import { getAnalytics, logEvent } from "@firebase/analytics";









const acknowledge = async(req,res) =>
{   
    try
    {  

        //  create a record and update Verification status
        let checkData = await inapp.findOne({
            productid : req.body.productid,
            purchaseToken : req.body.purchaseToken
        })
        // if(checkData) return res.status(409).json({
        //     status : 409,
        //     message : "Already Applied",
        //     data : {}
        // })


        // get service account based on project id

        let serviceAccount = await ServiceAccount.findOne({
            product_id : req.body.project_id
        })

   

        // options

        let options = {
            email: serviceAccount.client_email,
            key: serviceAccount.private_key
          };
        
        const verifier = new Verifier(options);



       

        const receipt = {
            packageName: req.body.packageName,
            productId: req.body.productid,
            purchaseToken: req.body.purchaseToken
            
        };


        let promiseData = await verifier.verifyINAPP(receipt)
 
        if(promiseData.isSuccessful)
        {

            let data = new inapp(req.body)
            data = await data.save()

            await inapp.findByIdAndUpdate({
                _id : data._id,
            },{
                $set : {
                    isAcknowledged : true,
                    isVerify : true

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

        // admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccount)
        // });

        let start = new Date();
        start.setUTCHours(0,0,0,0);
        let logs = [];


        let inAppLogs = new automationlogs({
            status : "success"
        });

        await inAppLogs.save();

        let data = await inapp.find({
            isConfirm : false,
            createdAt: {$gte: start},
        })

   
     

        await Promise.all(data.map(async(e) =>{
            
            
            
            let receipt = {
                packageName: e.packageName,
                productId: e.productid,
                purchaseToken: e.purchaseToken,
                developerPayload: ""
            };

            let serviceAccount = await ServiceAccount.findOne({
                project_id : e.project_id,
                
            })
    
       
    
            // options
    
            let options = {
                email: serviceAccount.client_email,
                key: serviceAccount.private_key
              };
            
            const verifier = new Verifier(options);

            
            

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

                    //  Add a Log

                    let log = await admin.analytics().logEvent('purchase', {
                        userId: "GPA.3390-0391-9810-37378",
                        productId  : e.productid,
                        price : 100
                      });

                    // send notification

                    console.log(log)

                    const payload = {
                        data: {
                            title: e.title,
                            body: e.description,
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
        console.log(error)
        return res.status(500).json({
            status : 500,
            message : error,
            data : {}
        })
    }
}

const fcm = async(req,res) =>
{
    try
    {
            // test fcm
            let serviceAccount = await ServiceAccount.findOne({
                project_id : "fitech33-b944b",
                
            })
            const payload = {
                data: {
                    title: "test Final Title",
                    body: "test Final Description"
                    
                }
                
            };

            const response = await admin.messaging().sendToDevice("fz3DRVyKQ8WWOj1jaVNZEy:APA91bEP6AD_KhQCLLmkMPsHoCXzq9y0x-eT4K7E3r74JTuQt-l5pssVGhaIJzkppN-jQDt8yym4lNWNtn1HJv9YD4ACUY3rr0Q2goahfLtYOg2loQPS_-WTikMYoC-Eb4Cpne_6vPxq", payload);
            return res.json({response})
    }
    catch(error)
    {
        console.log(error)
        return res.json({error})
    }
}

const view = async(req,res) =>{
    try
    {
        let data = await inapp.findOne({
            productid : req.body.productid,
            purchaseToken : req.body.purchaseToken
        })
        return res.json({
            status : 200,
            message : "success",
            data
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

const service = async(req,res) =>
{
    try
    {   
        let data = await ServiceAccount.findOne({
            private_key_id : req.body.private_key_id
        })
        if(data) return res.status(409).json({
            status : 409,
            message : "Service Account Already Exist",
            data : {}
        })

        data = new ServiceAccount(req.body);
        data = await data.save();

        return res.json({
            status : 200,
            message : "success",
            data
        })

    }
    catch(error)
    {
        return res.json({
            status : 200,
            message : error.message,
            data : {}
        })
    }
}

const listServiceAccounts = async(req,res) =>
{
    try
    {   
        let data = await ServiceAccount.find({
        })

        return res.json({
            status : 200,
            message : "success",
            data
        })

    }
    catch(error)
    {
        return res.json({
            status : 200,
            message : error.message,
            data : {}
        })
    }
}

const verifyIApp2 = async(req,res) =>{
    try
    {

    }
    catch(error)
    {

    }
}

export  default{
    acknowledge,
    confirm,
    view,
    service,
    listServiceAccounts,
    fcm
}