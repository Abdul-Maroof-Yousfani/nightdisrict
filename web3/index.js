// index.mjs

import express from 'express';
import puppeteer from 'puppeteer';
import ejs from 'ejs';

const app = express();
const port = 3005;

app.set('view engine', 'ejs');
app.set('views', './views'); // Create a 'views' directory in your project

app.get('/download-pdf', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Data to pass to the EJS template
    const data = {
      name: 'John Doe',
      message: 'This is a PDF generated with Puppeteer and EJS.',
    };

    // Render the EJS template
    const html = await ejs.renderFile('./views/template.ejs', data);

    await page.setContent(html);

    // Generate PDF
    const pdfBuffer = await page.pdf();
    
    // Close the browser
    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=example.pdf');

    // Send the PDF as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
