var
  scrape = require('express').Router(),
  suq = require('suq'),
  _ = require('lodash'),
  chalk = require('chalk');


// Scrape!!
scrape.post('/', function (req, res, next) {
  var url = req.body.url;

  suq(url, function(err, data) {
    if (err) {
      next();
    } else {
      req.scrape = data;
      // Test for Video Object
      if (data.microdata) {
        data.microdata.forEach(function(item) {
          if (item.type === "http://schema.org/VideoObject") {
            req.payload = {
              description: item.props.description,
              embedUrl: item.props.embedURL,
              thumbnailUrl: item.props.thumbnailUrl,
              title: item.props.name,
              url: url
            };
            next();
          }
        });
      }
      req.payload = {};
      next();
    }
  });
});

/* Facebook opengraph */

scrape.use(function(req, res, next) {

  if (req.scrape && req.scrape.opengraph) {

    req.payload.description || (req.payload.description = req.scrape.opengraph['og:description']);
    req.payload.title || (req.payload.title = req.scrape.opengraph['og:title']);
    req.payload.thumbnailUrl || (req.payload.thumbnailUrl = req.scrape.opengraph['og:image']);
    req.payload.url || (req.payload.url = req.scrape.opengraph['og:url']);
    console.log(chalk.yellow(req.payload.thumbnailUrl, req.scrape.opengraph['og:image']));

  }

  next();

});

/* Twitter */
scrape.use(function(req, res, next) {

  if (req.scrape && req.scrape.meta) {

    req.payload.description || (req.payload.description = req.scrape.meta['twitter:description']);
    req.payload.title || (req.payload.title = req.scrape.meta['twitter:title']);
    req.payload.thumbnailUrl || (req.payload.thumbnailUrl = req.scrape.meta['twitter:image:src']);
    req.payload.url || (req.payload.url = req.body.url);
    console.log(req.payload.thumbnailUrl, req.scrape.opengraph['twitter:image:src']);

  }

  next();

});



/* Meta */
scrape.use(function(req, res, next) {

  if (req.scrape && req.scrape.meta) {

    req.payload.description || (req.payload.description = req.scrape.meta['description']);
    req.payload.title || (req.payload.title = req.scrape.meta['title']);

  }

  next();

});

/* Tags */
scrape.use(function(req, res, next) {

  if (req.scrape && req.scrape.tags) {
    console.log(chalk.cyan(JSON.stringify(req.scrape, null, 2)));
    console.log(chalk.magenta(JSON.stringify(req.payload, null, 2)));
    req.payload.title || (req.payload.title = req.scrape.tags['title']);
    if (req.scrape.tags.images &&
      Array.isArray(req.scrape.tags.images) &&
      req.scrape.tags.images.length &&
      !req.payload.thumbnailUrl) {
      req.payload.thumbnailUrl = req.scrape.tags.images[0];
    }
  }

  next();

});



/* Final Payload middleware before sending off to error handler */

scrape.use(function (req, res, next) {

  if (req.payload) {
    res.json(req.payload);
  } else {
    next();
  }


});

module.exports = scrape;
