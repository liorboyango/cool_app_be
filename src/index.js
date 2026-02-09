// Function to validate LinkedIn URL
function isValidLinkedinUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS LinkedIn URLs
    if (parsedUrl.protocol !== 'https:') return false;
    // Only allow linkedin.com domain
    if (!['www.linkedin.com', 'linkedin.com'].includes(parsedUrl.hostname)) return false;
    // Max length check
    if (url.length > 256) return false;
    return true;
  } catch (e) {
    return false;
  }
}

// Proxy endpoint for images
app.get('/proxy/image', proxyLimiter, async (req, res) => {
  const { url } = req.query;
  if (!url || !isValidImageUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 5000,
      httpsAgent: new https.Agent({ rejectUnauthorized: true }),
      maxContentLength: 2 * 1024 * 1024, // 2MB limit
    });
    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    });
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
});