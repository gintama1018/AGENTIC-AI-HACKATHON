import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/db.json');

// In-memory / file backed store
let localDb = {
  users: [],
  returns: [],
  product_stats: [],
  recommendations: [],
  integrations: [],
  runs: [],
  analyses: [],
  interventions: [],
  feedback: []
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
      const parsed = JSON.parse(data);
      localDb = {
        users: parsed.users || [],
        returns: parsed.returns || [],
        product_stats: parsed.product_stats || [],
        recommendations: parsed.recommendations || [],
        integrations: parsed.integrations || [],
        runs: parsed.runs || [],
        analyses: parsed.analyses || [],
        interventions: parsed.interventions || [],
        feedback: parsed.feedback || []
      };
    }
  } catch (err) {
    console.error('Failed to read DB file, initializing empty store:', err.message);
  }
};

export const initDb = async () => {
  loadLocalDb();
  console.log(' Local Persistent Storage Engine active (runs, analyses, recommendations, interventions)');
};

export const getDb = () => localDb;

export const saveDb = () => {
  persistLocalDb();
};
