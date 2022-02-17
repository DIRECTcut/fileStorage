import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	signUpDate: {
		type: Date,
		required: true,
		default: Date.now()
	}
});

export default mongoose.model("User", userSchema);