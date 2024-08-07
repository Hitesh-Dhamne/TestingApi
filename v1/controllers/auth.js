import bcrypt from "bcrypt";
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
//import jwt from "jsonwebtoken";
//import { SECRET_ACCESS_TOKEN } from "../config/index.js";

/**
 * @route POST v1/auth/login
 * @desc logs in a user
 * @access Public
 */
export async function Login(req, res) {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Account does not exist",
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password. Please try again with the correct credentials.",
            });
        }

        // Generate session token for user
        const token = user.generateAccessJWT();

        // Set cookie options
        const options = {
            maxAge: 20 * 60 * 1000, // expires in 20 minutes
            httpOnly: true, // The cookie is only accessible by the web server
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: "None",
        };

        // Set the token to response header
        res.cookie("SessionID", token, options);
        res.status(200).json({
            status: "success",
            message: "You have successfully logged in.",
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}
export async function Logout(req, res) {
    try {
      const authHeader = req.headers['cookie']; // get the session cookie from request header
      if (!authHeader) return res.sendStatus(204); // No content
      const cookie = authHeader.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
      const accessToken = cookie.split(';')[0];
      const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
      // if true, send a no content response.
      if (checkIfBlacklisted) return res.sendStatus(204);
      // otherwise blacklist token
      const newBlacklist = new Blacklist({
        token: accessToken,
      });
      await newBlacklist.save();
      // Also clear request cookie on client
      res.setHeader('Clear-Site-Data', '"cookies"');
      res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }
    res.end();
}