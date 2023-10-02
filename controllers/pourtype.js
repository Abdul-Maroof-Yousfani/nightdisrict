import Joi from "joi";
import pourtype from "../models/pourtype.js";

const store = async (req, res) => {
    try {
            let schema = Joi.object({
                name : Joi.string().required()
            }) 


          
            const { error, value } = schema.validate(req.body); 
            if(error) return res.status(400).json({ message : error.message , data : {} })

            
            let data = new pourtype(req.body);
            await data.save();
            return res.json({
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

const index = async(req,res) =>
{
    try
    {   
        let data = await pourtype.find({})
        return res.json({
                status : 200,
                message : "success",
                data
            })
    }
    catch(error)
    {
        return res.json({
            status : 500,
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
            status : 500,
            message : error.message,
            data : {}
        })
    }
}
export default {
    store,
    index
}