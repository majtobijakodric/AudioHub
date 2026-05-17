import { NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { checkAuthenticated } from "../auth";
import { logWithTime } from "../helper";
import express, { Request, Response } from "express";


const userRouter = express.Router();

userRouter.get("/getusername", checkAuthenticated, (req: Request, res: Response) => {
    const username = (req.user as { username: string }).username;
    res.json({ success: true, username });
});

userRouter.post("/deleteaccount", checkAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { id: string }).id;

    try {
        await prisma.$transaction(async (tx) => {
            // delete playlists first so the user can be deleted
            await tx.playlist.deleteMany({
                where: { userId: userId },
            });

            await tx.user.delete({
                where: { id: userId },
            });
        });

        req.logOut(() => {
            req.session.destroy(() => {
                res.clearCookie("connect.sid");
                res.json({ success: true, message: "Account deleted" });
            });
        });

    } catch (error) {
        logWithTime(`[DELETEACCOUNT] failed: ${error}`);
        res.status(500).json({ success: false, message: "Failed to delete account" });
    }
});

export default userRouter;