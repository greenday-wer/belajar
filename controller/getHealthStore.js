const axios = require("axios");
require("dotenv").config();

// Fungsi untuk memformat waktu (dari HHMM ke format HH:MM)
function timeFormat(waktu) {
  if (!waktu || waktu.length !== 4) return "";
  const jam = waktu.substring(0, 2);
  const menit = waktu.substring(2, 4);
  return `${jam}:${menit}`;
}

// Fungsi untuk memformat nomor HP menjadi tautan WhatsApp
function numberFormat(nomor) {
  if (!nomor || !nomor.startsWith("+")) return "";
  return `https://wa.me/${nomor.replace(/\D/g, "")}`;
}

async function getHealthStore(req, res) {
  try {
    const { latitude, longitude, keyword } = req.query;
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    // Validasi input parameter
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    // Tentukan URL berdasarkan apakah keyword diberikan atau tidak
    let url;
    if (keyword) {
      // URL untuk pencarian berbasis keyword
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        keyword
      )}&location=${latitude},${longitude}&radius=5000&key=${API_KEY}`;
    } else {
      // URL untuk pencarian berbasis kesehatan mental di lokasi
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=kesehatan%20mental&key=${API_KEY}`;
    }

    // Mengirim permintaan HTTP GET ke Google Maps Places API
    const response = await axios.get(url);
    const results = response.data.results;

    // Validasi apakah ada hasil pencarian
    if (!results || results.length === 0) {
      return res.status(404).json({ error: "No places found" });
    }

    // Mengambil informasi yang diperlukan dari hasil pencarian
    const tokoPromises = results.map(async (place) => {
      const photoUrl = place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : "";

      // Mengambil detail tempat untuk mendapatkan informasi tambahan
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,photos,opening_hours,formatted_phone_number&key=${API_KEY}`;
      const detailResponse = await axios.get(detailUrl);
      const detailResult = detailResponse.data.result;
      const openingHours = detailResult.opening_hours;
      const phoneNumber = detailResult.formatted_phone_number || "Not Available";

      let jamBuka = "";
      let jamTutup = "";

      if (openingHours && openingHours.periods && openingHours.periods.length > 0) {
        const period = openingHours.periods[0];
        jamBuka = period.open && period.open.time ? timeFormat(period.open.time) : "";
        jamTutup = period.close && period.close.time ? timeFormat(period.close.time) : "";
      }

      const nomorHp = phoneNumber || "";
      const whatsappUrl = numberFormat(nomorHp);

      return {
        nama: place.name,
        alamat: place.formatted_address || place.vicinity,
        rating: place.rating,
        fotoUrl: photoUrl,
        jamBuka,
        jamTutup,
        nomorHP: phoneNumber,
        whatsappUrl: whatsappUrl,
      };
    });

    // Menunggu semua promise untuk menyelesaikan dan mengembalikan hasil
    const toko = await Promise.all(tokoPromises);

    res.json({ toko });
  } catch (error) {
    console.error("Error Occurred:", error.message || error);
    res.status(500).json({ error: "Something went wrong when looking for a health store" });
  }
}

module.exports = { getHealthStore };
