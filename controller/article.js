const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.NEWS_API_KEY;

async function getArticle(req, res) {
    try {
        const url = `https://newsapi.org/v2/everything?q=kesehatan%20mental&apiKey=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching mental health news' });
    }
}

module.exports = { getArticle };