import Joi from 'joi';
import mongoose from 'mongoose';


import ticktype from '../../models/ticktype.js';

const store = async(req,res) =>
{
    let {name} = req.body;
  
    try
    {
        const schema = Joi.object({
            name: Joi.string().required(),
            stock : Joi.any(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 400,
              message: error.message,
              data: {}
        })
        // check if parent category is there

        // if title already exists

        let checkTitle = await ticktype.findOne({name});
        if(checkTitle) return res.status(409).json({ message : "Title Already Exists" , data : {}})



        // add Images to Categories

  
        let data = new ticktype(req.body);
        await data.save();

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(200).json({
            status : 200,
            message: error.message,
            data: {}
        })
    }

}

export  default{
    store
}