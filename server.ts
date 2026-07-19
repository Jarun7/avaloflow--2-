import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import {
  isMetaConfigured,
  getLoginUrl,
  exchangeCodeForUserToken,
  getLongLivedUserToken,
  resolveConnectedInstagramAccounts,
} from "./server/meta";

dotenv.config({ override: true });

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await prisma.account.findMany({
        select: {
          id: true,
          name: true,
          followers: true,
          status: true,
          image: true,
          platform: true,
          igUserId: true,
          createdAt: true,
        },
      });
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const account = await prisma.account.create({
        data: req.body
      });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      await prisma.account.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // --- Meta (Instagram/Facebook) OAuth connect flow ---

  function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!cookieHeader) return out;
    for (const part of cookieHeader.split(";")) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
    return out;
  }

  app.get("/api/meta/status", (req, res) => {
    res.json({ configured: isMetaConfigured() });
  });

  app.get("/api/meta/connect", (req, res) => {
    if (!isMetaConfigured()) {
      return res.status(500).json({ error: "Meta app is not configured. Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI." });
    }
    const state = crypto.randomBytes(16).toString("hex");
    res.setHeader("Set-Cookie", `meta_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
    res.redirect(getLoginUrl(state));
  });

  app.get("/api/meta/callback", async (req, res) => {
    const { code, state, error, error_description } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(`/settings?meta_error=${encodeURIComponent(error_description || error)}`);
    }

    const cookies = parseCookies(req.headers.cookie);
    if (!state || !cookies.meta_oauth_state || state !== cookies.meta_oauth_state) {
      return res.redirect(`/settings?meta_error=${encodeURIComponent("Invalid OAuth state")}`);
    }
    res.setHeader("Set-Cookie", "meta_oauth_state=; HttpOnly; Path=/; Max-Age=0");

    try {
      const shortLived = await exchangeCodeForUserToken(code);
      const longLived = await getLongLivedUserToken(shortLived.access_token);
      const igAccounts = await resolveConnectedInstagramAccounts(longLived.access_token);

      if (igAccounts.length === 0) {
        return res.redirect(`/settings?meta_error=${encodeURIComponent("No Instagram Business account found on your Facebook Pages")}`);
      }

      const expiresAt = new Date(Date.now() + longLived.expires_in * 1000);

      await Promise.all(igAccounts.map((acc) =>
        prisma.account.upsert({
          where: { igUserId: acc.igUserId },
          update: {
            name: acc.profile.username,
            followers: String(acc.profile.followers_count ?? 0),
            image: acc.profile.profile_picture_url || "",
            status: "Active",
            pageId: acc.pageId,
            pageAccessToken: acc.pageAccessToken,
            tokenExpiresAt: expiresAt,
          },
          create: {
            name: acc.profile.username,
            followers: String(acc.profile.followers_count ?? 0),
            image: acc.profile.profile_picture_url || "",
            status: "Active",
            platform: "Instagram",
            igUserId: acc.igUserId,
            pageId: acc.pageId,
            pageAccessToken: acc.pageAccessToken,
            tokenExpiresAt: expiresAt,
          },
        })
      ));

      res.redirect("/settings?meta_connected=1");
    } catch (err) {
      console.error("Error completing Meta OAuth flow:", err);
      res.redirect(`/settings?meta_error=${encodeURIComponent("Failed to connect Instagram account")}`);
    }
  });

  app.get("/api/keywords", async (req, res) => {
    try {
      const keywords = await prisma.keyword.findMany();
      res.json(keywords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch keywords" });
    }
  });

  app.post("/api/keywords", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Keyword text is required" });
      const keyword = await prisma.keyword.create({
        data: { text }
      });
      res.json(keyword);
    } catch (error) {
      res.status(500).json({ error: "Failed to create keyword" });
    }
  });

  app.delete("/api/keywords/:id", async (req, res) => {
    try {
      await prisma.keyword.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete keyword" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await prisma.setting.findMany();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const { settings } = req.body; // Array of { key, value }
      if (!Array.isArray(settings)) return res.status(400).json({ error: "Settings array is required" });

      const updates = settings.map(s =>
        prisma.setting.update({
          where: { key: s.key },
          data: { value: String(s.value) }
        })
      );

      await Promise.all(updates);
      const updatedSettings = await prisma.setting.findMany();
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.get("/api/autodm", async (req, res) => {
    try {
      const automations = await prisma.autoDm.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.json(automations);
    } catch (error) {
      console.error("Error fetching autodm automations:", error);
      res.status(500).json({ error: "Failed to fetch automations" });
    }
  });

  app.post("/api/autodm", async (req, res) => {
    try {
      const automation = await prisma.autoDm.create({
        data: req.body
      });
      res.status(201).json(automation);
    } catch (error) {
      console.error("Error creating autodm automation:", error);
      res.status(500).json({ error: "Failed to create automation" });
    }
  });

  app.put("/api/autodm/:id", async (req, res) => {
    try {
      const automation = await prisma.autoDm.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(automation);
    } catch (error) {
      console.error("Error updating autodm automation:", error);
      res.status(500).json({ error: "Failed to update automation" });
    }
  });

  app.delete("/api/autodm/:id", async (req, res) => {
    try {
      await prisma.autoDm.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting autodm automation:", error);
      res.status(500).json({ error: "Failed to delete automation" });
    }
  });

  app.get("/api/autodm/events", async (req, res) => {
    try {
      const events = await prisma.autoDmEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { autoDm: { select: { name: true, sourceType: true } } }
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching autodm events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  const MOCK_CONTACTS = [
    { name: 'ava.rivers', avatar: 'https://picsum.photos/seed/contact1/100/100' },
    { name: 'jordan.k', avatar: 'https://picsum.photos/seed/contact2/100/100' },
    { name: 'mia_bakes', avatar: 'https://picsum.photos/seed/contact3/100/100' },
    { name: 'sam.creates', avatar: 'https://picsum.photos/seed/contact4/100/100' },
    { name: 'noah_eats', avatar: 'https://picsum.photos/seed/contact5/100/100' },
  ];

  app.post("/api/autodm/:id/simulate", async (req, res) => {
    try {
      const automation = await prisma.autoDm.findUnique({ where: { id: req.params.id } });
      if (!automation) return res.status(404).json({ error: "Automation not found" });

      const contact = MOCK_CONTACTS[Math.floor(Math.random() * MOCK_CONTACTS.length)];
      const keywords = Array.isArray(automation.keywords) ? automation.keywords as string[] : [];
      const triggerText = automation.triggerMode === 'any'
        ? "Loved this! 😍"
        : (keywords[Math.floor(Math.random() * keywords.length)] || "info");
      const messagesSent = 1 + (automation.askFollow ? 1 : 0) + (automation.askEmail ? 1 : 0);

      const [event, updated] = await Promise.all([
        prisma.autoDmEvent.create({
          data: {
            autoDmId: automation.id,
            contactName: contact.name,
            contactAvatar: contact.avatar,
            triggerText,
            messagesSent,
          }
        }),
        prisma.autoDm.update({
          where: { id: automation.id },
          data: {
            triggerCount: { increment: 1 },
            messagesSent: { increment: messagesSent },
            uniqueUsers: { increment: 1 },
          }
        })
      ]);

      res.json({ event, automation: updated });
    } catch (error) {
      console.error("Error simulating autodm activity:", error);
      res.status(500).json({ error: "Failed to simulate activity" });
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
}

startServer();
