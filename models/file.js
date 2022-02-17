import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
	filename: {
		type: String,
		required: true
	},
	size: {
		type: Number,
		required: true
	},
	uploadDate: {
		type: Date,
		required: true,
		default: Date.now()
	},
	ownerId: {
		type: ObjectId,
		required: true
	},
	data: {
		type: Buffer,
		default: Buffer([])
	},
	contentType: {
		type: String
	}
});

export default mongoose.model("File", fileSchema);