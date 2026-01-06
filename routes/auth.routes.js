const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const { user, accessToken, refreshToken } = await authService.login(
			email,
			password
		);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: false, //Set to true when in production
			sameSite: "strict",
			maxAge: process.env.REFRESH_TOKEN_TTL * 1000,
		});

		res.status(201).json({
			message: "Login Successful",
			user,
			accessToken,
		});
	} catch (err) {
		res.status(500).json({ error: err });
		next(err);
	}
});

router.post("/signup", async (req, res, next) => {
	try {
		const user = await authService.signup(req.body.email, req.body.password);
		res.status(201).json({ message: "User Created", user });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
