import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const getInitialSeedData = () => {
  const hashedPassword = bcrypt.hashSync('demo1234', 10);

  const defaultUser = {
    _id: 'user_demo_001',
    name: 'Sarah Jenkins',
    email: 'sarah@aurorafashion.com',
    password_hash: hashedPassword,
    company_name: 'Aurora Apparel & Goods',
    role: 'Operations Director',
    created_at: '2026-07-01T00:00:00.000Z'
  };

  const sampleProducts = [
    { id: 'PRD-701', name: 'Vintage Heavyweight Denim Jacket', category: 'Apparel', price: 89.00 },
    { id: 'PRD-802', name: 'Ultra-Comfort Knit Joggers', category: 'Apparel', price: 45.00 },
    { id: 'PRD-903', name: 'ProSound ANC Wireless Headphones', category: 'Electronics', price: 129.99 },
    { id: 'PRD-404', name: 'Ceramic Pour-Over Coffee Dripper', category: 'Home & Kitchen', price: 34.50 },
    { id: 'PRD-505', name: 'Organic Silk Pillowcase (2-Pack)', category: 'Home Goods', price: 58.00 },
    { id: 'PRD-606', name: 'Waterproof All-Terrain Trail Shoes', category: 'Footwear', price: 110.00 },
    { id: 'PRD-307', name: 'GlowBoost Vitamin C Face Serum', category: 'Cosmetics', price: 38.00 },
    { id: 'PRD-208', name: 'Ergonomic Memory Foam Lumbar Cushion', category: 'Accessories', price: 42.00 }
  ];

  const rawReturnTemplates = [
    {
      prodIdx: 0,
      comment: "Ordered a Large but fits like a Medium. Can't even button the chest comfortably when wearing a light tee.",
      rawReason: "Too small",
      aiCat: "Size & Fit Mismatch",
      conf: 0.96,
      rootCause: "Sizing chest circumference runs 2.2 inches tighter than standard US/EU measurement spec.",
      mitigation: "Update size guide on PDP with high-visibility 'Runs Small' banner.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 1
    },
    {
      prodIdx: 0,
      comment: "Arms are way too tight around the bicep area. Length is fine though.",
      rawReason: "Size mismatch",
      aiCat: "Size & Fit Mismatch",
      conf: 0.94,
      rootCause: "Sleeve pitch and armhole opening taper too aggressively for jacket weight class.",
      mitigation: "Instruct garment supplier to relax upper-sleeve pattern radius by 1.2 inches.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 2
    },
    {
      prodIdx: 0,
      comment: "Third time wearing it and the left copper button popped right off when unbuttoning.",
      rawReason: "Defective item",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.98,
      rootCause: "Sub-gauge shank rivets failing under moderate shearing torque.",
      mitigation: "Quarantine Batch #D409 button hardware and switch to reinforced steel studs.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 4
    },
    {
      prodIdx: 0,
      comment: "Color is much lighter than shown. The site picture is deep indigo, this is faded sky blue.",
      rawReason: "Color discrepancy",
      aiCat: "Listing & Color Variance",
      conf: 0.92,
      rootCause: "PDP studio wash imagery was shot under 6500K strobe lighting without gamma compensation.",
      mitigation: "Re-photograph denim wash under standard daylight Kelvin ratings.",
      severity: "medium",
      sentiment: "negative",
      daysAgo: 5
    },
    {
      prodIdx: 0,
      comment: "Fit around torso is really boxy and stiff. Just didn't like how it looked on me.",
      rawReason: "Buyer changed mind",
      aiCat: "Buyer Remorse / Intent Shift",
      conf: 0.89,
      rootCause: "14oz rigid unwashed denim requires break-in period not clarified on product page.",
      mitigation: "Add customer onboarding video on how to soften and break in raw denim.",
      severity: "low",
      sentiment: "neutral",
      daysAgo: 7
    },
    {
      prodIdx: 1,
      comment: "Waistband elastic snapped inside the casing after first 30° cold wash cycle.",
      rawReason: "Defective quality",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.97,
      rootCause: "Poly-elastane blend degraded due to low melting point internal bonding thread.",
      mitigation: "Issue non-conformance ticket to factory and replace waistband cord supplier.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 2
    },
    {
      prodIdx: 1,
      comment: "Way too long! I am 5'10 and the cuffs bunch up around my shoes by 3 inches.",
      rawReason: "Too long",
      aiCat: "Size & Fit Mismatch",
      conf: 0.93,
      rootCause: "Inseam graded at 32.5 inches without short/tall sizing variants available.",
      mitigation: "Introduce Short (30\") and Regular (32\") inseam options on listing.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 6
    },
    {
      prodIdx: 1,
      comment: "Material is thinner than expected, almost see-through under bright light.",
      rawReason: "Misleading material",
      aiCat: "Listing & Color Variance",
      conf: 0.91,
      rootCause: "Listing copy describes 'heavyweight fleece' while 220 GSM single jersey was used.",
      mitigation: "Correct listing fabric specification from heavyweight fleece to lightweight French terry.",
      severity: "medium",
      sentiment: "negative",
      daysAgo: 9
    },
    {
      prodIdx: 2,
      comment: "Left earbud stopped charging after 4 days. Red LED flashes constantly in the case.",
      rawReason: "Broken hardware",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.99,
      rootCause: "Pogo pin spring contact corrosion/misalignment in charging cradle.",
      mitigation: "Recalibrate contact pin alignment jig at factory assembly line.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 1
    },
    {
      prodIdx: 2,
      comment: "ANC has a faint high-pitch buzzing noise when connected to MacBook over Bluetooth.",
      rawReason: "Audio defect",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.95,
      rootCause: "Firmware DAC sampling clock jitter on AAC codec stream.",
      mitigation: "Push OTA firmware update v1.4.2 addressing Bluetooth sampling filter.",
      severity: "critical",
      sentiment: "negative",
      daysAgo: 3
    },
    {
      prodIdx: 2,
      comment: "Earcups are too small for large ears. Causes intense pain after 45 minutes of use.",
      rawReason: "Uncomfortable fit",
      aiCat: "Size & Fit Mismatch",
      conf: 0.92,
      rootCause: "Inner cup depth is only 18mm with firm foam density causing cartilage pressure.",
      mitigation: "Release velour plush deep-cushion accessory kit with 24mm depth.",
      severity: "medium",
      sentiment: "negative",
      daysAgo: 8
    },
    {
      prodIdx: 2,
      comment: "Delivery box looked like it was stepped on by the courier, headphones had a cracked headband.",
      rawReason: "Shipping transit damage",
      aiCat: "Logistics & Transit Damage",
      conf: 0.97,
      rootCause: "Retail packaging lacks internal crush-resistant cardboard structural bridge.",
      mitigation: "Add rigid inner sleeve and mandate bubble-wrap outer envelopes for parcel dispatch.",
      severity: "high",
      sentiment: "very_negative",
      daysAgo: 10
    },
    {
      prodIdx: 3,
      comment: "Dripper arrived cracked down the middle. Ceramic pieces were loose in the bubble envelope.",
      rawReason: "Broken on arrival",
      aiCat: "Logistics & Transit Damage",
      conf: 0.98,
      rootCause: "Shipped in padded mailer rather than rigid corrugated box with molded pulp insert.",
      mitigation: "Mandate Box-in-Box packaging standard for all fragile kitchenware SKUs.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 1
    },
    {
      prodIdx: 3,
      comment: "Ordered matte black, received glossy turquoise blue. Incorrect item in box.",
      rawReason: "Wrong item received",
      aiCat: "Warehouse Fulfillment Error",
      conf: 0.99,
      rootCause: "Supplier barcode label on box exterior mapped to turquoise SKU instead of matte black.",
      mitigation: "Audit inventory barcodes at receiving dock and re-label affected warehouse batch.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 4
    },
    {
      prodIdx: 4,
      comment: "Doesn't feel like 100% Mulberry silk. Feels more like synthetic satin polyester.",
      rawReason: "Material not as described",
      aiCat: "Listing & Color Variance",
      conf: 0.93,
      rootCause: "Listing omitted 19-Momme rating specification and OEKO-TEX certification details.",
      mitigation: "Upload certified laboratory silk momme test report badge to PDP image carousel.",
      severity: "medium",
      sentiment: "negative",
      daysAgo: 3
    },
    {
      prodIdx: 4,
      comment: "Zipper on pillowcase pulled right off the track on day two.",
      rawReason: "Broken zipper",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.96,
      rootCause: "Missing zipper end-stop metal crimp during blind seam finishing.",
      mitigation: "Enforce automated ultrasonic end-stop crimping with textile subcontractor.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 11
    },
    {
      prodIdx: 5,
      comment: "Stepped in shallow puddle and my socks were soaked in seconds. Definitely not waterproof.",
      rawReason: "Defective waterproofing",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.97,
      rootCause: "Hydrophobic membrane seam-tape failure along lower tongue gusset.",
      mitigation: "Audit supplier vulcanized seam taping machines and test batch hydro-pressure.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 2
    },
    {
      prodIdx: 5,
      comment: "Toe box is extremely narrow. My toes were completely squished.",
      rawReason: "Too narrow",
      aiCat: "Size & Fit Mismatch",
      conf: 0.95,
      rootCause: "Last shape constructed on European narrow D-width standard rather than wide trail last.",
      mitigation: "Add Wide (EE) width option and add sizing advisory for trail running socks.",
      severity: "high",
      sentiment: "negative",
      daysAgo: 5
    },
    {
      prodIdx: 6,
      comment: "Serum turned dark orange/brown within 1 week of delivery, oxidized and smells acidic.",
      rawReason: "Spoiled product",
      aiCat: "Quality / Manufacturing Defect",
      conf: 0.96,
      rootCause: "Dropper bottle cap does not have airtight nitrogen seal, degrading L-ascorbic acid.",
      mitigation: "Switch to amber airless pump bottle packaging to prevent air oxidation.",
      severity: "critical",
      sentiment: "very_negative",
      daysAgo: 3
    },
    {
      prodIdx: 7,
      comment: "Way too hard, like sitting against a brick. Doesn't mold to back at all.",
      rawReason: "Too firm",
      aiCat: "Buyer Remorse / Intent Shift",
      conf: 0.88,
      rootCause: "Memory foam density rating is 60D (extra firm orthotic grade) which feels hard in cold ambient temp.",
      mitigation: "Include product temperature-responsive acclimation card inside box.",
      severity: "low",
      sentiment: "neutral",
      daysAgo: 8
    }
  ];

  // Generate 55+ realistic return records distributed across the last 30 days
  const returns = [];
  const now = new Date();

  // Create initial structured returns
  rawReturnTemplates.forEach((tpl, idx) => {
    const prod = sampleProducts[tpl.prodIdx];
    const returnDate = new Date(now.getTime() - (tpl.daysAgo * 24 * 60 * 60 * 1000) - (idx * 3600000)).toISOString();
    
    returns.push({
      _id: `ret_${idx + 1001}`,
      user_id: defaultUser._id,
      order_id: `ORD-${92000 + idx}`,
      customer_name: ['Alex Rivera', 'Emily Chen', 'Marcus Vance', 'David Miller', 'Sophia Patel', 'Liam Brooks', 'Chloe Bennett', 'Noah Sullivan'][idx % 8],
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

  // Generate additional historical return points across past 4 weeks to create stunning trend lines
  for (let w = 1; w <= 4; w++) {
    for (let i = 0; i < 8; i++) {
      const template = rawReturnTemplates[i % rawReturnTemplates.length];
      const prod = sampleProducts[template.prodIdx];
      const randomHours = Math.floor(Math.random() * 168); // within week
      const returnDate = new Date(now.getTime() - (w * 7 * 24 * 60 * 60 * 1000) + (randomHours * 3600000)).toISOString();
      const returnId = `ret_hist_${w}_${i}`;

      returns.push({
        _id: returnId,
        user_id: defaultUser._id,
        order_id: `ORD-${85000 + (w * 100) + i}`,
        customer_name: ['Olivia Martin', 'James Wilson', 'Emma Watson', 'Lucas Garcia', 'Ava Taylor', 'Ethan Anderson', 'Mia Thomas', 'William Jackson'][i % 8],
        product_id: prod.id,
        product_name: prod.name,
        category: prod.category,
        product_price: prod.price,
        customer_comment: template.comment,
        return_reason_raw: template.rawReason,
        ai_reason_category: template.aiCat,
        ai_confidence: parseFloat((0.91 + (Math.random() * 0.07)).toFixed(2)),
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
      api_key: 'rsh_live_9948fa812bc802f6ae4e',
      sync_interval: 'hourly',
      auto_analyze: true,
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
