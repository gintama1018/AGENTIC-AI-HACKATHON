import { getDb, saveDb } from '../config/db.js';

export const handleWebhookResults = async (req, res) => {
  try {
    const payload = req.body;
    const db = getDb();

    // Payload can be a single return analysis result or array of results
    const results = Array.isArray(payload) ? payload : [payload];

    if (!results || results.length === 0) {
      return res.status(400).json({ message: 'No payload received' });
    }

    let updatedCount = 0;
    let insertedCount = 0;

    for (const item of results) {
      if (!item.order_id && !item._id) continue;

      const existingIndex = (db.returns || []).findIndex(r => 
        (item._id && r._id === item._id) || 
        (item.order_id && r.order_id === item.order_id)
      );

      if (existingIndex >= 0) {
        db.returns[existingIndex] = {
          ...db.returns[existingIndex],
          ...item,
          status: 'analyzed',
          analyzed_at: new Date().toISOString()
        };
        updatedCount++;
      } else {
        db.returns.unshift({
          ...item,
          status: 'analyzed',
          created_at: item.created_at || new Date().toISOString(),
          analyzed_at: new Date().toISOString()
        });
        insertedCount++;
      }
    }

    saveDb();

    res.status(200).json({
      success: true,
      message: `n8n webhook results processed successfully. Updated: ${updatedCount}, Inserted: ${insertedCount}`,
      updatedCount,
      insertedCount
    });
  } catch (err) {
    console.error('Error processing n8n webhook results:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
