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

// Respond to preflight OPTIONS request
router.options('/convert-to-symbol', (req, res) => {
    res.status(200).send();
});

// Convert SVG data to symbol and return it
router.post('/convert-to-symbol', inlineStyleMiddleware, (req, res) => {
    // Create a new instance of SVGSpriter
    const spriter = new SVGSpriter(config);

    // Generate a random name for the SVG file
    const name = `svg-${Math.random()}.svg`;

    // Add the SVG data to the spriter
    spriter.add(`./${name}`, `${name}`, req.body.svgData);

    // Compile the SVG data
    spriter.compile((error, result) => {
        if (error) {
            return res.status(503).send(error);
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
