require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();
let mongoose;
try {
  mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

} catch (e) {
  console.log(e);
}
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get("/is-mongoose-ok", function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

const urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: Number,
});

let _URL = mongoose.model('urls', urlSchema);

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  dns.lookup(new URL(url).hostname, async (err, address, family) => {
    if(err) res.json({error: 'invalid url'});
    const result = await saveUrl(url);
    res.json({original_url: result.original_url, short_url: result.short_url});
  });
})
const saveUrl = async (original_url) => {
  const urls = await _URL.find({});
  const nextShortUrl = urls.length + 1;
  const urlDocument = new _URL({
    original_url: original_url,
    short_url: nextShortUrl
  });
  return await urlDocument.save();
}
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
