const EmployeeModel = require("../models/EmployeeModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Employee Schema
function EmployeeData(data) {
	this.id = data._id;
	this.first_name = data.first_name;
	this.last_name = data.last_name;
	this.email = data.email;
	this.gender = data.gender;
	this.salary = data.salary;
}

/**
 * Get Employee List.
 * 
 * @returns {Object}
 */
exports.employeeList = [
	auth,
	function (req, res) {
		try {
			EmployeeModel.find({}, "_id first_name last_name email gender salary createdAt").then((employees) => {
				if (employees.length > 0) {
					return apiResponse.successResponseWithData(res, "Get all employees list - operation success", employees);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Get Employee Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.employeeDetail = [
	auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			EmployeeModel.findOne({ _id: req.params.id }, "_id first_name last_name email gender salary createdAt").then((employee) => {
				if (employee !== null) {
					let employeeData = new EmployeeData(employee);
					return apiResponse.successResponseWithData(res, "Get employee details operation success", employee);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Employee store.
 * 
 * @param {string}      first_name 
 * @param {string}      last_name
 * @param {string}      email
 * @param {string}      gender 
 * @param {float}      salary
 * 
 * @returns {Object}
 */
exports.employeeStore = [
	auth,
	body("first_name").isLength({ min: 1 }).trim().withMessage("first_name must not be empty."),
	body("last_name", "last_name must not be empty.").isLength({ min: 1 }).trim(),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return EmployeeModel.findOne({ email: value }).then((employee) => {
				if (employee) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("gender", "Gender must not be empty.").isLength({ min: 1 }).trim()
		.isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male / Female / Other'),
	body("salary").isFloat().withMessage("salary must be a float value."),
	sanitizeBody("gender").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("salary").escape(),

	(req, res) => {
		try {
			const errors = validationResult(req);


			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save employee.
				var employee = new EmployeeModel(
					{
						first_name: req.body.first_name,
						last_name: req.body.last_name,
						email: req.body.email,
						gender: req.body.gender,
						salary: req.body.salary,

					});

				employee.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let employeeData = new EmployeeData(employee);
					return apiResponse.successResponseWithCreate(res, "Employee added successfully", employeeData);
				});
			}
		} catch (err) {
			console.log(err);
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Employee update.
 * 
 * @param {string}      first_name 
 * @param {string}      last_name
 * @param {string}      email
 * @param {string}      gender 
 * @param {float}       salary
 * 
 * @returns {Object}
 */
exports.employeeUpdate = [
	auth,
	body("first_name").isLength({ min: 1 }).trim().withMessage("first_name must not be empty."),
	body("last_name", "last_name must not be empty.").isLength({ min: 1 }).trim(),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified."),
	// .isEmail().withMessage("Email must be a valid email address.").custom((value) => {
	// 	return EmployeeModel.findOne({email : value}).then((employee) => {
	// 		if (employee) {
	// 			return Promise.reject("E-mail already in use");
	// 		}
	// 	});
	// }),
	body("gender", "Gender must not be empty.").isLength({ min: 1 }).trim()
		.isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male / Female / Other'),
	body("salary").isFloat().withMessage("salary must be a float value."),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var employee = new EmployeeModel(
				{
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					email: req.body.email,
					gender: req.body.gender,
					salary: req.body.salary,
					_id: req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					EmployeeModel.findById(req.params.id, function (err, foundEmployee) {
						if (foundEmployee === null) {
							return apiResponse.notFoundResponse(res, "Employee not exists with this id");
						} else {//update employee.
							EmployeeModel.findByIdAndUpdate(req.params.id, employee, {}, function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								} else {
									let employeeData = new EmployeeData(employee);
									return apiResponse.successResponseWithData(res, "Employee update Success.", employeeData);
								}
							});

						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Employee Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.employeeDelete = [
	auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.query.eid)) {
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			EmployeeModel.findById(req.query.eid, function (err, foundEmployee) {
				if (foundEmployee === null) {
					return apiResponse.notFoundResponse(res, "Employee not exists with this id");
				} else {
					EmployeeModel.findByIdAndRemove(req.query.eid, function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponseWithDelete(res, "employee deleted Successfully.");
						}
					});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

