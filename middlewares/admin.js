import helper from '../helper/helper.js';
import User from '../models/users.js';
import JwtService from "../services/jwt.js";

const admin = async(req,res,next) =>
{
 
    try
    {   
    
        const user = await User.findOne({email:req.user.email});
        const checkRole = await helper.checkRole(user.role);
        if(!checkRole) return res.json({error:"Invalid Role"})
      
        if(checkRole.name == 'Admin')
        {
            
            next();
        }
        else
        {
            res.json({error:"This Feature is Available for Admins Only"})
        }
    }
    catch(err)
    {
        res.json({error:err.message})
            // return next(customErrorHandler.serverError());
    }
}

export default admin;