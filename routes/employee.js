var express = require("express");
const EmployeeController = require("../controllers/EmployeeController");

var router = express.Router();

router.get("/employees", EmployeeController.employeeList);
router.get("/employees/:id", EmployeeController.employeeDetail);
router.post("/employees", EmployeeController.employeeStore);
router.put("/employees/:id", EmployeeController.employeeUpdate);
router.delete("/employees/", EmployeeController.employeeDelete);

module.exports = router;