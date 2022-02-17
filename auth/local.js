import User from "../models/user.js";
import { compare } from "bcrypt";
import LocalStrategy from "passport-local";

async function verifyPassword(user, password) {
	const result = await compare(String(password), user.password);
	return result;
}

async function localLoginCb(username, password, done) {
	const userInDb = await User.findOne({ username: username });

	// if (err)  return done(err);
	if (!userInDb) return done(null, false);
	const isPasswordCorrect = await verifyPassword(userInDb, password);
	return isPasswordCorrect ? done(null, userInDb) : done(null, false);
	
	// return User.findOne({ username: username }, function (err, user) {
	// 	if (err)  return done(err);
	// 	if (!user) return done(null, false);
	// 	const isPasswordCorrect = await verifyPassword(user, password)

	// 	return isPasswordCorrect ? done(null, user) : done(null, false)
	// });
}

export default new LocalStrategy(localLoginCb);

