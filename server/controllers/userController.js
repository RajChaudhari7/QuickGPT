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

export const getPublishedImages = async (req, res) => {
    try {
        const publishImageMessages = await Chat.aggregate([
            { $unwind: "$messages" }, // Unwind the messages array
            {
                $match: {
                    "messages.isImage": true, // Check if the message is an image
                    "messages.isPublished": true, // Check if the image is published
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content", // Get the image URL
                    userName: "$userName",
                }
            }
        ]);

        // Reverse the array to show the latest images first
        res.json({ success: true, images: publishImageMessages.reverse() });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.json({ success: false, message: error.message });
    }
};
