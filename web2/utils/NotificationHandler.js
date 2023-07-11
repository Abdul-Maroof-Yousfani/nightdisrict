const FCM = require('fcm-node')
const Notification = require('../models/Notification.js');
let fcm = new FCM('AAAA8f0AzeE:APA91bFn6N_G2-JJL0L3W0r_8xAslJdWfA81vo52P6ArhPhmxZiOPF2Ms3bY2VHHeQAhsg9YFJMvdMP6gybmPrRoMbOjXfIVDk5HePN3CyOXN9HQdi68H1coNfhMppLWdKYUZ2y9E9or');

const sendNotification = (userToken, title, body, data = null, userid, image) => {
    // console.log(userToken);
    Notification.create({
        title: title,
        body: body,
        userid: userid,
        image: image,
        payload: data
    }).then(result => {
        let message = {
            to: userToken,
            collapse_key: 'xxxxxx-xxxxxx-xxxxxx',

            notification: {
                title: title,
                body: body,
            },
            data: { ...data, notificationid: result._id }
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.log(err, "Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
        console.log("notification inserted")
    }).catch(error => console.log(error))
}

const sendNotificationMultiple = (userToken, title, body, data = null, userids, image) => {
    let message = {
        registration_ids: userToken,
        collapse_key: 'xxxxxx-xxxxxx-xxxxxx',
        notification: {
            title: title,
            body: body,
        },
        data: data
    };
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
            console.log(`${process.env.DOMAIN}${image}`);
        }
    });
    userids.map(id => {
        Notification.create({
            title: title,
            body: body,
            userid: id,
            image: image,
            payload: data
        }).then(result => console.log(result))
            .catch(error => console.log(error))
    })
}

module.exports = {
    sendNotification,
    sendNotificationMultiple
}