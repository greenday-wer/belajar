// const mysql = require('mysql2');
// require('dotenv').config();

// // Membuat koneksi database
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// // Query untuk membuat tabel
// // const createUserTable = `
// // CREATE TABLE IF NOT EXISTS user (
// //   id_user INT AUTO_INCREMENT PRIMARY KEY,
// //   email VARCHAR(255) NOT NULL UNIQUE,
// //   first_name VARCHAR(100),
// //   last_name VARCHAR(100),
// //   password VARCHAR(255) NOT NULL,
// //   phone VARCHAR(15) NOT NULL UNIQUE,
// //   gender ENUM('male', 'female') NOT NULL,
// //   age INT,
// //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// // );
// // `;

// const createauthtokenTable = `
//   CREATE TABLE auth_tokens (
//   id_token INT AUTO_INCREMENT PRIMARY KEY,
//   token TEXT NOT NULL,
//   id_usertoken INT NOT NULL,
//   ip_address VARCHAR(45) NOT NULL,  -- Untuk mendukung IPv6
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (id_usertoken) REFERENCES user(id_user) ON DELETE CASCADE
// );
// `;

// // Membuat tabel jika belum ada
// connection.query(createauthtokenTable, function (error, results, fields) {
//   if (error) {
//     console.log('Error creating table: ', error);
//   } else {
//     console.log('Tabel user berhasil dibuat!');
//   }

//   // Menutup koneksi
//   connection.end();
// });
