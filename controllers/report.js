import SimpleSchema from 'simpl-schema';
import report from '../models/report.js';
import Joi from 'joi';


const store = async(req,res) =>
{
    try
    {
        req.body.reported_by = req.user._id;  
        if(!req.body.report)
        {
            req.body.message = "The customer did not receive the Order"
        } 
        let reportExist = await report.findOne({orderid : req.body.orderid});
        if(reportExist) return res.status(409).json({ status : 409, message : "order already reported" , data : {} })
        let data = await report(req.body);
        data.save();
        return res.send({
            status : 200,
            message:"Successfully Created",
            data
        })
    }
    catch(err)
    {
        return res.status(500).send({
            status : 500,
            status: err.message,
            data : {}
        })
    }
    
    
}

export  default{
    store
}