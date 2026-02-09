// Function to validate LinkedIn URL
function isValidLinkedinUrl(url) {
  if (!url || url === '') return true; // Allow empty
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
           (parsed.hostname === 'linkedin.com' || 
            parsed.hostname === 'www.linkedin.com');
  } catch {
    return false;
  }
}