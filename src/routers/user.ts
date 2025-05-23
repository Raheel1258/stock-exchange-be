import express from "express";
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/updateUserPreference", userController.saveUserPreference);
router.get("/getUserPreference", userController.getUserPreference);
router.get("/getAvailableGroupSymbols", userController.getAvailableGroupSymbols);
router.post("/createAvailableGroupSymbol", userController.createAvailableGroupSymbol);



export default router;
