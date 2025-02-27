import bar from "../../models/bar.js";
import Joi from "joi";

const nearby = async(req,res) =>
{
    let {longitude,latitude} = req.body;

    try
    {
        const schema = Joi.object({
            longitude: Joi.string().required(),
            latitude: Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(200).json({
              status: 400,
              message: error.message,
              data: {}
        })    
       let data  = await bar.find({location: {

                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $minDistance: 0,
                    $maxDistance: 200000
                }
            }}).select({ "barName": 1 , "location" : 1 , "upload_logo" : 1 ,  "address" : 1});
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
const pages = async(req,res) =>{
    let {slug} = req.params;
    try
    {
        
        let page = await Page.findOne({
            slug
        });
        return res.status(200).json({
            status : 200,
            message : "success",
            data : page
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 200,
            message : error.message,
            data : {}
        })
    }   
}
export default{
    nearby,
    pages
};