const Vehicle = require("../models/vehicle");
const path = require("path");

// create
exports.createVehicle = async (req, res) => {
  try {
    const { slug, name, seats } = req.body;
    const images = (req.files || []).map(f => "/uploads/" + f.filename); // or store full URL
    const v = await Vehicle.create({ slug, name, seats, images });
    res.json({ msg: "Vehicle created", vehicle: v });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// read all
exports.getAll = async (req, res) => {
  res.json(await Vehicle.find().sort({ name: 1 }));
};

// read single
exports.getBySlug = async (req, res) => {
  const v = await Vehicle.findOne({ slug: req.params.slug });
  if (!v) return res.status(404).json({ msg: "Not found" });
  res.json(v);
};

// update
exports.updateVehicle = async (req, res) => {
  const v = await Vehicle.findById(req.params.id);
  if (!v) return res.status(404).json({ msg: "Not found" });
  if (req.files && req.files.length) {
    const images = req.files.map(f => "/uploads/" + f.filename);
    v.images = v.images.concat(images);
  }
  v.name = req.body.name || v.name;
  v.seats = req.body.seats || v.seats;
  await v.save();
  res.json({ msg: "Updated", vehicle: v });
};

// delete
exports.deleteVehicle = async (req, res) => {
  await Vehicle.findByIdAndRemove(req.params.id);
  res.json({ msg: "Deleted" });
};
