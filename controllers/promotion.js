import Joi from "joi";
import menuCategory from "../models/menuCategory.js";
import promotion from "../models/promotion.js";
import superMenu from "../models/superMenu.js";
import fs from 'fs';
import menu from "../models/menu.js";
import bar from "../models/bar.js";
import helpers from "../utils/helpers.js";
import users from "../models/users.js";


const store = async(req,res) =>
{
    let {title,from,to,price,repeat,category,menu,infinity,discount} = req.body;


    let imageNameOne,thumbPath = "";
    try
    {
         const schema = Joi.object({
            title: Joi.string().required(),
            from: Joi.string().required(),
            to: Joi.any(),
            infinity : Joi.any(),
            price: Joi.number(),
            repeat: Joi.boolean(),
            category : Joi.string().required(),
            menu : Joi.any(),
            discount : Joi.any()
            
         });


        const { error, value } = schema.validate(req.body);
        
        if(error) return res.status(200).json({ status : 400, message : error.message , data : {}})

        // check if end date or either infinity is defined
        if(!infinity && !to)
        {
            return res.status(200).json({
                status : 400,
                message : 'please either set enddate or an infinity for the promotion',
                data : {}
            })
        }
        // if both are set in the fields
        if(infinity && to)
        {
            return res.status(200).json({
                status : 400,
                message : 'please either set enddate or an infinity for the promotion',
                data : {}
            })
        }



        //  check if Already Promotion is Availabe in with this time
        let query = {
            "from" : from,
            "to" : to
        }
        query = to?query:{ "from" : from, "infinity" : true }

        let checkDateRange = await promotion.findOne(query)
        if(checkDateRange) return res.status(200).json({ status :409, message : "Promotion Already Exist" , data : {}})


        // adding auth as bar_id
        req.body.bar = req.user.barInfo


        // adding bar location in promotion

        let bardata = await bar.findById({_id : req.user.barInfo});
        // req.body.address = bardata.address
        req.body.location = bardata.location

        if (req.files) {
            let image = req.files.picture;
        
                const dirOne = "public/promotions";
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

              req.body.picture = `/promotions/${imageNameOne}`
          }
        if(req.body.menu)
        {
            req.body.menu = JSON.parse(req.body.menu);
        }

        // update promot picture

        let menuPicture = req.body.menu[0].item;

        let itemDetail = await superMenu.findById({
            _id  : menuPicture
        })

        req.body.picture = itemDetail.pictures[0]

       

        let data  = new promotion(req.body);
        data = await data.save();

        // send user promotion notification

        let getUsers = await users.find({
            "favouriteBars.bar" : req.user.barInfo
        })

        await Promise.all(getUsers.map(async(findFol) =>{
            let orderNotification = {
                title : "Special Promotion",
                body : `Exclusive offer from ${bardata.barName}: save ${data.discount}% on ${data.title}`,
                type : "promotion",
                notification_for : data._id,
                user : findFol._id
            }
    
            await helpers.createNotification(orderNotification,findFol)
        }))
        

        

        data = await promotion.findById({
            _id : data._id
        }).lean()
        


        data = await helpers.getPromotionById(data,req.user.barInfo)

        return res.status(200).json({ status:200, message : 'success' , data })
         
    }
    catch(error)
    {
        return res.status(200).json({ status : 500,message : error.message , data : {} })
    }
}
const update = async(req,res) =>
{
    let {title,from,to,price,repeat,category,menu,infinity,discount} = req.body;


    let imageNameOne,thumbPath = "";
    try
    {
         const schema = Joi.object({
            title: Joi.string().required(),
            from: Joi.string().required(),
            to: Joi.any(),
            infinity : Joi.any(),
            price: Joi.number(),
            repeat: Joi.boolean(),
            category : Joi.string().required(),
            menu : Joi.any(),
            discount : Joi.any()
            
         });


        const { error, value } = schema.validate(req.body);
        
        if(error) return res.status(200).json({ status : 400, message : error.message , data : {}})

        //  check promotion for specific bar
        let checkPromotion = await promotion({
            bar : req.user.barInfo,
            _id : req.params.id
        })
        if(!checkPromotion)
        {
            return res.status(200).json({
                status : 404,
                message : 'Promotion not Found',
                data : {}
            })
        }


        // check if end date or either infinity is defined
        if(!infinity && !to)
        {
            return res.status(200).json({
                status : 400,
                message : 'please either set enddate or an infinity for the promotion',
                data : {}
            })
        }
        // if both are set in the fields
        if(infinity && to)
        {
            return res.status(200).json({
                status : 400,
                message : 'please either set enddate or an infinity for the promotion',
                data : {}
            })
        }



        //  check if Already Promotion is Availabe in with this time
        let query = {
            "from" : from,
            "to" : to
        }
        query = to?query:{ "from" : from, "infinity" : true }

        // let checkDateRange = await promotion.findOne(query)
        // if(checkDateRange) return res.status(409).json({message : "Promotion Already Exist" , data : {}})


        // adding auth as bar_id
        req.body.bar = req.user.barInfo


        // adding bar location in promotion

        let bardata = await bar.findById({_id : req.user.barInfo});
        // req.body.address = bardata.address
        req.body.location = bardata.location

        if (req.files) {
            let image = req.files.picture;
        
                const dirOne = "public/promotions";
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

              req.body.picture = `/promotions/${imageNameOne}`
          }
        if(req.body.menu)
        {
            req.body.menu = JSON.parse(req.body.menu);
        }

        // update promot picture

        let menuPicture = req.body.menu[0].item;

        let itemDetail = await superMenu.findById({
            _id  : menuPicture
        })

        req.body.picture = itemDetail.pictures[0]

       

        let data  = await promotion.findOneAndUpdate({_id : req.params.id},{
            $set : req.body
        },{
            new:true
        })


        data = await promotion.findById({
            _id : data._id
        }).lean()
        


        data = await helpers.getPromotionById(data,req.user.barInfo)

        return res.status(200).json({ status:200, message : 'success' , data })
         
    }
    catch(error)
    {
        return res.status(200).json({ status : 500, message : error.message , data : {} })
    }
}
const index = async(req,res) =>
{
    try
    {
        
        let data2 = await promotion.aggregate( [ { $group : { _id : "$category" } } ] )

        let data  = data2;
   
        data = await Promise.all(data.map( async (e) =>{
           
            let cat = await menuCategory.findOne({
                            _id : e._id
                        }).lean()
            if(cat)
            {
                e.thumbnail = cat.category_image?cat.category_image : ""
                e.name = cat.name?cat.name : ""
            }
           
            e.menu = await promotion.find({category : e._id}).lean()
            
            return e;
        }))

   




       

        // let data = await promotion.find().lean()
        // data = await Promise.all(data.map( async(e) =>{
                
        //         //  Calling Thumbnail from the Category

        //         let cat = await menuCategory.findOne({
        //             _id : e.category
        //         }).lean()
        //         e.thumbnail = cat.category_image?cat.category_image : ""
            
        //         // Calling Menu Details  From  Items
        //         e.menu = await Promise.all( e.menu.map ( async (it) =>{
        //             let items = await superMenu.findOne({
        //                 _id : it.item
        //             }).lean()
        //             it.detail = items?items : []
        //             return it
        //         }) )

        //         return e
        // }))
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

            message : "error",
            data : {}
        })
    }
}
const show = async(req,res) =>
{
    let {_id} = req.params;
    try
    {
        let data = await promotion.findById({_id}).lean();
        data = await helpers.getPromotionById(data,req.user.barInfo)
        return res.status(200).json({
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
            data : {}
        })

    }
}

const getPromotions = async(req,res) => {
    try
    {
        let data = await promotion.find({bar:req.user.barInfo}).lean();
        data = await Promise.all(data.map(async(e) =>{
            return await helpers.getPromotionById(e,req.user.barInfo)
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
            data : []
        })
    }
}

export default {
   store,
   index,
   show,
   getPromotions,
   update
}