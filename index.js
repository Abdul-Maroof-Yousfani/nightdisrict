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




dotenv.config();

var PORT = process.env.PORT,
DB_URL = process.env.DB_URL

console.clear();
mongoose.connect(DB_URL, (err, db) => {
    if (err) console.error(err);
    console.log("DB Connected Successfully");
})

const app = express();
app.use(express.json());
app.use(fileUpload());

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
// app.use("/api/barowner",barownerRoutes);
app.use('/api/rating',ratingRoute);
app.use('/api/post',postRoute);

app.get("/", (req, res) => res.send("Welcome to the Users API!"));
app.all("*", (req, res) => res.status(404).send("You've tried reaching a route that doesn't exist."));

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));