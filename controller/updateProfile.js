const jwt = require("jsonwebtoken");
const config = require("../config/secret.js");
const connection = require("../server.js");
const mysql = require("mysql2");

// Controller untuk Edit Profil
exports.updateProfile = function (req, res) {
  var authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Token not provided or invalid format" });
  }
  var token = authHeader.split(" ")[1];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }

    var userId = decoded.id_user; // Akses ID user dari token payload

    // Query untuk mendapatkan profil user
    var query = "SELECT * FROM ?? WHERE ??=?";
    var table = ["user", "id_user", userId];
    query = mysql.format(query, table);

    connection.query(query, function (error, rows) {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      // Validasi input yang ingin diupdate
      const allowedUpdates = ["first_name", "last_name", "phone", "gender", "age"];
      const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
      const updateData = {};

      updates.forEach(key => {
        if (key === "gender" && !["male", "female"].includes(req.body[key])) {
          return res.status(400).json({ message: "Gender harus dipilih antara male atau female." });
        }
        updateData[key] = req.body[key];
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid data to update" });
      }

      // Query untuk mengupdate profil user
      var updateQuery = "UPDATE ?? SET ? WHERE ??=?";
      var updateTable = ["user", updateData, "id_user", userId];
      updateQuery = mysql.format(updateQuery, updateTable);

      connection.query(updateQuery, function (error, result) {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: true, message: "Database error" });
        }

        return res.status(200).json({ success: true, message: "Profil berhasil diperbarui" });
      });
    });
  });
};
