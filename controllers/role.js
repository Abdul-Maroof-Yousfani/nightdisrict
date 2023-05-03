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
            return res.status(409).json({
                status: "error",
                message: "Role Already Exists",
                data: null,
            });
        }
        
        let role = await Role(req.body);
        role.save();
        return res.send({
            message:"Successfully Created",
            user:role
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
        return res.status(500).send({
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