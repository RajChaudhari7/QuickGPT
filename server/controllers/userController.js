import { User } from "../models/User.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { Chat } from "../models/Chat.js";

// functiont generate the token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// function to register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.json({ success: false, message: "User Already Exist" })
        }

        const user = await User.create({ name, email, password })

        const token = generateToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// function to login user
export const loginUser = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email })

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)

            if (isMatch) {
                const token = generateToken(user._id);
                return res.json({ success: true, token })
            }
        }

        return res.json({ success: false, message: "Invalid email or password" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// function to get user data
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// function to get published images
export const getPublishedImages = async (req, res) => {
    try {

        const publishImageMessages = await Chat.aggregate([
            { $unwind: "$messages" },
            {
                $match: {
                    "message.image": true,
                    "message.isPublished": true,
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])

        res.json({ success: true, images: publishImageMessages.reverse() })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}