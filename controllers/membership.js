import SimpleSchema from 'simpl-schema';
import Membership from '../models/membership.js';
import Joi from 'joi';
import membership from '../models/membership.js';


const index = async (req, res) => {
    let { _id } = "";
    try {
        let data = await Membership.find();

        return res.send({
            status : 200,
            message: "success",
            data
        })
    }
    catch (error) {
        return res.status(200).send({
            status : 500,
            message: error.message,
            data: []
        })
    }
}

const userMembership = async (req, res) => {
    try {
        let data = await Membership.find().lean();
        data = data.map((e) => {
            if (e._id.toString() == req.user.membership.toString()) {
                e.active = true
            }
            else {
                e.active = false
            }
            return e
        })
        return res.status(200).send({
            status : 200,
            message: "success",
            data
        })
    }
    catch (error) {
        return res.status(200).send({
            status : 500,
            message: error.message,
            data: []
        })
    }
}

const createMembership = async (req, res) => {
    try {
        let { name } = req.body;
        const membershipExists = await Membership.findOne({ name });
        if (membershipExists) {
            return res.status(200).json({
                status: 409,
                message: "Membership Already Exists",
                data: null,
            });
        }

        let membership = await Membership(req.body);
        membership.save();
        return res.status(200).json({
            status: 200,
            message: 'Membership successfully created',
            data: membership
        });
    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        });
    }
}

const updateMembership = async (req, res) => {
    try {
        const MembershipData = await Membership.findById(req.params.id).lean();
        if (!MembershipData) {
            return res.status(200).json({
                status: 404,
                message: 'Membership not found',
                data: []
            });
        }
        let data = await Membership.updateOne({ _id: req.params.id }, { $set: req.body },{new:true});
        return res.status(200).json({
            status: 200,
            message: 'Membership successfully updated',
            data: data
        });
    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        });
    }
}

const deleteMembership = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedStory = await Membership.findByIdAndDelete(id);
        
        if (deletedStory) {
            const updated = await Membership.find({ status: 1 }).lean();
            return res.status(200).json({
                status: 200,
                message: 'Membership successfully deleted',
                data: updated
            });
        }
    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        });
    }
}

export default {
    createMembership,
    updateMembership,
    userMembership,
    deleteMembership,
    index
}