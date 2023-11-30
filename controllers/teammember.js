import Joi from "joi"
import teamMember from "../models/team.js";
import users from "../models/users.js";
import bcrypt from 'bcrypt';
import roles from "../models/roles.js";
import mongoose from "mongoose";
import fs from 'fs';
import team from "../models/team.js";
import order from "../models/order.js";



const store = async (req, res) => {
    let imageNameOne,thumbPath = "";
    try
    {
        const schema = Joi.object({
            "name" : Joi.string().required(),
            "email" : Joi.string().required(),
            "username" : Joi.string().required(),
            "password" : Joi.string().required(),
            "type" : Joi.string().required(),
            "bar" : Joi.string()
        });
        // const  {error} = validate.schema(req.body);
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(200).json({ status:500, message : error.message ,data : {} })


        // // update code

        // let roleType = await roles.findOne({

        // })

        // check if user already exists

        let checkUser = await users.findOne({email : req.body.email})
        
        if(checkUser) return res.status(200).json( {
                status : 409,
                message : "User with this Emaily Already Exists",
                data : {}
        } )


        //  first create User in the users table, with respective type
        req.body.password = await bcrypt.hash(req.body.password, 10)

        if (req.files) {
            let image = req.files.picture;
        
                const dirOne = "public/profiles";
                imageNameOne = `${Date.now()}_`+ image.name;
                thumbPath = `${dirOne}/${imageNameOne}`;
              if (!fs.existsSync(dirOne)) {
                fs.mkdirSync(dirOne, { recursive: true });
              }
              image.mv(thumbPath, error => {
                if (error) {
                  return res.status(200).json({
                    status: 400,
                    error: error.message,
                    data: ""
                  });
                }
              });

              req.body.picture = `/profiles/${imageNameOne}`
          }

        
        let user = new users({
            firstname : req.body.name,
            username : req.body.username,
            password : req.body.password,
            email : req.body.email,
            profile_picture : req.body.picture,
            role : req.body.type,
            related_bar : req.body.bar
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

        // 

        let data2  = await roles.find(
            {
                $or:  [ {name : "bartender"} , { name : "bouncer" } ]
            }
        ).lean();
   
        data2 = await Promise.all(data2.map( async(e) =>{
            
              e.members = await teamMember.find({
                    type : e._id,
                    bar :  mongoose.Types.ObjectId(req.body.bar)
              }).lean()
              e.members.detail = await Promise.all(e.members.map( async (detail) =>{
                    detail.user = await users.findOne({_id : detail.user}).lean();
                    detail.user.todaytip = 0
                    detail.user.todaytipEarned = 0
                    detail.user.amountWithdraw = 0
                    return detail;
                    
              }))

              return e
        }))


        return res.json({
            status : 200,
            message : "success",
            data  : data2
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
    let {_id} = req.params;
    try
    {  
        let data  = await roles.find(
            {
                $or:  [ {name : "bartender"} , { name : "bouncer" } ]
            }
        ).lean();
      
        await Promise.all(data.map( async(e) =>{
           
              e.members = await teamMember.find({
                    type : e._id,
                    bar :  mongoose.Types.ObjectId(_id)
              }).lean()
              e.members.detail = await Promise.all(e.members.map( async (detail) =>{
                    detail.user = await users.findOne({_id : detail.user}).lean();
                    detail.user.todaytip = 0
                    detail.user.todaytipEarned = 0
                    detail.user.amountWithdraw = 0
                    return detail;
                    
              }))

              return e
        }))
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
            message :error.message,
            data : []
        })
    }
}


const remove = async(req,res) =>
{
    let {user} = req.body;
    try
    {  
        let checkMember = await team.findOne({
            bar : req.user.barInfo,
            user
        })
        if(!checkMember)
        {
            return res.status(200).json({
                status : 404,
                message : "User Not Found"
            })
        }

        // check bartender Dues

        let checkOrders = await order.findOne({
            bartender : user
        })
        if(checkOrders)
        {
            return res.json({
                status : 500,
                message :`Can't remove the bartender, already Orders are in process`,
                data : {}
            })
        }

        await team.findOneAndRemove({
            bar : req.user.barInfo,
            user
        }).lean()
        await users.findOneAndRemove({
            _id : user,
        }).lean()

        // check if user has any Orders in Process

        

        let data2  = await roles.find(
            {
                $or:  [ {name : "bartender"} , { name : "bouncer" } ]
            }
        ).lean();
   
        data2 = await Promise.all(data2.map( async(e) =>{
            
              e.members = await teamMember.find({
                    type : e._id,
                    bar :  req.user.barInfo
              }).lean()
              e.members.detail = await Promise.all(e.members.map( async (detail) =>{
                    detail.user = await users.findOne({_id : detail.user}).lean();
                    detail.user.todaytip = 0
                    detail.user.todaytipEarned = 0
                    detail.user.amountWithdraw = 0
                    return detail;
                    
              }))

              return e
        }))
        
   
        return res.json({
            status : 200,
            message : "success",
            data:data2
        })

    }
    catch(error)
    {
        console.log(error)
        return res.json({
            status : 500,
            message :error.message,
            data : []
        })
    }
}



export default {
   store,
   remove,
   index
}