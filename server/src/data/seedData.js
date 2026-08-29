import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const getInitialSeedData = () => {
  const hashedPassword = bcrypt.hashSync('demo1234', 10);

  const defaultUser = {
    _id: 'user_demo_001',
    name: 'Sonu Jangir',
    email: 'Sonu.jangir2024@uem.edu.in',
    password_hash: hashedPassword,
    company_name: 'BharatThreads Lifestyle Pvt. Ltd.',
    role: 'Head of E-Commerce Operations',
    location: 'Bengaluru, Karnataka, India',
    created_at: '2026-07-01T00:00:00.000Z'
  };

  const sampleProducts = [
    { id: 'SKU-IND-101', name: 'Handcrafted Chanderi Silk Anarkali Kurta Set', category: 'Ethnic Wear', price: 2499.00 },
    { id: 'SKU-IND-202', name: 'Slim Fit Stretch Denim Jeans (Dark Indigo)', category: 'Men Apparel', price: 1599.00 },
    { id: 'SKU-IND-303', name: 'BassPro ANC Wireless Earbuds (TWS)', category: 'Electronics', price: 2999.00 },
    { id: 'SKU-IND-404', name: 'Traditional Brass South Indian Filter Coffee Maker', category: 'Kitchen & Dining', price: 849.00 },
    { id: 'SKU-IND-505', name: 'Pure Mulberry Silk Festive Dupatta (2-Piece)', category: 'Ethnic Wear', price: 1899.00 },
    { id: 'SKU-IND-606', name: 'All-Terrain Cushioned Running Shoes', category: 'Footwear', price: 2899.00 },
    { id: 'SKU-IND-707', name: 'Kumkumadi Ayurvedic Radiance Face Oil (30ml)', category: 'Beauty & Skincare', price: 999.00 },
    { id: 'SKU-IND-808', name: 'Ergonomic Memory Foam Orthopedic Backrest Cushion', category: 'Home & Office', price: 1299.00 }
  ];

  const rawReturnTemplates = [
    {
      prodIdx: 0,
      comment: "Ordered Size L (40 bust) as per chart, but it's way too tight across the shoulders and chest. Can't even wear it comfortably.",
      rawReason: "Size too small",
      aiCat: "Size & Fit Mismatch",
      conf: 0.97,
      rootCause: "Kurta bodice chest circumference is 2.5 inches smaller than standard Indian ethnic wear sizing spec (Kurti chest graded 37.5\" instead of 40\").",
      mitigation: "Update size chart on Myntra/Shopify PDP with bust/shoulder measurements in inches and cm with 'Runs Small' tag.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 1
    },
    {
      prodIdx: 0,
      comment: "Zari embroidery around neck area is coming loose and itching against the collarbone.",
      rawReason: "Quality defect",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.96,
      rootCause: "Unbacked metallic zari thread with loose lockstitch prone to unraveling on friction.",
      mitigation: "Enforce soft cotton lining backing behind embroidered neckline at Surat manufacturing unit.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 2
    },
    {
      prodIdx: 0,
      comment: "Color in picture looks royal emerald green, but received washed-out parrot green. Very disappointing for wedding wear.",
      rawReason: "Color different from picture",
      aiCat: "Listing & Color Variance",
      conf: 0.94,
      rootCause: "Studio lighting over-saturated RGB highlights creating a 22% delta on green silk fabric under natural daylight.",
      mitigation: "Re-shoot catalogue photography under standard 5000K daylight and add customer unboxing swatch video.",
      severity: "medium",
      sentiment: "negative",
      daysAgo: 4
    },
    {
      prodIdx: 1,
      comment: "Waist fits fine, but length is too long. Inseam is 34 inches, drags below heels on Indian height.",
      rawReason: "Length too long",
      aiCat: "Size & Fit Mismatch",
      conf: 0.95,
      rootCause: "Pattern graded on Western 33.5\" inseam standard without Short (30\") variant for Indian average height.",
      mitigation: "Introduce 30-inch and 32-inch inseam length options on product page.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 2
    },
    {
      prodIdx: 1,
      comment: "Main front copper button broke off on first trial. Rivet quality is very weak.",
      rawReason: "Broken button / defect",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.98,
      rootCause: "Sub-gauge brass shank rivets failing under moderate shearing torque from Batch #IND-BLR-89.",
      mitigation: "Audit button rivet attachment torque at Tirupur/Bellary vendor facility.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 5
    },
    {
      prodIdx: 2,
      comment: "Right earbud stopped charging after 3 days. Red LED blinks continuously in case. Noise cancellation makes humming noise.",
      rawReason: "Defective hardware / not charging",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.99,
      rootCause: "Pogo-pin spring contact misalignment in charging dock causing zero-voltage latch.",
      mitigation: "Quarantine Batch #TWS-409 and mandate charging cradle voltage verification jig at Noida assembly line.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 1
    },
    {
      prodIdx: 2,
      comment: "Outer cardboard parcel was completely crushed by courier during transit. Left earbud shell had a hairline crack.",
      rawReason: "Courier transit damage",
      aiCat: "Logistics & Transit Damage",
      conf: 0.97,
      rootCause: "Single-wall 3-ply corrugated box crushed under hub conveyor sorted loads by courier partner.",
      mitigation: "Upgrade outer shipping box to 5-ply 150 GSM corrugated carton with internal bubble pouch wrap.",
      severity: "high",
      sentiment: "very_negative",
      daysAgo: 3
    },
    {
      prodIdx: 3,
      comment: "Ordered Brass Gold finish filter coffee maker, but received Stainless Steel silver. Wrong product dispatched.",
      rawReason: "Wrong item received",
      aiCat: "Warehouse Fulfillment Error",
      conf: 0.99,
      rootCause: "Barcode SKU sticker mismatch at Bhiwandi warehouse pick & pack station.",
      mitigation: "Implement optical barcode scan validation before generating Delhivery/BlueDart shipping label.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 2
    },
    {
      prodIdx: 3,
      comment: "Coffee dripper arrived with bent top rim and dent on side. Padded flyer was torn.",
      rawReason: "Damaged in delivery",
      aiCat: "Logistics & Transit Damage",
      conf: 0.98,
      rootCause: "Shipped in poly courier flyer instead of rigid box packaging for metallic kitchenware.",
      mitigation: "Enforce rigid Box-in-Box packaging standard across all fragile cookware SKUs.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 6
    },
    {
      prodIdx: 4,
      comment: "Fabric does not feel like pure silk. Feels more like synthetic poly-georgette. Border zari is stiff.",
      rawReason: "Material not as described",
      aiCat: "Listing & Color Variance",
      conf: 0.93,
      rootCause: "Product title states '100% Mulberry Silk' while blend is 40% Art-Silk Viscose.",
      mitigation: "Correct PDP specification to 'Art-Silk Festive Blend' and upload certified Silk Mark laboratory test badge.",
      severity: "medium",
      sentiment: "negative",
      daysAgo: 3
    },
    {
      prodIdx: 5,
      comment: "Toe box is extremely narrow for Indian feet. Caused blisters during first 20 min morning walk.",
      rawReason: "Uncomfortable / Narrow fit",
      aiCat: "Size & Fit Mismatch",
      conf: 0.96,
      rootCause: "Last shape constructed on narrow European D-width standard rather than wide Indian EE-width last.",
      mitigation: "Add Wide (EE) width variant and add sizing advisory recommending sizing up for broad feet.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 1
    },
    {
      prodIdx: 5,
      comment: "Sole separated completely from upper near the toe after 1 week of walking.",
      rawReason: "Sole peeling defect",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.98,
      rootCause: "Inadequate polyurethane adhesive curing time at Agra footwear contract manufacturer.",
      mitigation: "Issue non-conformance warning to factory and increase adhesive hot-press bonding dwell time.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 4
    },
    {
      prodIdx: 6,
      comment: "Oil turned dark brown and had a strong rancid smell on delivery. Seal was slightly leaking.",
      rawReason: "Leaked / Spoiled product",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.95,
      rootCause: "Dropper cap rubber teat degradation caused oxidation during high-temp transit.",
      mitigation: "Switch to airtight nitrogen-purged amber glass pump bottle with heat-induction foil seal.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 3
    },
    {
      prodIdx: 7,
      comment: "Way too hard, feels like a wooden plank against my car seat. Did not like the firmness.",
      rawReason: "Buyer changed mind / Too hard",
      aiCat: "Buyer Remorse / Intent Shift",
      conf: 0.88,
      rootCause: "High-density 60D orthopedic foam feels rigid in air-conditioned environments during initial usage.",
      mitigation: "Include product acclimation insert card explaining 5-day body posture adaptation curve.",
      severity: "low",
      sentiment: "neutral",
      daysAgo: 7
    }
  ];

  const indianNames = [
    'Rohan Sharma', 'Priya Patel', 'Vikram Singh', 'Ananya Iyer', 
    'Sneha Roy', 'Arjun Nair', 'Pooja Gupta', 'Amit Verma', 
    'Rahul Deshmukh', 'Kavita Reddy', 'Deepak Joshi', 'Neha Choudhary',
    'Aditya Banerjee', 'Ritu Aggarwal', 'Manish Kulkarni', 'Swati Mishra'
  ];

  const returns = [];
  const now = new Date();

  // Create initial structured returns
  rawReturnTemplates.forEach((tpl, idx) => {
    const prod = sampleProducts[tpl.prodIdx];
    const returnDate = new Date(now.getTime() - (tpl.daysAgo * 24 * 60 * 60 * 1000) - (idx * 3600000)).toISOString();
    
    returns.push({
      _id: `ret_ind_${idx + 1001}`,
      user_id: defaultUser._id,
      order_id: `ORD-IN-${92000 + idx}`,
      customer_name: indianNames[idx % indianNames.length],
      product_id: prod.id,
      product_name: prod.name,
      category: prod.category,
      product_price: prod.price,
      customer_comment: tpl.comment,
      return_reason_raw: tpl.rawReason,
      ai_reason_category: tpl.aiCat,
      ai_confidence: tpl.conf,
      ai_root_cause: tpl.rootCause,
      ai_mitigation_fix: tpl.mitigation,
      sentiment: tpl.sentiment,
      severity: tpl.severity,
      status: 'analyzed',
      return_date: returnDate,
      created_at: returnDate
    });
  });

  // Generate additional historical return points across past 4 weeks
  for (let w = 1; w <= 4; w++) {
    for (let i = 0; i < 9; i++) {
      const template = rawReturnTemplates[i % rawReturnTemplates.length];
      const prod = sampleProducts[template.prodIdx];
      const randomHours = Math.floor(Math.random() * 168);
      const returnDate = new Date(now.getTime() - (w * 7 * 24 * 60 * 60 * 1000) + (randomHours * 3600000)).toISOString();
      const returnId = `ret_hist_in_${w}_${i}`;

      returns.push({
        _id: returnId,
        user_id: defaultUser._id,
        order_id: `ORD-IN-${85000 + (w * 100) + i}`,
        customer_name: indianNames[(i + w * 2) % indianNames.length],
        product_id: prod.id,
        product_name: prod.name,
        category: prod.category,
        product_price: prod.price,
        customer_comment: template.comment,
        return_reason_raw: template.rawReason,
        ai_reason_category: template.aiCat,
        ai_confidence: parseFloat((0.92 + (Math.random() * 0.06)).toFixed(2)),
        ai_root_cause: template.rootCause,
        ai_mitigation_fix: template.mitigation,
        sentiment: template.sentiment,
        severity: template.severity,
        status: 'analyzed',
        return_date: returnDate,
        created_at: returnDate
      });
    }
  }

  // Integrations default setup
  const integrations = [
    {
      _id: 'int_001',
      user_id: defaultUser._id,
      n8n_webhook_url: 'https://primary-production-n8n.cloud/webhook/returnshield-ai-v2',
      google_sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      api_key: 'rsh_live_india_9948fa812bc802f6ae4e',
      sync_interval: 'hourly',
      auto_analyze: true,
      courier_partners: ['Delhivery', 'BlueDart', 'Shadowfax', 'Xpressbees'],
      last_sync: new Date().toISOString(),
      created_at: '2026-07-01T00:00:00.000Z'
    }
  ];

  return {
    users: [defaultUser],
    returns,
    product_stats: [],
    recommendations: [],
    integrations
  };
};
