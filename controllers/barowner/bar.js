import Bar from '../../models/bar.js';
import User from "../../models/users.js";
import Role from "../../models/roles.js";

const barProfile = async (req,res) =>{
    try {
        let userId = req.user._id;
        let result = await User.findById({_id: userId});
        let checkRole = await Role.findById({_id:result.role});
        
        if(checkRole.name == 'barowner'){
            if(req.files)
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
        }
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
        let userId = req.user._id;
        let result = await User.findById({_id: userId});
        let checkRole = await Role.findById({_id:result.role});
        
        let doc;
        
        
        if(checkRole.name == 'barowner'){
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
    }
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
        
        if(checkRole.name == 'barowner'){
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
            }
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
            
            if(checkRole.name == 'barowner'){
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

                let doc = req.files.upload_document;
                
                let docfileName = `public/bar/${Date.now()}-${doc.name.replace(/ /g, '-').toLowerCase()}`;
                await doc.mv(docfileName);
                
                doc = docfileName.replace("public", "");
                req.body.upload_document = docfileName;
                doc = docfileName.replace("public", "");
                req.body.upload_document = doc;

                let data ={
                    day: body.day,
                    startTime: body.startTime,
                    endTime: body.endTime
                }
                let barInfo = await Bar.findByIdAndUpdate({_id:barId} , {$set: {...body , barHours: data} }, {new: true});
                return res.status(200).json({
                    status: "success",
                    message: "All Bar Info Updated",
                    data: barInfo
                })
            } 
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
        let {} = req.body;
        try
        {
            console.log(req.body);
            return res.json({data : req.body})
        }
        catch(error)
        {

        }

    }
    
    export  default{
        barProfile,
        barInfo,
        detailInfo,
        updateBarInfo,
        addItem
    }