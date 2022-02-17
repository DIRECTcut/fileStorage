import express from "express";
import _ from "lodash";
import multer from "multer";
import HttpStatus from "http-status-codes";

import File from "../models/file.js";
import checkIsAuthenticated from "../middleware/checkIsAuthenticated.js";

const router = express.Router();

router.get("/files", checkIsAuthenticated, async(req, res, next) => {
	const files = await File.find({ownerId: req.user._id});
	const cleanedFiles = files.map(cleanFileObj);
	
	return res.send(cleanedFiles);
});

router.post("/files/upload", checkIsAuthenticated, multer().single("file"), async (req, res, next) => {
	const file = req.file;
	const fileSizeLimit = _.toNumber(process.env.SINGLE_FILE_SIZE_LIMIT);

	if (!file) return res.status(HttpStatus.BAD_REQUEST).send("No file found");
	if (file.size > fileSizeLimit) 
		return res.status(HttpStatus.BAD_REQUEST).send(`The file exceeds the limit of ${fileSizeLimit} bytes`);

	const {originalname: filename , size, mimetype: contentType, buffer: data } = req.file;
	const ownerId = req.user._id;

	const userFiles = await File.find({ownerId: req.user._id, size: req.file.size});
	const conflictingFile = userFiles.find(file => Buffer.compare(file.data, req.file.buffer) === 0);
	if (conflictingFile) return res.status(HttpStatus.ACCEPTED).send(cleanFileObj(conflictingFile));

	const createdFile = await File.create({filename, size, contentType, data, ownerId});
	return res.status(HttpStatus.CREATED).send(cleanFileObj(createdFile));
});

router.get("/files/download/:id([0-9a-f]{24})", checkIsAuthenticated, async (req, res, next) => {
	const fileId = req.params.id;
	if (!fileId) return res.status(HttpStatus.BAD_REQUEST).send("The link is invalid");
	
	const file = await File.findById(req.params.id);
	if(file.ownerId !== req.user._id.toString) return res.sendStatus(HttpStatus.FORBIDDEN).send("You have no permission to access this file");

	res.setHeader("Content-Length", file.size);
	res.setHeader("Content-Type", file.contentType);
	res.setHeader("Content-Disposition", `attachment; filename=${file.filename}`);
	res.write(file.data, "binary");
	res.end();
});

function cleanFileObj(file) {
	return _.pick(file, ["_id", "filename", "size", "uploadDate"]);
}

export default router;