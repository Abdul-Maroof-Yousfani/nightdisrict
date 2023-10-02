import SimpleSchema from 'simpl-schema';
import rating from '../models/rating.js';
import Joi from 'joi';


const store = async(req,res) =>
{
    try
    {
        // let {rating,comment} = req.body;   
        
        
        let data = await rating(req.body);
        data.save();
        return res.send({
            message:"Successfully Created",
            data
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

export  default{
    store
}