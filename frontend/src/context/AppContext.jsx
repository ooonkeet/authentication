import { useState,useEffect } from "react";
import { createContext } from "react";
// import axios from "axios";
import {server} from '../main'
import { useContext } from "react";
import api from "../apiIntercepter.js";
import { toast } from "react-toastify";
const AppContext=createContext(null)
export const AppProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const [isAuth,setIsAuth]=useState(false)
    async function fetchUser(){
        setLoading(true)
        try {
            const {data} = await api.get(`api/v1/me`,{
                // withCredentials:true
            })
            setIsAuth(true)
            setUser(data)
            
            
        } catch (error) {
            console.log(error);
            
        }finally{
            setLoading(false)
        }
    }
    async function logoutUser(navigate) {
        try {
            const {data} = await api.post(`api/v1/logout`)
            toast.success(data.message)
            setUser(null)
            navigate("/login")
            setIsAuth(false)
        } catch (error) {
            toast.error("Something went wrong")
        }
    }
    useEffect(()=>{
        fetchUser()
    },[])
    return <AppContext.Provider value={{setIsAuth,isAuth,user,setUser,loading,logoutUser}}>{children}</AppContext.Provider>

}
export const AppData=()=>{
    const context = useContext(AppContext)
    if(!context) throw new Error("AppData must be used within an AppProvider")
    return context
}