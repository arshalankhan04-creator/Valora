# Valora — Mongoose Schema Reference

These field shapes are the source of truth for models/User.js, models/Listing.js,
and models/Inquiry.js. The ML-related fields on Listing must match the Node ↔ Django
API Contract in Valora_Team_Workflow.md section 8 exactly.

## User
- name: String, required
- email: String, required, unique
- password: String, required (hashed via bcrypt pre-save hook)
- role: String, enum ['buyer', 'seller', 'admin'], default 'buyer'
- phone: String, optional
- responseRate: Number, default 0
- pastDealsCount: Number, default 0
- savedListings: [ObjectId ref 'Listing'], default []
- timestamps: true (createdAt used as account age for Trust Score)

## Listing
- seller: ObjectId ref 'User', required
- brand: String, required
- model: String, required
- year: Number, required
- kmDriven: Number, required
- fuelType: String, enum ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'], required
- transmission: String, enum ['Manual', 'Automatic'], required
- price: Number, required
- description: String, optional
- images: [String] (file paths)

ML fields — populated later by Django via Node, default null/empty until integration:
- conditionScore: Number, default null
- detectedDamages: [{ part: String, damageType: String, confidence: Number }]
- predictedPriceMin: Number, default null
- predictedPriceMax: Number, default null
- confidenceLevel: String, default null
- featureImportance: Object, default null
- riskFlag: String, enum ['Low','Medium','High',null], default null
- fraudProbability: Number, default null
- trustScore: Number, default null
- trustBreakdown: Object, default null

- status: String, enum ['active','pending_review','sold','rejected'], default 'active'
- rejectionReason: String, default null
- timestamps: true
- index on { brand: 1, year: 1, price: 1 } for search/filter

## Inquiry
- listing: ObjectId ref 'Listing', required
- buyer: ObjectId ref 'User', required
- seller: ObjectId ref 'User', required
- messages: [{ sender: ObjectId ref 'User', text: String required, sentAt: Date default now }]
- timestamps: true