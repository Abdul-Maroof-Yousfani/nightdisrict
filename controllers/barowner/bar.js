import Bar from '../../models/bar.js';
import User from "../../models/users.js";
import Role from "../../models/roles.js";
import bar from '../../models/bar.js';
import mongoose from 'mongoose';
import menuCategory from '../../models/menuCategory.js';
import superMenu from '../../models/superMenu.js';
import Joi from 'joi';
import menu from '../../models/menu.js';
import localMenu from '../../models/menu.js';
import order from '../../models/order.js';
import users from '../../models/users.js';
import pourtype from '../../models/pourtype.js';
import helpers from '../../utils/helpers.js';
import event from '../../models/event.js';
import promotion from '../../models/promotion.js';
import attendance from '../../models/attendance.js';
import teamMember from '../../models/team.js';
import fs from 'fs';
import ejs from 'ejs';
import puppeteer from 'puppeteer';
import axios from 'axios';
import reviews from '../../models/reviews.js';
import financial from '../../models/financials.js';
import financials from '../../models/financials.js';





const nearby = async (req, res) => {
    try {
        let data = await helpers.nearbyBars(req.body.longitude, req.body.latitude);
        let results = await helpers.paginate(data, req.params.page, req.params.limit);
        return res.status(200).json({
            status: 200,
            message: "success",
            data: results.result,
            paginate: results.totalPages
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
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
            status: 200,
            message: "Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: "error",
            data: error.message
        })
    }
}

const barInfo = async (req, res) => {
    let body = req.body;
    let barId = req.user.barInfo;
    let userId = req.user._id;
    let { longitude, latitude } = req.body;



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
        if (error) return res.status(200).json({ status: 400, message: error.message, data: {} })


        // add location here

        if (longitude && latitude) {
            let location = {
                type: "Point",
                coordinates: [longitude, latitude]
            }
            body.location = location
        }
        else {
            body.location = {
                type: "Point",
                coordinates: [0, 0]

            }
        }




        // check if Bar exists

        let checkBar = await bar.findOne({ _id: mongoose.Types.ObjectId(barId) }).lean()
        if (!checkBar) return res.status(200).json({ status: 404, message: "Record not found", data: {} })




        let result = await User.findById({ _id: userId });
        let checkRole = await Role.findById({ _id: result.role });

        let doc;


        if (req.files) {
            doc = req.files.upload_document;


            if (!helpers.fileValidation(doc, /(\.pdf|\.docx)$/i)) {
                return res.status(200).json({
                    status: 400,
                    message: "File Must of Type PDF / DOCX",
                    data: {}
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
                color: body.color,
                longitude: body.longitude,
                latitude: body.latitude,
                location: body.location
            }
        }, { new: true });



        return res.status(200).json({
            status: 200,
            message: "Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: "error",
            data: error.message
        })
    }
}

const detailInfo = async (req, res) => {
    let barId = req.user.barInfo;

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
            status: 200,
            message: "Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: "error",
            data: error.message
        })
    }


}

const updateBarInfo = async (req, res) => {
    let body = req.body;
    let barId = req.user.barInfo;
    let { longitude, latitude } = req.body
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
        if (req.body.hash_tags) {
            req.body.hash_tags = req.body.hash_tags.replace(/'/g, '"');
            req.body.hash_tags = JSON.parse(req.body.hash_tags)
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

        if (longitude && latitude) {
            let location = {
                type: "Point",
                coordinates: [longitude, latitude]
            }
            body.location = location
        }
        else {
            body.location = {
                type: "Point",
                coordinates: [0, 0]

            }
        }


        let barInfo = await Bar.findByIdAndUpdate({ _id: barId }, { $set: body }, { new: true });
        return res.status(200).json({
            status: 200,
            message: "All Bar Info Updated",
            data: barInfo
        })

    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: "error",
            data: error.message
        })
    }
}

const getBarGeometry = async (req, res) => {
    let { geo } = req.body;
    try {

        let location = {
            type: "Polygon",
            coordinates: geo
        }

        let data = await bar.findByIdAndUpdate({
            _id: req.user.barInfo
        }, {
            $set: {
                geometry: location,
                active: true
            }
        }, {
            new: true
        })

        return res.json({
            status: 200,
            message: "success",
            data
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        })
    }

}


// Adding items to a Bar Menu

const addItem = async (req, res) => {
    let { title, description, type, category, subcategory, variation, superItem, menu, parent, child, subType, tertiary } = req.body;
    let totalCategories = [];

    try {
        let schema = Joi.object({
            superItem: Joi.any(),
            menu: Joi.array(),
            title: Joi.string(),
            description: Joi.string(),
            type: Joi.string(),
            category: Joi.any(),
            subcategory: Joi.any(),
            variation: Joi.array(),
            picture: Joi.any(),
            parent: Joi.any(),
            child: Joi.any(),
            tertiary: Joi.any(),
            subType: Joi.any(),

        });


        const { error, value } = schema.validate(req.body);
        if (error) return res.status(200).json({ status: 400, message: error.message, data: {} })

        if (type == 'bar') {


            let mainMenu = await superMenu.findOne({ _id: superItem }).lean()
            mainMenu.categories.map((e) => {
                totalCategories.push({
                    category: e
                })
            })


            // mainMenu.category?totalCategories.push({category : mainMenu.category}):""
            // mainMenu.subCategory?totalCategories.push({category : mainMenu.subCategory}):""

            // totalCategories.push({
            //     category : mainMenu.category
            // },{
            //     category : mainMenu.subCategory
            // })


            let barSearch = await localMenu.findOne({
                item: superItem,
                barId: req.user.barInfo
            })
            if (!barSearch) {
                let data = new localMenu(
                    {
                        "barId": req.user.barInfo,
                        menu_name: title,
                        description,
                        "item": mainMenu._id,
                        "category": mainMenu.category,
                        "subCategory": mainMenu.subCategory,
                        variation,
                        categories: totalCategories

                    }
                )
                data = await data.save();
            }



            let itemsdata = await localMenu.findOne({
                item: mainMenu._id
            }).lean()

            let totalPrice = 0;
            mainMenu.variation = await Promise.all(itemsdata.variation.map(async (va) => {
                // get variation data
                console.log(va);
                let newVariations = await pourtype.findOne({
                    _id: va.variant
                })
                va.name = newVariations.name
                totalPrice = totalPrice + va.price
                return va
            }))

            itemsdata.price = totalPrice

            if (itemsdata.reviews) {
                mainMenu.reviews = await Promise.all(itemsdata.reviews.map(async (rev) => {
                    // get customer data

                    // get customer data and review information

                    let userInfo = await users.findOne({ _id: rev.customer });
                    if (userInfo) {
                        rev.name = userInfo.username
                        rev.picture = userInfo.profile_picture
                    }

                    // get review information

                    let reviewInfor = await reviews.findOne({
                        _id: rev.review
                    })
                    if (reviewInfor) {
                        rev.message = reviewInfor.message
                        rev.count = reviewInfor.rating
                    }



                    return rev;




                }))
            }


            // get item structure as parent item

            return res.json({ status: 200, message: "success", data: mainMenu })

        }
        else if (type == 'own') {
            let findCategories = [];
            if (req.body.tertiary) {
                req.body.subCategory = req.body.tertiary
                findCategories.push(req.body.tertiary)
                findCategories.push(req.body.child)
                findCategories.push(req.body.parent)
            }

            else if (req.body.child) {
                req.body.subCategory = req.body.child
                findCategories.push(req.body.child)
                findCategories.push(req.body.parent)
            }
            else {
                req.body.subCategory = req.body.parent
                findCategories.push(req.body.parent)
            }
            let pictureArray = [];
            let picture = req.body.picture;

            if (picture && Array.isArray(picture)) {
                // Use Promise.all to wait for all asynchronous operations to complete
                await Promise.all(picture.map(async (base64String) => {
                    // Convert base64 string to buffer
                    const buffer = Buffer.from(base64String, 'base64');

                    // Generate a unique filename using the current timestamp
                    const date = Date.now() + '.jpg';

                    // Write the buffer to the file system
                    fs.writeFileSync(`public/menu/${date}`, buffer);

                    // Assuming you want to store URLs in the array, construct the URL
                    const imageUrl = `/menu/${date}`;

                    // Push the URL to the pictureArray
                    pictureArray.push(imageUrl);
                }));
            }else{
                req.body.picture = []
            }

            let superData = new superMenu({
                bar: req.user.barInfo,
                user: req.user._id,
                menu_name: req.body.title,
                description: req.body.description,
                category: req.body.parent,
                subCategory: req.body.subCategory,
                categories: findCategories,
                subCategories: findCategories,
                pictures: pictureArray
            })
            superData = await superData.save();

            // get categories

            let allCats = [];
            superData.categories.map((e) => {
                allCats.push({
                    category: e
                })
            })

            let data = new localMenu(
                {
                    "barId": req.user.barInfo,
                    menu_name: req.body.title,
                    description: req.body.description,
                    "item": superData._id,
                    "category": superData.category,
                    "subCategory": superData.subCategory,
                    variation: req.body.variation,
                    categories: allCats

                }
            )
            data = await data.save();

            return res.json({ status: 200, message: "success", data })
        }

        if (!menu) {

            return res.status(200).json({ status: 400, message: "Menu is required", data: {} })
        }
        let finalMenu = [];
        totalCategories = [];
        let myCategories = [];
        menu = await Promise.all(menu.map(async (e) => {


            let mainMenu = await superMenu.findById({ _id: e.superItem }).lean()
            // check if menu is already there

            mainMenu.category ? totalCategories.push({ category: mainMenu.category }) : "";
            e.category = mainMenu.category




            e.subCategory = mainMenu.subCategory ? totalCategories.push({ category: mainMenu.subCategory }) : "";

            e.subCategory = mainMenu.subCategory

            // create totalCategories
            mainMenu.totalCategories = mainMenu.categories.map((category) => {
                return { category: category }; // Assuming your category object has a property named "category"
            });



            e.barId = req.user.barInfo;
            e.menu_name = e.title;
            e.item = e.superItem;
            e.description = e.description;
            e.categories = mainMenu.totalCategories;
            e.variation = e.variation

            let findMenu = await localMenu.findOne({
                item: e.superItem,
                barId: req.user.barInfo
            })
            if (!findMenu) {
                finalMenu.push(e);

            }


            // "barId": req.user.barInfo,
            //             menu_name: title,
            //             description,
            //             "item": mainMenu._id,
            //             "category": mainMenu.category,
            //             "subCategory": mainMenu.subCategory,
            //             variation,
            //             categories : totalCategories


            return e
        }))
        // return res.json(finalMenu);




        let data = await localMenu.insertMany(finalMenu)
        // await data.save()

        return res.json({ status: 200, message: "success", data })
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ status: 500, message: error.message })
    }

}


const favouriteitem = async (req, res) => {
    let { item, bar } = req.body;
    try {

        let itemCheck = await menu.findById({
            _id: id,
            barId: bar

        })

        if (!itemCheck) return res.status(200).json({ status: 404, message: "Item not found", data: {} })

        // now add Favourite item to the favourite


    }
    catch (error) {
        res.status(200).json({ status: 500, message: error.message, data: {} })
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
            status: 200,
            message: "success",
            data
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
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
        return res.status(200).json({
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
        return res.status(200).json({
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
        if (!data) return res.status(200).json({ status: 404, message: "success", data: {} })

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
        return res.status(200).json({
            status: 500,
            message: "failed",
            data: {}
        })
    }

}
const items = async (req, res) => {
    let { bar } = req.params;
    try {
        let data = await menu.find({ barId: bar }).lean()
        data = await Promise.all(data.map(async (e) => {
            e.item = await superMenu.findOne({ _id: e.item }).select({ menu_name: 1, pictures: 1, description: 1 }).lean()
            e.category = await menuCategory.findOne({ _id: e.category }).select({ name: 1 })

            e.variation = await Promise.all(e.variation.map(async (v) => {
                v.variant = await pourtype.findOne({ _id: v.variant }).select({ name: 1 })
                return v
            }))
            return e;

        }))
        if (!data) {
            return res.status(200).json({
                status: 404,
                message: "Not Found",
                data: []
            })
        }
        return res.status(200).json({
            status: 200,
            message: "success",
            data
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        })
    }

}

const show = async (req, res) => {
    let { id } = req.params;

    try {
        // get complete bar details from the bar Helper


        let data = await helpers.getBarById(id)

        return res.status(200).json({
            status: 200,
            message: "success",
            data
        })

    }
    catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const searchByBar = async (req, res) => {
    try {
        let query = await menu.find({
            barId: req.params.id,
            menu_name: { $regex: new RegExp(req.params.q, 'i') },
            onSale : true
        }).lean()
        query = await Promise.all(query.map(async (e) => {
            return await helpers.getItemById(e.item, req.params.id);
        }))

        return res.json({
            status: 200,
            message: 'success',
            data: query
        });

    }
    catch (error) {
        return res.json({
            status: 500,
            message: error.message,
            data: {}
        });
    }
}

const events = async (req, res) => {
    try {
        let data = await event.find({
            bar: req.params.id
        }).lean()
        data = helpers.paginate(
            data,
            req.query.page,
            req.query.limit

        );


        let result = await Promise.all(data.result.map(async (e) => {
            return await helpers.getEventById(e._id)
        }))
        return res.status(200).json({
            status: 200,
            message: "success",
            data: result,
            pagination: data.totalPages
        })

    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        })
    }
}
const promotions = async (req, res) => {
    let result = []
    try {
        let data = await promotion.find({
            bar: req.params.id
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
            status: 200,
            message: "success",
            data: result,
            pagination: data.totalPages
        })

    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        })
    }
}

// get all par menu

const Menu = async (req, res) => {
    let { bar, category, subCategory } = req.body;
    let { page, limit } = req.query;
    try {
        // adding validation in the code, to atleast have a bar id here

        let schema = Joi.object({
            bar: Joi.string().required(),
            category: Joi.string(),
            subCategory: Joi.string()
        });

        const { error, value } = schema.validate(req.body);
        if (error) return res.status(200).json({ status: 400, message: error.message, data: {} })




        const filters = {};

        filters.barId = bar
        filters.onSale = bar

        if (category) {
            filters.category = category;
        }
        if (subCategory) {
            filters.subCategory = subCategory;
        }

        console.log(filters);


        let results = await menu.find(
            filters
        ).lean();

        results = await helpers.paginate(results, page, limit);
        // console.log(results);
        // return res.json({results})
        let data = results.result;

        let newData = [];


        data = await Promise.all(data.map(async (e) => {
            return await helpers.getItemById(e.item, e.barId, '');
        }))





        return res.status(200).json({
            status: 200,
            message: 'success',
            data: data,
            pagination: results.totalPages
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: []
        })
    }
}

const update = async (req, res) => {
    let { title, description, type, category, subcategory, variation, superItem } = req.body;
    let totalCategories = [];

    try {
        let schema = Joi.object({
            superItem: Joi.string().required(),
            menu: Joi.array(),
            title: Joi.string(),
            description: Joi.string(),
            type: Joi.string(),
            category: Joi.any(),
            subcategory: Joi.any(),
            variation: Joi.array()
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(200).json({ status: 400, message: error.message, data: {} })





        // check menu exists

        let checkMenu = await menu.findOne({
            bar: req.user.barInfo,
            item: req.params.id
        })
        if (!checkMenu) {
            return res.json({ status: 404, message: "not found", data: {} })
        }

        if (type) {
            // add item to the main Menu

            // get category from super menu
            // let categoryImage = await menuCategory.findById({
            //     _id : category
            // })


            // let mainMenu = await superMenu.findByIdAndUpdate({
            //     _id  : req.params.id
            // },{
            //     set : {
            //         barId: req.user.barInfo,
            //         user: req.user._id,
            //         menu_name: title,
            //         description,
            //         category,
            //         subCategory : subcategory,
            //         pictures : [categoryImage.category_image]

            //     }
            // },{
            //     new : true
            // })
            let mainMenu = await superMenu.findOne({ _id: superItem }).lean()



            totalCategories.push({
                category: mainMenu.category
            }, {
                category: mainMenu.subCategory
            })

            let category1 = mainMenu.category;
            let category2 = mainMenu.subCategory;



            if (mainMenu.category) {
                let category = await menuCategory.findById({ _id: mainMenu.category }, { name: 1 });
                mainMenu.category = category.name
            }
            if (mainMenu.subCategory) {
                let subCategory = await menuCategory.findById({ _id: mainMenu.subCategory }, { name: 1 });
                mainMenu.subCategory = subCategory.name
            }



            // then add item to the Bar
            let data = await menu.findOneAndUpdate(
                {
                    item: req.params.id
                }, {
                $set: {
                    "barId": req.user.barInfo,
                    "item": mainMenu._id,
                    "category": category1,
                    "subCategory": category2,
                    variation,
                    categories: totalCategories

                }
            },
                {
                    new: true
                }

            )


            let itemsdata = await menu.findOne({
                item: mainMenu._id
            }).lean()

            let totalPrice = 0;
            mainMenu.variation = await Promise.all(itemsdata.variation.map(async (va) => {
                // get variation data
                let newVariations = await pourtype.findOne({
                    _id: va.variant
                })
                va.name = newVariations.name
                totalPrice = totalPrice + va.price
                return va
            }))

            itemsdata.price = totalPrice

            if (itemsdata.reviews) {
                mainMenu.reviews = await Promise.all(itemsdata.reviews.map(async (rev) => {
                    // get customer data

                    // get customer data and review information

                    let userInfo = await users.findOne({ _id: rev.customer });
                    if (userInfo) {
                        rev.name = userInfo.username
                        rev.picture = userInfo.profile_picture
                    }

                    // get review information

                    let reviewInfor = await reviews.findOne({
                        _id: rev.review
                    })
                    if (reviewInfor) {
                        rev.message = reviewInfor.message
                        rev.count = reviewInfor.rating
                    }



                    return rev;




                }))
            }


            // get item structure as parent item

            return res.json({ status: 200, message: "success", data: mainMenu })

        }
        if (!menu) {
            return res.status(200).json({ status: 400, message: "Menu is required", data: {} })
        }
        let data = await menu.insertMany(req.body.menu)
        // await data.save()

        return res.json({ status: 200, message: "success", data })
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ status: 500, message: error.message })
    }

}

// bar reports

const pdfReport = async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        const content = await ejs.renderFile('pdf/template.ejs', {}); // Path to your EJS template

        await page.setContent(content);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace ':' with '-' to create a valid filename

        await browser.close();
        res.setHeader('Content-Disposition', `attachment; filename=overviewreport-${timestamp}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            message: "success",
        })
    }
}

const report = async (req, res) => {
    try {
        // lets get bartenders list first for the specific Bartender
        // bartender Performance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const barId = req.params.id; // Replace with the actual bar ID


        // Step 2: Use the aggregation framework to group the data by bartender
        const bartenderData = await order.aggregate([
            {
                $match: {
                    bar: mongoose.Types.ObjectId(barId),
                    // createdAt: {
                    //     $gte: today,
                    //     $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    // },
                },
            },
            {
                $group: {
                    _id: '$bartender',
                    totalOrdersDelivered: { $sum: '$totalQuantity' },
                    totalTipsEarned: { $sum: '$tip' },
                    averageDrinkRating: { $avg: '$averageRatingField' }, // Replace with the actual field for drink ratings
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'bartenderInfo',
                },
            },
        ]);

        // Step 3: Organize the data in the desired format
        const formattedBartenderData = bartenderData.map((data) => ({
            name: data.bartenderInfo[0].firstname,
            Delivered: data.totalOrdersDelivered,
            Tips: data.totalTipsEarned,
            rating: 4.5
        }));


        let bartender = formattedBartenderData


        // let bartender = [{
        //     "name" : "Larry Nelson",
        //     "Orders Delivered" : 82,
        //     "Tips Earned" : 30,
        //     "Average Drink Rating" : '4.3/5'
        // }]

        // Menu Performance


        const bestSellingMenuItem = await menu.aggregate([
            {
                $match: {
                    barId: mongoose.Types.ObjectId(req.params.id),
                },
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'item',
                    foreignField: 'items.item',
                    as: 'orderDetails',
                },
            },
            {
                $addFields: {
                    totalOrders: { $size: '$orderDetails' },
                },
            },
            {
                $sort: { totalOrders: -1 },
            },
            {
                $limit: 1,
            },
        ]);
        let bestSellingMenu =
        {
            name: '',
            total: 0,
            image: ''
        }
        if (bestSellingMenuItem.length) {
            bestSellingMenu = {
                name: bestSellingMenuItem[0].menu_name,
                total: bestSellingMenuItem[0].totalOrders,
                image: 'www.google.com'
            }
        }

        let menuChart = [{
            name: "Cocktails",
            percentage: 20,
            color: 'red'

        },
        {
            name: "Wine",
            percentage: 30,
            color: 'Green'

        },
        {
            name: "Bear",
            percentage: '10',
            color: 'blue'

        },
        {
            name: "Kentucky",
            percentage: 40,
            color: 'Grey'

        }

        ]

        const totalMenus = await menu.aggregate([
            {
                $match: {
                    barId: mongoose.Types.ObjectId(req.params.id),
                },
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'item',
                    foreignField: 'items.item',
                    as: 'orderDetails',
                },
            },
            {
                $addFields: {
                    totalSales: { $sum: '$orderDetails.totalPrice' },
                    totalOrders: { $size: '$orderDetails' },
                },
            },
            {
                $sort: { totalSales: -1 },
            },
            {
                $project: {
                    menu_name: 1,
                    totalSales: 1,
                    totalOrders: 1,
                    rating: 1,
                },
            },
        ]);

        // Calculate the rank based on the sorted array
        totalMenus.forEach((menu, index) => {
            menu.rank = index + 1;
        });




        // let totalMenus = [{
        //     rank : 1,
        //     name : "Grey Goose 1",
        //     Orders  : 52.99,
        //     Sales : 212,
        //     rating : 4.3
        // },
        // {
        //     rank : 2,
        //     name : "Grey Goose 2",
        //     Orders  : 52.99,
        //     Sales : 250,
        //     rating : 4.3
        // }]

        const bestEvent = await event.aggregate([
            {
                $match: {
                    bar: mongoose.Types.ObjectId(req.params.id),
                    active: true, // Filter for active events
                },
            },
            {
                $lookup: {
                    from: 'attendance',
                    localField: '_id',
                    foreignField: 'event',
                    as: 'attendanceDetails',
                },
            },
            {
                $addFields: {
                    totalAttendance: { $size: '$attendanceDetails' }, // Calculate total attendance
                },
            },
            {
                $sort: { totalAttendance: -1 },
            },
            {
                $limit: 1,
            },
        ]);


        // let bestEvent = {
        //     title : "Friday Night",
        //     attendance : 326,
        //     image : "",
        //     rating : 4.5,
        //     reviews : [{
        //         "name" : "David",
        //         'date' : "Jan 01, 2022",
        //         'description' : "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, seddiam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet"
        //     }]

        // }

        let peakHours = [{
            'time': '6:00 PM',
            'attendance': 1
        },
        {
            'time': '7:00 PM',
            'attendance': 5
        },
        {
            'time': '8:00 PM',
            'attendance': 20
        },
        {
            'time': '9:00 PM',
            'attendance': 58
        },
        {
            'time': '10:00 PM',
            'attendance': 30
        },
        {
            'time': '11:00 AM',
            'attendance': 20
        },
        {
            'time': '1:00 AM',
            'attendance': 1
        }
        ]

        // Demo Graphics
        // pi
        let piechart1 = [{
            name: 'male',
            percentage: 44,
            color: 'red'
        }, {
            name: 'female',
            percentage: 56,
            color: 'grey'
        }]
        let piechart2 = [{
            name: "Cocktails",
            percentage: 20,
            color: 'red'

        },
        {
            name: "Wine",
            percentage: 30,
            color: 'Green'

        },
        {
            name: "Bear",
            percentage: '10',
            color: 'blue'

        },
        {
            name: "Kentucky",
            percentage: 40,
            color: 'Grey'

        }

        ]
        const piechart3 = [{
            name: "Cocktails",
            percentage: 20,
            color: 'red'

        },
        {
            name: "Wine",
            percentage: 30,
            color: 'Green'

        },
        {
            name: "Bear",
            percentage: '10',
            color: 'blue'

        },
        {
            name: "Kentucky",
            percentage: 40,
            color: 'Grey'

        }

        ]

        // chart data

        const chartData = {
            labels: [
                "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33"
            ],
            datasets: [
                {
                    label: "Male",
                    backgroundColor: "#000",
                    data: [135, 90, 92, 72, 42, 20, 0, 5, 0, 0, 2, 3, 1]
                },
                {
                    label: "Female",
                    backgroundColor: "#ff0092",
                    data: [120, 75, 82, 63, 45, 32, 1, 0, 0, 0, 0, 0, 0]
                }
            ]
        };

        return res.json({
            status: 200,
            data: { bartender, bestSellingMenu, menuChart, totalMenus, bestEvent, peakHours, piechart1: { chartname: "Male/Female", data: piechart1 }, piechart2: { chartname: "Female", data: piechart2 }, piechart3: { chartname: "Female", data: piechart3 }, chartData }

        })
    }
    catch (error) {
        console.log(error);
        return res.json({
            status: 200,
            message: error.message
        })
    }
}

const home = async (req, res) => {
    let graph = {}
    const currentDate = new Date();


    try {


        const orders = (await order.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;
        const events = (await event.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;
        const menuSales = (await order.find({
            bar: req.user.barInfo,
            subscriptionType: "642a6f6e17dc8bc505021545",
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;
        const attendence = (await attendance.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;



        // get todays sale



        let averageDrinkRating = 0;
        let averageEventRating = 0;
        // const drinks = await Drink.find();


        // const Events = await event.find({})
        // const review = await reviews.find({})

        // const pipeline = [
        //     {
        //       $group: {
        //         _id: '$eventId', // Assuming 'eventId' in reviews refers to the _id of events
        //         averageRating: { $avg: '$rating' }
        //       }
        //     }
        //   ];
      
        //   const result = await reviews.aggregate(pipeline);
      
        //   // Add the average ratings to the events
        //   const eventsWithRatings = await Events.populate(result, { path: '_id', select: 'name' });
      


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

        const newData = new Date();
        const startOfMonth = new Date(newData.getFullYear(), newData.getMonth(), 1);

        let reports  = await financials.find({
            createdAt: { $gte: startOfMonth, $lte: newData }
        }).lean()

        res.json({ status: 200, message: "success", data: { orders, events, menuSales, attendence, averageDrinkRating: 4.5, averageEventRating: 4.5, graph: salesDataArray, salesData , reports } });


    }
    catch (error) {
        console.log(error)
        res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const app = async (req, res) => {
    let graph = {}
    const currentDate = new Date();


    try {
        const orders = (await order.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;
        const events = (await event.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;
        const menuSales = (await event.find({
            bar: req.user.barInfo,
            createdAt: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
        })).length;
        const attendence = (await attendance.find({
            bar: req.user.barInfo,
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

        const newData = new Date();
        const startOfMonth = new Date(newData.getFullYear(), newData.getMonth(), 1);

        let reports  = await financials.find({
            createdAt: { $gte: startOfMonth, $lte: newData }
        }).lean()

       

        res.json({ status: 200, message: "success", data: { orders, events, menuSales, attendence, averageDrinkRating: 4.5, averageEventRating: 4.5, graph: salesDataArray, salesData , reports} });


    }
    catch (error) {
        console.log(error)
        res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const web = async (req, res) => {
    let graph = {}
    try {



        const orders = (await order.find({
            bar: req.user.barInfo
        })).length;
        const events = (await event.find({
            bar: req.user.barInfo
        })).length;
        const menuSales = (await event.find({
            bar: req.user.barInfo
        })).length;
        const attendence = (await attendance.find({
            bar: req.user.barInfo
        })).length;



        // get todays sale



        let averageDrinkRating = 0;
        let averageEventRating = 0;
        // const drinks = await Drink.find();


        // data updated

        

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
            salesDataArray[hourIndex] = { key: [hour], value: 10 };
        });

        res.json({ status: 200, message: "success", data: { orders, events, menuSales, attendence, averageDrinkRating: 4.5, averageEventRating: 4.5, graph: salesDataArray, salesData } });


    }
    catch (error) {
        console.log(error)
        res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const analytics = async (req, res) => {
    try {
        const totalMenuSalesCount = 0;
        const totalTicketCounts = 0;
        const eventAttendanceCount = 0;
        const averagingEventRatingsCount = 0;
        const bestSellingMenuPieChart = []; // Data for pie chart
        // const mostPopularMenuCategories = ["Appetizers", "Main Course", "Desserts"];
        // const bestSellingEvents = ["Event A", "Event B", "Event C"];

        const demoGraphicsMalePercentage = 0;
        const demoGraphicsFemalePercentage = 0;

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

        let events = await event.find({
            bar: req.user.barInfo
        }).select({ name: 1, picture: 1 }).limit(3).lean()
        events = events.map((e) => {
            e.totalAttendance = 10
            e.rating = 5
            return e;
        })
        let menu = await menuCategory.find({
            bar: req.user.barInfo
        }).select({ name: 1, category_image: 1 }).limit(3).lean()
        events = events.map((e) => {
            e.totalAttendance = 10
            return e;
        })


        // get total Menu Sales Count

        let totalDrinksSales = await order.find({
            barId : req.user.barInfo,
            type : "642a6f6e17dc8bc505021545"
        })
        let totalTickets = await order.find({
            barId : req.user.barInfo,
            type : "642a7e9917dc8bc505021552"
        })

        let totalAttendances = await attendance.find({
            barId : req.user.barInfo
        })





        const analyticsData = {
            totalMenuSalesCount : totalDrinksSales.length,
            totalTicketCounts:totalTickets.length,
            eventAttendanceCount : totalAttendances.length,
            averagingEventRatingsCount,
            bestSellingMenuPieChart: bestSellingMenuWithPercentageAndColor,
            mostPopularMenuCategories: menu,
            bestSellingEvents: events,
            demoGraphics: demoGraphicsArray,
            userAgeDistribution: ageDistributionArray
        };

        return res.json({
            status: 200,
            message: "success",
            data: analyticsData

        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}

        })
    }
}

const all = async (req, res) => {
    try {
        let data = await Bar.find({ active: true }).lean();
        let results = await helpers.paginate(data, req.params.page, req.params.limit)
        // top menus



        let newData = await Promise.all(results.result.map(async (e) => {
            e.owner = await helpers.getUserById(e.owner);
            let topMenus = await menu.find({
                barId: e._id,
                onSale : true
            }).limit(3).lean()
            if (topMenus) {
                topMenus = await Promise.all(topMenus.map(async (item) => {
                    return await helpers.getItemById(item.item, e._id)
                }))
                e.topMenus = topMenus
            }
            else {
                e.topMenus = []
            }

            return e;
        }));
        return res.status(200).json({
            status: 200,
            message: "success",
            data: newData,
            paginate: results.totalPages

        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const destroy = async (req, res) => {
    try {
        // let user
        if (req.user.barInfo) {
            await Bar.findByIdAndUpdate({
                _id: req.user.barInfo
            }, {
                $set: {
                    active: false
                }
            }, {
                new: true
            })

            await User.findByIdAndUpdate({
                _id: req.user._id
            }, {
                $set: {
                    isActive: false
                }
            }, {
                new: true
            })
        }




        return res.status(200).json({
            status: 200,
            message: "Account Deleted Successfully!",
            data: {}
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}

const getBarStats = async (req, res) => {
    try {
        let data = await bar.findById(
            {
                _id: req.params.id
            }
        ).lean()
        data = await helpers.getBarById(data._id);

        data.owner = await helpers.getUserById(data.owner);

        // add a team member

        let team = await teamMember.find({
            bar: req.params.id
        });
        team = await Promise.all(team.map(async (e) => {
            return await helpers.getUserById(e.user)
        }))
        data.team = team;


        return res.json({
            status: 200,
            message: 'success',
            data
        })
    }
    catch (error) {
        console.log(error.message);
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}


const analyticsByBarId = async (req, res) => {
    let { id } = req.params;
    let graph = {}
    try {
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

        let events = await event.find({}).select({ name: 1, picture: 1 }).limit(3).lean()
        events = events.map((e) => {
            e.totalAttendance = 10
            e.rating = 5
            return e;
        })
        let menu = await menuCategory.find({}).select({ name: 1, category_image: 1 }).limit(3).lean()
        events = events.map((e) => {
            e.totalAttendance = 10
            return e;
        })


        const analyticsData = {
            totalMenuSalesCount,
            totalTicketCounts,
            eventAttendanceCount,
            averagingEventRatingsCount,
            bestSellingMenuPieChart: bestSellingMenuWithPercentageAndColor,
            mostPopularMenuCategories: menu,
            bestSellingEvents: events,
            demoGraphics: demoGraphicsArray,
            userAgeDistribution: ageDistributionArray
        };

        return res.json({
            status: 200,
            message: "success",
            data: analyticsData
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}

        })
    }
}

const suspendRespond = async (req, res) => {
    try {
        let data = await bar.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                isSuspended: req.body.suspend
            }
        },{
            new:true
        })
        return res.json({
            status: 200,
            message: 'success',
            data
        })
    }
    catch (error) {
        return res.status(200).json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}
const getReviesForProduct = async (req, res) => {
    try {
        let review = await reviews.find({
            bar: req.body.bar,
            item: req.body.item
        }).lean()
        let totalRe = await helpers.paginate(review, req.query.page, req.query.limit);
        let records = await Promise.all(totalRe.result.map((e) => {
            return helpers.getBasicReview(e);
        }))
        return res.json({
            status: 200,
            message: "success",
            data: records,
            paginate: totalRe.totalPages

        })
    }
    catch (error) {
        return res.json({
            status: 500,
            message: error.message,
            data: [],
        })
    }
}

const isBarHaveBartender = async (req, res) => {
    try {
        var barId = req.params.id;
        const users = await User.find({
            related_bar: barId
        })
        if (users.length) {
            return res.json({
                status: 200,
                message: "This Bar have Bartenders",
                data: true,
            })
        } else {
            return res.json({
                status: 200,
                message: "This Bar does not have any Bartenders",
                data: false,
            })
        }
    }
    catch (error) {
        return res.json({
            status: 500,
            message: error.message,
        })
    }
}

const toggleUpdate = async (req, res) => {
    let { type, onSale, id } = req.body;
    try {
        let data;
        if (type == 'event') {
            data = await event.findByIdAndUpdate({
                _id: id
            }, {
                $set: {
                    onSale
                }
            }, {
                new: true
            })

            console.log(data);
        }
        else {

            data = await menu.findOneAndUpdate({
                barId: req.user.barInfo,
                item: id
            }, {
                $set: {
                    onSale
                }
            }, {
                new: true
            })
            console.log(data);

        }

        return res.json({
            status: 200,
            message: "success",
            data: {
                onSale
            }
        })
    }
    catch (error) {
        return res.json({
            status: 500,
            message: error.message,
            data: {}
        })
    }
}


const createReport = async(req,res) =>
{
    try
    {
        let data = new financial(req.body);
        data = await data.save();
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
    isBarHaveBartender,
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
    update,
    report,
    pdfReport,
    searchByBar,
    getReviesForProduct,
    toggleUpdate,
    createReport
}