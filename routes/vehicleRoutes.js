const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const vehicleCtrl = require("../controllers/vehicleController");

// simple local upload config (for production use S3)
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "uploads/"); },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get("/", vehicleCtrl.getAll);
router.get("/:slug", vehicleCtrl.getBySlug);

// admin CRUD
router.post("/", auth, role("admin"), upload.array("images", 6), vehicleCtrl.createVehicle);
router.patch("/:id", auth, role("admin"), upload.array("images", 6), vehicleCtrl.updateVehicle);
router.delete("/:id", auth, role("admin"), vehicleCtrl.deleteVehicle);

module.exports = router;
