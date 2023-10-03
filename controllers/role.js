import SimpleSchema from 'simpl-schema';
import Role from '../models/roles.js';
import Joi from 'joi';


const createRole = async(req,res) =>
{
    try
    {
        let {name} = req.body;   
        const roleExists = await Role.findOne({name});
        if (roleExists) {
            return res.status(200).json({
                status: 409,
                message: "Role Already Exists",
                data: null,
            });
        }
        
        let role = await Role(req.body);
        role.save();
        return res.send({
            status : 200,
            message:"Successfully Created",
            user:role
        })
    }
    catch(err)
    {
        return res.send({
            status: 500,
            message: err.message,
        })
    }
    
    
}
const index = async(req,res) =>
{
    try
    {
        
        let data = await Role.find({}).lean()
        return res.send({
            status : 200,
            message:"Successfully Created",
            data
        })
    }
    catch(err)
    {
        return res.status(200).send({
            status : 500,
            message: err.message,
            data : {}
        })
    }
    
    
}

export  default{
    createRole,
    index
}