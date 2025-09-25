import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets/assets";
import axios from 'axios'
import toast from "react-hot-toast";

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()

    axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

    const [user, setUser] = useState(null)
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [loadingUser, setLoadingUser] = useState(true)

    const fetchUser = async () => {
        try {

            const { data } = await axios.get('/api/user/get', {
                headers: { Authorization: token }
            })

            if (data.success) {
                setUser(data.user)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
        finally {
            setLoadingUser(false)
        }
    }

    const createNewChat = async () => {
        try {

            if (!user) {
                return toast('login to create new chat')
            }

            navigate('/')
            await axios.get('/api/chat/create', { headers: { Authorization: token } })
            await fetchUsersChats()

        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUsersChats = async () => {
        try {

            const { data } = await axios.get('/api/chat/get', { headers: { Authorization: token } })

            if (data.success) {
                setChats(data.chats)
                // if the user has not chats
                if (data.chats.length === 0) {
                    await createNewChat();
                    return fetchUsersChats()
                } else {
                    setSelectedChat(data.chats[0])
                }
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchUsersChats()
        } else {
            setChats([])
            setSelectedChat(null)
        }
    }, [user])

    useEffect(() => {

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

    }, [theme])

    useEffect(() => {
        if (token) {
            fetchUser()
        } else {
            setUser(null)
            setLoadingUser(false)
        }

    }, [token])

    const value = {
        user, setUser,
        chats, setChats,
        selectedChat, setSelectedChat,
        theme, setTheme,
        navigate, fetchUser,
        fetchUsersChats, createNewChat, loadingUser, token, setToken, axios
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)