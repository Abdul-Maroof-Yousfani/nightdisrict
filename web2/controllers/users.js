const jwt = require('jsonwebtoken');
const helper = require('../utils/helpers.js');
const socketHandler = require('../utils/SocketHandler.js');
const User = require('../models/users.js');
const SimpleSchema = require('simpl-schema');
const Imap = require('imap');
const MailParser = require('mailparser').MailParser;
const Promise = require('bluebird');


const createEmail = async (req, res) => {
    const body = req.body,
        validationSchema = new SimpleSchema({
            deviceId: String,
            fcmToken: {
                type: String,
                optional: true
            }
        }).newContext();

    if (!validationSchema.validate(body)) return res.status(400).json({
        status: "error",
        message: "Please fill all the required fields to continue.",
        trace: validationSchema.validationErrors()
    });

    const deviceExists = await User.findOne({ deviceId: body.deviceId }).lean();
    if (deviceExists) return res.status(402).json({
        status: "error",
        message: "A device with same Id already exists!",
        trace: deviceExists
    })

    const inserted = await new User(body).save();

    const email = await helper.createEmail();
    inserted.email = email.email;
    inserted.password = email.password;
    inserted.save();

    const token = jwt.sign({ ...inserted._doc }, process.env.JWT_SECRET);

    // function for cron job to delete this created email after 2 hours
    helper.deleteMailAfterTwoHours(inserted);

    return res.json({
        status: "success",
        message: "New temporary email has been generated!",
        data: { ...inserted._doc, token }
    });
}

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
        const checkUser = await User.findOne({ deviceId: body.deviceId }).lean();

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
        const emailList = await new Promise((resolve, reject) => {
            imap.once("ready", () => {
                const emailList = [];
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
                                    emailList.push(mail);
                                });
                            });

                            f.once("error", function (err) {
                                console.log("Error fetching messages:", err);
                                reject(err);
                            });

                            f.once("end", function () {
                                console.log("Done fetching all unseen messages.");
                                imap.end();
                                resolve(emailList);
                            });
                            console.log(emailList);
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
            Emails: emailList,
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
        const checkUserStaus = await User.findOne({ deviceId: req.params.deviceId }).lean();
        // Check User Status 
        if (!checkUserStaus.Premium == false) {
            helper.isUserSubscriptionExpired(checkUserStaus)
        }

        return res.status(200).json({
            message: "your mail box",
            data:
                [{ mailBox: checkUserStaus.email }],
            paymentStatus: checkUserStaus.paymentStatus

        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}


module.exports = {
    createEmail,
    deleteEmail,
    getUserDetails,
    recivedEmail,
    trackUser
}; 