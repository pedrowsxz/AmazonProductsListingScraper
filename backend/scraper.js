import axios from 'axios';
import { JSDOM } from 'jsdom';

export const scrapeAmazonProductsListing = async (req, res) => {
    //Get keyword from query
    const {keyword} = req.query;

    //Check if keyword is provided
    if (!keyword) {
        return res.status(400).json({error: "Must provide a keyword."});
    }

    //Create the Amazon search URL with the keyword as a parameter, and assign it to a url variable
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    //Set headers to mimic a real browser (to not be blocked by amazon)
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    };

    try {
        //Fetch the search result page and assign it to a response variable
        const response = await axios.get(url, {headers});
        //console.log(response.data);

        //Use JSDOM to parse Amazon's webpage HTML
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        //Select all products containers
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');

        //Validation of productElements
        if (!productElements || productElements.length === 0) {
            res.status(404).json({error: "No products found", details: "Amazon's page structure may have changed"});
            return;
        }

        //Extract each product information, calling the function extractProductsInformationFromDOM
        const products = Array.from(productElements).map(extractProductsInformationFromDOM);

        //Responds with extracted products data as JSON
        res.json(products);
    } catch (error) {
        console.log("Error scraping Amazon: ", error);
        res.status(500).json({error: "Failed to scrape Amazon products listing page.", details: error.message});
    }
}

const extractProductsInformationFromDOM = (element) => {
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
};