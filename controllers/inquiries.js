
import event from '../models/event.js';
import Joi from 'joi';
import inquiry from '../models/inquiry.js';

const store = async(req,res) =>
{   
    try
    {   
        const schema = Joi.object({
                name : Joi.string().required(),
                city : Joi.string().required(),
                email : Joi.string().required(),
                phone : Joi.string().required(),
                message : Joi.string().required(),
                type : Joi.string()
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(200).json({
              status: 400,
              message: error.message,
              data: {}
        })
        
        let data = new inquiry(req.body)
    
        data.save();

        res.json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {
        res.status(200).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}


export  default{
    store
}