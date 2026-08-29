import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/db.json');

// In-memory / file backed store
let localDb = {
  users: [],
  returns: [],
  product_stats: [],
  recommendations: [],
  integrations: []
};

// Helper to save to disk
const persistLocalDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist DB to file:', err.message);
  }
};

// Helper to load from disk
const loadLocalDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      localDb = JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read DB file, initializing empty store:', err.message);
  }
};

let isConnectedToMongo = false;

export const initDb = async () => {
  loadLocalDb();
  
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      isConnectedToMongo = true;
      console.log(' Connected to MongoDB Atlas');
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, falling back to persistent JSON storage:', err.message);
      isConnectedToMongo = false;
    }
  } else {
    console.log(' Local Persistent Storage Engine active (zero-config, high speed)');
  }
};

export const getDb = () => localDb;

export const saveDb = () => {
  persistLocalDb();
};

export const isMongo = () => isConnectedToMongo;
