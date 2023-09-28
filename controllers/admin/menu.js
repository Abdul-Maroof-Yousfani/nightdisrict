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







const store = async(req,res) =>
{

    let {menu_name,description} = req.body;
    let imageNameOne , fileName = "";
    let category = [];
    let childCategory = [];
    let menuPictures = [];
    
    try
    {
        const schema = Joi.object({
            menu_name: Joi.string().required(),
            description: Joi.string().required(),
            categories: Joi.string().required(),
            // subCategory: Joi.string().required(),
         });
        const { error, value } = schema.validate(req.body);
        if(error) return res.status(403).json({
              status: 403,
              message: error.message,
              data: {}
        })
        // check if parent category is there

   
        // if title already exists

        let checkTitle = await superMenu.findOne({menu_name});
        if(checkTitle) return res.status(409).json({ status:409, message : "Title Already Exists" , data : {}})



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
                      return res.status(400).json({
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

        if(req.body.categories)
        {
            req.body.categories = JSON.parse(req.body.categories);

            // get categories

            req.body.categories.map((e) =>{
              category.push(e.parent)
              e.child.map((ch) =>{
                childCategory.push(ch)
              })
              
            })





            //  get sub categories

            
            
        }

        

        //  add sub categories
        let data = new superMenu({
          menu_name,
          description,
          categories : category,
          subCategories : childCategory,
          pictures : menuPictures,
          user:req.user._id

        });
        await data.save();

        return res.json({
            message : "success",
            data
        })
           
    }
    catch(error)
    {
        res.status(500).json({
            message: error.message,
            data: {}
        })
    }

}

const update = async(req,res) =>
{
  let {menu_name,description} = req.body;
  let {_id} = req.params;
  let imageNameOne , fileName = "";
  let category = [];
  let childCategory = [];
  let menuPictures = [];
  
  try
  {
      const schema = Joi.object({
          menu_name: Joi.string(),
          description: Joi.string(),
          categories: Joi.string(),
          // subCategory: Joi.string().required(),
       });
      const { error, value } = schema.validate(req.body);
      if(error) return res.status(403).json({
            status: 403,
            message: error.message,
            data: {}
      })
      // check if parent category is there

 
      // if title already exists

      // let checkTitle = await superMenu.findOne({menu_name});
      // if(checkTitle) return res.status(409).json({ status:409, message : "Title Already Exists" , data : {}})



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
                    return res.status(400).json({
                      status: 400,
                      error: error.message,
                      data: ""
                    });
                  }
                });

  
                menuPictures.push(`/menu/${fileName}`)
            })
          }
          
          req.body.pictures = menuPictures;
        }

      //  add categories

      if(req.body.categories)
      {
          req.body.categories = JSON.parse(req.body.categories);

          // get categories

          req.body.categories.map((e) =>{
            category.push(e.parent)
            e.child.map((ch) =>{
              childCategory.push(ch)
            })
            
          })

          req.body.subCategories = childCategory


          
      }


      // update data

      req.body.user  = req.user._id;
     
      //  add sub categories
      let data = await  superMenu.findByIdAndUpdate({_id : mongoose.Types.ObjectId(_id)},{
        $set: req.body
      },{new:true});
      // await data.save();

      return res.json({
          message : "success",
          data
      })
         
  }
  catch(error)
  {
      console.log(error)
      res.status(500).json({
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
        res.status(500).json({
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
        return res.status(500).json({
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

  for (const imageUrl of imageUrls) {
    // Extract the file ID from the Google Drive URL
    
    const googleDriveFileId = extractGoogleDriveFileId(imageUrl.hyperlink);

    // Generate the direct download link for the Google Drive image
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;

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
    }
  }

  // Update the SuperMenu with image paths

  return imagePaths;
};


const createOrUpdateCategory = async (colE, parentId = null, colJ = "") => {
  try {
    // Try to find an existing category
    let category = await menuCategory.findOne({ name: colE, parent: parentId });

    if (!category) {
      // If the category doesn't exist, create a new one
      category = new menuCategory({ name: colE, parent: parentId });
    }

    colJ = colJ.hyperlink;

    if (colJ && typeof colJ === 'string') {
      // Extract the file ID from the Google Drive URL
      const googleDriveFileId = extractGoogleDriveFileId(colJ);

      // Generate the direct download link for the Google Drive image
      const imageUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;

      // Download the image from the URL using Axios
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer', // Receive image data as an array buffer
      });

      if (response.status === 200) {
        // Specify the directory for SuperMenu images
        const dirOneSuperMenu = "public/menuCat";

        // Generate a unique filename for the SuperMenu image
        const fileNameSuperMenu = `${Date.now()}_supermenu_image.png`;

        // Construct the full image path
        const imageNameSuperMenu = `${dirOneSuperMenu}/${fileNameSuperMenu}`;

        if (!fs.existsSync(dirOneSuperMenu)) {
          fs.mkdirSync(dirOneSuperMenu, { recursive: true });
        }

        // Save the downloaded image
        fs.writeFileSync(imageNameSuperMenu, response.data);

        // Update the category_image field with the image path
        if (category) {
          category.category_image = `menuCat/${fileNameSuperMenu}`;
          await category.save();
        }
      }
    }

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

              // Create or find Subcategory1 and set its parent to categoryId
        const subcategory1Id = await createOrUpdateCategory(colG, categoryId,colJ);

        // Create or find Subcategory2 and set its parent to categoryId
        const subcategory2Id = await createOrUpdateCategory(colI, categoryId,colJ);
        


        const superMenuData = {
          bar: null, // Set the appropriate bar ID
          user: null, // Set the appropriate user ID
          userType: null, // Set the appropriate userType ID
          menu_name: colB,
          description: colC,
          category: categoryId, // Use the category ID obtained above
          subCategory: subcategory1Id, // Use the subcategory1 ID obtained above
          picture: '',
          pictures: [], // You can add pictures here if needed
          categories: [categoryId], // Include parent and subcategories
          subCategories: [subcategory1Id, subcategory2Id], // No need to include subcategories here
        };
  
        // Insert superMenuData into the superMenu collection
        superMenuData.pictures = await downloadSuperMenuPictures([colJ])
     
        let data = new superMenu(superMenuData);
        await data.save();


      } catch (error) {
        console.error('Error processing row:', error);
      }
    }

    // Handle the response when all rows are processed
    console.log('Data processing completed');
    res.json({ message: 'Data processing completed' });

  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Error reading Excel file' });
  }
};


export  default{
    store,
    update,
    index,
    show,
    importProduct
}