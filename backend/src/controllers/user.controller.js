import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';



const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
}


export const registerUser = asyncHandler( async (req, res) => {
    const { name , email , password } = req.body;

    if(!name || !email || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({ email })

    if(existingUser) {
        throw new ApiError(400, "User already exists")
    }

    const user = await User.create({
        name,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser))
})



export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required!");
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid email or password!");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(true, "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken
            })
        )
})


export const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if(!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: undefined },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
})