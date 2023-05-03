import Joi from 'joi';
import mongoose from 'mongoose';


import hashtag from '../../models/hashtag.js';

const store = async(req,res) =>
{
    let {name} = req.body;
  
    try
    {
        const schema = Joi.object({
            name: Joi.string().required(),
           
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 400,
              message: error.message,
              data: {}
        })
        // check if parent category is there

        // if title already exists

        let checkTitle = await hashtag.findOne({name});
        if(checkTitle) return res.status(409).json({ message : "Title Already Exists" , data : {}})



        // add Images to Categories

  
        let data = new hashtag(req.body);
        await data.save();

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(500).json({
            message: error.message,
            data: {}
        })
    }

}

const all = async(req,res) =>
{
    try
    {
        let data = await hashtag.find({});

        return res.json({
            status : 200,
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(500).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }
}

export  default{
    store,
    all
}