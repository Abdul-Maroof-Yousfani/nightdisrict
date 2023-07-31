const Subscription = require('../models/subscription.js');
const SimpleSchema = require('simpl-schema');


const createsubscription = async (req, res) => {
    const body = req.body,
        validationSchema = new SimpleSchema({
            name: {
                type: String,
            },
            price: {
                type: Number,
            },
            detail: {
                type: String,
            }
        }).newContext();

    if (!validationSchema.validate(body)) return res.status(400).json({
        status: "error",
        message: "Please fill all the required fields to continue.",
        trace: validationSchema.validationErrors()
    });

    const inserted = await Subscription.create(body)
    return res.json({
        status: "success",
        message: "Successfully !! Subscription has been created",
        data: inserted
    }
    );
}

module.exports = {
    createsubscription,
}; 