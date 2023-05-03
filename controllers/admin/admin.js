import bar from "../../models/bar.js";
import inquiry from "../../models/inquiry.js";

const inquiries = async(req,res) =>
{
    let Bar;
    try
    {

        let inquiries = await inquiry.aggregate( [ 
            {
                $match: {"type" : "barInquiry" }
            }
            ,{ $group : { _id : "$bar"  } }] )

        let data = inquiries

        data = await Promise.all(data.map(async(e) =>{
            e = await bar.findOne({_id : e._id}).select({"barName" : 1 , "upload_document" : 1  }).lean()
            e.inquiries = await inquiry.find({bar : e._id})
            return e
            
        }))

        return res.status(200).json({
            status : 200,
            message : "success",
            data : data
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data
        })
    }
}
const updateInquiry = async(req,res) =>{
    let {_id} = req.params  ;
    try
    {   
        let data = await inquiry.findByIdAndUpdate({_id},{$set : req.body},{new:true});
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
    inquiries,
    updateInquiry
}