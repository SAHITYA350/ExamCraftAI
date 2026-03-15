import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', verifyJWT, logoutUser);
router.patch('/update-account', verifyJWT, updateAccountDetails);

export default router;