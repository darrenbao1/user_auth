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
	const refreshTokenHash = hashToken(refreshToken);
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000); // why * 1000??

	await refreshTokenRepo.saveRefreshToken(user.id, refreshTokenHash, expiresAt);
	return { user, accessToken, refreshToken };
};

const refreshsession = async (refreshToken) => {

	if (!refreshToken) {
		throw new Error("MISSING_REFRESH_TOKEN");
	}

	const tokenHash = hashToken(refreshToken);
	const storedToken = await refreshTokenRepo.findValidToken(tokenHash);

	if(!storedToken) {
		throw new Error("INVALID_REFRESH_TOKEN");
	}

	await refreshTokenRepo.revokeToken(storedToken.id);

	const newRefreshToken = generateRefreshToken();
	const newRefreshTokenHash = hashToken(newRefreshToken);
	const expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

	await refreshTokenRepo.saveRefreshToken(storedToken.user_id,newRefreshTokenHash,expires_at);

	const newAccessToken = jwt.sign({id: storedToken.user_id});

	return { accessToken: newAccessToken, refreshToken: newRefreshToken };


}

module.exports = { signup, login, refreshsession };
