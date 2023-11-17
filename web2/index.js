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
const path = require('node-path')
const { dirname } = require('path')
const { fileURLToPath } = require('url')
const serviceAccount = require("./config/tempmail.json") ;
const admin = require('firebase-admin') ;
const threadMails = require("./models/threadMails.js");
const cronJob = require("./models/cronJob.js");




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
app.use(express.static("public"));

app.use("/api/emails", usersRoutes);
app.use("/api/subscription", subscriptionRoutes);

app.get("/", (req, res) => res.send("Welcome to the Users API!"));

app.get('/downloadable-pdf', (req,res) => {
    const pdfFilePath = `public/attachment/${req.query.file}`; // Update the path to your PDF file
    const pdfFileName = `${req.query.file}`; // Specify the desired filename for the downloaded PDF

    res.download(pdfFilePath, pdfFileName, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// remove fields


app.get('/remove-products', async(req,res) => {

    try
    {
        let result = await threadMails.find({
            isDeleted : "false",
        })
        result = await Promise.all(result.map(async(e) =>{

            await threadMails.findByIdAndUpdate({
                _id: e._id
            },{
                $set : {
                    isDeleted : "true",
                }
            })
        }))
        let data  = new cronJob({run : "started"})
        data = await data.save();
        return res.json(data)
    }
    catch(error)
    {
        return res.json({
            data : error.message
        })
    }

    
});

app.get('/test-notification', async(req,res) => {

    try
    {
        let result = await helpers.notification('djh9WHTanW4:APA91bHb2m7AhMlxh_t0hLL8mmgeDNpkzSWTEkN715bEdv_o_qhhz4cD7zOG3bG0nngqYe2BKKviurQdZECxXkvs3Z0vyB8FcYN05iUBqOr7tlMGv9qH5baFKpKUnWZ2vCjWqzb1XibV');
        return res.json({
            result
        })
    }
    catch(error)
    {
        return res.json({
            data : error.message
        })
    }

    
});

// app.get('/downloadable-json', (req, res) => {
//     // Create a JSON response with image and downloadable PDF links
    
//     const response = {
//         image: "http://localhost:3000/attachment/1697464370614.pdf", // Replace with your image URL
//         downloadable: "http://localhost:3000/downloadable-pdf?file=1697464370614.pdf", // URL to trigger PDF download
//     };

//     res.json(response);
// });

  

// app.all("*", (req, res) => res.status(404).send("You've tried reaching a route that doesn't exist."));

const expressServer = app.listen(PORT, () => {
    console.log(`Server is now up and running on:`);
    console.log(`http://localhost:${PORT}`);
});