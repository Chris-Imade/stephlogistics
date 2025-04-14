const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service");

router.get("/", serviceController.getInternationalShippingPage);

module.exports = router;
