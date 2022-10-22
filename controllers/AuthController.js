const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");


const jwt = require("jsonwebtoken");

/**
 * User registration.
 *
 * @param {string}      username
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("username").isLength({ min: 1 }).trim().withMessage("Username must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({ email: value }).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Sanitize fields.
	sanitizeBody("username").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {

				// Create User object with escaped and trimmed data
				var user = new UserModel(
					{
						username: req.body.username,
						email: req.body.email,
						password: req.body.password
					}
				);
				user.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let userData = {
						_id: user._id,
						username: user.username,
						email: user.email
					};
					return apiResponse.successResponseWithCreate(res, "User registered successfully.", userData);
				});
				// 	}).catch(err => {
				// 		console.log(err);
				// 		return apiResponse.ErrorResponse(res,err);
				// 	}) ;
				// });
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({ email: req.body.email }).then(user => {
					if (user) {
						//Compare given password with db's password.
						if (req.body.password === user.password) {
							let userData = {
								_id: user._id,
								username: user.username,
								email: user.email,
							};
							//Prepare JWT token for authentication
							const jwtPayload = userData;
							const jwtData = {
								expiresIn: process.env.JWT_TIMEOUT_DURATION,
							};
							const secret = process.env.JWT_SECRET;
							//Generated JWT token with Payload and secret.
							userData.jwt_token = jwt.sign(jwtPayload, secret, jwtData);
							return apiResponse.successResponseWithData(res, "User logged in successfully", userData);

						} else {
							return apiResponse.unauthorizedResponse(res, "Invalid Username and password");
						}
					} else {
						return apiResponse.unauthorizedResponse(res, "Invalid Username and password");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];
