import { checkAuthenticated } from "../auth";
import { logRequest } from "../helper";
import express, { Request, Response } from "express";

const homeRouter = express.Router();

homeRouter.get("/", logRequest, (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/home");
    }
    
    res.redirect("/login");
});

homeRouter.get("/home", logRequest, checkAuthenticated, (req: Request, res: Response) => {
    res.render("home", {
        name: (req.user as { username: string }).username,
    });
},
);

export default homeRouter;