const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL;
const sign = (payload) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
};

const verify = (token) => {
	return jwt.verify(token, JWT_SECRET);
};

module.exports = { sign, verify };
