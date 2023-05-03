import Joi from 'joi';
import mongoose from 'mongoose';
import fs from 'fs';
import superMenu from '../../models/superMenu.js';
import menuCategory from '../../models/menuCategory.js';

const store = async(req,res) =>
{

    let {menu_name,description} = req.body;
    let imageNameOne , fileName = "";
    let category = [];
    let childCategory = [];
    let menuPictures = [];
    
    try
    {
        const schema = Joi.object({
            menu_name: Joi.string().required(),
            description: Joi.string().required(),
            categories: Joi.string().required(),
            // subCategory: Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 403,
              message: error.message,
              data: {}
        })
        // check if parent category is there

   
        // if title already exists

        let checkTitle = await superMenu.findOne({menu_name});
        if(checkTitle) return res.status(409).json({ status:409, message : "Title Already Exists" , data : {}})



        // add Images to Categories

        if (req.files) {
            let pictures = req.files.pictures;
            if(pictures)
            {
              pictures.map((e) =>{

        
                let image = e;
          
                const dirOne = "/public/menu";
                  fileName = `${Date.now()}_` + image.name;
                  imageNameOne = `${dirOne}/${fileName}`;
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

    
                  menuPictures.push(`/menu/${fileName}`)
              })
            }
            
            
          }

        //  add categories

        if(req.body.categories)
        {
            req.body.categories = JSON.parse(req.body.categories);

            // get categories

            req.body.categories.map((e) =>{
              category.push(e.parent)
              e.child.map((ch) =>{
                childCategory.push(ch)
              })
              
            })





            //  get sub categories

            
            
        }

        

        //  add sub categories
        let data = new superMenu({
          menu_name,
          description,
          categories : category,
          subCategories : childCategory,
          pictures : menuPictures,
          user:req.user._id

        });
        await data.save();

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({
            message: error.message,
            data: {}
        })
    }

}

const update = async(req,res) =>
{
  let {menu_name,description} = req.body;
  let {_id} = req.params;
  let imageNameOne , fileName = "";
  let category = [];
  let childCategory = [];
  let menuPictures = [];
  
  try
  {
      const schema = Joi.object({
          menu_name: Joi.string().required(),
          description: Joi.string().required(),
          categories: Joi.string().required(),
          // subCategory: Joi.string().required(),
       });
      const { error, value } = schema.validate(req.body);
      if(error) return res.status(403).json({
            status: 403,
            message: error.message,
            data: {}
      })
      // check if parent category is there

 
      // if title already exists

      // let checkTitle = await superMenu.findOne({menu_name});
      // if(checkTitle) return res.status(409).json({ status:409, message : "Title Already Exists" , data : {}})



      // add Images to Categories

      if (req.files) {
          let pictures = req.files.pictures;
          if(pictures)
          {
            pictures.map((e) =>{

      
              let image = e;
        
              const dirOne = "/public/menu";
                fileName = `${Date.now()}_` + image.name;
                imageNameOne = `${dirOne}/${fileName}`;
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

  
                menuPictures.push(`/menu/${fileName}`)
            })
          }
          
          
        }

      //  add categories

      if(req.body.categories)
      {
          req.body.categories = JSON.parse(req.body.categories);

          // get categories

          req.body.categories.map((e) =>{
            category.push(e.parent)
            e.child.map((ch) =>{
              childCategory.push(ch)
            })
            
          })





          //  get sub categories

          
          
      }

      

      //  add sub categories
      let data = await  superMenu.findByIdAndUpdate({_id},{
        $set:{
          menu_name,
          description,
          categories : category,
          subCategories : childCategory,
          pictures : menuPictures,
          user:req.user._id
        }

      });
      await data.save();

      return res.json({
          message : "success",
          data
      })
         
  }
  catch(error)
  {
      console.log(error)
      res.status(500).json({
          message: error.message,
          data: {}
      })
  }
}


const index = async(req,res) =>
{
    let {search} = req.query;
    try
    {
        // check if file is there



        let data = await superMenu.find({user : mongoose.Types.ObjectId('641d2816a266e71a5c95de1c')}).select({ "picture" : 0 , "bar" : 0, "userType" : 0, "category" : 0, "subCategory" : 0  , "createdAt" : 0 , "updatedAt" : 0 }).lean();
        data = await Promise.all(data.map(async(e) =>{
            if(e.categories.length)
            {
                e.categories = await Promise.all(e.categories.map( async (category) =>{
                    return await menuCategory.findOne({_id : category}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
            if(e.subCategories.length)
            {
                e.subCategories = await Promise.all(e.subCategories.map( async (sub) =>{
                    return await menuCategory.findOne({_id : sub}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
            return e
        }))
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

const show = async(req,res) =>{
    let {_id} = req.params
    try
    {
        let data = await superMenu.findOne({_id , user: mongoose.Types.ObjectId('641d2816a266e71a5c95de1c')}).lean();
     
        if(data.categories.length)
            {
                data.categories = await Promise.all(data.categories.map( async (category) =>{
                    return await menuCategory.findOne({_id : category}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
            if(data.subCategories.length)
            {
                data.subCategories = await Promise.all(data.subCategories.map( async (sub) =>{
                    return await menuCategory.findOne({_id : sub}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
      
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
          data:{}
        })
    }
}

export  default{
    store,
    update,
    index,
    show
}