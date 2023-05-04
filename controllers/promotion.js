import Joi from "joi";
import menuCategory from "../models/menuCategory.js";
import promotion from "../models/promotion.js";
import superMenu from "../models/superMenu.js";
import fs from 'fs';


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
        
        if(error) return res.status(400).json({message : error.message , data : {}})

        // check if end date or either infinity is defined
        if(!infinity && !to)
        {
            return res.status(400).json({
                status : 400,
                message : 'please either set enddate or an infinity for the promotion',
                data : {}
            })
        }
        // if both are set in the fields
        if(infinity && to)
        {
            return res.status(400).json({
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
        if(checkDateRange) return res.status(409).json({message : "Promotion Already Exist" , data : {}})


        // adding auth as bar_id
        req.body.bar = req.user.barInfo

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
                  return res.status(400).json({
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

        let data  = new promotion(req.body);
        await data.save();
        return res.status(200).json({ message : 'success' , data })
         
    }
    catch(error)
    {
        return res.status(500).json({ message : error.message , data : {} })
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
            e.thumbnail = cat.category_image?cat.category_image : ""
            e.name = cat.name?cat.name : ""
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
            message : "success",
            data
        })

    }
    catch(error)
    {
        return res.status(500).json({
            message : "error",
            data : {}
        })
    }
}
export default {
   store,
   index
}