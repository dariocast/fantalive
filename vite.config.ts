import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import https from 'https';

function probabiliApiPlugin(): Plugin {
  return {
    name: 'probabili-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/probabili', (req, res) => {
        const options = {
          hostname: 'www.fantacalcio.it',
          path: '/probabili-formazioni-serie-a',
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8'
          }
        };

        const fetchReq = https.request(options, (fetchRes) => {
          let rawHtml = '';
          fetchRes.on('data', (chunk) => {
            rawHtml += chunk;
          });
          fetchRes.on('end', () => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.end(rawHtml);
          });
        });

        fetchReq.on('error', (err) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        });

        fetchReq.end();
      });

      server.middlewares.use('/api/infortunati', (req, res) => {
        const options = {
          hostname: 'www.fantacalcio.it',
          path: '/infortunati-serie-a',
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8'
          }
        };

        const fetchReq = https.request(options, (fetchRes) => {
          let rawHtml = '';
          fetchRes.on('data', (chunk) => {
            rawHtml += chunk;
          });
          fetchRes.on('end', () => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.end(rawHtml);
          });
        });

        fetchReq.on('error', (err) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        });

        fetchReq.end();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), probabiliApiPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
