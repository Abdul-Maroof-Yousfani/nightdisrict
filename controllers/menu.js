import SimpleSchema from 'simpl-schema';
import menuCategory from "../models/menuCategory.js";
import Role from "../models/roles.js";
import User from "../models/users.js";
import Menu from '../models/menu.js';
import helpers from '../utils/helpers.js';
import reviews from '../models/reviews.js';

const createMenuCat = async (req, res) => {
    try {

        let userId = req.user._id;
        let result = await User.findById(userId);
        let checkRole = await Role.findById({ _id: result.role });

        if (checkRole.name == 'admin') {
            if (req.files) {
                let picture = req.files.category_image;

                let fileName = `public/menuCat/${Date.now()}-${picture.name.replace(/ /g, '-').toLowerCase()}`;
                await picture.mv(fileName);

                picture = fileName.replace("public", "");
                req.body.category_image = fileName;
                picture = fileName.replace("public", "");
                req.body.category_image = picture;
            }
            const updateCat = await menuCategory.create(req.body);

            return res.status(200).json({
                status: "success",
                message: "Menu Category Updated",
                data: updateCat
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "error",
            data: error.message
        })
    }
}

const createMenu = async (req, res) => {
    try {
        let userId = req.user._id;
        let result = await User.findById(userId);
        let checkRole = await Role.findById({ _id: result.role });

        if (checkRole.name == 'barowner' || checkRole.name == 'admin') {
            if (req.files) {
                let picture = req.files.image;

                let fileName = `public/menu/${Date.now()}-${picture.name.replace(/ /g, '-').toLowerCase()}`;
                await picture.mv(fileName);

                picture = fileName.replace("public", "");
                req.body.image = fileName;
                picture = fileName.replace("public", "");
                req.body.image = picture;

                req.body.galleryImages = [];
                let file = req.files.galleryImages;
                for (let i = 0; i < file.length; i++) {
                    let fileNameNew = `public/menu/${Date.now()}-${file[i].name.replace(/ /g, '-').toLowerCase()}`;
                    file[i].mv(fileNameNew, async (err) => {
                        if (err) return res.status(400).json({ message: err.message });
                    });
                    fileNameNew = fileNameNew.replace("public", "");
                    req.body.galleryImages.push({ 'path': fileNameNew });
                }
            }
            const menu = await Menu.create(req.body);

            return res.status(200).json({
                status: "success",
                message: "Menu Created",
                data: menu
            })

        }
    } catch (error) {
        return res.status(500).json({
            message: "error",
            data: error.message
        })
    }
}

const getReviewById = async(req,res) =>
{
    let {bar,item} = req.body;
    try
    {
        let data = await reviews.find({
            bar : bar,
            item :  item
        }).limit(1).lean();
        // let results = await helpers.paginate(data,req.query.page,req.query.limit);
        data = await Promise.all(data.map( async (e) =>{
            return helpers.getReviewById(e._id);
        }))

        return res.status(200).json({
            status : 200,
            message : "success",
            data,
            // paginate : results.totalPages
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
    createMenuCat,
    createMenu,
    getReviewById,
}