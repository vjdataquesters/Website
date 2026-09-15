import https from 'https';

export default function handler(req, res) {
  let driveId = req.query?.driveId || req.query?.id;
  if (!driveId && req.url) {
    const cleanUrl = req.url.split('?')[0];
    const match = cleanUrl.match(/\/api\/video\/(.+)/);
    if (match) {
      driveId = match[1];
    }
  }

  if (!driveId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Missing or invalid driveId');
    return;
  }

  const rangeHeader = req.headers.range;

  const fetchFromDrive = (url, redirectCount = 0) => {
    if (redirectCount > 5) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Too many redirects from Google Drive');
      return;
    }

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const request = https.get(url, { headers }, (driveRes) => {
      if (
        driveRes.statusCode >= 300 &&
        driveRes.statusCode < 400 &&
        driveRes.headers.location
      ) {
        fetchFromDrive(driveRes.headers.location, redirectCount + 1);
        return;
      }

      if (driveRes.statusCode === 403 || driveRes.statusCode >= 400) {
        console.error('Google Drive error:', {
          driveId,
          range: rangeHeader,
          status: driveRes.statusCode,
          contentType: driveRes.headers['content-type'],
          contentLength: driveRes.headers['content-length'],
          url,
        });

        res.statusCode = driveRes.statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Google Drive returned ' + driveRes.statusCode,
            driveId,
            details: 'Unable to stream file. Verify sharing permissions.',
          })
        );
        return;
      }

      res.statusCode = driveRes.statusCode || 200;

      const forwardHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'last-modified',
        'etag',
        'cache-control',
      ];

      forwardHeaders.forEach((h) => {
        if (driveRes.headers[h]) {
          res.setHeader(h, driveRes.headers[h]);
        }
      });

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');

      driveRes.pipe(res);
    });

    request.on('error', (err) => {
      console.error('Drive fetch error:', err.message);
      if (!res.headersSent) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Video stream error: ' + err.message);
      }
    });
  };

  const initialUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
  fetchFromDrive(initialUrl);
}
