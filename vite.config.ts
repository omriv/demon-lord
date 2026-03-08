import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const tasksPath = resolve(__dirname, 'src/data/tasks.json');

function saveTasksPlugin() {
  return {
    name: 'save-tasks',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/save-tasks', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            JSON.parse(body); // validate
            writeFileSync(tasksPath, body);
            res.statusCode = 200;
            res.end('ok');
          } catch {
            res.statusCode = 400;
            res.end('invalid json');
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    saveTasksPlugin(),
  ],
})
