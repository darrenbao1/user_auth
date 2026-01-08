const userRepo = require("../repositories/user.repository");
const refreshTokenRepo = require("../repositories/refreshToken.repository");
const jwt = require("../utils/jwt");
const { generateToken, hashToken } = require("../utils/token");
const emailVerificationTokenRepo = require("../repositories/emailVerificationToken.repository");
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL);
const EMAIL_VERIFICATION_TOKEN_TTL = Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL);

const signup = async (email, password) => {
	return await userRepo.createUser(email, password);
};

const login = async (email, password) => {
	const user = await userRepo.validateUser(email, password);
	const payload = { id: user.id, email: user.email };
	const accessToken = jwt.sign(payload);
	const refreshToken = generateToken();
	const refreshTokenHash = hashToken(refreshToken);
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000); // why * 1000??

	await refreshTokenRepo.saveRefreshToken(user.id, refreshTokenHash, expiresAt);
	return { user, accessToken, refreshToken };
};

const logout = async(refreshToken) => {
	const tokenHash = hashToken(refreshToken);

	const storedToken = await refreshTokenRepo.findValidToken(tokenHash);

	if(storedToken) {
		await refreshTokenRepo.revokeToken(storedToken.id);
	}

	return;
}

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

	const newRefreshToken = generateToken();
	const newRefreshTokenHash = hashToken(newRefreshToken);
	const expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

	await refreshTokenRepo.saveRefreshToken(storedToken.user_id,newRefreshTokenHash,expires_at);

	const newAccessToken = jwt.sign({id: storedToken.user_id});

	return { accessToken: newAccessToken, refreshToken: newRefreshToken };


}

const createEmailVerificationToken = async (userId) => {
	const token = generateToken();
	const tokenHash = hashToken(token);
	const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL * 1000); // 24 hours
	await emailVerificationTokenRepo.saveEmailVerificationToken(userId, tokenHash, expiresAt);
	return token;
}

const verifyEmailToken = async (token) => {
	const tokenHash = hashToken(token);
	const userId = await emailVerificationTokenRepo.consumeEmailVerificationToken(tokenHash);
	if(!userId) {
		throw new Error("Invalid or expired verification token");
	}

	return userId;
}
module.exports = { signup, login, refreshsession,logout, createEmailVerificationToken,verifyEmailToken };