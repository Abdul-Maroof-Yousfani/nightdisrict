const jwt = require('jsonwebtoken');
const helper = require('../utils/helpers.js');
const socketHandler = require('../utils/SocketHandler.js');
const User = require('../models/users.js');
const SimpleSchema = require('simpl-schema');

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

module.exports = {
    createEmail,
    deleteEmail,
    getUserDetails
}; 