import Joi from "joi";
import promotion from "../models/promotion.js";


const store = async(req,res) =>
{
    try
    {
        const schema = Joi.object({
            title: Joi.string().required(),
            from: Joi.string().required(),
            to: Joi.string().required(),
            price: Joi.number(),
            repeat: Joi.boolean(),
            menu : Joi.array().required()
            
         });
        const { error, value } = schema.validate(req.body);
        let data  = new promotion(req.body);
        await data.save();
        return res.status(200).json({ message : 'success' , data })
        
        
    }
    catch(error)
    {
        return res.status(500).json({ message : error.message , data : {} })
    }
}

export default {
   store
}