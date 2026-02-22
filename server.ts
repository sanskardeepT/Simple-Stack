import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure Multer for memory storage
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json());

  // API Route: Handle Archive Upload
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const platform = req.body.platform; // 'instagram', 'facebook', 'twitter', 'youtube'
      const posts: string[] = [];

      if (req.file.mimetype === "application/zip" || req.file.originalname.endsWith(".zip")) {
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
          const entryName = entry.entryName.toLowerCase();
          
          // Instagram Parser
          if (platform === "instagram" && entryName.includes("posts/") && entryName.endsWith(".json")) {
            const data = JSON.parse(entry.getData().toString("utf8"));
            if (Array.isArray(data)) {
              data.forEach(item => {
                const caption = item.media?.[0]?.caption || item.caption;
                if (caption) posts.push(caption);
              });
            }
          }
          
          // Facebook Parser
          if (platform === "facebook" && entryName.includes("posts/your_posts") && entryName.endsWith(".json")) {
            const data = JSON.parse(entry.getData().toString("utf8"));
            if (Array.isArray(data)) {
              data.forEach(item => {
                if (item.post) posts.push(item.post);
                else if (item.data?.[0]?.post) posts.push(item.data[0].post);
              });
            }
          }

          // X (Twitter) Parser
          if (platform === "twitter" && entryName.includes("data/tweet") && (entryName.endsWith(".js") || entryName.endsWith(".json"))) {
            let content = entry.getData().toString("utf8");
            // Twitter .js files start with "window.YTD.tweet.part0 = "
            if (content.includes("=")) {
              content = content.substring(content.indexOf("=") + 1);
            }
            try {
              const data = JSON.parse(content);
              if (Array.isArray(data)) {
                data.forEach(item => {
                  if (item.tweet?.full_text) posts.push(item.tweet.full_text);
                });
              }
            } catch (e) {
              console.error("Failed to parse Twitter JS/JSON", e);
            }
          }

          // YouTube Parser
          if (platform === "youtube" && entryName.includes("history/watch-history") && entryName.endsWith(".json")) {
            const data = JSON.parse(entry.getData().toString("utf8"));
            if (Array.isArray(data)) {
              data.forEach(item => {
                if (item.title) posts.push(item.title);
              });
            }
          }
        }
      } else if (req.file.mimetype === "application/json" || req.file.originalname.endsWith(".json")) {
        // Direct JSON upload
        const data = JSON.parse(req.file.buffer.toString("utf8"));
        // Generic extraction attempt
        if (Array.isArray(data)) {
          data.forEach(item => {
            const text = item.text || item.caption || item.post || item.title || item.full_text;
            if (text) posts.push(text);
          });
        }
      }

      // Clean and filter posts
      const cleanedPosts = Array.from(new Set(posts))
        .map(p => p.trim())
        .filter(p => p.length > 5)
        .slice(0, 50); // Limit to 50 for demo/performance

      res.json({ 
        success: true, 
        platform, 
        count: cleanedPosts.length,
        posts: cleanedPosts 
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process archive" });
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
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
