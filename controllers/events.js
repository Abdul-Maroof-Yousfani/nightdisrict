
import event from '../models/event.js';
import Joi from 'joi';

const store = async(req,res) =>
{   
    try
    {   

        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            hashtags: Joi.string(),
            repeat: Joi.boolean(),
            ticket :  Joi.string(),
            dj : Joi.string()
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(400).json({
              status: 400,
              message: error.message,
              data: {}
        })
        
        let data = new event(req.body)
    
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