const pool = require("../db");

const saveRefreshToken = async (userId, tokenHash, expiresAt) => {
  await pool.query(
    "INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES ($1,$2,$3)",
    [userId, tokenHash, expiresAt]
  );
};

const findValidToken = async (tokenHash) => {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = false AND expires_at > now()",
    [tokenHash]
  );
  return result.rows[0];
};

const revokeToken = async (id) => {
	const result = await pool.query("UPDATE refresh_tokens SET revoked = true WHERE id = $1",[id]);
}

module.exports = { saveRefreshToken, findValidToken, revokeToken };