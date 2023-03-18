
import event from '../models/event.js';
import Joi from 'joi';
import inquiry from '../models/inquiry.js';

const store = async(req,res) =>
{   
    try
    {   
        const schema = Joi.object({
                name : Joi.string().required(),
                email : Joi.string().required(),
                message : Joi.string().required()
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(400).json({
              status: 400,
              message: error.message,
              data: {}
        })
        
        let data = new inquiry(req.body)
    
        data.save();

        res.json({
            message : "success",
            data
        })
    }
    catch(error)
    {
        res.status(500).json({
            message : error.message,
            data : {}
        })
    }
}


export  default{
    store
}