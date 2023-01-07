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

const getUuid = () => 'xxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16;
  const v = c === 'x' ? r : ((r % 4) + 8);
  return v.toString(16);
});

// Respond to preflight OPTIONS request
router.options('/convert', (req, res) => {
  res.status(200).send();
});

// Convert SVG data to symbol and return it
router.post('/convert', inlineStyleMiddleware, (req, res) => {
  // Create a new instance of SVGSpriter
  const spriter = new SVGSpriter(config);
  const svgName = `svg-${req.body.name ? req.body.name : getUuid()}`;
  // Generate a random name for the SVG file
  const name = `svg-${svgName}.svg`;

  // Add the SVG data to the spriter
  spriter.add(`./${name}`, `${name}`, req.body.svgData);

  // Compile the SVG data
  spriter.compile((error, result) => {
    if (error) {
      res.status(503).send(error);
    }

    // Extract the symbol sprite and modify it
    let data = result.symbol.sprite._contents.toString();
    data = data
      .replace(/></g, '>\n<')
      .replace(/id=""/g, '')
      .replace(/\s{2,}/gm, '')
      .replace(/"(?:\s{1,})/gm, '" ');

    // Send the modified symbol sprite and the original SVG data back to the client
    res.type('json').status(200).send({
      symbol: data,
      svgId: svgName,
      input: req.body.svgData,
    });
  });
});

// Test route
router.get('/', (req, res) => {
  res.json({
    message: 'Hey!',
  });
});

module.exports = router;
