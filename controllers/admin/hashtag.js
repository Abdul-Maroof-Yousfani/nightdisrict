import Joi from 'joi';
import mongoose from 'mongoose';
import fs from 'fs';
import superMenu from '../../models/superMenu.js';

const store = async(req,res) =>
{
    let {menu_name,description,category,subCategory} = req.body;
    let imageNameOne = "";
    try
    {
        const schema = Joi.object({
            menu_name: Joi.string().required(),
            description: Joi.string().required(),
            category: Joi.string().required(),
            subCategory: Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 400,
              message: error.message,
              data: {}
        })
        // check if parent category is there

   
        // if title already exists

        let checkTitle = await superMenu.findOne({menu_name});
        if(checkTitle) return res.status(409).json({ message : "Title Already Exists" , data : {}})



        // add Images to Categories

        if (req.files) {
            let image = req.files.picture;
        
            const dirOne = "menuCat";
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

              req.body.picture = `menuCat/${image.name}`
          }

        let data = new superMenu(req.body);
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

export  default{
    store
}