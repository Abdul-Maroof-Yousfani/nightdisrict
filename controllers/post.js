import Joi from "joi";
import post from "../models/post.js";
import fs  from 'fs';

const store = async (req, res) => {
    let imageNameOne , thumbPath = ""
    let tags = []
    try {
            let schema = Joi.object({
                title : Joi.string().required(),
                description : Joi.string().required(),
                hastags : Joi.string()
            }) 


          
            const { error, value } = schema.validate(req.body); 
            if(error) return res.status(400).json({ message : error.message , data : {} })

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

            if(req.body.hastags)
            {
                tags = req.body.hastags.split(",");
           
                req.body.hastags = tags
            }
            
            let data = new post(req.body);
            await data.save();
            return res.json({
                status : 200,
                message : "success",
                data
            })

    }
    catch(error)
    {
        return res.status(500).json({
            status:500,
            message : error.message,
            data : {}
        })
    }
}

const index = async(req,res) =>
{
    try
    {   
        let data = await post.find({})
        return res.json({
                message : "success",
                data
            })
    }
    catch(error)
    {
        return res.json({
            message : error.message,
            data
        })
    }
}
const view  = async(req,res) =>
{
    let {_id} = req.params;
    try
    {
        let data = await post.findById(_id);
        return res.json({
            message : "success",
            data
        })
    }
    catch(error)
    {
        return res.json({
            message : error.message,
            data : {}
        })
    }
}
export default {
    store,
    index,
    view
}