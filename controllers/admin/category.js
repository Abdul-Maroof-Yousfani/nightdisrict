import Joi from 'joi';
import mongoose from 'mongoose';
import menuCategory from '../../models/menuCategory.js';
import fs from 'fs';
import superMenu from '../../models/superMenu.js';
import menu from '../../models/menu.js';
import users from '../../models/users.js';
import reviews from '../../models/reviews.js';
import pourtype from '../../models/pourtype.js';
import helpers from '../../utils/helpers.js';

const store = async (req, res) => {
    let { name, description, category_image, parent } = req.body;
    let imageNameOne = "";
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            category_image: Joi.object().unknown(true),
            parent: Joi.string()
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(200).json({
            status: 400,
            message: error.message,
            data: {}
        })
        // check if parent category is there

        if (parent) {
            let checkParent = await menuCategory.findById({ _id: mongoose.Types.ObjectId(parent) });
            if (!checkParent) return res.status(200).json({ status:400, message: "Parent Category Does not Exist", data: {} })
        }

        // if title already exists

        let checkTitle = await menuCategory.findOne({ name });
        if (checkTitle) {
            //  assign category to the Parent Category 


            return res.status(200).json({ status:403, message: "Title Already Exists", data: {} })
        }



        // add Images to Categories

        if (req.files) {
            let image = req.files.category_image;

            const dirOne = "public/menuCat";
            imageNameOne = `${dirOne}/${Date.now()}_` + image.name;
            if (!fs.existsSync(dirOne)) {
                fs.mkdirSync(dirOne, { recursive: true });
            }
            image.mv(imageNameOne, error => {
                if (error) {
                    return res.status(200).json({
                        status: 400,
                        error: error.message,
                        data: ""
                    });
                }
            });

            req.body.category_image = `menuCat/${image.name}`
        }

        let data = new menuCategory(req.body);
        await data.save();

        return res.json({
            status : 200,
            message: "success",
            data
        })

    }
    catch (error) {
        res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }

}
const index = async (req, res) => {
    try {

        let data = await menuCategory.find({ parent: null }).lean();
        data = await Promise.all(data.map(async (e) => {
            let categories = await menuCategory.find({ parent: e._id }).lean()
       
            e.subcategories = categories
            if(e.name == 'Spirits' || e.name == 'spirits')
            {
                // get All three Servings, 
                let servings = await pourtype.find({

                })
                e.servings = servings

            }
            else
            {
                let servings = await pourtype.find({
                    name : "Pour"
                })
                e.servings = servings

            }

            e.subcategories = await Promise.all(e.subcategories.map(async (item) => {

                // add tertiary categories into It
                item.tertiary = await menuCategory.find({parent: item._id})

                item.items = await superMenu.find({ categories: item._id , bar: null })
                item.items = item.items ? item.items : []
                return item
            }));

            return e
        }))


        return res.json({
            status : 200,
            message: "success",
            data
        })
    }
    catch (error) {
        res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }
}

const update = async (req, res) => {
    let imageNameOne, thumbPath = "";
    let { _id } = req.params;
    try {
        // checking if it contains files
        if (req.files) {
            let image = req.files.category_image;

            const dirOne = "public/menuCat";
            imageNameOne = `${Date.now()}_` + image.name;
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

            req.body.category_image = `/menuCat/${imageNameOne}`
        }
        // check request contains subcategories

        // update category using id


        let data = await menuCategory.findByIdAndUpdate({
            _id
        }, { $set: req.body }, { new: true })



        if (req.body.subcategories) {
            // convert data to Json 
            let subcategories = JSON.parse(req.body.subcategories);
            subcategories.map(async (e) => {
                await menuCategory.updateOne({ _id: e.id }, { $set: { parent: _id, name: e.name } }, { upsert: true })
            })



        }





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

const parentCategory2 = async (req, res) => {
    try {

        let data = await menuCategory.find({ parent: null }).lean();
        

        data = await Promise.all(data.map(async (e) => {
        
            if(e.name == 'Spirits' || e.name == 'spirits')
            {
                // get All three Servings, 
                let servings = await pourtype.find({

                })
                e.servings = servings

            }
            else
            {
                let servings = await pourtype.find({
                    name : "Pour"
                })
                e.servings = servings

            }
            e.items = await menu.find({ category: e._id , barId : req.query.barId}).lean()
            if(e.items.length)
            {
                // e.items = await helpers.getItemById()
                e.items = await Promise.all(e.items.map(async(itemData) =>{
                    // console.log(itemData);
                    return await helpers.getItemById(itemData.item,itemData.barId);
                }))
            }

            // add a check here

            // get a subcategory
           
            // if(e.items.length)
            // {
            //     e.items = await Promise.all(e.items.map( async (item) =>{

            //         // get categories and subcategories

            //         item.price = 0

            //         if(item.category)
            //         {
            //             let category = await menuCategory.findById({_id : item.category},{name : 1});
            //             item.category = category.name
            //         }
            //         if(item.subCategory)
            //         {
            //             let subCategory = await menuCategory.findById({_id : item.subCategory},{name : 1});
            //             item.subCategory = subCategory.name
            //         }


            //         let filter = {};

            //         // get item name from the bar
                   
                    

            //         let itemsdata = await menu.findOne({
            //             item : item._id
            //         }).lean();

            //             // add variation data to
            //         let totalPrice = 0;
            //         item.variation = await Promise.all(itemsdata.variation.map( async (va) =>{
            //                 // get variation data
            //                 let newVariations = await pourtype.findOne({
            //                     _id : va.variant
            //                 })
            //                 va.name = newVariations.name
            //                 totalPrice  = totalPrice + va.price
            //                 return va
            //             }))


            //         item.price = totalPrice

                        
            //             // get reviews from the customer

            //         if(itemsdata.reviews)
            //             {
            //                 item.reviews = await Promise.all(itemsdata.reviews.map(async(rev) =>{
            //                     // get customer data
    
            //                     // get customer data and review information
    
            //                     let userInfo = await users.findOne({_id : rev.customer});
            //                     if(userInfo)
            //                     {
            //                         rev.name = userInfo.username
            //                         rev.picture = userInfo.profile_picture
            //                     }
                 
            //                     // get review information
    
            //                     let reviewInfor = await reviews.findOne({
            //                         _id : rev.review
            //                     })
            //                     if(reviewInfor)
            //                     {
            //                         rev.message = reviewInfor.message
            //                         rev.count = reviewInfor.rating
            //                     }
                        
    
    
            //                     return rev;
    
    
                                
    
            //                 }))
            //             }
            //             else
            //             {
            //                 item.reviews = []
            //             }
                       

            //         return item;
                    

            //     }))
            // }

            return e

        }))


        return res.json({
            status: 200,
            message: "success",
            data
        })
    }
    catch (error) {
        console.log(error)
        return res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }
}

const parentCategory = async (req, res) => {
    try {

        let data = await menuCategory.find({ parent: null }).lean();
        data = await Promise.all(data.map(async (e) => {
            if(e.name == 'Spirits' || e.name == 'spirits')
            {
                // get All three Servings, 
                let servings = await pourtype.find({

                })
                e.servings = servings

            }
            else
            {
                let servings = await pourtype.find({
                    name : "Pour"
                })
                e.servings = servings

            }
            e.items = await superMenu.find({ category: e._id , bar : null }).lean()

            // add a check here

            e.items = e.items ? e.items : []
            
           
            // get a subcategory
           

            if(e.items.length)
            {
                e.items = await Promise.all(e.items.map( async (item) =>{

                    // get categories and subcategories

                    item.price = 0


                    
                    if(item.category)
                    {
                        let category = await menuCategory.findById({_id : item.category},{name : 1});
                        item.category = category.name
                    }
                    if(item.subCategory)
                    {
                        let subCategory = await menuCategory.findById({_id : item.subCategory},{name : 1});
                        item.subCategory = subCategory.name
                    }


                    let filter = {};

                    // get item name from the bar
                    if(req.query.barid)
                    {
                        filter.push = item._id
                        filter.barId = req.query.barid
                        // itemsdata = await menu.findOne({
                        //     item : item._id,
                        //     bar : req.query.barid
                        // }).lean()
                    }
                    else
                    {
                        filter.item = item._id
                        // filter.bar = req.query.barid
                    }

                    

                    let itemsdata = await menu.findOne({
                        $and : [filter]
                    });

                    
                   
                    if(itemsdata)
                    {
                        
                        // add variation data to
                        let totalPrice = 0;
                        item.variation = await Promise.all(itemsdata.variation.map( async (va) =>{
                            // get variation data
                            let newVariations = await pourtype.findOne({
                                _id : va.variant
                            })
                            va.name = newVariations.name
                            totalPrice  = totalPrice + va.price
                            return va
                        }))

                        item.price = totalPrice

                        
                        // get reviews from the customer

                        if(itemsdata.reviews)
                        {
                            item.reviews = await Promise.all(itemsdata.reviews.map(async(rev) =>{
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
                        else
                        {
                            item.reviews = []
                        }
                       

                    }

                    return item;
                    

                }))
            }

            return e

        }))


        return res.json({
            status : 200,
            message: "success",
            data
        })
    }
    catch (error) {
        console.log(error)
        return res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }
}
const getCategoryBasedItems = async (req, res) => {
    let { category } = req.body;
    try {
        const schema = Joi.object({
            category: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(200).json({
            status: 403,
            message: error.message,
            data: {}
        })


        let data = await superMenu.find({ categories: mongoose.Types.ObjectId(category) , bar : null }).select({ "menu_name": 1, "description": 1, "picture": 1 })


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
            data: {}
        })
    }
}

const getSearchableProducts = async(req,res) =>
{
    let {id,bar} = req.params
    let  {page,limit,query,category} = req.query;
   
    let child , data , newData = [];
    let categoryQuery  = {}
    let productQuery = {}

    categoryQuery.name = { $regex: new RegExp(query, 'i') }
    productQuery.menu_name =  { $regex: new RegExp(query, 'i') }


    try {

        if(category)
        {
            categoryQuery.parent = mongoose.Types.ObjectId(category)
            productQuery = {
                barId :  mongoose.Types.ObjectId(bar),
                menu_name : { $regex: new RegExp(query, 'i') },
                onSale : true
            }
        }



        // categoryQuery.name = { $regex: new RegExp(query, 'i') }
        // productQuery.menu_name =  { $regex: new RegExp(query, 'i') }


        // Split the query into words
        // let child = await menuCategory.find({parent : mongoose.Types.ObjectId(id)}).select({name:1,description:1,category_image:1})
        // let data = await menu.find({ barId: mongoose.Types.ObjectId(bar) , "categories.category" : id  }).lean();

        let child = await menuCategory.find(categoryQuery)
        if(child.length)
        {
            productQuery = {
                "categories.category" : child[0]._id,
                "onSale" : true
            }
        }
        let products = await menu.find(productQuery).select({name:1,description:1,category_image:1 , category :1 , subCategory : 1,item:1}).lean()
        // // let childrens = [];

        let newData = helpers.paginate(products,page,limit)
        
        let data = await Promise.all(newData.result.map((e) => {
            return helpers.getItemById(e.item,bar)
        }))
        // get single Product
        let product = {};
        if(products.length)
        {
            product = await helpers.getItemById(products[0].item,bar)
        }
        return res.json({
            status : 200,
            message : "success",
            data : {child,products:data , product},
            pagination : newData.totalPages
        })

        // Perform a recursive search for each keyword and its combinations
        // for (let i = 0; i < keywords.length; i++) { 
        //     for (let j = i + 1; j <= keywords.length; j++) {
        //         const currentKeywords = keywords.slice(i, j);
        //         const searchString = currentKeywords.join(' ');

        //         // Check if the current search string matches any category names
        //         const categoryResults = await menuCategory.find({ name: { $regex: searchString, $options: 'i' } });

        //         if (categoryResults.length > 0) {
        //             console.log(`Category Results for "${searchString}":`);
        //             console.log(categoryResults);

        //             // If there are category results, fetch associated products
        //             for (const category of categoryResults) {
        //                 const products = await menu.find({ category: category._id });
        //                 console.log(`Products in category ${category.name}:`);
        //                 console.log(products);
        //             }
        //         } else {
        //             // If no category matches, check for product names
        //             const productResults = await menu.find({
        //                 menu_name: { $regex: searchString, $options: 'i' }
        //             });

        //             if (productResults.length > 0) {
        //                 console.log(`Product Results for "${searchString}":`);
        //                 console.log(productResults);
        //             } else {
        //                 console.log(`No results found for "${searchString}".`);
        //             }
        //         }
        //     }
        // }
        return res.json({
            status : 200,
            message : 'success',
            data : {}
        })
    } catch (error) {
        console.log(error);
        return res.json({
            status : 500,
            message : 'success',
            data : {}
        })
        console.error('Error searching:', error);
    }
}

const searchNewProducts = async(req,res) =>
{
    let {term} = req.query;
    try {
        // Check if the term matches any category names
        const categoryResults = await menuCategory.find({ name: { $regex: term, $options: 'i' } });
    
        if (categoryResults.length > 0) {
          // Display category results
          console.log('Category Results:');
          console.log(categoryResults);
        } else {
          // If no category matches, check for product names
          const productResults = await menu.find({ menu_name: { $regex: term, $options: 'i' } });
    
          if (productResults.length > 0) {
            // Display product results
            console.log('Product Results:');
            console.log(productResults);
          } else {
            // If no matches found
            console.log('No results found.');
          }
        }
        return res.json({})
      } catch (error) {
        console.error('Error searching:', error);
      }
}


const show = async (req, res) => {
    let { _id } = req.params;
    try {
        let data = await menuCategory.findOne({ _id }).lean()
        data.subcategories = await menuCategory.find({ parent: data._id }).lean()
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
const category = async(req,res) =>
{
    try
    {
        let data = await menuCategory.find({parent : null});
        return res.status(200).json({
            status : 200,
            message : "success",
            data
        })
    }
    catch(error)
    {
        return res.status(200).json({
            status : 500,
            message :error.message,
            data : []
        })
    }
}

const categoryWiseData = async(req,res) =>
{
    let {id} = req.params;
    try
    {   

        let checkCategory = await menuCategory.findById({
            _id : id
        }).lean()

        
        checkCategory.child = [];
        checkCategory.items = [];



        let child = await menuCategory.find({
            parent:id
        }).lean()


        let servings =  []
        if(checkCategory.name == 'Spirits')
        {
            servings =  await pourtype.find({
               
            }).lean()

        }
        else
        {
            servings =  await pourtype.find({
                name : 'Pour' 
            }).lean()
        }
        checkCategory.servings = servings;



        if(child.length)
        {
            checkCategory.child = await Promise.all(child.map( async (e) =>{
                // get categories having which is parent of All
                let data = await menuCategory.find({
                    "parent" : e._id
                }).lean()
                e.child = [];
                e.items = [];
                if(data.length)
                {
                    e.child = await Promise.all(data.map(async(childData) =>{
          
                        childData.items = await superMenu.find({
                            subCategory : childData._id,
                            bar:null
                        });
                        childData.items = await Promise.all(childData.items.map( async (productData) =>{
                            return await helpers.getSuperItem(productData._id)
                        }))
                        /// childData.products = await helpers.getSuperItem(newProduct._id)
                        return childData
                        
                    }))
                }
                else
                  {
                    e.items = await superMenu.find({
                        subCategories : e._id,
                        bar : null
                    });
                    e.items = await Promise.all(e.items.map(async(childProducts) =>{
                        return await helpers.getSuperItem(childProducts._id)
                    }))
                }
                
                
                return e;
            }))
        }
        else
        {
            checkCategory.items = await superMenu.find({
                category : id,
                bar : null
            }).lean()
            checkCategory.items = await Promise.all(checkCategory.items.map(async(childProducts) =>{
                return await helpers.getSuperItem(childProducts._id)
            }))
        }   
        
        return res.json({
            status : 200,
            message : 'success',
            data : checkCategory

        })
    }
    catch(error)
    {
        console.log(error);
        return res.json({
            status : 500,
            message : error.message,
            data : {}

        })

    }
}

const getSingleCategory = async(req,res)=> {
    let {id} = req.params
    try
    {
        let category = await menuCategory.findById({
            _id : id
        }).lean()
        let data = await superMenu.find({
            parent : null,
            category : mongoose.Types.ObjectId(id)
        }).lean()
        let newData = await helpers.paginate(data,req.query.page,req.query.limit)
        
        category.list  = await Promise.all(newData.result.map(async(e) =>{
            return await helpers.getSuperItem(e._id)
        }))
        // get servings based on category
        let servings =  []
        if(category.name == 'Spirits')
        {
            servings =  await pourtype.find({
                
            }).lean()

        }
        else
        {
            servings =  await pourtype.find({
                name : 'Pour' 
            }).lean()
        }
        category.servings = servings;
        
        // let data = await helpers.getSuperItem(_id)
        return res.json({
            status  : 200,
            message : "success",
            data : category,
            paginate : newData.totalPages
        })
    }
    catch(error)
    {
        return res.json({
            status  : 500,
            message : error.message,
            data : {}
        })
    }
}

const getProductCategories = async(req,res) =>
{
    let {id,bar} = req.params
    let  {page,limit} = req.query;
    try
    {
        // check if category has any Child Categories
        let child = await menuCategory.find({parent : mongoose.Types.ObjectId(id)}).select({name:1,description:1,category_image:1})
        let data = await menu.find({ barId: mongoose.Types.ObjectId(bar) , "categories.category" : id , onSale : true }).lean();

        let newData = helpers.paginate(data,page,limit)
        

        data = await Promise.all(newData.result.map((e) => {
            return helpers.getItemById(e.item,e.barId)
        }))
        return res.json({
            status : 200,
            message : "success",
            data : {child,products:data },
            pagination : newData.totalPages
        })
    }
    catch(error)
    {
        return res.json({
            status : 500,
            message : error.message,
            data : {}
        })
    }
}


const getAllCategories = async(req,res) =>
{
    try
    {
        let data = await menuCategory.find({
            parent : null
        }).lean()
        data  = await Promise.all(data.map(async(e) =>{
            e.child = await menuCategory.find({
                parent : e._id
            }).lean();
            e.child = await Promise.all(e.child.map( async (children) =>{
                children.child = await menuCategory.find({
                    parent : children._id
                })
                return children;
            }))
            return e;
        }))
        return res.json({
            status : 200,
            message : 'success',
            data 
        });
    }
    catch(error)
    {
        return res.json({
            status : 500,
            message : error.message,
            data :{}
        });
    }
}


const allDrinks = async(req,res) =>
{
    let {page,limit} = req.query;
    try
    {
        let data = await superMenu.find({}).lean();
        let newData = helpers.paginate(data,page,limit);
        data = await Promise.all( newData.result.map(async(e) =>{
            e.category = await menuCategory.findById({_id : e.category});
            e.tertiaryCategory = await menuCategory.findById({_id : e.subCategory});
            e.subCategory = await menuCategory.findById({_id : e.subCategory});
            // e.tertiaryCategory = await menuCategory.findById({_id : e.subCategory});

            delete e.categories;
            delete e.subCategories;
            return e;
        }))
        

        return res.json({
            status : 200,
            message : "success",
            data,
            paginate  : newData.totalPages
        })
    }
    catch(error)
    {
        console.log(error);
        return res.json({
            status : 500,
            message : "error",
            data : []
        })
    }
   
}


export default {
    category,
    categoryWiseData,
    store,
    index,
    update,
    show,
    parentCategory,
    getCategoryBasedItems,
    parentCategory2,
    getProductCategories,
    getSingleCategory,
    getAllCategories,
    getSearchableProducts,
    searchNewProducts,
    allDrinks,
    
}