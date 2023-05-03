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
        if(error) return res.status(400).json({
              status: 400,
              message: error.message,
              data: {}
        })    
       let data  = await bar.find({location: {

                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $minDistance: 0,
                    $maxDistance: 10000
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
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }

}
export default{
    nearby,
};