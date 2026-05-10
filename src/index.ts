import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

console.log("JWT_SECRET:", process.env.JWT_SECRET);

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth"
import noterouter from "./routes/notes" 
import userrouter from "./routes/user"
const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth" , authRouter);
app.use("/notes" , noterouter);
app.use("/user" , userrouter);

app.get("/", (req, res) => {
  res.send("Notes API is running");
});

app.listen(3000 , 
    ()=>console.log("Notes Editor Is Running"))

