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
import pourtype from '../../models/pourtype.js';
import helpers from '../../utils/helpers.js';
import event from '../../models/event.js';
import promotion from '../../models/promotion.js';
import attendance from '../../models/attendance.js';
import teamMember from '../../models/team.js';



const nearby = async(req,res) =>
{
    try
    {
        let data = await helpers.nearbyBars(req.body.longitude,req.body.latitude);
        let results = await helpers.paginate(data,req.params.page,req.params.limit);
        return res.status(200).json({
            status : 200,
            message : "success",
            data : results.result,
            paginate : results.totalPages
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 500,
            message : error.message,
            data :[]
        })
    }
    
}


const barProfile = async (req, res) => {
    try {
        let userId = req.user._id;
        let result = await User.findById({ _id: userId });
        let checkRole = await Role.findById({ _id: result.role });

        if (req.files.upload_logo) {
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
        barInfo.result = await User.findByIdAndUpdate(userId, { $set: { barInfo: barInfo._id } }, { new: true });
        return res.status(200).json({
            status: "success",
            message: "Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(500).json({
            message: "error",
            data: error.message
        })
    }
}

const barInfo = async (req, res) => {
    let body = req.body;
    let barId = req.params.id;
    let userId = req.user._id;
    let {longitude,latitude} = req.body;



    try {

        // Joi Validation

        let schema = Joi.object({
            barName: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            phone: Joi.number().required(),
            url: Joi.string(),
            longitude: Joi.string(),
            latitude: Joi.string(),
            color: Joi.string(),
        });

       



        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ message: error.message, data: {} })


        // add location here

        if(longitude && latitude)
        {
            let location = {
                type : "Point",
                coordinates:[longitude,latitude]
            }
            body.location = location
        }
        else

        {
            body.location = {
                type : "Point",
                coordinates:[0,0]
    
            }  
        }

     


        // check if Bar exists

        let checkBar = await bar.findOne({ _id: mongoose.Types.ObjectId(barId) }).lean()
        if (!checkBar) return res.status(404).json({ message: "Record not found", data: {} })




        let result = await User.findById({ _id: userId });
        let checkRole = await Role.findById({ _id: result.role });

        let doc;


        if (req.files) {
            doc = req.files.upload_document;


            if(!helpers.fileValidation(doc,/(\.pdf|\.docx)$/i))
            {
                return res.status(400).json({
                    status : 400,
                    message : "File Must of Type PDF / DOCX",
                    data : {}
                })
            }



            let fileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;
            await doc.mv(fileName);

            doc = fileName.replace("public", "");
            req.body.upload_document = fileName;
            doc = fileName.replace("public", "");
            req.body.upload_document = doc;
        }
        let barInfo = await Bar.findByIdAndUpdate({ _id: barId }, {
            $set: {
                barName: body.barName,
                address: body.address,
                city: body.city,
                state: body.state,
                phone: body.phone,
                url: body.url,
                upload_document: req.body.upload_document,
                color:body.color,
                longitude : body.longitude,
                latitude : body.latitude,
                location : body.location
            }
        }, { new: true });



        return res.status(200).json({
            status: "success",
            message: "Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "error",
            data: error.message
        })
    }
}

const detailInfo = async (req, res) => {
    let barId = req.params.id;
    let body = req.body;
    try {
        let userId = req.user._id;
        let result = await User.findById({ _id: userId });
        let checkRole = await Role.findById({ _id: result.role });

        let data = {
            day: body.day,
            startTime: body.startTime,
            endTime: body.endTime
        }
        let barInfo = await Bar.findByIdAndUpdate({ _id: barId }, {
            $set: {
                barHours: data,
                barHashtag: body.barHashtag,
                ownerAge: body.ownerAge,
                drinkSize: body.drinkSize,
                drinkShot: body.drinkShot,
                rock_neat: body.rock_neat
            }
        },
            { new: true });
        return res.status(200).json({
            status: "success",
            message: "Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(500).json({
            message: "error",
            data: error.message
        })
    }


}

const updateBarInfo = async (req, res) => {
    let body = req.body;
    let barId = req.params.id;
    let {longitude,latitude} = req.body
    try {
        let userId = req.user._id;
        let result = await User.findById({ _id: userId });
        let checkRole = await Role.findById({ _id: result.role });


        // chec if we are receiving geo

        



        if (req.files) {
            let logo = req.files.upload_logo;
            

   


            if (logo) {
                let fileName = `public/bar/${Date.now()}-${logo.name.replace(/ /g, '-').toLowerCase()}`;

                // if(!helpers.fileValidation(logo,/(\.jpg|\.jpeg|\.png|\.gif)$/i))
                // {
                //     return res.status(400).json({
                //         status : 400,
                //         message : "Please upload file having extensions .jpeg/.jpg/.png/.gif only.",
                //         data : {}
                //     })
                // }

                await logo.mv(fileName);

                logo = fileName.replace("public", "");
                req.body.upload_logo = fileName;
                logo = fileName.replace("public", "");
                req.body.upload_logo = logo;
            }

            let coverPhoto = req.files.upload_coverPhoto;
            if (coverPhoto) {
                let newFileName = `public/bar/${Date.now()}-${coverPhoto.name.replace(/ /g, '-').toLowerCase()}`;

                // if(!helpers.fileValidation(coverPhoto,/(\.jpg|\.jpeg|\.png|\.gif)$/i))
                // {
                //     return res.status(400).json({
                //         status : 400,
                //         message : "Please upload file having extensions .jpeg/.jpg/.png/.gif only.",
                //         data : {}
                //     })
                // }

                await coverPhoto.mv(newFileName);

                coverPhoto = newFileName.replace("public", "");
                req.body.upload_coverPhoto = newFileName;
                coverPhoto = newFileName.replace("public", "");
                req.body.upload_coverPhoto = coverPhoto;
            }

            let doc = req.files.upload_document;

            if (doc) {
                let docfileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;

                // if(!helpers.fileValidation(doc,/(\.pdf|\.docx)$/i))
                // {
                //     return res.status(400).json({
                //         status : 400,
                //         message : "File Must of Type PDF / DOCX",
                //         data : {}
                //     })
                // }

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

        if (req.body.barHours) {
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

        // updateing Coordinates here

        // add location here

        if(longitude && latitude)
        {
            let location = {
                type : "Point",
                coordinates:[longitude,latitude]
            }
            body.location = location
        }
        else

        {
            body.location = {
                type : "Point",
                coordinates:[0,0]
    
            }  
        }


        let barInfo = await Bar.findByIdAndUpdate({ _id: barId }, { $set: body }, { new: true });
        return res.status(200).json({
            status: "success",
            message: "All Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(500).json({
            message: "error",
            data: error.message
        })
    }
}

const getBarGeometry = async(req,res) =>
{
    let {geo} = req.body;
    try
    {

        let location = {
            type : "Polygon",
            coordinates:geo
        }

        let data  = await  bar.findByIdAndUpdate({
            _id : req.user.barInfo
        },{
            $set : {
                geometry : location
            }
        },{
            new : true
        })

        return res.json({
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
            data : []
        })
    }   

}


// Adding items to a Bar Menu

const addItem = async (req, res) => {
    let { title, description, type, category, subcategory, variation } = req.body;

    try {
        let schema = Joi.object({
            menu: Joi.array(),
            title: Joi.string(),
            description: Joi.string(),
            type: Joi.string(),
            category: Joi.string(),
            subcategory: Joi.string(),
            variation: Joi.array()
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ message: error.message, data: {} })

        if (type) {
            // add item to the main Menu

            // get category from super menu
            let categoryImage = await menuCategory.findById({
                _id : category
            })


            let mainMenu = new superMenu({
                barId: req.user.barInfo,
                user: req.user._id,
                menu_name: title,
                description,
                category,
                subCategory : subcategory,
                pictures : [categoryImage.category_image]

            })
            mainMenu = await mainMenu.save()

            mainMenu = await superMenu.findOne({ _id: mainMenu._id }).lean()

          

            if(mainMenu.category)
                    {
                        let category = await menuCategory.findById({_id : mainMenu.category},{name : 1});
                        mainMenu.category = category.name
                    }
                    if(mainMenu.subCategory)
                    {
                        let subCategory = await menuCategory.findById({_id : mainMenu.subCategory},{name : 1});
                        mainMenu.subCategory = subCategory.name
                    }


      

            // then add item to the Bar
            let data = new menu(
                {
                    "barId": req.user.barInfo,
                    "item": mainMenu._id,
                    "category": category,
                    "subCategory": subcategory,
                    variation
                }
            )
            data = await data.save();

            
            let itemsdata = await menu.findOne({
                item : mainMenu._id
            }).lean()

            let totalPrice = 0;
            mainMenu.variation = await Promise.all(itemsdata.variation.map( async (va) =>{
                            // get variation data
            let newVariations = await pourtype.findOne({
                                _id : va.variant
                            })
                            va.name = newVariations.name
                            totalPrice  = totalPrice + va.price
                            return va
                        }))

            itemsdata.price = totalPrice

            if(itemsdata.reviews)
                        {
                            mainMenu.reviews = await Promise.all(itemsdata.reviews.map(async(rev) =>{
                                // get customer data
    
                                // get customer data and review information
    
                                let userInfo = await users.findOne({_id : rev.customer});
                                if(userInfo)
                                {
                                    rev.name = userInfo.username
                                    rev.picture = userInfo.profile_picture
                                }
                 
                                // get review information
    
                                let reviewInfor = await reviews.findOne({
                                    _id : rev.review
                                })
                                if(reviewInfor)
                                {
                                    rev.message = reviewInfor.message
                                    rev.count = reviewInfor.rating
                                }
                        
    
    
                                return rev;
    
    
                                
    
                            }))
                        }


            // get item structure as parent item
            
            return res.json({ status: 200, message: "success", data : mainMenu })

        }
        if (!menu) {
            return res.status(400).json({ status: 400, message: "Menu is required", data: {} })
        }
        let data = await menu.insertMany(req.body.menu)
        // await data.save()

        return res.json({status: 200 , message: "success", data })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500 , message: error.message })
    }

}


const favouriteitem  = async(req,res) =>
{
    let {item,bar} = req.body;
    try
    {
   
        let itemCheck = await menu.findById({
            _id : id,
            barId : bar 
            
        })

        if(!itemCheck) return res.status(404).json({ status : 404 , message : "Item not found" , data :{}  })

        // now add Favourite item to the favourite


    }
    catch(error)
    {

    }
}


// Ending Item Section


//  search categories

const selectCategory = async (req, res) => {
    let { child } = req.body;
    try {
        let data = await menuCategory.findOne({
            _id: mongoose.Types.ObjectId(child)
        }).lean()

        data.parent = await menuCategory.findOne({
            _id: data.parent
        }).lean();

        data.items = await superMenu.find({
            'subCategory': mongoose.Types.ObjectId(child)
        }).lean()

        // let categories = await menuCategory.find({parent : e._id}).lean()
        // e.subcategories = categories

        // e.subcategories = await Promise.all(e.subcategories.map(async(item) =>{
        //     item.items = await superMenu.find({subCategory : item._id })
        //     item.items = item.items?item.items:[]
        //     return item
        // }));
        return res.json({
            message: "success",
            data
        })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            data: {}
        })
    }
}

const orders = async (req, res) => {
    let totalPrice = 0

    try {

        // get orders processing
        let current = await order.find({ "status": "processing" }).select({ "items": 1, "customer": 1, status: 1, type: 1 }).lean();
        current = await Promise.all((current.map(async (e) => {
            // add type

            let type = await menuCategory.findById({ _id: e.type }).select({ "name": 1 }).lean()
            if (type) {
                e.type = type.name
                e.items = await Promise.all(e.items.map(async (item) => {
                    let menu = await superMenu.findOne({ _id: item.item }).lean();
                    if (menu) {
                        item.menu_name = menu.menu_name
                        item.description = menu.description
                        item.picture = menu.picture
                        totalPrice = totalPrice + item.price

                    }
                    // check type




                    return item;

                }))

            }


            // get order 
            e.customer = await users.findOne({ _id: e.customer }).select({ "username": 1, "profile_picture": 1 })
            e.paymentMethod = "credit card"
            e.orderSummary = {

            }
            e.estimatedTime = "";
            e.totalPrice = totalPrice

            return e;

        })))


        // get orders processing
        let completed = await order.find({ "status": "completed" });


        // get orders processing
        let delivered = await order.find({ status: "delivered" });
        return res.status(200).json({
            status: 200,
            message: "success",
            data: [{ current, completed: [], delivered: [] }]
        })
    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: []
        })
    }
}

const tips = async (req, res) => {
    let totalEarning = 0;
    try {
        let current = await order.find({ "status": "completed" }).select({ "customer": 1, status: 1, type: 1, tip: 1, orderStatus: 1, orderNo: 1 }).lean();
        current = await Promise.all((current.map(async (e) => {
            // add type

            let type = await menuCategory.findById({ _id: e.type }).select({ "name": 1 }).lean()


            // get order 
            e.customer = await users.findOne({ _id: e.customer }).select({ "username": 1, "profile_picture": 1 }).lean()
            e.customer = e.customer ? e.customer.username : {}
            totalEarning = totalEarning + e.tip
            return e;

        })))
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: { totalEarning, data: current }
        })

    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: "error",
            data: []
        })
    }
}

const view = async (req, res) => {
    let { _id } = req.params;
    let totalPrice = 0;
    try {

        let data = await order.findOne({ _id }).lean();
        if (!data) return res.status(404).json({ status: 404, message: "success", data: {} })

        //  fetch items of the order

        data.items = await Promise.all(data.items.map(async (item) => {
            let menu = await superMenu.findOne({ _id: item.item }).lean();

            if (menu) {
                item.menu_name = menu.menu_name
                item.description = menu.description
                item.picture = menu.picture
                totalPrice = totalPrice + item.price

            }
            // check type


            return item;

        }))

        data.customer = await users.findOne({ _id: data.customer }).select({ "username": 1, "profile_picture": 1 }).lean()
        data.customer = data.customer ? data.customer.username : {}

        // set up order summary and totalPrices

        data.paymentMethod = "credit card"
        data.orderSummary = {
        }
        data.estimatedTime = "10 - 15 minutes";
        data.totalPrice = totalPrice

        return res.status(200).json({
            status: 200,
            message: 'success',
            data
        })

    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: "failed",
            data: {}
        })
    }

}
const items = async(req,res) =>
{
    let {bar}  = req.params;
    try
    {   
        let data = await menu.find({barId : bar}).lean()
        data = await Promise.all(data.map(async(e) =>{
            e.item = await superMenu.findOne({_id : e.item}).select({menu_name:1,pictures:1,description:1}).lean()
            e.category = await menuCategory.findOne({_id : e.category}).select({name :1})

            e.variation = await Promise.all(e.variation.map( async (v) =>{
                v.variant = await pourtype.findOne({_id : v.variant}).select({name:1})
                return v
            }))
            return e;
         
        })) 
        if(!data)
        {
            return res.status(404).json({
                status : 404,
                message : "Not Found",
                data: []
            })
        }   
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
            data : []
        })
    }

}

const show = async(req,res) =>{
    let {id}  = req.params;

    try
    {
        // get complete bar details from the bar Helper


        let data = await helpers.getBarById(id)

        return res.status(200).json({
            status : 200,
            message  : "success",
            data
        })

     }
    catch(error)
    {

        return res.status(500).json({
            status : 500,
            message  : error.message,
            data  : {}
        })
    }
}

const events = async(req,res) =>
{
    try
    {
        let data = await event.find({
            bar : req.params.id
        }).lean()
        data = helpers.paginate(
            data,
            req.query.page,
            req.query.limit
            
          );


        let result = await Promise.all(data.result.map( async (e) =>{
            return await helpers.getEventById(e._id)
        }))
        return res.status(200).json({
            status : 200,
            message : "success",
            data : result,
            pagination : data.totalPages
        })
        
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message :error.message,
            data : []
        })
    }
}
const promotions = async(req,res) =>
{
    let result = []
    try
    {
        let data = await promotion.find({
            bar : req.params.id
        }).lean()
        data = helpers.paginate(
            data,
            req.query.page,
            req.query.limit
            
          );


        //result = await Promise.all(data.result.map( async (e) =>{
        //     return await helpers.getPromotionById(e,e.bar)
        // }))
        return res.status(200).json({
            status : 200,
            message : "success",
            data : result,
            pagination : data.totalPages
        })
        
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message :error.message,
            data : []
        })
    }
}

// get all par menu

const Menu = async(req,res) =>
{
    let {bar,category,subCategory} = req.body;
    let {page,limit} = req.query;
    try
    {   
        // adding validation in the code, to atleast have a bar id here

        let schema = Joi.object({
            bar: Joi.string().required(),
            category: Joi.string(),
            subCategory: Joi.string()
        });
        
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ status : 400, message: error.message, data: {} })

      


        const filters = {};

        filters.bar = bar 

        if (category) {
            filters.category = category;
        }
        if (subCategory) {  
            filters.subCategory = subCategory;
        }


        let results = await menu.find({
            filters
        }).lean();

        results = await helpers.paginate(results,page,limit);
        // console.log(results);
        // return res.json({results})
        let data = results.result;

        let newData = [];
        

        data = await Promise.all(data.map( async (e) =>{
            return await helpers.getItemById(e.item,e.barId,'');
        }))





         return res.status(200).json({
            status : 200,
            message : 'success',
            data  : data,
            pagination :results.totalPages
        })
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            status : 500,
            message : error.message,
            data :  []
        })
    }
}

const update = async (req, res) => {
    let { title, description, type, category, subcategory, variation } = req.body;

    try {
        let schema = Joi.object({
            menu: Joi.array(),
            title: Joi.string(),
            description: Joi.string(),
            type: Joi.string(),
            category: Joi.string(),
            subcategory: Joi.string(),
            variation: Joi.array()
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ message: error.message, data: {} })

        if (type) {
            // add item to the main Menu

            // get category from super menu
            let categoryImage = await menuCategory.findById({
                _id : category
            })

            

            // let mainMenu = new superMenu({
            //     barId: req.user.barInfo,
            //     user: req.user._id,
            //     menu_name: title,
            //     description,
            //     category,
            //     subCategory : subcategory,
            //     pictures : [categoryImage.category_image]

            // })
            // mainMenu = await mainMenu.save()

            // mainMenu = await superMenu.findOne({ _id: mainMenu._id }).lean()

          

            if(mainMenu.category)
                    {
                        let category = await menuCategory.findById({_id : mainMenu.category},{name : 1});
                        mainMenu.category = category.name
                    }
                    if(mainMenu.subCategory)
                    {
                        let subCategory = await menuCategory.findById({_id : mainMenu.subCategory},{name : 1});
                        mainMenu.subCategory = subCategory.name
                    }


      

            // then add item to the Bar
            let data = new menu(
                {
                    "barId": req.user.barInfo,
                    "item": mainMenu._id,
                    "category": category,
                    "subCategory": subcategory,
                    variation
                }
            )
            data = await data.save();

            
            let itemsdata = await menu.findOne({
                item : mainMenu._id
            }).lean()

            let totalPrice = 0;
            mainMenu.variation = await Promise.all(itemsdata.variation.map( async (va) =>{
                            // get variation data
            let newVariations = await pourtype.findOne({
                                _id : va.variant
                            })
                            va.name = newVariations.name
                            totalPrice  = totalPrice + va.price
                            return va
                        }))

            itemsdata.price = totalPrice

            if(itemsdata.reviews)
                        {
                            mainMenu.reviews = await Promise.all(itemsdata.reviews.map(async(rev) =>{
                                // get customer data
    
                                // get customer data and review information
    
                                let userInfo = await users.findOne({_id : rev.customer});
                                if(userInfo)
                                {
                                    rev.name = userInfo.username
                                    rev.picture = userInfo.profile_picture
                                }
                 
                                // get review information
    
                                let reviewInfor = await reviews.findOne({
                                    _id : rev.review
                                })
                                if(reviewInfor)
                                {
                                    rev.message = reviewInfor.message
                                    rev.count = reviewInfor.rating
                                }
                        
    
    
                                return rev;
    
    
                                
    
                            }))
                        }


            // get item structure as parent item
            
            return res.json({ status: 200, message: "success", data : mainMenu })

        }
        if (!menu) {
            return res.status(400).json({ status: 400, message: "Menu is required", data: {} })
        }
        let data = await menu.insertMany(req.body.menu)
        // await data.save()

        return res.json({status: 200 , message: "success", data })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500 , message: error.message })
    }

}

const home = async(req,res) =>
{
    let graph  = {}
    const currentDate = new Date();


    try
    {  


        const orders = (await order.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;
        const events =  (await event.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;
        const menuSales =  (await order.find({
            bar : req.user.barInfo,
            subscriptionType : "642a6f6e17dc8bc505021545",
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;
        const attendence =  (await attendance.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;

  

        // get todays sale



        let averageDrinkRating = 0;
        let averageEventRating = 0;
        // const drinks = await Drink.find();

        const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

      

        let salesData = await order.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        }).limit(5).sort({ createdAt: -1 }).lean();
        // // salesData  = await Promise.all(salesData.map( async (e) =>{
        //     return await helpers.getOrderById(e);
        // // }))




        const hourlySales = await order.aggregate([
            {
                $match: {
                    bar: req.user.barInfo,
                    createdAt: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $hour: '$createdAt' // Make sure this matches the actual field name in your data
                    },
                    sales: { $sum: '$totalPrice' },
                },
            },
            {
                $sort: {
                    _id: 1
                }
            },
        ]);
        //   console.log(hourlySales)
      
          const salesDataArray = Array.from({ length: 24 }, (_, index) => {
            const hour = ('0' + index).slice(-2) + ':00';
            const sales = hourlySales.find(item => item._id === index);
            return { [hour]: sales ? sales.sales : 0 };
          });
          hourlySales.forEach(item => {
            const hourIndex = item._id; // Use the hour as index
            const hour = ('0' + hourIndex).slice(-2) + ':00';
            salesDataArray[hourIndex] = { [hour]: item.sales };
          });

         res.json({ status : 200, message : "success", data  : { orders, events , menuSales, attendence , averageDrinkRating : 4.5 , averageEventRating : 4.5 , graph : salesDataArray , salesData}});
        

    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const app = async(req,res) =>
{
    let graph  = {}
    const currentDate = new Date();

    try
    {  
        const orders = (await order.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;
        const events =  (await event.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;
        const menuSales =  (await event.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;
        const attendence =  (await attendance.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        })).length;

  

        // get todays sale



        let averageDrinkRating = 0;
        let averageEventRating = 0;
        // const drinks = await Drink.find();

        const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

      


        let salesData = await order.find({
            bar : req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
        }).lean();
        // // salesData  = await Promise.all(salesData.map( async (e) =>{
        //     return await helpers.getOrderById(e);
        // // }))



        const hourlySales = await order.aggregate([
            {
                $match: {
                    bar: req.user.barInfo,
                    createdAt: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $hour: '$createdAt' // Use 'createdAt' field instead of '$timestamp'
                    },
                    sales: { $sum: '$amount' }, // Adjust the field name if necessary
                },
            },
            {
                $sort: {
                    _id: 1
                }
            },
        ]);
        
      
        const salesDataArray = Array.from({ length: 24 }, (_, index) => ({
            key: `${index.toString().padStart(2, '0')}:00`,
            value: 0
        }));
        
        hourlySales.forEach(item => {
            const hour = item._id;
            const formattedHour = `${hour.toString().padStart(2, '0')}:00`; // Format to "HH:00"
            const index = salesDataArray.findIndex(data => data.key === formattedHour);
            if (index !== -1) {
                salesDataArray[index].value = item.sales;
            }
        });
         res.json({ status : 200, message : "success", data  : { orders, events , menuSales, attendence , averageDrinkRating : 4.5 , averageEventRating : 4.5 , graph : salesDataArray , salesData}});
        

    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const web = async(req,res) =>
{
    let graph  = {}
    try
    {  

       

        const orders = (await order.find({
            bar : req.user.barInfo
        })).length;
        const events =  (await event.find({
            bar : req.user.barInfo
        })).length;
        const menuSales =  (await event.find({
            bar : req.user.barInfo
        })).length;
        const attendence =  (await attendance.find({
            bar : req.user.barInfo
        })).length;

  

        // get todays sale



        let averageDrinkRating = 0;
        let averageEventRating = 0;
        // const drinks = await Drink.find();

        const currentDate = new Date();
        const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

      


        let salesData = await order.find({}).lean();
        // // salesData  = await Promise.all(salesData.map( async (e) =>{
        //     return await helpers.getOrderById(e);
        // // }))



        const hourlySales = await order.aggregate([
           
            {
              $group: {
                _id: {
                  $hour: '$timestamp'
                },
                sales: { $sum: '$amount' },
              },
            },
            {
              $sort: {
                _id: 1
              }
            },
          ]);
      
          const salesDataArray = Array.from({ length: 24 }, (_, index) => {
            const hour = ('0' + index).slice(-2) + ':00';
            return { [hour]: 10 };
          });
          hourlySales.forEach(item => {
            const hourIndex = item._id; // Use the hour as index
            const hour = ('0' + hourIndex).slice(-2) + ':00';
            salesDataArray[hourIndex] = { key : [hour] , value : 10 };
          });

         res.json({ status : 200, message : "success", data  : { orders, events , menuSales, attendence , averageDrinkRating : 4.5 , averageEventRating : 4.5 , graph : salesDataArray , salesData}});
        

    }
    catch(error)
    {
        console.log(error)
        res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}

const analytics = async(req,res) =>
{
    try
    {
        const totalMenuSalesCount = 1500;
        const totalTicketCounts = 1200;
        const eventAttendanceCount = 300;
        const averagingEventRatingsCount = 4.5;
        const bestSellingMenuPieChart = []; // Data for pie chart
        // const mostPopularMenuCategories = ["Appetizers", "Main Course", "Desserts"];
        // const bestSellingEvents = ["Event A", "Event B", "Event C"];

        const demoGraphicsMalePercentage = 60;
        const demoGraphicsFemalePercentage = 40;

        // get best selling menu

        let menuData = await superMenu.find({}).limit(6).lean();
        let count = 0;
        menuData = menuData.map((menu) => {
        count += 20;
        menu.value = count;
        return menu;
        });

        const totalMenuSales = menuData.reduce((sum, menu) => sum + menu.value, 0);

        const menuColors = ['#FFA500', '#FF0000', '#87CEEB', '#FFC0CB', '#008000', '#0000FF']; // Colors for each rank

        const bestSellingMenuWithPercentageAndColor = menuData.map((menu, index) => {


        const percentage = (menu.value / totalMenuSales) * 100;

        let backgroundColor;
        if (percentage >= 30) {
            backgroundColor = menuColors[0]; // Highest percentage color
        } else if (percentage >= 25) {
            backgroundColor = menuColors[1];
        } else if (percentage >= 20) {
            backgroundColor = menuColors[2];
        } else if (percentage >= 15) {
            backgroundColor = menuColors[3];
        } else if (percentage >= 10) {
            backgroundColor = menuColors[4];
        } else {
            backgroundColor = menuColors[5]; // Lowest percentage color
        }

        return {
            label: menu.menu_name, // Assuming 'name' is the property containing the menu label
            value: menu.value,
            percentage: percentage,
            backgroundColor: backgroundColor
          };
    })

        const demoGraphicsArray = [
            {
              label: 'Male',
              percentage: demoGraphicsMalePercentage,
              color: '#FFA500'
            },
            {
              label: 'Female',
              percentage: demoGraphicsFemalePercentage,
              color: '#FF0000'
            }
          ];
        // const userAgeDistribution = {
        //     'Baby Boomers': 20,
        //     'GenX': 30,
        //     'GenY': 25,
        //     'GenZ': 25
        //  };

        const userAgeDistribution = {
            'Baby Boomers': {
              percentage: 20,
              color: '#FFA500'
            },
            'GenX': {
              percentage: 30,
              color: '#FF0000'
            },
            'GenY': {
              percentage: 25,
              color: '#87CEEB'
            },
            'GenZ': {
              percentage: 25,
              color: '#008000'
            }
          };

        const ageDistributionArray = Object.entries(userAgeDistribution).map(([ageGroup, data]) => ({
            ageGroup,
            percentage: data.percentage,
            color: data.color
          }));

        const colors = ['#FFA500', '#FF0000', '#87CEEB', '#008000'];

        const sortedAgeDistribution = Object.entries(userAgeDistribution).sort((a, b) => b[1] - a[1]);

    


        sortedAgeDistribution.forEach((entry, index) => {
            const [ageGroup] = entry;
            userAgeDistribution[ageGroup] = {
              percentage: entry[1],
              color: colors[index] || '#808080' // Use gray for extra items
            };
          });


        //   get list of evetns

        let events = await event.find({}).select({ name :1, picture : 1 }).limit(3).lean()
        events = events.map((e) =>{
            e.totalAttendance = 10
            e.rating = 5
            return e;
        })
        let menu = await menuCategory.find({}).select({ name :1, category_image : 1 }).limit(3).lean()
        events = events.map((e) =>{
            e.totalAttendance = 10
            return e;
        })

        

          

        const analyticsData = {
            totalMenuSalesCount,
            totalTicketCounts,
            eventAttendanceCount,
            averagingEventRatingsCount,
            bestSellingMenuPieChart : bestSellingMenuWithPercentageAndColor,
            mostPopularMenuCategories  : menu,
            bestSellingEvents: events,
            demoGraphics: demoGraphicsArray,
            userAgeDistribution : ageDistributionArray
        };

        return res.json({
            status : 200,
            message : "success",
            data : analyticsData

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

const all = async(req,res) =>
{
    try
    {
        let data = await Bar.find({active: true}).lean();
        let results = await helpers.paginate(data,req.params.page,req.params.limit)
        // top menus

  

        let newData = await Promise.all(results.result.map( async (e) =>{
            e.owner = await helpers.getUserById(e.owner);
            let topMenus = await menu.find({
                barId : e._id
            }).limit(3).lean()
            if(topMenus)
            {
                topMenus = await Promise.all(topMenus.map(async(item) =>{
                    return  await helpers.getItemById(item.item,e._id)
                }))
                e.topMenus = topMenus
            }
            else
            {
                e.topMenus = []
            }
          
            return e;
        }));
        return res.status(200).json({
            status : 200,
            message : "success",
            data : newData,
            paginate : results.totalPages

        })
    }
    catch(error)
    {
        return res.status(500).json({
            status : 500,
            message : error.message,
            data   : {}
        })
    }
}

const destroy = async(req,res) =>
{
    try
    {
        // let user
        if(req.user.barInfo)
        {
            await Bar.findByIdAndUpdate({
                _id : req.user.barInfo
            },{
                $set : {
                    active : false  
                }
            },{
                new : true
            })

            await User.findByIdAndUpdate({
                _id : req.user._id
            },{
                $set : {
                    isActive : false  
                }
            },{
                new : true
            })
        }

        


        return res.status(200).json({
            status : 200,
            message : "Account Deleted Successfully!",
            data : {}
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

const getBarStats = async(req,res) =>
{
    try
    {   
        let data  = await bar.findById(
            {
                _id : req.params.id
            }
        ).lean()
        data  = await helpers.getBarById(data._id);

        data.owner = await helpers.getUserById(data.owner);
        
        // add a team member

        let team  = await teamMember.find({
            bar : req.params.id
        });
        team = await Promise.all(team.map(async(e) =>{
            return await helpers.getUserById(e.user)
        }))
        data.team = team;


        return res.json({
            status : 200,
            message : 'success',
            data
        })
    }
    catch(error)
    {
        console.log(error.message);
        return res.status(500).json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}


const analyticsByBarId = async(req,res) =>
{
    let {id} = req.params;
    let graph  = {}
    try
    {
        const totalMenuSalesCount = 1500;
        const totalTicketCounts = 1200;
        const eventAttendanceCount = 300;
        const averagingEventRatingsCount = 4.5;
        const bestSellingMenuPieChart = []; // Data for pie chart
        // const mostPopularMenuCategories = ["Appetizers", "Main Course", "Desserts"];
        // const bestSellingEvents = ["Event A", "Event B", "Event C"];

        const demoGraphicsMalePercentage = 60;
        const demoGraphicsFemalePercentage = 40;

        // get best selling menu

        let menuData = await superMenu.find({}).limit(6).lean();
        let count = 0;
        menuData = menuData.map((menu) => {
        count += 20;
        menu.value = count;
        return menu;
        });

        const totalMenuSales = menuData.reduce((sum, menu) => sum + menu.value, 0);

        const menuColors = ['#FFA500', '#FF0000', '#87CEEB', '#FFC0CB', '#008000', '#0000FF']; // Colors for each rank

        const bestSellingMenuWithPercentageAndColor = menuData.map((menu, index) => {


        const percentage = (menu.value / totalMenuSales) * 100;

        let backgroundColor;
        if (percentage >= 30) {
            backgroundColor = menuColors[0]; // Highest percentage color
        } else if (percentage >= 25) {
            backgroundColor = menuColors[1];
        } else if (percentage >= 20) {
            backgroundColor = menuColors[2];
        } else if (percentage >= 15) {
            backgroundColor = menuColors[3];
        } else if (percentage >= 10) {
            backgroundColor = menuColors[4];
        } else {
            backgroundColor = menuColors[5]; // Lowest percentage color
        }

        return {
            label: menu.menu_name, // Assuming 'name' is the property containing the menu label
            value: menu.value,
            percentage: percentage,
            backgroundColor: backgroundColor
          };
    })

        const demoGraphicsArray = [
            {
              label: 'Male',
              percentage: demoGraphicsMalePercentage,
              color: '#FFA500'
            },
            {
              label: 'Female',
              percentage: demoGraphicsFemalePercentage,
              color: '#FF0000'
            }
          ];
        // const userAgeDistribution = {
        //     'Baby Boomers': 20,
        //     'GenX': 30,
        //     'GenY': 25,
        //     'GenZ': 25
        //  };

        const userAgeDistribution = {
            'Baby Boomers': {
              percentage: 20,
              color: '#FFA500'
            },
            'GenX': {
              percentage: 30,
              color: '#FF0000'
            },
            'GenY': {
              percentage: 25,
              color: '#87CEEB'
            },
            'GenZ': {
              percentage: 25,
              color: '#008000'
            }
          };

        const ageDistributionArray = Object.entries(userAgeDistribution).map(([ageGroup, data]) => ({
            ageGroup,
            percentage: data.percentage,
            color: data.color
          }));

        const colors = ['#FFA500', '#FF0000', '#87CEEB', '#008000'];

        const sortedAgeDistribution = Object.entries(userAgeDistribution).sort((a, b) => b[1] - a[1]);

    


        sortedAgeDistribution.forEach((entry, index) => {
            const [ageGroup] = entry;
            userAgeDistribution[ageGroup] = {
              percentage: entry[1],
              color: colors[index] || '#808080' // Use gray for extra items
            };
          });


        //   get list of evetns

        let events = await event.find({}).select({ name :1, picture : 1 }).limit(3).lean()
        events = events.map((e) =>{
            e.totalAttendance = 10
            e.rating = 5
            return e;
        })
        let menu = await menuCategory.find({}).select({ name :1, category_image : 1 }).limit(3).lean()
        events = events.map((e) =>{
            e.totalAttendance = 10
            return e;
        })

        

          

        const analyticsData = {
            totalMenuSalesCount,
            totalTicketCounts,
            eventAttendanceCount,
            averagingEventRatingsCount,
            bestSellingMenuPieChart : bestSellingMenuWithPercentageAndColor,
            mostPopularMenuCategories  : menu,
            bestSellingEvents: events,
            demoGraphics: demoGraphicsArray,
            userAgeDistribution : ageDistributionArray
        };

        return res.json({
            status : 200,
            message : "success",
            data : analyticsData

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

const suspendRespond = async(req,res) =>
{
    try
    {
        let data = await bar.findByIdAndUpdate({
            _id : req.params.id
        },{
            $set : {
                isSuspended : true
            }
        })
        return res.json({
            status  : 200,
            message : 'success',
            data
        })
    }
    catch(error)
    {
        return res.status(500).json({
            status  : 500,
            message : error.message,
            data : {}
        })
    }
}

export default {
    nearby,
    items,
    barProfile,
    barInfo,
    detailInfo,
    updateBarInfo,
    addItem,
    selectCategory,
    orders,
    view,
    tips,
    show,
    favouriteitem,
    events,
    promotions,
    Menu,
    home,
    analytics,
    app,
    web,
    all,
    destroy,
    getBarStats,
    analyticsByBarId,
    getBarGeometry,
    suspendRespond,
    update
}