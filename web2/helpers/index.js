// const serviceAccount = require("./config/tempmail.json") ;
// const admin = require('firebase-admin') ;




// const handler = async(req) =>{
//     try
//     {   
//         const payload = {
//             notification: {
//                 title: 'TempMail',
//                 body: 'New Email Received',
//             },
//         };
//         const response = await admin.messaging().sendToDevice('c9XboojEtjU:APA91bHmZwQN54BAWv6zsppAm4FESgF0J7k8QEnn7yayV5IZjJN4wtaAXAoi1KEbHNQ-E1cmGbKJ0DbWUpOPvFyMb0HgH5j8zYvxyNS-N19osGMfBHI3NHZMwf5Rmm-aLxxExO8QaQ7a', payload);
//         return res.json({
//             response
//         })
       
//     }
//     catch(error)
//     {
//         return res.json({
//             response
//         })
//     }
// }


// module.exports = handler