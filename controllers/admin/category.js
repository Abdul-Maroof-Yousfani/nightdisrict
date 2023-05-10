import Joi from 'joi';
import mongoose from 'mongoose';
import menuCategory from '../../models/menuCategory.js';
import fs from 'fs';
import superMenu from '../../models/superMenu.js';

const store = async(req,res) =>
{
    let {name,description,category_image,parent} = req.body;
    let imageNameOne = "";
    try
    {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            category_image: Joi.object().unknown(true),
            parent: Joi.string()
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 400,
              message: error.message,
              data: {}
        })
        // check if parent category is there

        if(parent)
        {
            let checkParent = await menuCategory.findById({_id : mongoose.Types.ObjectId(parent)});
            if(!checkParent) return res.status(404).json({ message : "Parent Category Does not Exist" , data : {}})
        }

        // if title already exists

        let checkTitle = await menuCategory.findOne({name});
        if(checkTitle)
        {
            //  assign category to the Parent Category 

            
            return res.status(409).json({ message : "Title Already Exists" , data : {}})
        } 



        // add Images to Categories

        if (req.files) {
            let image = req.files.category_image;
        
            const dirOne = "/public/menuCat";
              imageNameOne = `${dirOne}/${Date.now()}_` + image.name;
              if (!fs.existsSync(dirOne)) {
                fs.mkdirSync(dirOne, { recursive: true });
              }
              image.mv(imageNameOne, error => {
                if (error) {
                  return res.status(400).json({
                    status: 400,
                    error: error.message,
                    data: ""
                  });
                }
              });

              req.body.category_image = `menuCat/${image.name}`
          }

        let data = new menuCategory(req.body);
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
const index = async(req,res) =>
{
    try
    {
        
        let data = await menuCategory.find({parent : null}).lean();
        data = await Promise.all(data.map(async(e) =>{
            let categories = await menuCategory.find({parent : e._id}).lean()
            e.subcategories = categories

            e.subcategories = await Promise.all(e.subcategories.map(async(item) =>{
                item.items = await superMenu.find({subCategory : item._id })
                item.items = item.items?item.items:[]
                return item
            }));

            return e
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
            data : {}
        })
    }
}

const update = async(req,res) =>
{
    let imageNameOne , thumbPath = "";
    let {_id} = req.params;
    try
    {
        // checking if it contains files
        if (req.files) {
            let image = req.files.category_image;
        
                const dirOne = "public/menuCat";
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

              req.body.category_image = `/menuCat/${imageNameOne}`
          }
        // check request contains subcategories

        // update category using id

        
        let data = await menuCategory.findByIdAndUpdate({
            _id
        },{ $set : req.body },{new:true})



        if(req.body.subcategories)
        {
            // convert data to Json 
            let subcategories = JSON.parse(req.body.subcategories);
            subcategories.map( async(e) =>{
                await menuCategory.updateOne({_id : e.id},{$set : { parent : _id, name :e.name}},{upsert:true})
            })  
            


        }

    

        
      
        return res.json({
            status: 200,
            message : "success",
            data
        })

    }
    catch(error)
    {
        return res.status(500).json({
            status: 500,
            message : error.message,
            data:{}
        })
    }
}
const parentCategory = async(req,res) =>
{
    try
    {
        
        let data = await menuCategory.find({ parent: null}).lean();
        data = await Promise.all(data.map(async(e) =>{
                e.items = await superMenu.find({category : e._id })
                e.items = e.items?e.items:[]
                return e

            return e
        }))

       
        return res.json({
            message : "success",
            data
        })
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({
            message : error.message,
            data : {}
        })
    }
}
const getCategoryBasedItems = async(req,res) =>
{
    let {category} = req.body;
    try
    {
        const schema = Joi.object({
            category: Joi.string().required()
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 400,
              message: error.message,
              data: {}
        })

        
        let data = await superMenu.find({ subCategory: mongoose.Types.ObjectId(category)}).select({"menu_name" : 1 , "description" : 1 , "picture" : 1})

        
        return res.status(200).json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}
const show = async(req,res) =>
{
    let {_id} = req.params;
    try
    {
        let data = await menuCategory.findOne({_id}).lean()
        data.subcategories = await menuCategory.find({parent:data._id}).lean()
        return res.json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : []
        })
    }
}
export  default{
    store,
    index,
    update,
    show,
    parentCategory,
    getCategoryBasedItems

}