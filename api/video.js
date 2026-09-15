import https from 'https';

export default function handler(req, res) {
  const urlParts = req.url.split('?');
  let driveId = req.query?.driveId || req.query?.id;
  
  if (!driveId) {
    driveId = urlParts[0].replace(/^\/api\/video\/?/, '');
  }

  if (!driveId) {
    res.status(400).send('Missing driveId');
    return;
  }

  const fetchFromDrive = (url, headers, redirectCount = 0) => {
    if (redirectCount > 5) {
      res.status(502).send('Too many redirects');
      return;
    }

    const request = https.get(url, { headers }, (driveRes) => {
      if (
        driveRes.statusCode >= 300 &&
        driveRes.statusCode < 400 &&
        driveRes.headers.location
      ) {
        fetchFromDrive(driveRes.headers.location, headers, redirectCount + 1);
        return;
      }

      res.status(driveRes.statusCode || 200);

      const headersToForward = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'last-modified',
        'etag',
        'cache-control',
      ];

      headersToForward.forEach((h) => {
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
      if (!res.headersSent) {
        res.status(502).send('Video stream error: ' + err.message);
      }
    });
  };

  const initialUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
  const headers = {};
  if (req.headers.range) {
    headers['Range'] = req.headers.range;
  }

  fetchFromDrive(initialUrl, headers);
}
