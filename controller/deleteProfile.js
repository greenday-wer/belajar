// Import library yang diperlukan
const connection = require("../server");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const config = require("../config/secret");

// Fungsi untuk menghapus akun pengguna
exports.deleteProfile = function (req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Invalid or missing Authorization header" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }

    const userId = decoded.id_user; // Mendapatkan ID pengguna dari token

    // Hapus akun pengguna dari database
    const deleteUserQuery = "DELETE FROM user WHERE ?? = ?";
    const userValues = ["id_user", userId];
    const formattedDeleteUserQuery = mysql.format(deleteUserQuery, userValues);

    connection.query(formattedDeleteUserQuery, function (error, result) {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: "Account not found" });
      }

      // Hapus juga token autentikasi yang terkait dengan pengguna
      const deleteTokenQuery = "DELETE FROM auth_tokens WHERE ?? = ?";
      const tokenValues = ["id_usertoken", userId];
      const formattedDeleteTokenQuery = mysql.format(deleteTokenQuery, tokenValues);

      connection.query(formattedDeleteTokenQuery, function (error, result) {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: true, message: "Database error" });
        }

        return res.status(200).json({ success: true, message: "Account deleted successfully" });
      });
    });
  });
};
