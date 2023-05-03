import Bar from '../../models/bar.js';
import User from "../../models/users.js";
import Role from "../../models/roles.js";
import bar from '../../models/bar.js';
import mongoose from 'mongoose';
import menuCategory from '../../models/menuCategory.js';
import superMenu from '../../models/superMenu.js';
import Joi from 'joi';
import menu from '../../models/menu.js';
import order from '../../models/order.js';
import users from '../../models/users.js';



const barProfile = async (req,res) =>{
    try {
        let userId = req.user._id;
        let result = await User.findById({_id: userId});
        let checkRole = await Role.findById({_id:result.role});
        
            if(req.files.upload_logo)
            {
                let logo = req.files.upload_logo;
                
                let fileName = `public/bar/${Date.now()}-${logo.name.replace(/ /g, '-').toLowerCase()}`;
                
                await logo.mv(fileName);
                
                logo = fileName.replace("public", "");
                req.body.upload_logo = fileName;
                logo = fileName.replace("public", "");
                req.body.upload_logo = logo;
                
                let coverPhoto = req.files.upload_coverPhoto;
                
                let newFileName = `public/bar/${Date.now()}-${coverPhoto.name.replace(/ /g, '-').toLowerCase()}`;
                
                await coverPhoto.mv(newFileName);
                
                coverPhoto = newFileName.replace("public", "");
                req.body.upload_coverPhoto = newFileName;
                coverPhoto = newFileName.replace("public", "");
                req.body.upload_coverPhoto = coverPhoto;
                
            }
            let barInfo = await Bar.create(req.body);
            barInfo.result = await User.findByIdAndUpdate(userId , {$set: {barInfo: barInfo._id}} , {new: true});
            return res.status(200).json({
                status: "success",
                message: "Bar Info Updated",
                data: barInfo
            })
       
    } catch (error) {
        return res.status(500).json({
            message : "error",
            data: error.message
        })
    }
}

const barInfo = async (req,res) =>{
    let body = req.body;

    
    try {
        let barId = req.params.id;

        // check if Bar exists

        let checkBar = await bar.findOne({_id : mongoose.Types.ObjectId(barId)}).lean()
        if(!checkBar) return res.status(404).json({message : "Record not found" , data : {} })


        let userId = req.user._id;
        let result = await User.findById({_id: userId});
        let checkRole = await Role.findById({_id:result.role});
        
        let doc;
        
        

            if(req.files)
            {
                doc = req.files.upload_document;
                
                let fileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;
                await doc.mv(fileName);
                
                doc = fileName.replace("public", "");
                req.body.upload_document = fileName;
                doc = fileName.replace("public", "");
                req.body.upload_document = doc;
            }
            let barInfo = await Bar.findByIdAndUpdate({_id:barId} , {$set: {
                barName : body.barName , 
                address : body.address  , 
                city : body.city, 
                state : body.state, 
                phone : body.phone, 
                url : body.url,
                upload_document : req.body.upload_document
            } 
        }, {new: true});



        return res.status(200).json({
            status: "success",
            message: "Bar Info Updated",
            data: barInfo
        })
   
} catch (error) {
    return res.status(500).json({
        message : "error",
        data: error.message
    })
}
}

const detailInfo = async (req,res) =>{
    let barId = req.params.id;
    let body = req.body;
    try {
        let userId = req.user._id;
        let result = await User.findById({_id: userId});
        let checkRole = await Role.findById({_id:result.role});
        
            let data ={
                day: body.day,
                startTime: body.startTime,
                endTime: body.endTime
            }
            let barInfo = await Bar.findByIdAndUpdate({_id:barId} , {$set: {
                barHours: data ,
                barHashtag: body.barHashtag , 
                ownerAge: body.ownerAge , 
                drinkSize: body.drinkSize , 
                drinkShot: body.drinkShot , 
                rock_neat: body.rock_neat } }, 
                {new: true});
                return res.status(200).json({
                    status: "success",
                    message: "Bar Info Updated",
                    data: barInfo
                })
          
        } catch (error) {
            return res.status(500).json({
                message : "error",
                data: error.message
            })
        }
        
        
    }
    
    const updateBarInfo = async (req,res) =>{
        let body = req.body;
        let barId = req.params.id;
        try {
            let userId = req.user._id;
            let result = await User.findById({_id: userId});
            let checkRole = await Role.findById({_id:result.role});

            
         
                if(req.files)
                {
                    let logo = req.files.upload_logo;


                    if(logo)
                    {
                        let fileName = `public/bar/${Date.now()}-${logo.name.replace(/ /g, '-').toLowerCase()}`;
                    
                        await logo.mv(fileName);
                        
                        logo = fileName.replace("public", "");
                        req.body.upload_logo = fileName;
                        logo = fileName.replace("public", "");
                        req.body.upload_logo = logo;
                    }

                    let coverPhoto = req.files.upload_coverPhoto;
                    if(coverPhoto)
                    {
                        let newFileName = `public/bar/${Date.now()}-${coverPhoto.name.replace(/ /g, '-').toLowerCase()}`;
                    
                        await coverPhoto.mv(newFileName);
                        
                        coverPhoto = newFileName.replace("public", "");
                        req.body.upload_coverPhoto = newFileName;
                        coverPhoto = newFileName.replace("public", "");
                        req.body.upload_coverPhoto = coverPhoto;
                    }

                    let doc = req.files.upload_document;

                    if(doc)
                    {
                        let docfileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;
                        await doc.mv(docfileName);
                        
                        doc = docfileName.replace("public", "");
                        req.body.upload_document = docfileName;
                        doc = docfileName.replace("public", "");
                        req.body.upload_document = doc;
                    }
                
                    

                
                    
                }
                
                // if(req.files)
                // {
                    // let coverPhoto = req.files.upload_coverPhoto;
                
                    // let newFileName = `public/bar/${Date.now()}-${coverPhoto.name.replace(/ /g, '-').toLowerCase()}`;
                    
                    // await coverPhoto.mv(newFileName);
                    
                    // coverPhoto = newFileName.replace("public", "");
                    // req.body.upload_coverPhoto = newFileName;
                    // coverPhoto = newFileName.replace("public", "");
                    // req.body.upload_coverPhoto = coverPhoto;
                // }

                // if(req.files)
                // {
                //     let doc = req.files.upload_document;
                
                //     let docfileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;
                //     await doc.mv(docfileName);
                    
                //     doc = docfileName.replace("public", "");
                //     req.body.upload_document = docfileName;
                //     doc = docfileName.replace("public", "");
                //     req.body.upload_document = doc;
                // }
                
                if(req.body.barHours)
                {
                    req.body.barHours = JSON.parse(req.body.barHours)
                }
                // if(req.body.barHours)
                // {
                //     req.body.barHours = JSON.parse(req.body.barHours)
                //     console.log(req.body.barHours)
                //     console.log(typeof(req.body.barHours))
                // }
                // let data ={
                //     day: body.day,
                //     startTime: body.startTime,
                //     endTime: body.endTime
                // }

                let barInfo = await Bar.findByIdAndUpdate({_id:barId} , {$set: body }, {new: true});
                return res.status(200).json({
                    status: "success",
                    message: "All Bar Info Updated",
                    data: barInfo
                })
           
        }catch (error) {
            return res.status(500).json({
                message : "error",
                data: error.message
            })
        }
    }


    // Adding items to a Bar Menu

    const addItem = async(req,res) =>
    {
        let { title,description,type,category,subcategory,variation} = req.body;
        try
        {
            let schema = Joi.object({
                menu : Joi.array(),
                title : Joi.string(),
                description : Joi.string(),
                type : Joi.string(),
                category : Joi.string(),
                subcategory : Joi.string(),
                variation : Joi.array()
            });
            const {error,value} = schema.validate(req.body);
            if(error) return res.status(400).json({message : error.message , data : {}})

            if(type)
            {   
                // add item to the main Menu


                let mainMenu = new superMenu({
                    bar : req.user.barInfo,
                    user : req.user._id,
                    menu_name : title,
                    description,
                    category,
                    subcategory

                })
                mainMenu = await mainMenu.save()

         
              
                // then add item to the Bar

                let data = new menu([
                    {
                        "item" : mainMenu._id,
                        "category" : category,
                        "variation" : []
                     }
                ])
                await data.save();

                return res.json({message : "success",mainMenu})

            

            }
            if(!menu)
            {
                return res.status(400).json({status : 400, message : "Menu is required",data : {}}) 
            }
            let data = await menu.insertMany(req.body.menu)
            // await data.save()
      
            return res.json({message : "success",data})
        }
        catch(error)
        {
            return res.status(500).json({message : error.message})
        }

    }
    
    //  search categories

    const selectCategory  = async(req,res) =>
    {
        let {child} = req.body;
        try
        {
            let data = await menuCategory.findOne({
                _id  : mongoose.Types.ObjectId(child)
            }).lean()

            data.parent = await menuCategory.findOne({
                _id : data.parent
            }).lean();

            data.items = await superMenu.find({
                'subCategory' : mongoose.Types.ObjectId(child)
            }).lean()
            
            // let categories = await menuCategory.find({parent : e._id}).lean()
            // e.subcategories = categories

            // e.subcategories = await Promise.all(e.subcategories.map(async(item) =>{
            //     item.items = await superMenu.find({subCategory : item._id })
            //     item.items = item.items?item.items:[]
            //     return item
            // }));
            return res.json({
                message : "success",
                data
            })
        }
        catch(error)
        {
            return res.status(500).json({
                message : error.message,
                data : {}
            })
        }
    }

    const orders = async(req,res) =>{
        try
        {

            // get orders processing
            let current = await order.find({"status" : "processing"}).select({"items" : 1 , "customer" : 1 , status : 1 , type : 1}).lean();
            current  = await Promise.all((current.map(async(e) =>{
                // add type
                let type = await menuCategory.findById({_id : e.type}).select({ "name" : 1 }).lean()
                e.type = type.name
                e.items = await Promise.all(e.items.map(async(item) =>{
                        let menu = await superMenu.findOne({ _id : item.item}).lean();
                        if(menu)
                        {
                            item.menu_name = menu.menu_name
                            item.description = menu.description
                            item.picture = menu.picture
                            
                        }
                        // check type



                       
                        return item;
                        
                    }))
                
                
                // get order 
                e.customer = await users.findOne({_id : e.customer}).select({"username" : 1 , "profile_picture" : 1 })
                e.paymentMethod = "credit card"
                e.orderSummary = {

                }
                e.estimatedTime = "";
                e.totalPrice = 50
                
                return e;

            })))


            // get orders processing
            let completed = await order.find({"status" : "completed"});


            // get orders processing
            let delivered = await order.find({status : "delivered"});
            return res.status(200).json({
                status : 200,
                message : "success",
                data : [ { current ,  completed : [], delivered : [] } ]
            })
        }
        catch(error)
        {
            return res.status(500).json({
                status : 500,
                message : error.message,
                data : []
            })
        }
    }


    export  default{
        barProfile,
        barInfo,
        detailInfo,
        updateBarInfo,
        addItem,
        selectCategory,
        orders
    }