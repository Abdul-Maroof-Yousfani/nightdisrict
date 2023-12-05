// index.mjs

import express from 'express';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import axios from 'axios';

const app = express();
const port = 3005;

app.set('view engine', 'ejs');
app.set('views', './views'); // Create a 'views' directory in your project

app.get('/download-pdf', async (req, res) => {
  try {

    // get nightly overview data from the api

    const apiEndpoint = 'http://localhost:3000/api/bar/655f5e400815a9f80eb2ada9/report';
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: apiEndpoint,
        headers: { }
      };
      
    let apiResponse = await axios.request(config)


    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Data to pass to the EJS template
    // const data = {
    //   name: 'John Doe',
    //   message: 'This is a PDF generated with Puppeteer and EJS.',
    // };

    // Render the EJS template
    const html = await ejs.renderFile('./views/template.ejs', { apiResponse : apiResponse.data.data });

    await page.setContent(html);

    // Generate PDF
    const pdfBuffer = await page.pdf();
    
    // Close the browser
    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ma.pdf');

    // // Send the PDF as the response
    res.send(pdfBuffer);
  } catch (error) {
    return res.json({error : error.message});
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
