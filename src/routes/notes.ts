import express from "express";
import {prisma} from "../prisma";
import { middleware } from "../middleware/auth";

const router = express.Router();

router.post("/" , middleware , async(req ,res)=>{
    
    try{
        const {title , content} = req.body;
        const userId = (req as any).user.id
        const note = await prisma.notes.create({
            data:{
                title ,
                content,
                userId
            }
        });
        res.status(201).json({
            message:"Note Created",
            note
        })  
    }catch(e){
        console.error(e);
        res.status(500).json({message:"Internal error!! "})
    }
})

router.get("/",middleware ,async(req ,res)=>{
    try{
        const notes = await prisma.notes.findMany({
            where:{
                userId:(req as any).user.id
            },
            orderBy:{
                updatedAt:'desc'
            }
        })
        res.json({
            notes
        })
    }catch(e){
        console.error(e);
        res.status(500).json({message:"Internal error!! "})

    }
})

router.get("/:id" , middleware ,async(req ,res)=>{
    
    try{
        const noteid = req.params.id;

        if (typeof noteid !== "string") {
            return res.status(400).json({ message: "Invalid note id" });
        }

        const note = await prisma.notes.findUnique({
            where:{
                id: noteid
            }
        });
        if(!note){
            res.status(404).json({message:"Note not found"});
            return;
        }
        if(note.userId !== (req as any).user.id) {
        res.status(403).json({ message: "Unauthorized" });
        return;
        }
        res.json({ note });
    }catch(e){
        console.error(e);
        res.status(500).json({message:"Internal error!! "})

    }
})

router.put("/:id" , middleware ,async(req ,res)=>{
    
    try{
        const noteid = req.params.id;
        const {title , content} = req.body;

        if (typeof noteid !== "string") {
                return res.status(400).json({ message: "Invalid note id" });
            }

        const note = await prisma.notes.findUnique({
            where:{
                id: noteid
            }
        });
        if(!note){
            res.status(404).json({message:"Note not found"});
            return;
        }
        if(note.userId !== (req as any).user.id) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        const updateNote = await prisma.notes.update({
            where: { id: noteid },  // ← which note to update
            data: {
                title,
                content
            }
        });

        res.json({
            updateNote
        })
    }catch(e){
        console.error(e);
        res.status(500).json({message:"Internal error!! "})
    }
})

router.delete("/:id" , middleware ,async(req,res)=>{
    try{
        const noteid = req.params.id;
    
        if (typeof noteid !== "string") {
                return res.status(400).json({ message: "Invalid note id" });
            }

        const note = await prisma.notes.findUnique({
            where:{
                id: noteid
            }
        });
        if(!note){
            res.status(404).json({message:"Note not found"});
            return;
        }
        if(note.userId !== (req as any).user.id) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        const deleteNote = await prisma.notes.delete({
            where: { id: noteid }, 
            
        });

        res.json({
            message:"Note deleted Successfully !!"
        })
    }catch(e){
        console.error(e);
        res.status(500).json({message:"Internal error!! "})
    }
})

export default router