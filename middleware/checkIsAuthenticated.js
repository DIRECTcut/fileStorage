
import HttpStatus from "http-status-codes";

export default function checkIsAuthenticated(req, res, next) {
	return req.isAuthenticated() ?
		next() :
		res.sendStatus(HttpStatus.UNAUTHORIZED);
}