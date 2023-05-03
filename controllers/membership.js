import SimpleSchema from 'simpl-schema';
import Membership from '../models/membership.js';
import Joi from 'joi';
import membership from '../models/membership.js';


const index = async(req,res) =>
{
    let {_id} = "";
    try
    {   
        let data = await Membership.find();
       
        return res.send({
            message:"success",
            data
        })
    }
    catch(error)
    {
        return res.status(500).send({
            message: error.message,
            data : []
        })
    }
}
const userMembership = async(req,res) =>
{
    try
    {   
        let data = await Membership.find().lean();
        data = data.map((e) =>{
                console.log(req.user.membership)
                if(e._id.toString() == req.user.membership.toString())
                {
                    e.active = true
                }
                else
                {
                    e.active = false
                }
                return  e
        })
        return res.send({
            message:"success",
            data
        })
    }
    catch(error)
    {
        return res.status(500).send({
            message: error.message,
            data : []
        })
    }
}

const createMembership = async(req,res) =>
{
    try
    {
        let {name} = req.body;   
        const membershipExists = await Membership.findOne({name});
        if (membershipExists) {
            return res.status(409).json({
                status: "error",
                message: "Membership Already Exists",
                data: null,
            });
        }
        
        let membership = await Membership(req.body);
        membership.save();
        return res.send({
            message:"Successfully Created",
            user:Membership
        })
    }
    catch(err)
    {
        return res.send({
            status: "error",
            message: err.message,
        })
    }
    
    
}

export  default{
    createMembership,
    userMembership,
    index
}