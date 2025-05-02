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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': 'https://www.amazon.com/',
        'Cookie': 'i18n-prefs=USD; lc-main=en_US;', //Cookies related to localization
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
    };

    try {
        //Fetch the search result page and assign it to a response variable
        const response = await axios.get(url, {headers: headers});
        //console.log(response.data);

        //Check if Amazon blocked the request (CAPTCHA)
        if (response.data.includes("api-services-support@amazon.com")) {
            return res.status(403).json({ error: "Blocked by Amazon (CAPTCHA)" });
        }

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
        if (error.response) {
        //Check if Amazon returned a non-200 status (e.g. 403, 503, 502)
            return res.status(502).json({ 
                error: "Amazon blocked the request", 
                status: error.response.status,
            });
        }
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