import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import localPassportStrategy from "./auth/local.js";
import cookieParser from "cookie-parser";
import HttpStatus from "http-status-codes";
import "express-async-errors";

import usersRouter from "./routes/users.js";
import filesRouter from "./routes/files.js";

import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 5000;

const sessionMiddleware = session({
	store: new MongoStore({
		mongoUrl: process.env.MONGO_CONNECTION_STRING,
		collectionName: "sessions"
	}),
	secret: process.env.SESSION_SECRET,
	resave: true,
	rolling: true,
	saveUninitialized: false,
	cookie: {
		maxAge: 10 * 60 * 1000,
		httpOnly: false,
	},
});

app.use(express.json({limit: "10mb", extended: true}));
app.use(cors({origin: process.env.CLIENT_ORIGIN_URL_CORS, credentials: true}));
app.use(morgan("tiny"));

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

passport.use("local", localPassportStrategy);

app.use(usersRouter);
app.use(filesRouter);

app.use(function(err, req, res, next) {
	if (!res.headersSent) return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
	return next();
});

mongoose.connect(process.env.MONGO_CONNECTION_STRING, {useNewUrlParser: true});
const db = mongoose.connection;
db.on("error", console.error);
db.once("open", () => console.info("Connected to DB"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
