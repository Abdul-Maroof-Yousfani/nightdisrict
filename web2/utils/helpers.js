const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/users.js');
const { GET } = require('./APIRequestProvider.js');

function sendResetPasswordEmail(num, email, name, callback) {
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    var mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: "Code for reset password",
        html: " Hi <strong>" + `${name}` + "</strong> <br /><br /> Your verification code is <strong>" + `${num}` + "</strong>. <br /> Enter this code in our app to reset your password.",
    };
    return transporter.sendMail(mailOptions, callback)
}

function validateUsername(username) {
    /* 
      Usernames can only have: 
      - Lowercase Letters (a-z) 
      - Numbers (0-9)
      - Dots (.)
      - Underscores (_)
    */
    const res = /^[a-z0-9_\.]+$/.exec(username);
    const valid = !!res;
    return valid;
}

function validateEmail(email) {
    let pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(email);
}

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ");
        req.token = bearerToken[1];
        next();
    } else {
        res.status(401).json({ message: "please Insert Jwt" });
    }
}

function regexSearch(query) {
    let search = '.*' + query + '.*';
    let value = new RegExp(["^", search, "$"].join(""), "i");
    return value;
}

async function createEmail() {
    const email = randomString(6),
        password = generatePassword();

    const authorize = await GET(`${process.env.CP_URL}/login/?login_only=1&user=${process.env.CP_USER}&pass=${process.env.CP_PASS}`);

    if (authorize.status === 1) {
        const securityToken = authorize.security_token;
        const createEmail = await GET(`${process.env.CP_URL}${securityToken}/execute/Email/add_pop?email=${email}&domain=${process.env.CP_DOMAIN}&password=${password}&quota=20&send_welcome_email=0`);
        if (createEmail.status === 1) {
            return {
                email: `${email}@${process.env.CP_DOMAIN}`,
                password
            };
        }
    }
    throw new Error("Unable to create email");
}

function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

async function deleteMailAfterThreeDays(data) {
    const authorize = await GET(`https://obtempemail.online:2096/login/?login_only=1&user=${data.email}&pass=${data.password}`);
    console.log(authorize);

    if (authorize.status === 1) {
        const securityToken = authorize.security_token;
        // Assuming you have a "threadId" property in the "data" object that holds the ID of the thread you want to delete
        const deleteThread = await GET(`https://obtempemail.online:2096/${securityToken}/execute/Batch/strict?command=["Email","deleteThread",{"threadId":"1"}]`);
        // const dbDeleteEmail = await User.findOneAndDelete({ _id: data._id });
        return;
    }

    throw new Error("Unable to delete email thread");
}

async function isUserSubscriptionExpired(deviceId) {
    try {
        const user = await User.findOne({ deviceId }).lean();
        if (!user) {
            throw new Error('User not found');
        }

        // If the user is not a premium user or there is no expireAt, consider it as not expired
        if (!user.Premium || !user.expireAt) {
            return false;
        }

        // Check if the user's premium subscription has expired
        const currentDate = new Date();
        return currentDate > user.expireAt;
    } catch (error) {
        console.log('Error:', error);
        throw new Error('Error checking user subscription expiry');
    }
}

function pagination(records, page = 1, limit = 10) {
    page = isNaN(parseInt(page)) ? 1 : parseInt(page),
        limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit);

    const results = {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    if (endIndex < records.length) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }
    results.totalPages = {
        page: Math.ceil(records.length / limit),
        limit: limit,
        totalRecords: records.length
    }

    results.result = records.slice(startIndex, endIndex);
    return results;
}
module.exports = {
    sendResetPasswordEmail,
    validateUsername,
    validateEmail,
    verifyToken,
    regexSearch,
    createEmail,
    deleteMailAfterThreeDays,
    isUserSubscriptionExpired,
    pagination
}