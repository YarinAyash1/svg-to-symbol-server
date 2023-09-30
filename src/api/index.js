const express = require('express');

const router = express.Router();
const SVGSpriter = require('svg-sprite');
const inlineCss = require('inline-css');

// Configuration object for SVGSpriter
const config = {
  log: 'verbose',
  mode: {
    symbol: {
      bust: false,
      inline: true,
    },
  },
};

// Middleware function that inlines styles in the SVG data
const inlineStyleMiddleware = (req, res, next) => {
  inlineCss(req.body.svgData)
    .then((newSvgData) => {
      req.body.svgData = newSvgData;
      next();
    })
    .catch(() => {
      next();
    });
};

const getUuid = () => 'xxxxqxxxx'.replace(/[xy]/g, (c) => {
  // eslint-disable-next-line no-bitwise
  const r = Math.random() * 16 | 0;
  // eslint-disable-next-line no-bitwise,no-mixed-operators
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

// Respond to preflight OPTIONS request
router.options('/convert', (req, res) => {
  res.status(200)
    .send();
});

// Convert SVG data to symbol and return it
router.post('/convert', inlineStyleMiddleware, (req, res) => {
  // Create a new instance of SVGSpriter
  const spriter = new SVGSpriter(config);
  const svgName = `svg-${req.body.name ? req.body.name : getUuid()}`;
  // Generate a random name for the SVG file
  const name = `${svgName}.svg`;

  // Add the SVG data to the spriter
  spriter.add(`./${name}`, `${name}`, req.body.svgData);

  // Compile the SVG data
  spriter.compile((error, result) => {
    if (error) {
      res.status(503)
        .send(error);
    }

    // Extract the symbol sprite and modify it
    let data = result.symbol.sprite._contents.toString();
    data = data
      .replace(/></g, '>\n<')
      .replace(/id=""/g, '')
      .replace(/\s{2,}/gm, '')
      .replace(/"(?:\s{1,})/gm, '" ');

    // Send the modified symbol sprite and the original SVG data back to the client
    res.type('json')
      .status(200)
      .send({
        symbol: data,
        svgId: svgName,
        input: req.body.svgData,
      });
  });
});

// New route to convert a symbol to an SVG element
router.post('/convert-symbol', inlineStyleMiddleware, (req, res) => {
  // eslint-disable-next-line max-len
  const symbolString = req.body.symbol; // Assuming the symbol is sent as a string in the request body

  // Check if symbolString exists in the request body
  if (!symbolString) {
    res.status(400)
      .json({ error: 'Symbol string not provided in the request body' });
  }

  // Replace <symbol> with <svg> while keeping the attributes
  const svgElement = symbolString.replace(/<symbol([^>]*)>/, '<svg$1>');

  // Replace </symbol> with </svg>
  const finalSvgElement = svgElement.replace('</symbol>', '</svg>');

  // Send the converted SVG element back to the client
  const generatedSymbols = `<svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${symbolString}</svg> `;

  // Use a regular expression to search for the id attribute within the symbolString
  const idMatch = symbolString.match(/id="([^"]*)"/);

  // Check if the id attribute is found
  if (!idMatch || !idMatch[1]) {
    res.status(400)
      .json({ error: 'Failed to extract the id attribute from the symbol string' });
  }

  // Extracted id attribute value
  const idAttribute = idMatch[1];
  res.type('json')
    .status(200)
    .send({
      symbol: generatedSymbols,
      svgId: idAttribute,
      input: finalSvgElement,
    });
});

router.post('/convert-upload', inlineStyleMiddleware, (req, res) => {
  // Create a new instance of SVGSpriter
  const symbols = [];
  if (!Array.isArray(req.files.svgFiles)) req.files.svgFiles = [req.files.svgFiles];
  req.files.svgFiles.forEach((file) => {
    const spriter = new SVGSpriter(config);
    if (file.mimetype !== 'image/svg+xml') {
      res.status(503)
        .send({
          message: 'Type is not valid. only SVG files accepted',
        });
    }
    const svgName = file.name.replace('.svg', '');
    // Generate a random name for the SVG file
    // Add the SVG data to the spriter
    spriter.add(`./${file.name}`, `${file.name}`, file.data.toString('utf8'));
    // Compile the SVG data
    spriter.compile((error, result) => {
      if (error) {
        res.status(503)
          .send(error);
      }

      // Extract the symbol sprite and modify it
      let data = result.symbol.sprite._contents.toString();
      data = data
        .replace(/></g, '>\n<')
        .replace(/id=""/g, '')
        .replace(/\s{2,}/gm, '')
        .replace(/"(?:\s{1,})/gm, '" ');

      symbols.push({
        symbol: data,
        svgId: svgName,
        input: file.data.toString('utf8'),
      });
    });
  });
  // Send the modified symbol sprite and the original SVG data back to the client
  res.type('json')
    .status(200)
    .send({
      symbols,
    });
});

router.post('/export-all', (req, res) => {
  const { symbols } = req.body;
  let generatedSymbols = '<svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const symbolsKey in symbols) {
    generatedSymbols += '\n';
    generatedSymbols += `${symbols[symbolsKey]}`;
    generatedSymbols += '\n';
  }
  generatedSymbols += '</svg>';

  res.type('json')
    .status(200)
    .send({
      data: generatedSymbols,
    });
});

// Test route
router.get('/', (req, res) => {
  res.json({
    message: 'Hey!',
  });
});

router.get('/keep-alive', (req, res) => {
  res.json({
    message: 'Im Alive!',
  });
});

module.exports = router;
