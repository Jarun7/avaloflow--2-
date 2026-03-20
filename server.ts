import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ override: true });

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await prisma.dashboardStat.findMany();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats", details: error.message });
    }
  });

  app.get("/api/chart-data", async (req, res) => {
    const { type } = req.query;
    try {
      const chartData = await prisma.chartData.findMany({
        where: type ? { type: String(type) } : undefined,
        orderBy: { order: 'asc' }
      });
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await prisma.campaign.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { flow: true }
      });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = await prisma.campaign.create({
        data: req.body
      });

      // Increment active_campaigns stat
      const activeStat = await prisma.dashboardStat.findUnique({ where: { key: 'active_campaigns' } });
      if (activeStat) {
        const currentActive = parseInt(activeStat.value.replace(/,/g, '') || '0');
        await prisma.dashboardStat.update({
          where: { key: 'active_campaigns' },
          data: { value: (currentActive + 1).toString() }
        });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await prisma.campaign.delete({
        where: { id: req.params.id }
      });

      // Decrement active_campaigns stat
      const activeStat = await prisma.dashboardStat.findUnique({ where: { key: 'active_campaigns' } });
      if (activeStat) {
        const currentActive = parseInt(activeStat.value.replace(/,/g, '') || '0');
        await prisma.dashboardStat.update({
          where: { key: 'active_campaigns' },
          data: { value: Math.max(0, currentActive - 1).toString() }
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.post("/api/campaigns/:id/simulate", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const newDms = Math.floor(Math.random() * 50) + 10;
      const newComments = Math.floor(Math.random() * 20) + 5;

      const updatedCampaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'active',
          sentDms: { increment: newDms },
          comments: { increment: newComments },
          stat: 'Active',
        }
      });

      // Update Dashboard Stats
      const audienceStat = await prisma.dashboardStat.findUnique({ where: { key: 'total_audience' } });
      if (audienceStat) {
        const currentAudience = parseInt(audienceStat.value.replace(/,/g, '') || '0');
        const newAudience = currentAudience + newDms;
        await prisma.dashboardStat.update({
          where: { key: 'total_audience' },
          data: { value: newAudience.toLocaleString() }
        });
      }

      // Add Activity Log
      await prisma.activity.create({
        data: {
          title: `Campaign Executed: ${campaign.name}`,
          desc: `Sent ${newDms} DMs and replied to ${newComments} comments.`,
          icon: 'Rocket',
          color: 'bg-primary',
          category: 'Automation'
        }
      });

      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error simulating campaign:", error);
      res.status(500).json({ error: "Failed to simulate campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await prisma.campaign.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await prisma.campaign.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.get("/api/audiences", async (req, res) => {
    try {
      const audiences = await prisma.audience.findMany({
        include: {
          history: { orderBy: { time: 'desc' } },
          notes: { orderBy: { updatedAt: 'desc' } }
        }
      });
      
      const parsedAudiences = audiences.map(audience => ({
        ...audience,
        tags: typeof audience.tags === 'string' ? JSON.parse(audience.tags) : audience.tags,
        history: audience.history.map(h => ({
          ...h,
          details: typeof h.details === 'string' ? JSON.parse(h.details) : h.details
        }))
      }));
      
      res.json(parsedAudiences);
    } catch (error: any) {
      console.error("Error fetching audiences:", error);
      res.status(500).json({ error: "Failed to fetch audiences", details: error.message });
    }
  });

  app.get("/api/activity", async (req, res) => {
    try {
      const activity = await prisma.activity.findMany({
        orderBy: { time: 'desc' },
        take: 10
      });
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  app.post("/api/activity", async (req, res) => {
    try {
      const activity = await prisma.activity.create({
        data: req.body
      });
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await prisma.report.findMany({
        orderBy: { date: 'desc' }
      });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const report = await prisma.report.create({
        data: req.body
      });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      await prisma.report.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await prisma.template.findMany({
        orderBy: { usage: 'desc' }
      });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const { name, desc, category, icon } = req.body;
      if (!name || !desc || !category) {
        return res.status(400).json({ error: "Name, description, and category are required" });
      }
      const template = await prisma.template.create({
        data: {
          name: String(name).trim(),
          desc: String(desc).trim(),
          category: String(category).trim(),
          icon: String(icon || 'Zap').trim(),
          color: "bg-primary/10 text-primary",
          usage: 0,
          rating: 0,
        }
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Failed to create template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.get("/api/flows", async (req, res) => {
    try {
      const flows = await prisma.flow.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.json(flows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flows" });
    }
  });

  app.get("/api/flows/:id", async (req, res) => {
    try {
      const flow = await prisma.flow.findUnique({
        where: { id: req.params.id }
      });
      if (!flow) return res.status(404).json({ error: "Flow not found" });
      res.json(flow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flow" });
    }
  });

  app.post("/api/flows", async (req, res) => {
    try {
      const flow = await prisma.flow.create({
        data: req.body
      });
      res.json(flow);
    } catch (error) {
      res.status(500).json({ error: "Failed to create flow" });
    }
  });

  app.put("/api/flows/:id", async (req, res) => {
    try {
      const flow = await prisma.flow.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(flow);
    } catch (error) {
      res.status(500).json({ error: "Failed to update flow" });
    }
  });

  app.delete("/api/flows/:id", async (req, res) => {
    try {
      await prisma.flow.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete flow" });
    }
  });

  app.get("/api/library", async (req, res) => {
    try {
      const assets = await prisma.asset.findMany({
        orderBy: { date: 'desc' }
      });
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch library assets" });
    }
  });

  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await prisma.account.findMany();
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
