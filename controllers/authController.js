const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register (unchanged)...
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: "Email exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role: role || "client", phone });
    res.json({ msg: "Registered successfully", user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email" });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // send only safe fields to frontend + isAdmin flag
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.role === 'admin' // <-- this is key
    };

    res.json({ msg: "Login OK", token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// get profile (requires auth)
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

// update profile
exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ msg: "User not found" });
  const { fullName, phone } = req.body;
  user.fullName = fullName || user.fullName;
  user.phone = phone || user.phone;
  await user.save();
  res.json({ msg: "Updated", user });
};
