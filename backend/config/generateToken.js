import jwt from 'jsonwebtoken'
import { redisClient } from '../index.js'
import { generateCSRFToken, revokeCSRFToken } from './csrfMiddleware.js'
export const generateToken=async(id,res)=>{
    const accessToken=jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"1m",
    })
    const refreshToken=jwt.sign({id},process.env.REFRESH_SECRET,{
        expiresIn:"7d",
    })
    const refreshTokenKey=`refresh:${id}`
    await redisClient.setEx(refreshTokenKey,7*24*60*60,refreshToken)
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        maxAge:1*60*1000,
    })
    res.cookie("refreshToken",refreshToken,{
        maxAge: 7*24*60*60*1000,
        httpOnly:true,
        secure:true,
        sameSite:"none",
    })
    const csrfToken = await generateCSRFToken(id,res)
    return {accessToken,refreshToken,csrfToken}
}
export const verifyRefreshToken=async(refreshToken)=>{
    try{
        const decode=jwt.verify(refreshToken,process.env.REFRESH_SECRET)
        const storedToken=await redisClient.get(`refresh:${decode.id}`)
        if(storedToken===refreshToken){
            return decode
        }
        return null
    }catch(error){
        return null
    }
}
export const generateAccessToken=(id,res)=>{
    const accessToken=jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"1m",
    })
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        maxAge:1*60*1000,
    })
}
export const revokeRefreshToken= async(userId)=>{
    await redisClient.del(`refresh:${userId}`)
    await revokeCSRFToken()
}