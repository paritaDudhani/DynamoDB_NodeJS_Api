const express = require('express');
const app = express();
const port = process.env.PORT || 8010
const countryRouter = require('./routes/api/country');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// require('./routes')(app);
app.use('/api/country', countryRouter);

app.listen(port, '0.0.0.0', (err) => {

    if (err) {
      console.log(err.message);
    }
  
    console.info('>>> 🌎 Open http://0.0.0.0:%s/ in your browser.', port);
});
  
module.exports = app;