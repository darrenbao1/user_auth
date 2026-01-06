require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

const requirebody = (req, res, next) => {
	if (!req.body) {
		return res.status(400).json({ error: "Body required" });
	}
	next();
};

app.use("/auth", requirebody, authRoutes);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT);

