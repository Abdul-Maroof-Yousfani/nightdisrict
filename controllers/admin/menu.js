import Joi from 'joi';
import mongoose from 'mongoose';
import fs from 'fs';
import menuCategory from '../../models/menuCategory.js';
import helpers from '../../utils/helpers.js';
import excel from 'exceljs';
import { Readable } from 'stream'; // Import the Readable class from the 'stream' module
import fetch from 'node-fetch'; // Import the node-fetch library


import axios from 'axios';

import async from 'async';
import superMenu from '../../models/superMenu.js';
import menu from '../../models/menu.js';







const store = async(req,res) =>
{

    let {menu_name,description,parent,subcategory,tertiary} = req.body;
    let imageNameOne , fileName = "";
    let category = [];
    let childCategory = [];
    let menuPictures = [];
    
    try
    {
        const schema = Joi.object({
            menu_name: Joi.string().required(),
            description: Joi.string().required(),
            // categories: Joi.string().required(),
            parent: Joi.string().required(),
            subcategory : Joi.any(),
            tertiary : Joi.any(),
            // subCategory: Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(200).json({
              status: 403,
              message: error.message,
              data: {}
        })
        // check if parent category is there

   
        // if title already exists

        let checkTitle = await superMenu.findOne({menu_name});
        if(checkTitle) return res.status(200).json({ status:409, message : "Title Already Exists" , data : {}})



        // add Images to Categories

        if (req.files) {
            let pictures = req.files.pictures;
            if(pictures)
            {
              pictures.map((e) =>{

        
                let image = e;
          
                const dirOne = "public/menu";
                  fileName = `${Date.now()}_` + image.name;
                  imageNameOne = `${dirOne}/${fileName}`;
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

    
                menuPictures.push(`/menu/${fileName}`)
              })
            }
            
            
          }

        //  add categories
        let finalCategory;
        if(tertiary)
        {
          finalCategory =  req.body.tertiary;
        }
        else if(subcategory)
        {
          finalCategory = subcategory;
        }
        else
        {
          finalCategory = parent;
        }
        

        //  add sub categories
        let data = new superMenu({
            menu_name,
            description,
            category : parent,
            subCategory : finalCategory,
            categories : [parent, subcategory, tertiary].filter(id => id !== undefined),
            subCategories: [parent, subcategory, tertiary].filter(id => id !== undefined),// No need to include subcategories here
            user:req.user._id,
            pictures : menuPictures

        });
        await data.save();

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }

}

const update = async(req,res) =>
{
  let {menu_name,description,parent,subcategory,tertiary} = req.body;
  let {_id} = req.params;
    let imageNameOne , fileName = "";
    let category = [];
    let childCategory = [];
    let menuPictures = [];
    
    try
    {
        const schema = Joi.object({
            menu_name: Joi.string().required(),
            description: Joi.any(),
            // categories: Joi.string().required(),
            parent: Joi.any(),
            subcategory : Joi.any(),
            tertiary : Joi.any(),
            // subCategory: Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(200).json({
              status: 403,
              message: error.message,
              data: {}
        })
        // check if parent category is there

   
        // if title already exists

        let checkM = await superMenu.findById({_id});
        if(!checkM) return res.status(200).json({ status:404, message : "Menu not found" , data : {}})

        // let checkTitle = await superMenu.findOne({menu_name : menu_name});
        // if(checkTitle) return res.status(200).json({ status:409, message : "Menu name can't be duplicate" , data : {}})



        // add Images to Categories

        if (req.files) {
            let pictures = req.files.pictures;
            if(pictures)
            {
              pictures.map((e) =>{

        
                let image = e;
          
                const dirOne = "public/menu";
                  fileName = `${Date.now()}_` + image.name;
                  imageNameOne = `${dirOne}/${fileName}`;
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

    
                menuPictures.push(`/menu/${fileName}`)
              })
            }
            
            
          }

        //  add categories
        let finalCategory;
        if(tertiary)
        {
          finalCategory =  req.body.tertiary;
        }
        else if(subcategory)
        {
          finalCategory = subcategory;
        }
        else
        {
          finalCategory = parent;
        }
        

        //  add sub categories
        let data = await  superMenu.findByIdAndUpdate(
          {
            _id
          },
          {
            menu_name,
            description,
            category : parent,
            subCategory : finalCategory,
            categories : [parent, subcategory, tertiary].filter(id => id !== undefined),
            subCategories: [parent, subcategory, tertiary].filter(id => id !== undefined),// No need to include subcategories here
            user:req.user._id,
            pictures : menuPictures
        },{
          new:true
        });

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
      res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
      })
    }
}


const index = async(req,res) =>
{
    let {search} = req.query;
    try
    {
        // check if file is there



        let data = await superMenu.find({}).select({ "picture" : 0 , "bar" : 0, "userType" : 0, "category" : 0, "subCategory" : 0  , "createdAt" : 0 , "updatedAt" : 0 }).lean();
        // paginate the code
        let result = await helpers.paginate(data,req.params.page,req.params.limit);

        let newData = await Promise.all(result.result.map(async(e) =>{
            if(e.categories.length)
            {
                e.categories = await Promise.all(e.categories.map( async (category) =>{
                    return await menuCategory.findOne({_id : category}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
            if(e.subCategories.length)
            {
                e.subCategories = await Promise.all(e.subCategories.map( async (sub) =>{
                    return await menuCategory.findOne({_id : sub}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
            return e
        }))
        return res.json({
            status : 200,
            message : "success",
            data : newData,
            paginate :  result.totalPages

        })
          
    }
    catch(error)
    {
        res.status(200).json({
            status : 500,
            message: error.message,
            data: {}
        })
    }
}

const show = async(req,res) =>{
    let {_id} = req.params
    try
    {
        let data = await superMenu.findOne({_id , user: mongoose.Types.ObjectId('641d2816a266e71a5c95de1c')}).lean();
     
        if(data.categories.length)
            {
                data.categories = await Promise.all(data.categories.map( async (category) =>{
                    return await menuCategory.findOne({_id : category}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
        if(data.subCategories.length)
            {
                data.subCategories = await Promise.all(data.subCategories.map( async (sub) =>{
                    return await menuCategory.findOne({_id : sub}).select({"name" : 1 , "description" : 1 , "category_image" : 1})
                }))
               
            }
      
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
          message : error.message,
          data:{}
        })
    }
}


// 


const extractGoogleDriveFileId = (url) => {
  const urlParts = url.split('/');
  let fileId = null;

  // Search for the 'file/d/' pattern in the URL
  const fileIndex = urlParts.indexOf('file');
  if (fileIndex !== -1 && fileIndex + 2 < urlParts.length) {
    fileId = urlParts[fileIndex + 2];
  }

  // If the 'file/d/' pattern was not found, check for 'open?id='
  if (!fileId) {
    const openIdIndex = url.indexOf('open?id=');
    if (openIdIndex !== -1) {
      fileId = url.substring(openIdIndex + 8);
    }
  }

  if (fileId) {
    return fileId;
  } else {
    throw new Error('Invalid Google Drive URL format');
  }
};


const downloadSuperMenuPictures = async (imageUrls) => {


  const imagePaths = [];

  try
  {
    for (const imageUrl of imageUrls) {
      // Extract the file ID from the Google Drive URL
      
      const googleDriveFileId = extractGoogleDriveFileId(imageUrl.text);
  
      // Generate the direct download link for the Google Drive image
      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;
      console.log(directDownloadUrl);

  
      // Download the image from the URL using Axios
      const response = await axios.get(directDownloadUrl, {
        responseType: 'arraybuffer', // Receive image data as an array buffer
      });
  
      if (response.status === 200) {
        // Specify the directory for SuperMenu images
        const dirOneSuperMenu = "public/menu";
  
        // Generate unique filenames for SuperMenu images
        const fileNameSuperMenu = `${Date.now()}_supermenu_image.png`;
  
        // Construct the full image path
        const imageNameSuperMenu = `${dirOneSuperMenu}/${fileNameSuperMenu}`;
  
        if (!fs.existsSync(dirOneSuperMenu)) {
          fs.mkdirSync(dirOneSuperMenu, { recursive: true });
        }
  
        // Save the downloaded image
        fs.writeFileSync(imageNameSuperMenu, response.data);
  
        // Add the image path to the array
        imagePaths.push(`menu/${fileNameSuperMenu}`);

        return imagePaths;
      }
      
    }
  }
  catch(error)
  {
    console.log(error.message)
    return imagePaths;
  }

 

  // Update the SuperMenu with image paths

};


const createOrUpdateCategory = async (colE, parentId = null, colJ = "") => {
  try {
    // Try to find an existing category
    let category = await menuCategory.findOne({ name: colE, parent: parentId });

    if (!category) {
      // If the category doesn't exist, create a new one
      category = new menuCategory({ name: colE, parent: parentId });
    }

    // colJ = colJ.hyperlink;

    // if (colJ && typeof colJ === 'string') {
    //   // Extract the file ID from the Google Drive URL
    //   const googleDriveFileId = extractGoogleDriveFileId(colJ);

    //   // Generate the direct download link for the Google Drive image
    //   const imageUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;

    //   // Download the image from the URL using Axios
    //   const response = await axios.get(imageUrl, {
    //     responseType: 'arraybuffer', // Receive image data as an array buffer
    //   });

    //   if (response.status === 200) {
    //     // Specify the directory for SuperMenu images
    //     const dirOneSuperMenu = "public/menuCat";

    //     // Generate a unique filename for the SuperMenu image
    //     const fileNameSuperMenu = `${Date.now()}_supermenu_image.png`;

    //     // Construct the full image path
    //     const imageNameSuperMenu = `${dirOneSuperMenu}/${fileNameSuperMenu}`;

    //     if (!fs.existsSync(dirOneSuperMenu)) {
    //       fs.mkdirSync(dirOneSuperMenu, { recursive: true });
    //     }

    //     // Save the downloaded image
    //     fs.writeFileSync(imageNameSuperMenu, response.data);

    //     // Update the category_image field with the image path
    //     if (category) {
    //       category.category_image = `menuCat/${fileNameSuperMenu}`;
    //       await category.save();
    //     }
    //   }
    // }

    // Save the category (either new or updated)
    await category.save();

    return category._id;
  } catch (error) {
    console.error(`Error creating/updating category: ${error}`);
    throw error;
  }
};


const importProduct = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const excelData = req.files.file.data;

    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(excelData);
    stream.push(null); // End the stream

    const workbook = new excel.Workbook();

    await workbook.xlsx.read(stream);

    const worksheet = workbook.getWorksheet(1); // Assuming the data is in the first sheet
    let allCats = [];
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const colB = row.getCell(2).value; // Get the value of cell B
      const colC = row.getCell(3).value; // Get the value of cell C
      const colE = row.getCell(5).value; // Get the value of cell E
      const colG = row.getCell(7).value; // Get the value of cell G
      const colI = row.getCell(9).value; // Get the value of cell I
      const colJ = row.getCell(10).value; // Get the value of cell J

      try {
        // Create or find the Menu Category and set its picture as colJ
        const categoryId = await createOrUpdateCategory(colE, null, colJ);

        let subcategory1Id,subcategory2Id;
        // Create or find Subcategory1 and set its parent to categoryId
        if(colG)
        {
          subcategory1Id = await createOrUpdateCategory(colG, categoryId,colJ);
          allCats.push(subcategory1Id)
        }

        if(colI)
        {
          subcategory2Id = await createOrUpdateCategory(colI, subcategory1Id,colJ);
        }
        // console.log(subcategory2Id);
        let parent = categoryId;
        let finalCategory;
        if(colI)
        {
          finalCategory =  subcategory2Id;
        }
        else if(colG)
        {
          finalCategory = subcategory1Id;
        }
        else
        {
          finalCategory = parent;
        }


        // check and update product
        
        // Create or find Subcategory2 and set its parent to categoryId
        
        let checkSuperMenu = await superMenu.findOne({
          menu_name  : colB
        })
        let superMenuData = {}
        if(checkSuperMenu)
        {
            superMenuData = {
                bar: null, // Set the appropriate bar ID
                user: null, // Set the appropriate user ID
                userType: null, // Set the appropriate userType ID
                menu_name: colB,
                description: colC,
                category: parent, // Use the category ID obtained above
                subCategory: finalCategory, // Use the subcategory1 ID obtained above
                categories: [categoryId, subcategory1Id, subcategory2Id].filter(id => id !== undefined),
                subCategories: [subcategory1Id, subcategory2Id].filter(id => id !== undefined),// No need to include subcategories here
            }; 
        }

        console.log("Update Menu")
        console.log(superMenuData);
        console.log("Menu Updated")


        allCats = []

        // update Menu

        let update = await superMenu.findByIdAndUpdate({
          _id : checkSuperMenu._id
        },{
          $set  : superMenuData
        },{
          new :true
        })
 
       
        // if(!checkSuperMenu)
        // {
        //     const superMenuData = {
        //       bar: null, // Set the appropriate bar ID
        //       user: null, // Set the appropriate user ID
        //       userType: null, // Set the appropriate userType ID
        //       menu_name: colB,
        //       description: colC,
        //       category: categoryId, // Use the category ID obtained above
        //       subCategory: subcategory1Id, // Use the subcategory1 ID obtained above
        //       picture: '',
        //       pictures: [], // You can add pictures here if needed
        //       categories: [categoryId], // Include parent and subcategories
        //       subCategories: [subcategory1Id, subcategory2Id], // No need to include subcategories here
        //     };
      
        //     // Insert superMenuData into the superMenu collection
    
        //     if(colJ)
        //     {
        //       superMenuData.pictures = await downloadSuperMenuPictures([colJ])
        //       console.log("ROW NUMBER" + rowNumber);
        //       console.log(superMenuData.pictures);
        //     }
        
        
        //     let data = new superMenu(superMenuData);
        //     await data.save();
        // }
        // else
        // {
        //     // update menu images
        //     let pictures = [];
        //     if(colJ)
        //     {
        //          pictures = await downloadSuperMenuPictures([colJ])
        //           if(!pictures.length)
        //           {
        //             pictures.push('menu/no_photo.png')
        //           }
                
        //     }
        //     else
        //     {
        //         pictures.push('menu/no_photo.png')
                
        //     }

        //     console.log("new picture")
        //     console.log("Menu name "  + colB)
        //     console.log(pictures)
                

        //     await superMenu.findByIdAndUpdate({
        //       _id : checkSuperMenu._id
        //     },{ 
        //       $set: {
        //         pictures : pictures
        //       }
        //     })

        //     if(!colB)
        //     {
        //         return res.json({
        //           status : "done"
        //         })
        //     }
            

        // }

      } catch (error) {
        console.error('Error processing row:',error);
      }
    }

    // Handle the response when all rows are processed
    console.log('Data processing completed');
    res.json({ message: 'Data processing completed' });

  } catch (error) {
    // console.error('fError reading Excel ile:', error);
    res.status(500).json({ error: 'Error reading Excel file' });
  }
};

async function removeDuplicates(req,res) {
  try {
    const result = await superMenu.aggregate([
      {
        $group: {
          _id: { menu_name: '$menu_name' },
          uniqueIds: { $addToSet: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    

    const duplicateIds = result.map((group) => group.uniqueIds.slice(1)).flat();

    // Remove duplicate records
    const deletionResult = await MenuModel.deleteMany({ _id: { $in: duplicateIds } });

    console.log(`${deletionResult.deletedCount} duplicate records removed.`);
  } catch (error) {
    console.error('Error removing duplicates:', error);
  }
}


export  default{
    store,
    update,
    index,
    show,
    importProduct,
    removeDuplicates
}