const mongoose = require('mongoose');

const threadMailsSchema = new mongoose.Schema({
    Attachments: [{ type: String }],
    mail_id: { type: Number },
    Mail_Address: {
        value: [{ type: String }],
        html: { type: String },
        text: { type: String }
    },
    Mail_From: { type: String },
    mail_Text: { type: String },
    Read_Status: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('threadMails', threadMailsSchema);