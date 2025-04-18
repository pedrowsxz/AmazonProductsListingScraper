# Amazon Product Scraper

A simple web application that scrapes Amazon product listings from the first page of search results for a given keyword.

## Features

- Backend API to scrape Amazon search results
- Frontend interface to input keywords and display results
- Extracts product titles, ratings, review counts, and images

## Tech Stack

- **Backend**: Bun, Express, Axios, JSDOM
- **Frontend**: HTML, CSS, Vanilla JavaScript with Vite

## Prerequisites

- [Bun](https://bun.sh/) (v1.2.6 or higher)
- Modern web browser

## Installation

1. Clone the repository or create the files as described in this README.

2. Install backend dependencies:
   ```bash
   cd backend
   bun install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   bun install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   bun run server.js
   ```
   The server will start on http://localhost:3000.

2. Start the frontend development server:
   ```bash
   cd ../frontend
   bun run dev
   ```
   The Vite development server will start and provide a local URL (typically http://localhost:5173).

## Important Notes

- Amazon may block requests that appear to be automated. This scraper sets a User-Agent header to mimic a real browser, but it might still be detected as a bot.
- The structure of Amazon's website may change, which could break the scraper. If this happens, update the selectors in the backend code.

## Troubleshooting

If Amazon blocks the requests, consider these advanced mitigation techniques:

- **Rotate User-Agents** to simulate diverse browsers/devices 
- **Enhance request headers** with Amazon-specific cookies and anti-bot headers  
- **Route traffic through proxies** (residential/rotating IPs)  
- **Implement request throttling** to mimic human browsing patterns  

*Note: Always comply with Amazon's Terms of Service.*
