import express from 'express';
import cors from 'cors';
import { scrapeAmazon } from './scraper';

const app = express();
const PORT = 3000;

//Enable cors to allow requests from frontend
app.use(cors())

//Endpoint for scraping Amazon product listings
app.get('/api/scrape', scrapeAmazon);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
