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



    try {

        // Joi Validation

        let schema = Joi.object({
            barName: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            phone: Joi.number().required(),
            url: Joi.string(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ message: error.message, data: {} })



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
                upload_document: req.body.upload_document
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
    try {
        let userId = req.user._id;
        let result = await User.findById({ _id: userId });
        let checkRole = await Role.findById({ _id: result.role });



        if (req.files) {
            let logo = req.files.upload_logo;
            

   


            if (logo) {
                let fileName = `public/bar/${Date.now()}-${logo.name.replace(/ /g, '-').toLowerCase()}`;

                if(!helpers.fileValidation(logo,/(\.jpg|\.jpeg|\.png|\.gif)$/i))
                {
                    return res.status(400).json({
                        status : 400,
                        message : "Please upload file having extensions .jpeg/.jpg/.png/.gif only.",
                        data : {}
                    })
                }

                await logo.mv(fileName);

                logo = fileName.replace("public", "");
                req.body.upload_logo = fileName;
                logo = fileName.replace("public", "");
                req.body.upload_logo = logo;
            }

            let coverPhoto = req.files.upload_coverPhoto;
            if (coverPhoto) {
                let newFileName = `public/bar/${Date.now()}-${coverPhoto.name.replace(/ /g, '-').toLowerCase()}`;

                if(!helpers.fileValidation(coverPhoto,/(\.jpg|\.jpeg|\.png|\.gif)$/i))
                {
                    return res.status(400).json({
                        status : 400,
                        message : "Please upload file having extensions .jpeg/.jpg/.png/.gif only.",
                        data : {}
                    })
                }

                await coverPhoto.mv(newFileName);

                coverPhoto = newFileName.replace("public", "");
                req.body.upload_coverPhoto = newFileName;
                coverPhoto = newFileName.replace("public", "");
                req.body.upload_coverPhoto = coverPhoto;
            }

            let doc = req.files.upload_document;

            if (doc) {
                let docfileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;

                if(!helpers.fileValidation(doc,/(\.jpg|\.jpeg|\.png|\.gif)$/i))
                {
                    return res.status(400).json({
                        status : 400,
                        message : "Please upload file having extensions .jpeg/.jpg/.png/.gif only.",
                        data : {}
                    })
                }

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


            let mainMenu = new superMenu({
                barId: req.user.barInfo,
                user: req.user._id,
                menu_name: title,
                description,
                category,
                subCategory: subcategory

            })
            mainMenu = await mainMenu.save()




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
            await data.save();

            return res.json({ message: "success", data })

        }
        if (!menu) {
            return res.status(400).json({ status: 400, message: "Menu is required", data: {} })
        }
        let data = await menu.insertMany(req.body.menu)
        // await data.save()

        return res.json({ message: "success", data })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }

}

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
        console.log(error)
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

export default {
    items,
    barProfile,
    barInfo,
    detailInfo,
    updateBarInfo,
    addItem,
    selectCategory,
    orders,
    view,
    tips
}