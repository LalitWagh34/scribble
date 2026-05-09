

import type { NextFunction , Request ,Response } from "express";
import jwt from "jsonwebtoken"

export async function middleware(req:Request ,res:Response ,next:NextFunction){
    const authHeader = req.headers.authorization
    
    if(!authHeader){
        res.status(401).json({message:"No token Provided!!"});
        return
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "No token provided!!" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded;
        next();
    }catch(e){
        res.status(401).json({
            message:"Invalid token"
        })
    }

}