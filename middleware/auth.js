const connection = require("../server");
const mysql = require("mysql2");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const config = require("../config/secret");
const ip = require("ip");

exports.registration = function (req, res) {
  const post = {
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    password: md5(req.body.password),
    phone: req.body.phone,
    gender: req.body.gender,
    age: req.body.age,
  };

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(post.email)) {
    return res.status(400).json({ message: "Format email tidak valid." });
  }

  if (post.gender !== "male" && post.gender !== "female") {
    return res.status(400).json({ message: "Gender harus dipilih antara male atau female." });
  }

  let query = "SELECT * FROM ?? WHERE ??=? OR ??=?";
  const table = ["user", "phone", post.phone, "email", post.email];
  query = mysql.format(query, table);

  connection.query(query, function (error, rows) {
    if (error) {
      console.log(error);
    } else {
      if (rows.length === 0) {
        query = "INSERT INTO ?? SET ?";
        const table = ["user"];
        query = mysql.format(query, table);

        connection.query(query, post, function (error, rows) {
          if (error) {
            console.log(error);
          } else {
            return res.status(200).json({ message: "Registrasi Akun Berhasil" });
          }
        });
      } else {
        return res.status(400).json({ message: "Nomor atau Email sudah terdaftar" });
      }
    }
  });
};

exports.login = function (req, res) {
  const post = {
    email: req.body.email,
    password: req.body.password,
  };

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(post.email)) {
    return res.status(400).json({ message: "Format email tidak valid." });
  }

  let query = "SELECT * FROM ?? WHERE ??=? AND ??=?";
  const table = ["user", "email", post.email, "password", md5(post.password)];
  query = mysql.format(query, table);

  connection.query(query, function (error, rows) {
    if (error) {
      console.log(error);
    } else {
      if (rows.length === 1) {
        const token = jwt.sign({ id_user: rows[0].id_user }, config.secret, { expiresIn: 1440 });
        const data = { id_usertoken: rows[0].id_user, token, ip_address: ip.address() };

        query = "INSERT INTO ?? SET ?";
        const table = ["auth_tokens"];
        query = mysql.format(query, table);

        connection.query(query, data, function (error, rows) {
          if (error) {
            console.log(error);
          } else {
            return res.status(200).json({
              success: true,
              message: "Token JWT tergenerate!",
              token,
              currUser: data.id_usertoken,
            });
          }
        });
      } else {
        return res.status(400).json({ error: true, message: "Email atau password salah!" });
      }
    }
  });
};

exports.logout = function (req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  let query = "DELETE FROM ?? WHERE ?? = ?";
  const table = ["auth_tokens", "token", token];
  query = mysql.format(query, table);

  connection.query(query, function (error, result) {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: true, message: "Internal Server Error" });
    } else {
      if (result.affectedRows === 0) {
        return res.status(401).json({ error: true, message: "Invalid token" });
      }
      return res.status(200).json({ success: true, message: "Logout successful" });
    }
  });
};
