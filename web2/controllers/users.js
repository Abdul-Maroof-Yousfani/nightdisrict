const jwt = require('jsonwebtoken');
const helper = require('../utils/helpers.js');
const socketHandler = require('../utils/SocketHandler.js');
const User = require('../models/users.js');
const Order = require('../models/order.js');
const Device = require('../models/device.js');
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
                return res.status(403).json({
                    status: "error",
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
            premium: premium
        }
        const forinserted = await new Device(forDevice).save();
        const inserted = await new User(userObject).save();
        const token = jwt.sign({ ...inserted._doc }, process.env.JWT_SECRET);


        // Function for cron job to delete this created email after 2 hours
        helper.deleteMailAfterTwoHours(inserted);

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

const recivedEmail = async (req, res) => {
    try {
        const body = req.params;
        const checkUser = await User.findOne({ id: body }).lean();
        if (!checkUser) {
            return res.status(404).json({
                status: "error",
                message: "Please add a Device Id",
            });
        }

        const imap = new Imap({
            user: checkUser.email,
            password: checkUser.password,
            host: 'idealjobsworld.site',
            port: 143,
            tls: false
        });

        Promise.promisifyAll(imap);
        const dataList = [];
        const emailList = await new Promise((resolve, reject) => {
            imap.once("ready", () => {
                imap.openBox("INBOX", false, function (err, mailBox) {
                    if (err) {
                        console.log('[ERROR]', err);
                        reject(err);
                    }
                    imap.search(["UNSEEN"], function (err, results) {
                        if (!results || !results.length) {
                            console.log("No unread mails");
                            imap.end();
                            resolve([]);
                        } else {
                            let f = imap.fetch(results, { bodies: "" });
                            f.on("message", (msg, seqno) => {
                                const mail = { Attachments: [] };

                                var parser = new MailParser();
                                parser.on("headers", (headers) => {
                                    mail.Created_At = headers.get("date");
                                    mail.Mail_id = seqno;
                                    mail.Mail_Address = headers.get("to");
                                    mail.Mail_From = headers.get("from").text;
                                });

                                parser.on('data', data => {
                                    if (data.type === 'text') {
                                        mail.Mail_Text = data.text;
                                    }

                                    if (data.type === 'attachment') {
                                        let bufs = [];
                                        data.content.on('data', function (d) { bufs.push(d); });
                                        data.content.on('end', function () {
                                            let buffer = Buffer.concat(bufs);
                                            mail.Attachments.push({ filename: data.filename, content: buffer });
                                            data.release();
                                        })
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

                                parser.on('end', () => {
                                    mail.Read_Status = 0; // Unread status, you can change this as needed
                                    dataList.push(mail);
                                    console.log(dataList);
                                });
                            });

                            f.once("error", function (err) {
                                console.log("Error fetching messages:", err);
                                reject(err);
                            });

                            f.once("end", function () {
                                console.log("Done fetching all unseen messages.");
                                imap.end();
                                resolve(dataList);
                            });
                        }
                    });
                });
            });

            imap.once("error", function (err) {
                console.log("[CONNECTION ERROR]", err.stack);
                reject(err);
            });

            imap.connect();
        });

        return res.json({
            status: 'success',
            Emails: dataList,
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
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

        const existingUser = await Device.findOne({ deviceId }).lean();

        if (existingUser) {
            if (!existingUser.premium && !premium) {
                return res.status(403).json({
                    status: "error",
                    message: "User already exists and is not a premium user. Only one email allowed.",
                    data: {
                        paymentStatus: existingUser.paymentStatus,
                        isPremiun: existingUser.Premium,
                        isPaid: existingUser.paymentStatus,
                        mailBox: [
                            {
                                email: existingUser.email,
                                id: existingUser._id
                            },

                        ]
                    }
                });
            }
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
            premium: premium 

        }
        const forinserted = await new Device(forDevice).save();
        const inserted = await new User(userObject).save();
        const token = jwt.sign({ ...inserted._doc }, process.env.JWT_SECRET);


        // Function for cron job to delete this created email after 2 hours
        helper.deleteMailAfterTwoHours(inserted);

        return res.json({
            status: "success",
            message: "New temporary email has been generated!",
            data: {
                paymentStatus: inserted.paymentStatus,
                isPaid: inserted.paymentStatus,
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

        const updateUSer = await Device.findOneAndUpdate(
            { deviceId: body.deviceId },
            { $set: { premium: true } },
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

module.exports = {
    createEmail,
    deleteEmail,
    getUserDetails,
    recivedEmail,
    trackUser,
    createOrder,
    createPayment
}; 