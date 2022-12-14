exports.successResponse = function (res, msg) {
	var data = {
		status: true,
		message: msg
	};
	return res.status(200).json(data);
};

exports.successResponseWithDelete = function (res, msg) {
	var resData = {
		status: true,
		message: msg
	};
	return res.status(204).json(resData);
};

exports.successResponseWithData = function (res, msg, data) {
	var resData = {
		status: true,
		message: msg,
		data: data
	};
	return res.status(200).json(resData);
};

exports.successResponseWithCreate = function (res, msg, data) {
	var resData = {
		status: true,
		message: msg,
		data: data
	};
	return res.status(201).json(resData);
};

exports.ErrorResponse = function (res, msg) {
	var data = {
		status: false,
		message: msg,
	};
	return res.status(500).json(data);
};

exports.notFoundResponse = function (res, msg) {
	var data = {
		status: false,
		message: msg,
	};
	return res.status(404).json(data);
};

exports.validationErrorWithData = function (res, msg, data) {
	var resData = {
		status: false,
		message: msg,
		data: data
	};
	return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
	var data = {
		status: false,
		message: msg,
	};
	return res.status(401).json(data);
};