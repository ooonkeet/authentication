import express from 'express'
import { loginUser,logoutUser,registerUser, verifyUser, verifyOtp, myProfile,refreshToken, refreshCSRF } from '../controllers/user.js'
import { isAuth } from '../middlewares/isAuth.js'
import { verifyCSRFToken } from '../config/csrfMiddleware.js'
const router=express.Router()
router.post("/register",registerUser)
router.post("/verify/:token",verifyUser)
router.post("/login",loginUser)
router.post("/verify",verifyOtp)
router.get("/me",isAuth,myProfile)
router.post("/refresh",refreshToken)
router.post("/logout",isAuth, verifyCSRFToken,logoutUser)
router.post("/refresh-csrf",isAuth,refreshCSRF)
export default router