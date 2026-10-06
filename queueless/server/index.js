import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Zone from './models/Zone.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

app.use(cors());
app.use(express.json());

// Seed initial zones if collection is empty
const seedZones = async () => {
  try {
    const count = await Zone.countDocuments();
    if (count === 0) {
      const defaultZones = [
        { slug: 'canteen', name: 'Canteen', avgTimePerPerson: 2, currentToken: 0, lastTokenGiven: 0 },
        { slug: 'library', name: 'Library', avgTimePerPerson: 3, currentToken: 0, lastTokenGiven: 0 },
        { slug: 'lab', name: 'Lab', avgTimePerPerson: 5, currentToken: 0, lastTokenGiven: 0 },
        { slug: 'office', name: 'Office', avgTimePerPerson: 4, currentToken: 0, lastTokenGiven: 0 },
      ];
      await Zone.insertMany(defaultZones);
      console.log('✅ Initialized default zones (Canteen, Library, Lab, Office)');
    }
  } catch (err) {
    console.error('Error seeding zones:', err.message);
  }
};

// Database Connection with graceful fallback to in-memory server if local Mongo is unavailable
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/queueless';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`Could not connect to MongoDB at ${uri}: ${err.message}`);
    console.log('Starting MongoMemoryServer as fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to MongoMemoryServer at ${memUri}`);
    } catch (memErr) {
      console.error('Failed to start fallback in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
  await seedZones();
};

// --- Middleware ---
const requireAdminPin = (req, res, next) => {
  const pinHeader = req.headers['x-admin-pin'];
  if (!pinHeader || pinHeader !== ADMIN_PIN) {
    return res.status(401).json({ error: 'Invalid admin PIN' });
  }
  next();
};

// --- API Routes ---

// GET /api/zones - List all zones
app.get('/api/zones', async (req, res) => {
  try {
    const zones = await Zone.find().sort({ _id: 1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zones/:slug - Get one zone
app.get('/api/zones/:slug', async (req, res) => {
  try {
    const zone = await Zone.findOne({ slug: req.params.slug });
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:slug/token - Take a token
app.post('/api/zones/:slug/token', async (req, res) => {
  try {
    const updatedZone = await Zone.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { lastTokenGiven: 1 } },
      { new: true }
    );
    if (!updatedZone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    res.json({ token: updatedZone.lastTokenGiven, zone: updatedZone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:slug/next - Serve next token (Admin)
app.post('/api/zones/:slug/next', requireAdminPin, async (req, res) => {
  try {
    // Atomically increment currentToken only if currentToken < lastTokenGiven
    const updatedZone = await Zone.findOneAndUpdate(
      {
        slug: req.params.slug,
        $expr: { $lt: ['$currentToken', '$lastTokenGiven'] },
      },
      { $inc: { currentToken: 1 } },
      { new: true }
    );

    if (updatedZone) {
      return res.json(updatedZone);
    }

    // If no update occurred (either nobody waiting or zone not found)
    const existingZone = await Zone.findOne({ slug: req.params.slug });
    if (!existingZone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    // Return unchanged zone if no one is waiting
    res.json(existingZone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zones/:slug/reset - Reset zone queue (Admin)
app.post('/api/zones/:slug/reset', requireAdminPin, async (req, res) => {
  try {
    const updatedZone = await Zone.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: { currentToken: 0, lastTokenGiven: 0 } },
      { new: true }
    );

    if (!updatedZone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.json(updatedZone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 QueueLess Server running on http://localhost:${PORT}`);
  });
});
