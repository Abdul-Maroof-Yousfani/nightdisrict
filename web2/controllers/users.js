const fs = require('fs');
const jwt = require('jsonwebtoken');
const helper = require('../utils/helpers.js');
const socketHandler = require('../utils/SocketHandler.js');
const User = require('../models/users.js');
const Order = require('../models/order.js');
const Device = require('../models/device.js');
const threadMails = require('../models/threadMails.js');
const Payment = require('../models/payment.js');
const SimpleSchema = require('simpl-schema');
const Imap = require('imap');
const MailParser = require('mailparser').MailParser;
const Promise = require('bluebird');
const mongoose = require('mongoose');

const createEmail = async (req, res) => {
    try {
        const { deviceId, fcmToken, premium } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                status: "error",
                message: "deviceId is required.",
            });
        }

        const existingUser = await Device.findOne({ deviceId }).lean();
        if (existingUser) {
            if (!existingUser.premium && !premium) {
                return res.status(200).json({
                    status: "Success",
                    message: "User already exists and is not a premium user. Only one email allowed.",
                    data: { ...existingUser }
                });
            }
        }

        const email = await helper.createEmail();
        const userObject = {
            deviceId,
            fcmToken,
            email: email.email,
            password: email.password,
            premium: premium || false
        };
        const forDevice = {
            deviceId,
            premium: premium,
            emailId: email._id,
            mailBox: [
                {
                    email: email.email,
                }
            ]

        }
        if (existingUser) {
            await Device.findOneAndUpdate({ deviceId: deviceId }, { $push: { mailBox: email } })
        }
        else {
            const forinserted = await new Device(forDevice).save();
        }
        const inserted = await new User(userObject).save();
        const token = jwt.sign({ ...inserted._doc }, process.env.JWT_SECRET);


        // Function for cron job to delete this created email after 2 hours
        // helper.deleteMailAfterThreeDays(inserted);

        return res.json({
            status: "success",
            message: "New temporary email has been generated!",
            data: { ...inserted._doc, token }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Unexpected error",
            trace: error.message
        });
    }
};

const deleteEmail = async (req, res) => {
    const emailId = req.params.emailId;

    if (emailId === null || emailId === undefined || emailId === '') {
        return res.status(400).json({
            status: 'error',
            message: 'Please provide valid email ID!'
        })
    }

    const fetchedEmail = await User.findOneAndDelete({ _id: emailId });

    if (fetchedEmail === null) {
        return res.json({
            status: 'error',
            message: "Email Doesn't Exist!",
        })
    }

    return res.json({
        status: 'success',
        message: 'Email Deleted!',
        fetchedEmail
    })

}

const getUserDetails = async (req, res) => {

    socketHandler.sendSignal(req, {
        evt: 'signal',
        message: 'handler called on Get User Details API'
    });

    return res.json({
        status: 'success',
        message: 'User information retrieved!',
        data: req.user
    });
}

const cronJob = async (req, res) => {
    try {
        const { id } = req.params;
        const checkUsers = await User.find({}).lean();
        // if (!checkUser) {
        //     return res.status(404).json({
        //         status: "error",
        //         message: "User not found. Please provide a valid Device Id.",
        //     });
        // }
        // find user with empty user
        // make a loap
        // send email for every user
        // check 
        // return res.json({
        //     checkUser
        // })
        await Promise.all(checkUsers.map( async (e) =>{
            let checkUser;
            checkUser = e;

            const imap = new Imap({
                user: checkUser.email,
                password: checkUser.password,
                host: 'idealjobsworld.site',
                port: 143,
                tls: false
            });
    
            const dataList = [];
    
            
    
            imap.once("end", function () {
                console.log("Connection is Ending NOW!");
    
                // Save all the fetched emails to the database
                threadMails.insertMany(dataList, (err, savedMails) => {
                    if (err) {
                        return res.status(500).json({
                            status: 'error',
                            message: err.message,
                        });
                    }
                    
                });
            });
    
            await new Promise((resolve, reject) => {
                imap.once("ready", () => {
                    imap.openBox("INBOX", false, function (err, mailBox) {
                        if (err) {
                            imap.end();
                            reject(err);
                        }
    
                        imap.search(["UNSEEN"], function (err, results) {
                            if (err) {
                                imap.end();
                                reject(err);
                            }
    
    
                            if (results.length === 0) {
                                // No unread mails, end the connection and resolve the promise
                                imap.end();
                                resolve();
                                return;
                            }
    
    
    
                            const f = imap.fetch(results, { bodies: "" });
                            f.on("message", (msg, seqno) => {
    
                                const mail = { Attachments: [] };
    
                                const parser = new MailParser();
                                parser.on("headers", (headers) => {
                                    // Extract the email address from headers
                                    const mailAddress = headers.get('to').value.map((addr) => addr.address);
                                    // const body = headers.get('return-path').value.map((returnPath) => console.log(returnPath));
                                    mail.Created_At = headers.get("date");
                                    mail.Mail_id = seqno;
                                    mail.Mail_Address = { value: mailAddress };
                                    mail.Mail_From = headers.get("from").text;
                                    mail.Message_ID = headers.get('message-id');
                                    mail.Mail_Subject = headers.get('subject')
                                });
    
                                parser.on('data', data => {
                                    if (data.type === 'text') {
    
                                        mail.Mail_Text = data.text;
                                    }
    
                                    if (data.type === 'attachment') {
                                        const bufs = [];
    
                                        // Listen for the 'data' event to gather attachment chunks
                                        data.content.on('data', function (chunk) {
                                            bufs.push(chunk);
                                        });
    
                                        // Listen for the 'end' event when all attachment data is received
                                        data.content.on('end', function () {
                                            const buffer = Buffer.concat(bufs);
                                            let attachmentString = buffer.toString('base64'); // Convert buffer to base64 string
                                            attachmentString = Buffer.from(attachmentString, "base64");
                                            let date = Date.now() + '.jpg';
                                            fs.writeFileSync(`public/attachment/${date}`, attachmentString)
                                            const fileUrl = `http://67.205.168.89:3002/attachment/${date}`;
    
                                            // Add the file URL to your mail object
                                            mail.Attachments.push(fileUrl);
    
                                            // Release the attachment data resources
                                            data.release();
                                        });
                                    }
                                });
    
                                msg.on("body", function (stream) {
                                    stream.on("data", function (chunk) {
                                        parser.write(chunk.toString("utf8"));
                                    });
                                });
                                msg.once("end", function () {
                                    parser.end();
                                });
                                parser.on('end', async () => {
                                    mail.Read_Status = 0; // Unread status, you can change this as needed
                                    let checkMail = await threadMails.findOne({
                                        Message_ID: mail.Message_ID
                                    })
                                    if (!checkMail) {
                                        dataList.push(mail);
    
                                    }
                                });
                            });
    
                            f.once("error", function (err) {
                                f.removeAllListeners('end');
                                f.removeAllListeners('message');
                                imap.end();
                                reject(err);
                            });
    
                            f.once("end", function () {
                                imap.end();
                                resolve();
                            });
                        });
                    });
                });
    
                imap.connect();
                
            });

            return e;
        }))
        return res.status(400).json({
            status: 'success',
            Emails: [],
                    });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};

const recivedEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const checkUser = await User.findById({ _id: id }).lean();
        if (!checkUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found. Please provide a valid Device Id.",
            });
        }
        // find user with empty user
        // make a loap
        // send email for every user
        // check 
        const imap = new Imap({
            user: checkUser.email,
            password: checkUser.password,
            host: 'idealjobsworld.site',
            port: 143,
            tls: false
        });

        const dataList = [];

        imap.once("error", function (err) {
            console.log("[CONNECTION ERROR]", err.stack);
            return res.status(500).json({
                status: 'error',
                message: 'Error connecting to the mail server.',
            });
        });

        imap.once("end", function () {
            console.log(dataList)
            console.log("Connection is Ending NOW!");

            // Save all the fetched emails to the database
            threadMails.insertMany(dataList, (err, savedMails) => {
                if (err) {
                    return res.status(500).json({
                        status: 'error',
                        message: err.message,
                    });
                }
                return res.json({
                    status: 'success',
                    Emails: savedMails,
                });
            });
        });

        await new Promise((resolve, reject) => {
            imap.once("ready", () => {
                imap.openBox("INBOX", false, function (err, mailBox) {
                    if (err) {
                        console.log('[ERROR]', err);
                        imap.end();
                        reject(err);
                    }

                    imap.search(["UNSEEN"], function (err, results) {
                        if (err) {
                            console.log("Error fetching messages:", err);
                            imap.end();
                            reject(err);
                        }


                        if (results.length === 0) {
                            // No unread mails, end the connection and resolve the promise
                            console.log("No unread mails");
                            imap.end();
                            resolve();
                            return;
                        }



                        const f = imap.fetch(results, { bodies: "" });
                        f.on("message", (msg, seqno) => {

                            const mail = { Attachments: [] };

                            const parser = new MailParser();
                            parser.on("headers", (headers) => {
                                console.log(headers);
                                // Extract the email address from headers
                                const mailAddress = headers.get('to').value.map((addr) => addr.address);
                                // const body = headers.get('return-path').value.map((returnPath) => console.log(returnPath));
                                mail.Created_At = headers.get("date");
                                mail.Mail_id = seqno;
                                mail.Mail_Address = { value: mailAddress };
                                mail.Mail_From = headers.get("from").text;
                                mail.Message_ID = headers.get('message-id');
                                mail.Mail_Subject = headers.get('subject')
                            });

                            parser.on('data', data => {
                                if (data.type === 'text') {

                                    mail.Mail_Text = data.text;
                                }

                                if (data.type === 'attachment') {
                                    const bufs = [];

                                    // Listen for the 'data' event to gather attachment chunks
                                    data.content.on('data', function (chunk) {
                                        bufs.push(chunk);
                                    });

                                    // Listen for the 'end' event when all attachment data is received
                                    data.content.on('end', function () {
                                        const buffer = Buffer.concat(bufs);
                                        let attachmentString = buffer.toString('base64'); // Convert buffer to base64 string
                                        attachmentString = Buffer.from(attachmentString, "base64");
                                        let date = Date.now() + '.jpg';
                                        fs.writeFileSync(`public/attachment/${date}`, attachmentString)
                                        const fileUrl = `http://67.205.168.89:3002/attachment/${date}`;

                                        // Add the file URL to your mail object
                                        mail.Attachments.push(fileUrl);

                                        // Release the attachment data resources
                                        data.release();
                                    });
                                }
                            });

                            msg.on("body", function (stream) {
                                stream.on("data", function (chunk) {
                                    parser.write(chunk.toString("utf8"));
                                });
                            });
                            msg.once("end", function () {
                                parser.end();
                            });
                            parser.on('end', async () => {
                                mail.Read_Status = 0; // Unread status, you can change this as needed
                                console.log(dataList);
                                let checkMail = await threadMails.findOne({
                                    Message_ID: mail.Message_ID
                                })
                                if (!checkMail) {
                                    dataList.push(mail);

                                }
                            });
                        });

                        f.once("error", function (err) {
                            console.log("Error fetching messages:", err);
                            f.removeAllListeners('end');
                            f.removeAllListeners('message');
                            imap.end();
                            reject(err);
                        });

                        f.once("end", function () {
                            console.log("Done fetching all unseen messages.");
                            imap.end();
                            resolve();
                        });
                    });
                });
            });

            console.log(dataList);
            imap.connect();
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error.',
        });
    }
};

const trackUser = async (req, res) => {
    try {
        // Find user 
        const { deviceId, fcmToken, premium } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                status: "error",
                message: "deviceId is required.",
            });
        }

        const existingUser = await Device.findOne({ deviceId: deviceId }).lean();


        if (existingUser) {

            // already exist

            // helper to create similar response, what you have when a new user is created

            return res.status(200).json({
                status: "Success",
                message: "Success",
                data: {
                    paymentStatus: existingUser.paymentStatus,
                    isPremiun: existingUser.premium,
                    _id: existingUser._id,
                    mailBox: existingUser.mailBox
                }
            });
        }

        const email = await helper.createEmail();
        const userObject = {
            deviceId,
            fcmToken,
            email: email.email,
            password: email.password,
        };
        const forDevice = {
            deviceId,
            premium: premium,
            fcmToken,
            emailId: email._id,
            mailBox: [
                {
                    email: email.email,
                }
            ]

        }
        if (!existingUser) {
            const forinserted = await new Device(forDevice).save();
        }
        const inserted = await new User(userObject).save();
        const token = jwt.sign({ ...inserted._doc }, process.env.JWT_SECRET);


        // Function for cron job to delete this created email after 2 hours
        helper.deleteMailAfterThreeDays(inserted);

        return res.json({
            status: "success",
            message: "New temporary email has been generated!",
            data: {
                paymentStatus: inserted.paymentStatus,
                isPaid: inserted.paymentStatus,
                isPremiun: false,
                _id: inserted._id,
                mailBox: [
                    {
                        email: inserted.email,
                        id: inserted._id
                    },

                ]
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

const createOrder = async (req, res) => {
    try {
        const { orderNo, items, deviceId } = req.body;

        const order = new Order({
            orderNo,
            items,
            deviceId,
        });

        const createdOrder = await order.save();

        return res.json({
            status: 'success',
            message: 'Order created successfully',
            data: createdOrder
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Unexpected error',
            trace: error.message
        });
    }
};

const createPayment = async (req, res) => {
    try {
        const body = req.body;
        const paymentSchema = new SimpleSchema({
            order: {
                type: String,
            },
            deviceId: {
                type: String,
            },
            amountPaid: {
                type: Number,
            },
            paymentStatus: {
                type: String,
            }
        }).newContext();

        if (!paymentSchema.validate(body)) {
            return res.status(400).json({
                status: "error",
                message: "Validation errors in the request body.",
                errors: paymentSchema.validationErrors()
            });
        }

        const { order, deviceId, amountPaid, paymentStatus } = body;

        // Create a new payment document
        const newPayment = new Payment({
            order,
            deviceId,
            amountPaid,
            paymentStatus
        });

        // Save the payment document to the database
        const savedPayment = await newPayment.save();
        var timeObject = new Date();
        timeObject.setTime(timeObject.getTime() + 1000 * 60)
        await Device.findOneAndUpdate(
            { deviceId: body.deviceId },
            { $set: { premium: true, paymentStatus: "paid", expireAt: timeObject } },
            { new: true }
        ).lean();

        await User.findOneAndUpdate(
            { deviceId: body.deviceId },
            { $set: { premium: true, paymentStatus: "paid" } },
            { new: true }
        ).lean();



        return res.status(200).json({
            status: "success",
            message: "Payment created successfully!",
            data: savedPayment
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Unexpected error",
            trace: error.message
        });
    }
};

const deleteEmails = async (req, res) => {
    const { id } = req.body;
    const deleteEmail = await threadMails.findOneAndDelete({ _id: id })
    if (!deleteEmail) return res.status(404).json({
        status: 'error',
        message: 'no email found against this ID'
    })
    return res.status(200).json({
        status: "seccuess",
        message: "SuccessFully ! Email is Deleted"
    })
}

const recivedEmailDuplicate = async (req, res) => {
    try {
        const { mailAddressValue } = req.body;

        const foundMails = await threadMails.find({
            'Mail_Address.value': mailAddressValue,
        });

        if (!foundMails) return res.status(404).json({
            status: "error",
            message: "Email not found in threadMail Database"
        })
        const foundMailListPaginated = helper.pagination(foundMails, req.query.page, req.query.limit);

        return res.status(200).json({
            status: "success",
            message: "success",
            data: foundMailListPaginated
        })


    } catch (error) {
        console.error('Error finding mails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateReadStatus = async (req, res) => {
    try {
        let { id, deviceId } = req.body
        const findEmail = await threadMails.findOneAndUpdate(
            { _id: id },
            { $set: { Read_Status: 1 } },
            { new: true }
        ).lean();

        if (!findEmail) return res.status(404).json({
            status: "Error",
            message: "Please Enter a Valid Id ! User not found aganist this ID "
        })

        return res.status(200).json({
            status: "Success",
            message: "SuccessFully Email update status"
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Unexpected error",
            trace: error.message
        });
    }
}

const creteAndDeleteEmails = async (req, res) => {
    try {

        const { deviceId, fcmToken, premium } = req.body;
        const checkInUserModel = await User.findOneAndDelete({ deviceId: deviceId });
        if (!checkInUserModel) return res.status(404).json({
            status: "error",
            message: "User Not found aganist this DeviceId"
        })
        console.log("delete");
        const checkUserInThreadMial = await threadMails.findOneAndDelete({ deviceId: deviceId })
        // if (!checkUserInThreadMial) return res.status(404).json({
        //     status: "error",
        //     message: "User Not found aganist this DeviceId"
        // })
        if (checkUserInThreadMial) {
            console.log("userExists");
        }
        console.log("delete");

        const email = await helper.createEmail();
        const userObject = {
            deviceId,
            fcmToken,
            email: email.email,
            password: email.password,
            premium: premium || false
        };
        const forDevice = {
            deviceId,
            premium: premium,
            emailId: email._id,
            mailBox: [
                {
                    email: email.email,
                }
            ]

        }
        const inserted = await new User(userObject).save();
        const token = jwt.sign({ ...inserted._doc }, process.env.JWT_SECRET);


        // Function for cron job to delete this created email after 2 hours
        // helper.deleteMailAfterThreeDays(inserted);

        return res.json({
            status: "success",
            message: "New temporary email has been generated!",
            data: { ...inserted._doc, token }
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Unexpected error",
            trace: error.message
        });
    }
}

module.exports = {
    createEmail,
    deleteEmail,
    getUserDetails,
    recivedEmail,
    trackUser,
    createOrder,
    createPayment,
    deleteEmails,
    recivedEmailDuplicate,
    updateReadStatus,
    creteAndDeleteEmails,
    cronJob
}; 