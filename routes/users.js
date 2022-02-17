import express from "express";
import _ from "lodash";
import { hash } from "bcrypt";
import passport from "passport";
import HttpStatus from "http-status-codes";

import User from "../models/user.js";
import checkIsAuthenticated from "../middleware/checkIsAuthenticated.js";

const router = express.Router();

router.post("/users/signup", async(req, res, next) => {
	const { username, password } = req.body;
	if (_.isNil(username) || _.isNil(password)) return res.status(400).send("Username or password missing");
    
	const userInDb = await User.findOne({username});
	if (userInDb) return res.status(HttpStatus.CONFLICT).send("User with the username already exists");

	const hashedPassword = await hash(String(password), 10);
	const createdUser = await User.create({username, password: hashedPassword});
	return res.send(cleanUserObj(createdUser));
});

router.post("/users/login",  passport.authenticate("local", {session: true}), (req, res, next) => {
	return res.send(cleanUserObj(req.user));
});

router.post("/users/logout", checkIsAuthenticated, (req, res) => {
	req.logOut();
	return res.sendStatus(HttpStatus.OK);
});

passport.deserializeUser(async (user, done) => {
	const dbUser = await User.findById(user.id);
	const userObj = {
		_id: dbUser._id,
		username: dbUser.username,
		signUpDate: dbUser.signUpDate
	};

	return done(null, userObj);
});

passport.serializeUser((user, done) => { 
	return done(null, {id: user._id});
});

function cleanUserObj(user) {
	return _.pick(user, ["username", "_id", "signUpDate"]);
}

export default router;