document.addEventListener('DOMContentLoaded', () => {
  const keywordInput = document.getElementById('keyword');
  const scrapeButton = document.getElementById('scrape-button');
  const loadingElement = document.getElementById('loading');
  const errorMessageElement = document.getElementById('error-message');
  const resultsContainer = document.getElementById('results');
  
  //API endpoint (the backend server)
  const API_URL = 'http://localhost:3000/api/scrape';
  
  //Add event listener to the search button, which calls the function scrapeProducts
  scrapeButton.addEventListener('click', scrapeProducts);
  
  //Also add event listener for Enter key on the input field
  keywordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      scrapeProducts();
    }
  });
  
  async function scrapeProducts() {
    //Get keyword from user input
    const keyword = keywordInput.value.trim();
    
    //Validate input
    if (!keyword) {
      showError('Enter a keyword to search for.');
      return;
    }
    
    //Clear previous results and errors
    resultsContainer.innerHTML = '';
    errorMessageElement.classList.add('hidden');
    
    //Show loading text
    loadingElement.classList.remove('hidden');
    
    try {
      //Make the API request
      const response = await fetch(`${API_URL}?keyword=${encodeURIComponent(keyword)}`);
      
      //Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products.');
      }
      
      //Parse the JSON response
      const products = await response.json();
      
      //Check if products were found
      if (products.length === 0) {
        showError('No products found for the given keyword.');
        return;
      }
      
      //Display the products, calling the function displayProducts
      displayProducts(products);
    
    //Otherwise, if there are any errors, show them, calling the function showError
    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'An unexpected error occurred.');
    } finally {
      //Hide the loading text
      loadingElement.classList.add('hidden');
    }
  }
  
  function displayProducts(products) {
    products.forEach(product => {
      //Create product card
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      
      //Generate stars according to rating
      let starsHtml = '';
      if (product.rating) {
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
          if (i < fullStars) {
            starsHtml += '★'; //Full star
          } else if (i === fullStars && halfStar) {
            starsHtml += '✬'; //'Half star'
          } else {
            starsHtml += '☆'; //Empty star
          }
        }
      }
      
      //Set product image, title, stars, rating and number of reviews on its card
      productCard.innerHTML = `
        <img class="product-image" src="${product.imageUrl}" alt="${product.title}">
        <h3 class="product-title">${product.title}</h3>
        <div class="product-rating">
          <span class="stars">${starsHtml}</span>
          <span>${product.rating}</span>
        </div>
        <div class="review-count">${product.numberOfReviews}</div>
      `;
      
      //Add the product card to the results container
      resultsContainer.appendChild(productCard);
    });
  }
  
  function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove('hidden');
    loadingElement.classList.add('hidden');
  }
});
