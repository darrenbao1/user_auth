require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");


const app = express();

app.use(express.json());
app.use(cookieParser());


app.use("/auth", authRoutes);

app.use("/health", (req, res) => {
	res.status(200).send("User Auth Service is running.");
});


app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT);

