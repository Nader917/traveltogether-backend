const router = require("express").Router();
const authCtrl = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);

router.get("/me", auth, authCtrl.getProfile);
router.patch("/me", auth, authCtrl.updateProfile);

module.exports = router;
