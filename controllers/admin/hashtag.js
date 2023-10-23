import Joi from 'joi';
import mongoose from 'mongoose';


import hashtag from '../../models/hashtag.js';

const store = async(req,res) =>
{
    let {hashtags} = req.body;
  
    try
    {
        

        // add Images to Categories

  
        let data = await hashtag.insertMany(hashtags)

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }

}

const all = async(req,res) =>
{
    try
    {
        let data = await hashtag.find({type : req.query.type});

        return res.json({
            status : 200,
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(200).json({
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