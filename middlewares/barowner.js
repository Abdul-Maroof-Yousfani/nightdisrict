const barowner = async(req,res,next) =>
{
 
    try
    {   
    
        const user = await User.findOne({email:req.user.email});
        const checkRole = await helper.checkRole(user.role);
        if(!checkRole) return res.json({error:"Invalid Role"})
      
        if(checkRole.name == 'barowner')
        {
            
            next();
        }
        else
        {
            res.json({error:"This Feature is Available for BarOwner Only"})
        }
    }
    catch(err)
    {
        res.json({error:err.message})
            // return next(customErrorHandler.serverError());
    }
}

export default barowner;