
import express from "express";
import bcrypt from "bcrypt";
import {prisma} from "../prisma"
import jwt from "jsonwebtoken"

const router = express.Router();

router.post("/signup",async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check first
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // 2. Then create
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    res.status(201).json({
      message: "User Created",
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signin" , async(req ,res)=>{
  
  try{
    const {email ,password} = req.body;
    
    const user = await prisma.user.findUnique({
      where:{
        email:email
      }
    })

    if(!user){
      return res.status(404).json({
        message:"User Not found!!!"
      })
    }

    const isMatch = await bcrypt.compare(password ,user.password);

    if(!isMatch){
      res.status(401).json({
        messahe:"Invalid Password!!"
      });
      return
    }

    const token = jwt.sign({id:user.id} , process.env.JWT_SECRET!);



    res.json({
      message: "Login successful", token 
    })
  }catch(e){
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }



})

export default router;
