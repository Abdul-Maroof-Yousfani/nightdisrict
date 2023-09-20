import Joi from 'joi';
import mongoose from 'mongoose';
import fs from 'fs';
import superMenu from '../../models/superMenu.js';
import menuCategory from '../../models/menuCategory.js';
import helpers from '../../utils/helpers.js';
import excel from 'exceljs';


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

const importProduct = async(req,res) =>
{
  try
  {
    
    if (!req.files) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const buffer = req.files.file.data
    // console.log();
    // return;

    const workbook = new excel.Workbook();
    workbook.xlsx.load(buffer).then(async(workbook) => {
      const worksheet = workbook.getWorksheet(1); // Assuming the data is in the first sheet

      const extractedData = [];

      worksheet.eachRow(async(row, rowNumber) => {
        if (rowNumber !== 1) {
          const colB = row.getCell(2).value; // Get the value of cell B
          const colC = row.getCell(3).value; // Get the value of cell C
          const colE = row.getCell(5).value; // Get the value of cell E
          const colG = row.getCell(7).value; // Get the value of cell G
          const colI = row.getCell(9).value; // Get the value of cell I
          const colJ = row.getCell(10).value; // Get the value of cell J

          // Extract data from specific columns (B, C, E, G, I, J)

          // create categories sub categories
          let data = { colB, colC, colE, colG, colI, colJ };



          extractedData.push(data);
        }
      });
      
      await Promise.all(extractedData.map(async(e) =>{
         await helpers.createCategory(e)

      }))


      


      res.json({ products: extractedData });
    });
  }
  catch(error)
  {
    console.log(error)
    res.status(500).json({ error });
  }
}

export  default{
    store,
    update,
    index,
    show,
    importProduct
}