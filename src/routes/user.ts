import express from "express"
import {prisma} from "../prisma"
import { middleware } from "../middleware/auth"

const router = express.Router();

router.get("/profile" , middleware , async(req ,res)=>{
    try{
        const userId = (req as any).user.id;
        const user =await prisma.user.findUnique({
            where:{id:userId},
            select:{
                id:true,
                name:true,
                email:true
            }
        });
        res.json({
            user
        })
    }catch(e){
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put("/profile",middleware , async(req ,res)=>{
    try{
        const userId = (req as any).user.id;
        const {name} = req.body
        const updateProfile = await prisma.user.update({
            where:{id:userId},
            data:{
                name
            },
            select:{
                id:true ,
                name:true,
                email:true
            }
        });
        res.json({
            user: updateProfile
        });
    }catch(e){
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;