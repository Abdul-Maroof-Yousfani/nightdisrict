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
// app.all("*", (req, res) => res.status(404).send("You've tried reaching a route that doesn't exist."));

const expressServer = app.listen(PORT, () => {
    console.log(`Server is now up and running on:`);
    console.log(`http://localhost:${PORT}`);
});