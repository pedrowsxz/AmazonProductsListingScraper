import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';
const https = require('https');

const app = express();
const PORT = 3000;

//Enable cors to allow requests from frontend
app.use(cors())

//Endpoint for scraping Amazon product listings
app.get('/api/scrape', async (req, res) => {
    //Get keyword from query
    const {keyword} = req.query;

    //Check if keyword is provided
    if (!keyword) {
        return res.status(400).json({error: "Must provide a keyword."});
    }

    try {
        //Create the Amazon search URL with the keyword as a parameter, and assign it to a url variable
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

        //Set User-Agent to mimic a real browser
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Referer': 'https://www.amazon.com/',
            'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Cookie': 'session-id=144-4134760-3907231; session-id-time=2082787201l; aws-ubid-main=980-6605748-4500801; session-token=FLCdaTSC/q5HVwwhM7z3ftmdK+Q8aY88YneczjOmd8CsNEffL2Sk6PoJIalt0ACfXmBcebGT9tyD+wj26gXNHx8Dx97sC5ePk/OCD//YbMc/1z+fBG8rAihKpbFNMRksf8BkGrPyaGN3y3jRLFnd2uZ326fD3bs5/UKGiaWfD2xaaxuHQOwf/G2UHf+iC9fG+Wg46kkqYqpTTZ8/7QXHTBY81FRJ+cN5811FlxOeKr9W+yR2+oQc+yxQBRcOgM2DtZQP2NpziBleMusGc640jYaAq5L3s+k5oTb3GtCr/IrkH360LLwQz0Ay9XXRYdTw2DDAsopguwrZjVk5m4G374XL2IAFCU4x'
        };

        //Fetch the search result page and assign it to a response variable
        const response = await axios.get(url, {headers});
        //console.log(response.data);
        //console.log(response.data.includes('data-cy="reviews-block"'));
        //Use JSDOM to parse Amazon's webpage HTML
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        //Select all products containers
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');

        //Extract each product information
        const products = Array.from(productElements).map(element => {
            //Extract product title
            const titleElement = element.querySelector("a h2 span");
            const title = titleElement ? titleElement.textContent.trim() : "No title found";

            //Extract product rating
            const ratingElement = element.querySelector("span.a-icon-alt");
            const ratingElementText = ratingElement?.textContent.split(" ")[0];
            const rating = ratingElementText ? parseFloat(ratingElementText) : "No rating found";

            //Extract product review count
            const numberOfReviewsElement = element.querySelector("a.a-link-normal.s-underline-text");
            const numberOfReviewsText = numberOfReviewsElement.getAttribute("aria-label");
            const numberOfReviews = numberOfReviewsText ? numberOfReviewsText : "No reviews found";

            //Extract product image (the image source url)
            const imageElement = element.querySelector("img.s-image");
            const imageUrl = imageElement ? imageElement.src : "No image found";

            //Return product as an object with its attributes
            return {
                title,
                rating,
                numberOfReviews,
                imageUrl
            };
        })
        //Responds with extracted product data as JSON
        res.json(products);
    } catch (error) {
        console.log("Error scraping Amazon: ", error);
        res.status(500).json({error: "Failed to scrape Amazon products listing page.", details: error.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




