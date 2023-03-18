import JwtService from "../services/jwt.js";

const auth = async (req,res,next) =>
{
  
    let authHeader = req.headers.authorization;
    if(!authHeader)
    {
        return res.json({message:"Un Authorized User"})
    }

    const token = authHeader.split(' ')[1];
    try
    {   
        const {userId,email, role} = await JwtService.verify(token); 
        const user = {
            email,
            role,
            userId
        };
        req.user = user;
        next();
    }
    catch(err)
    {
        res.json({error:err.message})
    }
}

export default auth;