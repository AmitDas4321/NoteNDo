import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy for WhatsApp API
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { number, type, message, media_url, instance_id, access_token } = req.body;
      
      const response = await fetch('https://textsnap.in/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number,
          type,
          message,
          media_url,
          instance_id: instance_id || process.env.TEXTSNAP_INSTANCE_ID,
          access_token: access_token || process.env.TEXTSNAP_ACCESS_TOKEN,
        }),
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error in WhatsApp proxy:', error);
      res.status(500).json({ error: 'Failed to send WhatsApp message' });
    }
  });

  // Proxy for tmpfiles.org upload
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const formData = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('file', blob, req.file.originalname);

      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Error in upload proxy:', error);
      res.status(500).json({ error: 'Failed to upload' });
    }
  });

  // Proxy for Database
  app.get("/api/db/todos", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.json({});

      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;

      // Fetch all todos and filter manually to avoid "Missing Index" error on RTDB.
      // This is necessary because RTDB indexes cannot be managed directly from the code.
      const url = `${dbUrl}/todos.json?auth=${dbSecret}`;
      
      const response = await fetch(url);
      const allData = await response.json();
      
      if (allData && typeof allData === 'object') {
        const filtered = Object.fromEntries(
          Object.entries(allData).filter(([_, value]: [any, any]) => {
            return value && value.userId === userId;
          })
        );
        return res.json(filtered);
      }
      
      res.json({});
    } catch (error) {
      console.error('Error in DB get proxy:', error);
      res.status(500).json({ error: 'Failed to fetch from database' });
    }
  });

  app.post("/api/db/todos", async (req, res) => {
    try {
      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;
      const response = await fetch(`${dbUrl}/todos.json?auth=${dbSecret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error in DB post proxy:', error);
      res.status(500).json({ error: 'Failed to save to database' });
    }
  });

  app.patch("/api/db/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;
      const response = await fetch(`${dbUrl}/todos/${id}.json?auth=${dbSecret}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error in DB patch proxy:', error);
      res.status(500).json({ error: 'Failed to update database' });
    }
  });

  app.delete("/api/db/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;
      const response = await fetch(`${dbUrl}/todos/${id}.json?auth=${dbSecret}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error in DB delete proxy:', error);
      res.status(500).json({ error: 'Failed to delete from database' });
    }
  });

  // Proxy for User Profile
  app.get("/api/db/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;
      const response = await fetch(`${dbUrl}/users/${uid}.json?auth=${dbSecret}`);
      const data = await response.json();
      res.json(data || {});
    } catch (error) {
      console.error('Error in user profile get proxy:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.patch("/api/db/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;
      const response = await fetch(`${dbUrl}/users/${uid}.json?auth=${dbSecret}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error in user profile patch proxy:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Background task for reminders
  const checkReminders = async () => {
    try {
      const dbUrl = process.env.FIREBASE_DATABASE_URL;
      const dbSecret = process.env.FIREBASE_DATABASE_SECRET;
      
      if (!dbUrl || !dbSecret) {
        console.warn('Firebase DB credentials missing in env. Skipping reminders check.');
        return;
      }

      const todosUrl = `${dbUrl}/todos.json?auth=${dbSecret}`;
      const usersUrl = `${dbUrl}/users.json?auth=${dbSecret}`;

      const [todosRes, usersRes] = await Promise.all([
        fetch(todosUrl),
        fetch(usersUrl)
      ]);

      const allTodos = await todosRes.json();
      const allUsers = await usersRes.json();

      if (!allTodos || typeof allTodos !== 'object') return;

      const now = new Date();

      for (const [id, todo] of Object.entries(allTodos) as [string, any][]) {
        if (todo.reminderEnabled && !todo.reminderSent && todo.reminderDate && todo.reminderTime) {
          const user = allUsers?.[todo.userId];
          const timezone = user?.timezone || 'Asia/Kolkata';
          
          // Get current time in user's timezone
          const userNowStr = now.toLocaleString("en-US", { timeZone: timezone });
          const userNow = new Date(userNowStr);
          
          const year = userNow.getFullYear();
          const month = String(userNow.getMonth() + 1).padStart(2, '0');
          const day = String(userNow.getDate()).padStart(2, '0');
          const hours = String(userNow.getHours()).padStart(2, '0');
          const minutes = String(userNow.getMinutes()).padStart(2, '0');
          
          const currentDate = `${year}-${month}-${day}`;
          const currentTime = `${hours}:${minutes}`;

          // Check if it's time to send (exact match or past)
          if (currentDate > todo.reminderDate || (currentDate === todo.reminderDate && currentTime >= todo.reminderTime)) {
            console.log(`Sending reminder for todo ${id} to ${todo.phoneNumber}`);
            
            // Send WhatsApp
            const message = `🔔 *Reminder: ${todo.text}*\n\n_This is a friendly reminder from NoteNDo._`;
            
            try {
              const waResponse = await fetch('https://textsnap.in/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  number: todo.phoneNumber,
                  type: todo.imageUrl ? 'media' : 'text',
                  message: message,
                  media_url: todo.imageUrl || undefined,
                  instance_id: process.env.TEXTSNAP_INSTANCE_ID,
                  access_token: process.env.TEXTSNAP_ACCESS_TOKEN,
                }),
              });

              if (waResponse.ok) {
                // Mark as sent
                await fetch(`${dbUrl}/todos/${id}.json?auth=${dbSecret}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reminderSent: true }),
                });
                console.log(`Reminder marked as sent for ${id}`);
              } else {
                console.error(`Failed to send WhatsApp for ${id}:`, await waResponse.text());
              }
            } catch (err) {
              console.error(`Error sending WhatsApp for ${id}:`, err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in checkReminders background task:', error);
    }
  };

  // Run every minute
  setInterval(checkReminders, 60000);
  // Run once on start
  checkReminders();
}

startServer();
