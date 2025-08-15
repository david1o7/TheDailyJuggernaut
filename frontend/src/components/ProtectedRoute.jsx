import React , { useState , useEffect} from 'react'
import {Navigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import api from "../../api"
import { REFRESH_TOKEN , ACCESS_TOKEN } from '../../constants'
const ProtectedRoute = ({children}) => {
    const [isAuthorised , setIsAuthorised] = useState(null)

    useEffect(() =>{
        auth().catch(() => setIsAuthorised(false))
    }, [])

    const refreshToken = async () =>{
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)
        try{
            const res = await api.post("/api/token/refresh/" , {
                refresh : refreshToken, 
            });
            if (res.status === 200){
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorised(true)
            }else{
                setIsAuthorised(false)
            }
        }catch (error){
            console.log(error);
            setIsAuthorised(false);
        }
    };

    const auth = async () => {
        const token =  localStorage.getItem(ACCESS_TOKEN)
        if(!token){
            setIsAuthorised(false)
            return
        }
        const decoded = jwtDecode(token)
        const tokenExpiration = decoded.exp
        const now = Date.now() / 1000

        if (tokenExpiration < now){
            await refreshToken()
        }
        else{
            setIsAuthorised(true)
        }
    }

    if (isAuthorised === null){
        return <div>Loading...</div>
    }

    return isAuthorised ? children : <Navigate to="/login"/>
}

export default ProtectedRoute
