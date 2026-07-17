const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedListings = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/valora';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    // 1. Create or Find Seller User
    const sellerEmail = 'seller@valora.com';
    let seller = await User.findOne({ email: sellerEmail });

    if (!seller) {
      console.log(`Creating mock seller account "${sellerEmail}"...`);
      seller = new User({
        name: 'Arsalaan Khan (Seller)',
        email: sellerEmail,
        password: 'password123', // Will be auto-hashed by pre-save hook
        role: 'seller',
        phone: '+919876543210',
        responseRate: 98,
        pastDealsCount: 14
      });
      await seller.save();
      console.log('Seller account created successfully.');
    } else {
      console.log('Existing seller account found.');
    }

    // 2. Clear Existing Listings
    console.log('Clearing existing listings...');
    await Listing.deleteMany({});
    console.log('Listings cleared.');

    // 3. Define Seed Data
    const listingsData = [
      {
        seller: seller._id,
        brand: 'Mercedes-Benz',
        model: 'E-Class E200',
        year: 2021,
        kmDriven: 18500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        price: 4800000,
        description: 'Single-owner Mercedes E-Class. Kept in pristine condition, serviced regularly at authorised dealership. Original paint, zero accidents, full insurance cover.',
        images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80'],
        conditionScore: 9.2,
        trustScore: 94,
        riskFlag: 'Low',
        fraudProbability: 0.02,
        predictedPriceMin: 4700000,
        predictedPriceMax: 4950000,
        confidenceLevel: 'High',
        featureImportance: { mileage: 0.1, age: 0.05, condition: 0.8 },
        status: 'active'
      },
      {
        seller: seller._id,
        brand: 'Audi',
        model: 'A4 35 TDI',
        year: 2019,
        kmDriven: 52000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        price: 3200000,
        description: 'Audi A4 in pristine white. Mechanically sound and well-kept but listed slightly above regional market value.',
        images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80'],
        conditionScore: 7.5,
        trustScore: 61, // Lower score due to pricing variance
        riskFlag: 'Low',
        fraudProbability: 0.05,
        predictedPriceMin: 2400000,
        predictedPriceMax: 2750000,
        confidenceLevel: 'High',
        featureImportance: { mileage: 0.3, age: 0.4, condition: 0.2 },
        status: 'active'
      },
      {
        seller: seller._id,
        brand: 'Hyundai',
        model: 'i20 Asta',
        year: 2020,
        kmDriven: 34000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        price: 650000,
        description: 'Hyundai i20. Mechanically perfect. Scanned by CNN condition model: minor scratches detected on the front bumper and left rear door, priced accordingly.',
        images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80'],
        conditionScore: 5.8,
        trustScore: 78,
        riskFlag: 'Low',
        fraudProbability: 0.03,
        predictedPriceMin: 620000,
        predictedPriceMax: 680000,
        confidenceLevel: 'Medium',
        detectedDamages: [
          { part: 'bumper_front', damageType: 'scratch', confidence: 0.91 },
          { part: 'door_rear_left', damageType: 'dent', confidence: 0.85 }
        ],
        featureImportance: { condition: 0.6, mileage: 0.2, age: 0.2 },
        status: 'active'
      },
      {
        seller: seller._id,
        brand: 'BMW',
        model: '3 Series 320d',
        year: 2018,
        kmDriven: 85000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        price: 2100000,
        description: 'BMW 3 Series. High mileage highway cruiser. Priced slightly low for an urgent sale.',
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'],
        conditionScore: 6.8,
        trustScore: 74,
        riskFlag: 'Medium',
        fraudProbability: 0.38,
        predictedPriceMin: 2200000,
        predictedPriceMax: 2450000,
        confidenceLevel: 'Medium',
        featureImportance: { mileage: 0.5, age: 0.3, condition: 0.2 },
        status: 'active'
      },
      {
        seller: seller._id,
        brand: 'Toyota',
        model: 'Fortuner 4x4',
        year: 2022,
        kmDriven: 21000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        price: 3900000,
        description: 'Immaculate Fortuner 4x4 Automatic. Leather seats, off-road package, complete service logs available.',
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'],
        conditionScore: 9.5,
        trustScore: 96,
        riskFlag: 'Low',
        fraudProbability: 0.01,
        predictedPriceMin: 3800000,
        predictedPriceMax: 4100000,
        confidenceLevel: 'High',
        featureImportance: { mileage: 0.2, age: 0.1, condition: 0.7 },
        status: 'active'
      },
      {
        seller: seller._id,
        brand: 'Honda',
        model: 'City V',
        year: 2022,
        kmDriven: 4500,
        fuelType: 'Petrol',
        transmission: 'Manual',
        price: 400000, // Highly underpriced scam warning
        description: 'Brand new Honda City. Single owner. Relocating abroad, urgent sale. Pay a 10% advance deposit to secure deal.',
        images: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80'],
        conditionScore: 9.8,
        trustScore: 18, // Severe warning trust score
        riskFlag: 'High', // Flagged for review
        fraudProbability: 0.94,
        predictedPriceMin: 1150000,
        predictedPriceMax: 1300000,
        confidenceLevel: 'High',
        featureImportance: { price: 0.9, mileage: 0.05, age: 0.05 },
        status: 'pending_review' // Blocked from public view
      }
    ];

    console.log('Seeding listings...');
    await Listing.insertMany(listingsData);
    console.log('Listings seeded successfully.');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
};

seedListings();
