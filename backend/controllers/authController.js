import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToImageKit, deleteFromImageKit } from '../services/imageKitService.js';

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

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, branch, exam_target, subjects } = req.body;
    
    const sanitizedBranch = (branch === "nan" || branch === "undefined") ? "" : branch;
    const sanitizedExamTarget = (exam_target === "nan" || exam_target === "undefined") ? "" : exam_target;

    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    let avatarUrl = "";
    let avatarId = "";

    if (req.file) {
        const uploadResult = await uploadToImageKit(req.file.path, `${Date.now()}-${req.file.originalname}`, "avatars");
        if (uploadResult) {
            avatarUrl = uploadResult.url;
            avatarId = uploadResult.fileId;
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar: avatarUrl,
        avatarId: avatarId,
        avatarId: avatarId,
        branch: sanitizedBranch,
        exam_target: sanitizedExamTarget,
        subjects: subjects || []
    });

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };

    res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, {
                user: createdUser,
                accessToken,
                refreshToken
            }, "User registered successfully")
        );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required!");
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid email or password!");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    await User.findByIdAndUpdate(
        user._id,
        { $unset: { refreshToken: 1 } },
        { returnDocument: 'after' }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, bio, branch, exam_target, subjects } = req.body;
    
    const sanitizedBranch = (branch === "nan" || branch === "undefined") ? "" : branch;
    const sanitizedExamTarget = (exam_target === "nan" || exam_target === "undefined") ? "" : exam_target;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updateData = {
        name,
        bio,
        branch: sanitizedBranch,
        exam_target: sanitizedExamTarget,
        subjects: Array.isArray(subjects) ? subjects : subjects?.split(',').map(s => s.trim()).filter(Boolean)
    };

    let uploadPromise = null;
    if (req.file) {
        // Start upload and delete concurrently
        const deletePromise = user.avatarId ? deleteFromImageKit(user.avatarId) : Promise.resolve();
        uploadPromise = uploadToImageKit(req.file.path, `${Date.now()}-${req.file.originalname}`, "avatars")
            .then(result => {
                if (result) {
                    updateData.avatar = result.url;
                    updateData.avatarId = result.fileId;
                }
                return result;
            });
        
        // We can wait for delete in background or just proceed
        deletePromise.catch(err => console.error("Error deleting old avatar:", err));
    }

    if (uploadPromise) {
        await uploadPromise;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateData },
        { returnDocument: 'after' }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

