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
      path: "/auth",
    });

    res.status(201).json({
      message: "Login Successful",
      user,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

router.post("/refresh", async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.refreshsession(
      req.cookies?.refreshToken
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //Set to true when in production
      sameSite: "strict",
      maxAge: process.env.REFRESH_TOKEN_TTL * 1000,
      path: "/auth",
    });
    res.status(200).json({ accessToken });
  } catch (err) {
    if (err.message === "MISSING_REFRESH_TOKEN") {
      return res.status(401).json({ error: "Missing refresh token" });
    }
    if (err.message === "INVALID_REFRESH_TOKEN") {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    await authService.logout(req.cookies?.refreshToken);
    res.clearCookie("refreshToken", { path: "/auth" });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
});

router.post("/get-email-verification-token", async (req, res, next) => {
	try {
		const { userId } = req.body;
		const token =  await authService.createEmailVerificationToken(userId);
		res.status(200).json({ token });
	} catch(err) {
		next(err);

	}
	
})

router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ error: "Email Verification Token is required" });
    }
	await authService.verifyEmailToken(token);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
