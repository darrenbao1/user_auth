const userRepo = require("../repositories/user.repository");
const refreshTokenRepo = require("../repositories/refreshToken.repository");
const jwt = require("../utils/jwt");
const { generateRefreshToken, hashToken } = require("../utils/token");

const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL);

const signup = async (email, password) => {
	return await userRepo.createUser(email, password);
};

const login = async (email, password) => {
	const user = await userRepo.validateUser(email, password);
	const payload = { id: user.id, email: user.email };
	const accessToken = jwt.sign(payload);
	const refreshToken = generateRefreshToken();
	const refreshTokenHash = await hashToken(refreshToken);
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000); // why * 1000??

	await refreshTokenRepo.saveRefreshToken(user.id, refreshTokenHash, expiresAt);
	return { user, accessToken, refreshToken };
};

module.exports = { signup, login };
