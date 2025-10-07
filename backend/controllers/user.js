import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import trycatch from "../middlewares/trycatch.js";
import sanitize from "mongo-sanitize";
import {User} from "../models/user.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import sendMail from "../config/sendMail.js";
import { generateAccessToken, generateToken,revokeRefreshToken,verifyRefreshToken } from "../config/generateToken.js";
import { tr } from "zod/v4/locales";
import { generateCSRFToken } from "../config/csrfMiddleware.js";
export const registerUser = trycatch(async (req, res) => {
    const sanitizedBody=sanitize(req.body);
    const validation=registerSchema.safeParse(sanitizedBody);
    if(!validation.success){
        const zodError=validation.error;
        let firstErrorMessage= "Validation failed"
        let allErrors=[]
        if(zodError?.issues && Array.isArray(zodError.issues)){
            allErrors=zodError.issues.map((issue)=>({
                field:issue.path?issue.path.join("."):"unknown",message:issue.message||"Validation Error",
                code:issue.code,
            }))
            firstErrorMessage=allErrors[0]?.message||"Validation Error"
        }
        return res.status(400).json({message:firstErrorMessage,
            errors:allErrors,
        })
    }
    const {name,email,password}=validation.data;
    const ratelimitkey=`register-rate-limit:${req.ip}:${email}`
    if(await redisClient.get(ratelimitkey)){
        return res.status(429).json({message:"Too many requests,try again later"})
    }
    const existingUser=await User.findOne({email})
    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }
    const hashPassword=await bcrypt.hash(password,10);
    const verifyToken=crypto.randomBytes(32).toString("hex")
    const verifyKey=`verify:${verifyToken}`
    const datatoStore=JSON.stringify({name,email,password:hashPassword})
    await redisClient.set(verifyKey,datatoStore,{EX:300})
    const subject = "verify your email for Account creation"
    const html = getVerifyEmailHtml({email,token:verifyToken})
    await sendMail({email,subject,html})
    await redisClient.set(ratelimitkey,"true",{EX:60})
    res.json({message:"If your e-mail is valid, a verification link has been sent. It will expire in 5 minutes"})
})
export const verifyUser=trycatch(async(req,res)=>{
    const {token}=req.params;
    if(!token){
        return res.status(400).json({message:"Verification token is required.", 
        })
    }
    const verifyKey=`verify:${token}`
    const userDataJson=await redisClient.get(verifyKey)
    if(!userDataJson){
        return res.status(400).json({message:"Verification link is expired."})
    }
    await redisClient.del(verifyKey)
    const userData=JSON.parse(userDataJson)
    const existingUser=await User.findOne({email:userData.email})
    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }
    const newUser=await User.create({
        name:userData.name,
        email:userData.email,
        password:userData.password,
    })
    res.status(201).json({
        message: "Email verified Successfully! Your account has been created.",
        user: {_id:newUser._id,name:newUser.name,email:newUser.email}
    })
    })
    export const loginUser=trycatch(async(req,res)=>{
        const sanitizedBody=sanitize(req.body);
    const validation=loginSchema.safeParse(sanitizedBody);
    if(!validation.success){
        const zodError=validation.error;
        let firstErrorMessage= "Validation failed"
        let allErrors=[]
        if(zodError?.issues && Array.isArray(zodError.issues)){
            allErrors=zodError.issues.map((issue)=>({
                field:issue.path?issue.path.join("."):"unknown",message:issue.message||"Validation Error",
                code:issue.code,
            }))
            firstErrorMessage=allErrors[0]?.message||"Validation Error"
        }
        return res.status(400).json({message:firstErrorMessage,
            errors:allErrors,
        })
    }
    const {email,password}=validation.data;
    const ratelimitkey=`login-rate-limit:${req.ip}:${email}`
    if(await redisClient.get(ratelimitkey)){
        return res.status(429).json({message:"Too many requests,try again later"})
    }
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"Invalid credentials"})
    }
    const comparePassword=await bcrypt.compare(password,user.password)
    if(!comparePassword){
        return res.status(400).json({message:"Invalid credentials"})
    }
    const otp=Math.floor(10000+Math.random()*90000).toString()
    const otpKey=`otp:${email}`
    await redisClient.set(otpKey,JSON.stringify(otp),{EX:300})
    const subject="Otp for verification"
    const html = getOtpHtml({email,otp})
    await sendMail({email,subject,html})
    await redisClient.set(ratelimitkey,"true",{EX:60})
    res.json({
        message: "If your e-mail is valid, an otp has been sent. It will expire in 5 minutes"
    })
    })
    export const verifyOtp=trycatch(async(req,res)=>{
        const {email,otp}=req.body;
        if(!email || !otp){
            return res.status(400).json({message:"Please provide all details."})
        }
        const otpKey=`otp:${email}`
        const storedOtpString=await redisClient.get(otpKey)
        if(!storedOtpString){
            res.status(400).json({message:"Otp is expired."})
        }
        const storedOtp=JSON.parse(storedOtpString)
        if(storedOtp!==otp){
            return res.status(400).json({message:"Invalid otp."})
        }
        await redisClient.del(otpKey)
        let user=await User.findOne({email})
        const tokenData=await generateToken(user._id,res)
        res.status(200).json({
            message: `Welcome ${user.name}`,
            user,
        })
    })

    export const myProfile=trycatch(async(req,res)=>{
        const user=req.user
        res.json(user)
    })

    export const refreshToken=trycatch(async(req,res)=>{
        const refreshToken=req.cookies.refreshToken
        if(!refreshToken){
            return res.status(401).json({
                message: "Invalid refresh token"
            })
        }
        const decodedData=await verifyRefreshToken(refreshToken)
        if(!decodedData){
            return res.status(401).json({
                message: "Invalid refresh token"
            })
        }
        generateAccessToken(decodedData.id,res)
        res.status(200).json({
            message:"Token refreshed successfully"
        })
    })
    export const logoutUser=trycatch(async(req,res)=>{
        const userId=req.user._id
        await revokeRefreshToken(userId)
        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")
        res.clearCookie("csrfToken")
        await redisClient.del(`user:${userId}`)
        res.json({message:"Logged out successfully"})
    })
    export const refreshCSRF=trycatch(async(req,res)=>{
        const userId=req.user._id
        const newCSRFToken=await generateCSRFToken(userId,res)
        res.json({
            message: "CSRF token refreshed successfully",
            csrfToken: newCSRFToken
        })
    })