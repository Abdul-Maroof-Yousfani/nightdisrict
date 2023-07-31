const express = require("express");
const dotenv = require('dotenv');

const usersRoutes = require("./routes/users.js");
const subscriptionRoutes = require("./routes/subscription.js");
const SimpleSchema = require('simpl-schema');
const mongoose = require("mongoose");
const helpers = require("./utils/helpers.js");
// import { MongoUtil } from "./utils/MongoUtils.js";
const cors = require('cors');
const jwt = require('jsonwebtoken')
const User = require("./models/users.js");
const socketTokenVerification = require("./middlewares/socketTokenVerification.js");
const Imap = require('imap');
const { Server } = require('socket.io');
const { MailParser } = require('mailparser');
const Promise = require('bluebird');
const { inspect } = require('util');
const fs = require('fs');
const nodemailer = require('nodemailer')

dotenv.config();

var PORT = process.env.PORT,
    DB_URL = process.env.DB_URL
mongoose.connect(DB_URL, (err, db) => {
    if (err) console.error(err);
    let dbo = db.client.db('tempmail');
    // MongoUtil.getInstance(dbo);
    console.log('Database Connected!');
});

const app = express();
app.use(express.json());
app.use(cors())

app.use("/api/emails", usersRoutes);
app.use("/api/subscription", subscriptionRoutes);

app.get("/", (req, res) => res.send("Welcome to the Users API!"));
app.all("*", (req, res) => res.status(404).send("You've tried reaching a route that doesn't exist."));

const expressServer = app.listen(PORT, () => {
    console.log(`Server is now up and running on:`);
    console.log(`http://localhost:${PORT}`);
});

// const io = new Server(expressServer, {
//     cors: {
//         origin: '*',
//         methods: ["GET", "POST"]
//     }
// });

// io.use(socketTokenVerification.socketProtected).on("connection", socket => {
//     socket.emailList = new Set();

//     let imap = new Imap({
//         user: socket?.user?.email,
//         password: socket?.user?.password,
//         host: 'kindamail.pw',
//         port: 143,
//         tls: false
//     });
//     Promise.promisifyAll(imap);
//     imap.connect();

//     imap.once("ready", execute);
//     imap.once("error", function (err) {
//         console.log("[CONNECTION ERROR]" + err.stack);
//     });

//     socket.on('emails', execute);

//     function execute() {
//         imap.openBox("INBOX", false, function (err, mailBox) {
//             if (err) {
//                 console.log('[ERROR]', err);
//                 return;
//             }
//             imap.search(["UNSEEN"], function (err, results) {
//                 if (!results || !results.length) { console.log("No unread mails"); return; }
//                 let f = imap.fetch(results, { bodies: "" });
//                 f.on("message", processMessage);
//                 f.once("error", function (err) {
//                     return Promise.reject(err);
//                 });
//                 f.once("end", function () {
//                     console.log("Done fetching all unseen messages.");
//                     socket.emit('emails', [...socket.emailList]);
//                     socket.emailList.clear();
//                 });
//             });
//         });
//     }

//     socket.on('email', email => {

//         const schema = new SimpleSchema({
//             subject: String,
//             html: String,
//             attachments: [
//                 new SimpleSchema({
//                     filename: String,
//                     content: Buffer
//                 })
//             ],
//             to: String,
//         }).newContext();

//         if (!schema.validate(email)) return socket.emit("email", {
//             status: "error",
//             message: "Please fill all the fields to proceed further!",
//             trace: schema.validationErrors()
//         });
//         try {
//             let transporter = nodemailer.createTransport({
//                 host: "kindamail.pw",
//                 port: 465,
//                 secure: true,
//                 requireTLS: true,
//                 auth: {
//                     user: socket.user.email,
//                     pass: socket.user.password
//                 }
//             });

//             let mailOption = {
//                 from: socket.user.email,
//                 to: email.to,
//                 subject: email.subject,
//                 html: email.html,
//                 file: email.file,
//                 attachments: email.attachments
//             }

//             transporter.sendMail(mailOption, function (error, info) {
//                 try {
//                     if (error) {
//                         socket.emit('email', { status: 'error', message: error })
//                         console.log(error);
//                     }
//                     else {
//                         socket.emit('email', { status: 'success', message: 'Your email has been sent.' })
//                         console.log('sent');
//                     }
//                 } catch (err) {
//                     console.log(err.message);
//                 }
//                 console.log(info)
//             });
//         } catch (err) {
//             console.log(err)
//         }
//     })

//     function processMessage(msg, seqno) {
//         const mail = {attachments: []};

//         var parser = new MailParser();
//         parser.on("headers", (headers) => {
//             // console.log('[HEADERS]', inspect(headers));
//             mail.from = headers.get("from");
//             mail.date = headers.get("date");
//             mail.to = headers.get("to");
//             mail.subject = headers.get("subject");
//         });

//         parser.on('data', data => {
//             if (data.type === 'text') {
//                 mail.body = data.text;
//             }

//             if (data.type === 'attachment') {
//                 let bufs = [];
//                 data.content.on('data', function (d) { bufs.push(d); });
//                 data.content.on('end', function () {
//                     let buffer = Buffer.concat(bufs);
//                     mail.attachments.push({filename: data.filename, buffer})
//                     data.release();
//                 })
//             }
//         });

//         msg.on("body", function (stream) {
//             stream.on("data", function (chunk) {
//                 parser.write(chunk.toString("utf8"));
//             });
//         });
//         msg.once("end", function () {
//             // console.log("Finished msg #" + seqno);
//             parser.end();
//         });

//         parser.on('end', () => {
//             socket.emailList.add(mail);
//         });
//     }
// });

// app.set('socket', io);
// console.log('Socket.io listening for connections');