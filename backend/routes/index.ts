import express from "express";
import authRouter from "./auth";
import youtubeRouter from "./youtube";
import userRouter from "./user";
import songsRouter from "./songs";
import playlistRouter from "./playlists";
import homeRouter from "./home";

const rootRouter = express.Router();

rootRouter.use("/", authRouter);
rootRouter.use("/", youtubeRouter);
rootRouter.use("/", userRouter);
rootRouter.use("/", songsRouter);
rootRouter.use("/", playlistRouter);
rootRouter.use("/", homeRouter);

export default rootRouter;