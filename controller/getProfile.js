const connection = require("../server");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const config = require("../config/secret");

// Mendapatkan data profil
exports.getProfile = function (req, res) {
  const token = req.headers.authorization?.split(" ")[1]; // Mengambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ error: true, message: "Token not provided" });
  }

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }

    const userId = decoded.id_user; // Ambil ID user dari token payload

    // Buat query untuk mengambil profil user berdasarkan ID
    const query = "SELECT * FROM ?? WHERE ??=?";
    const table = ["user", "id_user", userId];

    const formattedQuery = mysql.format(query, table);
    connection.query(formattedQuery, function (error, rows) {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      const user = rows[0];
      return res.status(200).json({ success: true, user });
    });
  });
};
