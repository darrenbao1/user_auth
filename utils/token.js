const crypto = require("crypto");
const bcrypt = require("bcrypt");
const generateRefreshToken = () => {
	return crypto.randomBytes(64).toString("hex");
};

const hashToken = async (token) => {
	return bcrypt.hash(token, 10);
};

module.exports = { generateRefreshToken, hashToken };
