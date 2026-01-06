const pool = require("../db");
const bcrypt = require("bcrypt");
const createUser = async (email, password) => {
	const hashedPassword = bcrypt.hash(password, 10);
	const result = await pool.query(
		"INSERT INTO users (email,password_hash) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING id, email",
		[email, hashedPassword]
	);

	if (result.rowCount === 0) {
		throw new Error("Email already exists");
	}
	return result.rows[0];
};

const validateUser = async (email, password) => {
	//Get the user
	const results = await pool.query("SELECT * FROM users WHERE email = $1", [
		email,
	]);
	if (results.rowCount === 0) {
		throw new Error(`${email} does not have an account.`);
	}
	const user = results.rows[0];
	const isValid = await bcrypt.compare(password, user.password_hash);
	if (!isValid) {
		throw new Error(`Invalid credentials`);
	}
	return { id: user.id, email: user.email };
};

module.exports = { createUser, validateUser };
