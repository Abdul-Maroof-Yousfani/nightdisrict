import Joi from "joi";
import post from "../models/post.js";

const store = async (req, res) => {
    try {
            let schema = Joi.object({
                title : Joi.string().required(),
                description : Joi.string().required(),
                hashtag : Joi.array()
            }) 
          
            const { error, value } = schema.validate(req.body); 
            if(error) return res.status(400).json({ message : error.message , data : {} })

            let data = new post(req.body);
            await data.save();
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

export default {
    store
}