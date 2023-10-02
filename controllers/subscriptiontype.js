import Joi from "joi";
import subscriptiontype from "../models/subscriptiontype.js";
const store = async(req,res) =>
{   
    let {title,code} = req.body;
    try
    {   
        const schema = Joi.object({
            title: Joi.string().required(),
            code: Joi.string().required()
         });
         let {error,value} = schema.validate(req.body);
         if(error) return res.status(200).json({ status : 400, message : error.message }) 
         
         let alreadyExist = await subscriptiontype.findOne({code : code})
         if(alreadyExist) return res.status(200).json({ status : 409, message : "Already Exists" , data : alreadyExist })

         let data = new subscriptiontype(req.body);
         await data.save();
            
         res.json({
                message : "success",
                data
            })
    }
    catch(error)
    {
        res.status(200).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}


export  default{
    store
}