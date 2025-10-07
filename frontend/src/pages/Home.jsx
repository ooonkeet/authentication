import React from 'react'
import { AppData } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
const Home = () => {
  const navigate=useNavigate()
  const {logoutUser,user} = AppData()
  return (
    <div className="flex w-[100px] m-auto mt-40">
      <button className="bg-red-500 text-white p-2 rounded-md" onClick={()=>logoutUser(navigate)}>Logout</button>
      {
        user && user.role ==="admin" && (<Link to="/dashboard" className="bg-purple-500 text-white p-2 rounded-md">Dashboard</Link>)
      }
    </div>
  )
}

export default Home