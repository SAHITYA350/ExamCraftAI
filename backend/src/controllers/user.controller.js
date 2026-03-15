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
    console.log("Registration request body:", req.body);
    const { name, email, password, branch, exam_target, subjects } = req.body;

    if(!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required")
    }

    const existingUser = await User.findOne({ email })

    if(existingUser) {
        throw new ApiError(400, "User already exists")
    }

    const user = await User.create({
        name,
        email,
        password,
        branch,
        exam_target,
        subjects: subjects || []
    })

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, {
                user: createdUser,
                accessToken,
                refreshToken
            }, "User registered successfully")
        )
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
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully")
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

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, bio, branch, exam_target, subjects } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                bio,
                branch,
                exam_target,
                subjects: Array.isArray(subjects) ? subjects : subjects?.split(',').map(s => s.trim()).filter(Boolean)
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    );
});