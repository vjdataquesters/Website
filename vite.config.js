import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import https from 'https'

function googleDriveVideoProxy() {
  return {
    name: 'google-drive-video-proxy',
    configureServer(server) {
      server.middlewares.use('/api/video', (req, res) => {
        const urlParts = req.url.split('?');
        let driveId = urlParts[0].replace(/^\//, '');
        if (!driveId && urlParts[1]) {
          const params = new URLSearchParams(urlParts[1]);
          driveId = params.get('id') || '';
        }

        if (!driveId) {
          res.statusCode = 400;
          res.end('Missing driveId');
          return;
        }

        const fetchFromDrive = (url, headers, redirectCount = 0) => {
          if (redirectCount > 5) {
            res.statusCode = 502;
            res.end('Too many redirects');
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

            res.statusCode = driveRes.statusCode || 200;

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
              res.statusCode = 502;
              res.end('Video stream error: ' + err.message);
            }
          });
        };

        const initialUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
        const headers = {};
        if (req.headers.range) {
          headers['Range'] = req.headers.range;
        }

        fetchFromDrive(initialUrl, headers);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), googleDriveVideoProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

