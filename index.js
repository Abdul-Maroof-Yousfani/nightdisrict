import express from "express";
import dotenv from 'dotenv';
import users from "./routes/users.js";
import menu from "./routes/menu.js";
import membership from "./routes/membership.js";
import bar from "./routes/bar.js";
import mongoose from "mongoose";
import roles from "./routes/role.js";
import fileUpload from "express-fileupload";

import adminRoutes from "./routes/admin.js";
import eventRoutes from "./routes/event.js";
import promotionRoutes from "./routes/promotion.js";
import teamRoute from "./routes/teammember.js";
import inquiryRoute from "./routes/inquiry.js";
import ratingRoute from "./routes/rating.js";
import postRoute from './routes/post.js';
import orderRoute from './routes/order.js';
import webRoute from './routes/web.js';
import appRoute from './routes/app.js';
import bartenderRoute from './routes/bartender.js';
import orderSocket from './sockets/order.js';
import inApp from './routes/inapp.js';
import bouncerRoute from './routes/bouncer.js';
import notificationRoute from './routes/notification.js';
import Menu from './models/menu.js';






import path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import cors from 'cors';
import superMenu from "./models/superMenu.js";
import menuCategory from "./models/menuCategory.js";




dotenv.config();


var PORT = process.env.PORT,
DB_URL = process.env.DB_URL

console.clear();
mongoose.connect(DB_URL, (err, db) => {
    if (err) console.error(err);
    console.log("DB Connected Successfully");
})

const app = express();

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.json());
// app.use(fileUpload());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'web')));
app.use(express.static(path.join(__dirname, 'pdf')));


app.use("/api/users", users);
app.use("/api/roles", roles);
app.use("/api/menu" , menu);
app.use("/api/membership", membership);
app.use("/api/bar" , bar);
app.use("/api/admin",adminRoutes);
app.use("/api/event",eventRoutes);
app.use('/api/promotion',promotionRoutes);
app.use('/api/teammember',teamRoute);
app.use('/api/inquiry',inquiryRoute)
app.use("/api/bartender",bartenderRoute);
app.use('/api/rating',ratingRoute);
app.use('/api/post',postRoute);
app.use('/api/inApp',inApp)
app.use('/api/notification',notificationRoute)
app.use('/api/order',orderRoute);
app.use('/api/web',webRoute);




// route to remove items that are not is supermenu

app.use('/remove-items', async(req,res) =>{

    // the query is going to remove items that are not is supermenu

    let data = await Menu.find({});
    data = await Promise.all(data.map(async(e) =>{
        if(e.item)
        {
            let chekMenu = await superMenu.findById({
                _id : e.item
            });
            if(chekMenu)
            {
                console.log("menu is there")
            }
            else
            {
                await Menu.findByIdAndDelete({
                    _id : e._id
                })

                console.log("NO MENU DELETED");
            }
        }
        else

        {
            await Menu.findByIdAndDelete({
                _id : e._id
            })
            console.log("NO ITEM DELETED");
        }
        
    }))

    return res.json({

    });

}) 

app.use('/updateImages', async(req,res) => {

    // the query is going to remove items that are not is supermenu

    let data = await menuCategory.find({});
    await Promise.all(data.map( async (e) =>{
        let newData  = await menuCategory.findByIdAndUpdate({
            _id : e._id
        },{
            $set : {
                category_image : `/menuCat/${e.name}.png`
            }
        },{
            new:true
        })

        return e
    
    }))

    
    
 
}) 

app.use('/callback', async(req,res) =>{
    console.log(res);
    return req.json({
        data: res
    })
}) 

app.use('/notification-handler',notificationRoute);



// Routes for App

app.use('/api/bouncer' , bouncerRoute);






app.use("/api/app",appRoute);



orderSocket.initOrder();




app.get("/", (req, res) => res.send("Welcome to the Night District API!") );



// For Admin Panel UI
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname,'web', 'index.html'));
});

// app.all("*", (req, res) => res.status(404).send("You've tried reaching a route that doesn't exist."));



app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));