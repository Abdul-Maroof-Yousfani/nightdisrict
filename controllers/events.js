
import event from '../models/event.js';
import Joi from 'joi';
import users from '../models/users.js';
import hashtag from '../models/hashtag.js';
import fs from 'fs';
import bar from '../models/bar.js';
import helpers from '../utils/helpers.js';
import menuCategory from '../models/menuCategory.js';
import ticket from '../models/ticket.js';
import mongoose from 'mongoose';
import reviews from '../models/reviews.js';

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
        if(error) return res.status(200).json({
              status: 400,
              message: error.message,
              data: {}
        })

        // add Auth Token in Events
        req.body.bar = req.user.barInfo

        // get bar coordinates and location

        let bardata = await bar.findById({_id : req.body.bar});
        req.body.address = bardata.address
        req.body.location = bardata.location



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
                  return res.status(200).json({
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

        // get event data 

        data = await helpers.getEventById(data._id);

        res.json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {

        res.status(200).json({
            status:500,
            message : error.message,
            data : {}
        })
    }
}

const update = async(req,res) =>
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
        if(error) return res.status(200).json({
              status: 400,
              message: error.message,
              data: {}
        })

        // add Auth Token in Events
        req.body.bar = req.user.barInfo

        // get bar coordinates and location

        let checkEvent = await event.findById({
            _id  : req.params.id
        })
        if(!checkEvent)
        {
            return res.status(200).json({
                status: 404,
                error : "Event not found",
                message: "Event not found",
                data: {}
              });
        }


        let bardata = await bar.findById({_id : req.body.bar});
        req.body.address = bardata.address
        req.body.location = bardata.location



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
                  return res.status(200).json({
                    status: 400,
                    error: error.message,
                    data: ""
                  });
                }
              });

              req.body.picture = `/events/${imageNameOne}`
          }

        let data = await event.findByIdAndUpdate({
            _id : mongoose.Types.ObjectId(req.params.id)
        },{
            $set : req.body
        },
        {
            new : true
        })

        // get event data 

        data = await helpers.getEventById(data._id);

        res.json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {

        res.status(200).json({
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
    try
    {
        live = await event.find( { bar:req.user.barInfo,   $and: [ { date: { $gte: date } }, { enddate: { $lte: date } } ] } ).lean()
        today = await event.find({
            bar:req.user.barInfo, 
            date: { $gte : date},
        }).lean()
        
        
        upcomming = await event.find({
            bar:req.user.barInfo, 
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

            e.djDetail = await users.findOne({_id : e.dj})?await users.findOne({_id : e.dj}).select('username').lean():""
            e.hashtagsdetail = await Promise.all(e.hashtags.map( async (hash) =>{
                    return await hashtag.findOne({_id  : hash._id}).lean()
            }))
            return e
        }))

        return res.json({
            status : 200,
            message : "success",
            data : [{live,today,upcomming}] 
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 500,
            message : error.message,
            data  : []
        })
    }
}
const all = async(req,res) =>
{
    let {live,today,upcomming}  = [];
    let date = new Date();

    // Set the timezone to New York (Eastern Time Zone)
    const nyTimezone = "America/New_York";
    const options = { timeZone: nyTimezone };

    // Format the date and time in the New York timezone
    date = date.toLocaleString('en-US', options);

    console.log(date);
    
    try
    {
        live = await event.find( { bar:req.user.barInfo,   $and: [ { date: { $gte: date } }, { enddate: { $lte: date } } ] } ).lean()
        today = await event.find({
            bar:req.user.barInfo, 
            date: { $gte : date},
        }).lean()
        
        
        upcomming = await event.find({
            bar:req.user.barInfo, 
            date: { $gte : date}
        }).lean()
        live = await Promise.all(live.map( async (e) => {

            return await helpers.getEventById(e._id)
        }))
        today = await Promise.all(today.map( async (e) => {

            return await helpers.getEventById(e._id)

        }))
        upcomming = await Promise.all(upcomming.map( async (e) => {

            return await helpers.getEventById(e._id)

        }))

        return res.json({
            status : 200,
            message : "success",
            data : [{live,today,upcomming}] 
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 500,
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
            status : 200,
            message : "success",
            data 
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 500,
            message : error.message,
            data  : []
        })
    }
}

const single = async(req,res) =>
{
    let {_id}  = req.params
    try
    {
        let checkEvent = await event.findById(_id);
        if(!checkEvent)
        {
            return res.json({
                status : 404,
                message : "Event Not Found",
                data  : {}
            })
        }
        let data = await helpers.getEventById(_id);
        
       
        return res.json({
            status : 200,
            message : "success",
            data 
        })
    }
    catch(error)
    {
        console.log(error.message);
        return res.status(200).json({
            status : 500,
            message : error.message,
            data  : []
        })
    }
}
// 
const nearby = async(req,res) =>{
    let {longitude,latitude}  = req.body;
    try
    {   
        let data  = await event.find({date: {$gt: new Date()},location: {

            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $minDistance: 0,
                $maxDistance: 200000
            }
        }}).lean();
        // convert data to a proper event Page
        data = await helpers.paginate(data,req.params.page,req.params.limit)
        
        let newData = await Promise.all(data.result.map( async (e) => {
                // get hastags
                return await helpers.getEventById(e._id);
        } ))
        

        return res.status(200).json({
            status : 200,
            message : "success",
            data:newData,
            paginate : data.totalPages
        })

    }
    catch(error)
    {
        return res.status(200).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const tickets = async(req,res) =>{
    try
    {
        // user tickets based on Access token
        
        let data = await ticket.find({
            user : req.user._id
        }).lean();
        // get basic review for a ticket
        console.log("HERE");
       
        if(data.review)
        {
            data.review  = await helpers.getBasicReview(review)
        }
        let results = await helpers.paginate(data,req.params.page,req.params.limit)
        //  let get events details
        data =  await Promise.all(results.result.map(async(e) =>{
            e.review = null;
            e.event = await helpers.getEventById(e.event)
            e.user = await helpers.getUserById(e.user)
            let review = await reviews.findOne({
                customer : req.user._id,
                event   : e.order
            })
            e.review = review
            return e;   
        }))

        return res.json({
            status : 200,
            message : "success",
            data,
            paginate : results.totalPages
        })

    }
    catch(error)
    {
        console.log(error);
        return res.json({
            status : 500,
            message : error.message,
            data : []
        })
    }
}



export  default{
    store,
    update,
    index,
    view,
    nearby,
    tickets,
    single,
    all
}