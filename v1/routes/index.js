import express from 'express';
import Auth from './auth.js';
import { Verify, VerifyRole } from "../middleware/verify.js";


const Router = (server) => {
    const router = express.Router();

    // Home route with the get method and a handler
    router.get("/v1", (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Welcome to our API homepage!",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    });

    router.get("/v1/user", Verify, (req, res) => {
        res.status(200).json({
            status: "success",
            message: "Welcome to the your Dashboard!",
        });
    });

    router.get("/v1/admin", Verify, VerifyRole, (req, res) => {
        res.status(200).json({
            status: "success",
            message: "Welcome to the Admin portal!",
        });
    });


    // Use the Auth route
    router.use('/v1/auth', Auth);

    // Use the router in the server
    server.use(router);
};

export default Router;
