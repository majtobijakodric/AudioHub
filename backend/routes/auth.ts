import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import { createUser, checkNotAuthenticated, checkAuthenticated, } from "../auth";
import { isString, isEmptyString, logWithTime, logRequest } from "../helper";
import { searchYouTubeSong } from "../youtube";

const authRouter = express.Router();

authRouter.get("/login", logRequest, checkNotAuthenticated, (req: Request, res: Response) => {
    res.render("login");
});

authRouter.post("/login", logRequest, checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
}),
);

authRouter.post("/logout", logRequest, (req: Request, res: Response, next: NextFunction) => {
    req.logOut((error) => {
        if (error) return next(error);

        res.redirect("/login");
    });
},
);

authRouter.get("/register", checkNotAuthenticated, (req: Request, res: Response) => {
    res.render("register", {
        errors: req.flash("error"),
    });
});

authRouter.post("/register", checkNotAuthenticated, async (req: Request, res: Response) => {
    logWithTime(`[REGISTER] register api called`);

    const { username, password } = req.body;

    // check for valid username and password
    // doesnt check for a strong password
    const hasValidCredentialFormat =
        isString(username) &&
        isString(password) &&
        !isEmptyString(username) &&
        !isEmptyString(password);

    if (!hasValidCredentialFormat) {
        logWithTime(`[REGISTER] Invalid data:`);
        res.status(400).send({ succes: false, message: "Missing information" });
        return;
    }

    if (await createUser(username, password)) {
        logWithTime(`[REGISTER] added users ${username} to the database`);
        res.redirect("login");
    } else {
        logWithTime(`[REGISTER] failed to add user ${username} to the database`);
        req.flash("error", "This users already exists");
        res.redirect("/register");
    }
},
);



export default authRouter;