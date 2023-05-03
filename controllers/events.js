
import event from '../models/event.js';
import Joi from 'joi';
import users from '../models/users.js';
import hashtag from '../models/hashtag.js';
import fs from 'fs';
const store = async(req,res) =>
{   
    let imageNameOne,thumbPath = "";
    try
    {   
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            hashtags: Joi.string(),
            repeat: Joi.boolean(),
            stock :Joi.number().required(),
            dj : Joi.string(),
            category : Joi.string(),
            venue : Joi.string().required(),
            date : Joi.string().required(),
            enddate : Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(400).json({
              status: 400,
              message: error.message,
              data: {}
        })

        // add Auth Token in Events
        req.body.bar = req.user.barInfo

        if(req.body.hashtags)
        {
            req.body.hashtags = JSON.parse(req.body.hashtags)
        }
        if(req.body.category)
        {
            req.body.category = JSON.parse(req.body.category)
        }

        if (req.files) {
            let image = req.files.picture;
        
                const dirOne = "public/events";
                imageNameOne = `${Date.now()}_`+ image.name;
                thumbPath = `${dirOne}/${imageNameOne}`;
              if (!fs.existsSync(dirOne)) {
                fs.mkdirSync(dirOne, { recursive: true });
              }
              image.mv(thumbPath, error => {
                if (error) {
                  return res.status(400).json({
                    status: 400,
                    error: error.message,
                    data: ""
                  });
                }
              });

              req.body.picture = `/events/${imageNameOne}`
          }

        
        let data = new event(req.body)
    
        data = await data.save();

        res.json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {
        console.log(error)

        res.status(500).json({
            status:500,
            message : error.message,
            data : {}
        })
    }
}

const index = async(req,res) =>
{
    let {live,today,upcomming}  = [];
    let date = new Date().toISOString();
    console.log(date);
    try
    {
        live = await event.find({
            date: { $gte : date},
            enddate: { $lte : date},
        }).lean()
        today = await event.find({
            date: { $gte : date , $lte:date }
        }).lean()
        upcomming = await event.find({
            date: { $gte : date}
        }).lean()
        live = await Promise.all(live.map( async (e) => {

            e.djDetail = await users.findOne({_id : e.dj}).select('username').lean()
            e.hashtagsdetail = await Promise.all(e.hashtags.map( async (hash) =>{
                return await hashtag.findOne({_id  : hash._id}).lean()
            }))
            return e
        }))
        today = await Promise.all(today.map( async (e) => {

            e.djDetail = await users.findOne({_id : e.dj}).select('username').lean()
            e.hashtagsdetail = await Promise.all(e.hashtags.map( async (hash) =>{
                    return await hashtag.findOne({_id  : hash._id}).lean()
            }))
            return e
        }))
        upcomming = await Promise.all(upcomming.map( async (e) => {

            e.djDetail = await users.findOne({_id : e.dj}).select('username').lean()
            e.hashtagsdetail = await Promise.all(e.hashtags.map( async (hash) =>{
                    return await hashtag.findOne({_id  : hash._id}).lean()
            }))
            return e
        }))

        return res.json({
            message : "success",
            data : [{live,today,upcomming}] 
        })
    }
    catch(error)
    {
        return res.status(500).json({
            message : error.message,
            data  : []
        })
    }
}

const view = async(req,res) =>
{
    let {_id}  = req.params
    try
    {
        let data = await event.findOne({_id}).lean()
        data.djDetail = await users.findOne({_id : data.dj}).select('username').lean()
        data.hashtagsdetail = await Promise.all(data.hashtags.map( async (e) =>{
                return await hashtag.findOne({_id  : e}).lean()
        }))
       
        return res.json({
            message : "success",
            data 
        })
    }
    catch(error)
    {
        return res.status(500).json({
            message : error.message,
            data  : []
        })
    }
}

export  default{
    store,
    index,
    view
}