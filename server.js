const express = require("express");
const cors = require("cors");
const dns = require("dns");
const urlParser = require("url");

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory URL store
let urlDatabase = {};
let idCounter = 1;

// Root endpoint
const path = require("path");

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/Views/index.html"));
});

// app.get("/", (req, res) => {
//   res.send("URL Shortener Microservice is running.");
// });

// ✅ POST: Shorten a valid URL
app.post("/api/shorturl", (req, res) => {
  const inputUrl = req.body.url;

  try {
    // Validate protocol
    if (!/^https?:\/\//i.test(inputUrl)) {
      return res.json({ error: "invalid url" });
    }

    const hostname = urlParser.parse(inputUrl).hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Store URL and return short link
      const shortUrl = idCounter++;
      urlDatabase[shortUrl] = inputUrl;

      res.json({
        original_url: inputUrl,
        short_url: shortUrl,
      });
    });
  } catch (error) {
    res.json({ error: "invalid url" });
  }
});

// ✅ GET: Redirect short URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
