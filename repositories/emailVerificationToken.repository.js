const pool = require("../db");

const saveEmailVerificationToken = async (userId, token, expiresAt) => {
  await pool.query(
    `INSERT INTO email_verification_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,$3)`,
    [userId, token, expiresAt]
  );
};

const consumeEmailVerificationToken = async (tokenHash) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE email_verification_tokens SET used_at = now() 
            WHERE token_hash = $1 and used_at IS NULL and expires_at > now() returning user_id`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("INVALID_OR_USED_TOKEN");
    }

    await client.query(
      "UPDATE users SET email_verified = true WHERE id = $1",
      [result.rows[0].user_id]
    );
    await client.query("COMMIT");

    return result.rows[0].user_id;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { saveEmailVerificationToken, consumeEmailVerificationToken };
