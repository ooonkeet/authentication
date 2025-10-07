import React, { use,useState,useEffect } from 'react'
// import axios from 'axios'
import { toast } from 'react-toastify'
import { server } from '../main'
import api from '../apiIntercepter'

const Dashboard = () => {
  const [content,setContent]=useState("")
  async function fetchAdminData(){
    try {
      const {data}=await api.get(`${server}/api/v1/admin`,
        {withCredentials:true},
      )
      setContent(data.message)
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }
  useEffect(()=>{
    fetchAdminData()
  },[]);
  return content && <div>{content}</div>
}

export default Dashboard