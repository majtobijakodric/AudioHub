import { initializePassport } from "./auth";
import express, { } from "express";
import { areAllSongsDownloaded } from "./songFunctions";
import flash from "express-flash"; // used 2x for sending login and registration erros
import session from "express-session";
import MySQLStore from "express-mysql-session"; // for storing sessions in the db
import path from "node:path"; // to get the path functions
import passport from "passport"; // auth
import { logRequest, logWithTime } from "./helper"; // request loggin midleware
import rootRouter from "./routes";

export const FOLDER = "data/songs"; // songs are stored here

const app = express();
const PORT = Number(process.env.PORT) || 8080; // set the port in .env

const MySQLSessionStore = MySQLStore(session);

// save sessions in the databse
const sessionStore = new MySQLSessionStore({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// form forms to work
app.use(express.urlencoded({ extended: false }));

// to pars json
app.use(express.json());

// to use sessions which are store in the db
app.use(
  session({
    secret: process.env.SESSION_SECRET || "4t38h4eghre",
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
  }),
);

// for returning errors to the user (login / registration)
app.use(flash());

// passport and session
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// to render ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend"));

// so you can use css in html
app.use(express.static(path.join(__dirname, "../frontend")));

// so you can see icons in html
// I don't think I use this anymore
app.use("/fontawesome", express.static(path.join(__dirname, "../node_modules/@fortawesome/fontawesome-free")));

// midleware used for logging all request with path and ip
app.use(logRequest);

// all routes
app.use(rootRouter);

function start() {
  // Optionally use onReady() to get a promise that resolves when store is ready.
  sessionStore.onReady().then(() => {
    // MySQL session store ready for use.

    areAllSongsDownloaded().then(() => {
      logWithTime("[SONGS] all songs in the database are downloaded");
    });

    // 0.0.0.0 for listening on all IPv4
    app.listen(PORT, "0.0.0.0", () =>
      logWithTime(`[SERVER] listening on port http://localhost:${PORT}`),
    );

  }).catch((error) => {
    logWithTime(`${error}`);
  });
}

// call the start functon to start it all
start();
