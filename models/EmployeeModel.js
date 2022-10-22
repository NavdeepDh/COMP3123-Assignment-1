var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
	first_name: {type: String, required: true},
	last_name: {type: String, required: true},
	email: {type: String, required: true},
	gender: {type: String, required: true},
	salary: { type: Number, required: true},
}, {timestamps: true});

module.exports = mongoose.model("employee", EmployeeSchema);