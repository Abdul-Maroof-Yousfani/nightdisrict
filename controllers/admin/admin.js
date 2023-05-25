import bar from "../../models/bar.js";
import inquiry from "../../models/inquiry.js";
import users from "../../models/users.js";
import commonHelper from "../../helpers/commonHelper.js";

const inquiries = async (req, res) => {
    let Bar;
    try {

        let inquiries = await inquiry.aggregate([
            {
                $match: { "type": "barInquiry" }
            }
            , { $group: { _id: "$bar" } }])

        let data = inquiries

        data = await Promise.all(data.map(async (e) => {
            e = await bar.findOne({ _id: e._id }).select({ "barName": 1, "upload_document": 1 }).lean()
            e.inquiries = await inquiry.find({ bar: e._id })
            return e

        }))

        return res.status(200).json({
            status: 200,
            message: "success",
            data: data
        })
    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data
        })
    }
}

const updateInquiry = async (req, res) => {
    let { _id } = req.params;
    try {
        let data = await inquiry.findByIdAndUpdate({ _id }, { $set: req.body }, { new: true });
        return res.status(200).json({
            status: 200,
            message: "success",
            data
        })

    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const getUserActivities = async (req, res) => {
    try {
        const { page, limit } = req.query;
        let [totalUsersCount, totalUsers] = await Promise.all([
            users.countDocuments({ status: { $ne: 2 } }),
            users.find({ status: { $ne: 2 } })
        ]);

        let [activeUsersCount, activeUsers] = await Promise.all([
            users.countDocuments({ status: 1 }),
            users.find({ status: 1 })
        ]);

        let [blockedUsersCount, blockedUsers] = await Promise.all([
            users.countDocuments({ status: 3 }),
            users.find({ status: 3 })
        ]);

        totalUsers = commonHelper.pagination(parseInt(page), parseInt(limit), totalUsers);
        activeUsers = commonHelper.pagination(parseInt(page), parseInt(limit), activeUsers);
        blockedUsers = commonHelper.pagination(parseInt(page), parseInt(limit), blockedUsers);

        const data = {
            'totalUsersCount': totalUsersCount, 'activeUsersCount': activeUsersCount, 'blockedUsersCount': blockedUsersCount,
            'totalUsers': totalUsers, 'activeUsers': activeUsers, 'blockedUsers': blockedUsers
        };

        return res.status(200).json({
            status: 200,
            message: "success",
            data: data
        });
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        });
    }
}

const blockOrUnBlockUser = async (req, res) => {
    if (req.body === undefined) {
        return res.status(200).json({
            status: 400,
            message: "Something went wrong",
            data: []
        });
    }
    const { id, status } = req.body;
    const updated = await users.findOneAndUpdate({ _id: id }, { $set: { status: status } });
    if (!updated) {
        return res.status(200).json({
            status: 404,
            message: "UserId is undefined!",
            data: []
        });
    } else {
        return res.status(200).json({
            status: 200,
            message: "Successfully updated",
            data: []
        });
    }
}

export default {
    inquiries,
    updateInquiry,
    getUserActivities,
    blockOrUnBlockUser
}