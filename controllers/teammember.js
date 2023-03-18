import Joi from "joi"
import teamMember from "../models/team.js";
import users from "../models/users.js";
import bcrypt from 'bcrypt';



const store = async (req, res) => {
    
    try
    {
        const schema = Joi.object({
            "name" : Joi.string().required(),
            "username" : Joi.string().required(),
            "password" : Joi.string().required(),
            "type" : Joi.string().required(),
            "bar" : Joi.string()
        });
        // const  {error} = validate.schema(req.body);
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(400).json({ message : error.message ,data : {} })

        //  first create User in the users table, with respective type
        req.body.password = await bcrypt.hash(req.body.password, 10)
        let user = new users({
            firstname : req.body.name,
            username : req.body.username,
            password : req.body.password
        });
        await user.save()

        // creating team Object 
        let team = {
            type : req.body.type,
            bar : req.body.bar,
            user : user.id
        }

        let data = new teamMember(team);
        data.save();
        return res.json({
            message : "success",
            data
        })

    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({
            message : error.message,
            data : {}
        })

    }

    return res.json({
        data : "3232"
    })
}

const index = async(req,res) =>
{
    try
    {   
        

    }
    catch(error)
    {

    }
}


export default {
   store,
   index
}