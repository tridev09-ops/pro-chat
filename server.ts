import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import next from "next";
import initSocket from "./app/lib/socket.ts";

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || "localhost";
const port =  process.env.PORT ? parseInt(process.env.PORT) : 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Next.js using the server file directory as app root.
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Pass every request to the Next.js handler
      await handle(req, res);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Attach Socket.io server
  initSocket(server);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
