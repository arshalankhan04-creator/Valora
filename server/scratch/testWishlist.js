const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { addWishlistItem, removeWishlistItem, getWishlist } = require('../controllers/wishlistController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valora';

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

const runDirectTests = async () => {
  console.log('--- RUNNING DIRECT CONTROLLER TESTS ---');
  
  // Connect to DB
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  // Create clean slate users & listing
  const seller = await User.create({
    name: 'Seller User',
    email: `seller_${Date.now()}@valora.com`,
    password: 'password123',
    role: 'seller'
  });

  const buyer = await User.create({
    name: 'Buyer User',
    email: `buyer_${Date.now()}@valora.com`,
    password: 'password123',
    role: 'buyer'
  });

  const activeListing = await Listing.create({
    seller: seller._id,
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    kmDriven: 30000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    price: 1800000,
    status: 'active'
  });

  const pendingListing = await Listing.create({
    seller: seller._id,
    brand: 'Honda',
    model: 'Accord',
    year: 2021,
    kmDriven: 20000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    price: 2500000,
    status: 'pending_review'
  });

  const fakeId = new mongoose.Types.ObjectId().toString();
  const malformedId = 'not-a-valid-id';

  let req, res, next;

  // Test 1: Add malformed ID
  console.log('\n[TEST 1] Add malformed ID (should return 404)...');
  req = { params: { listingId: malformedId }, user: { id: buyer._id } };
  res = mockResponse();
  next = (err) => console.log('Next error:', err.message);
  await addWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 404) console.log('PASS'); else console.log('FAIL');

  // Test 2: Add nonexistent ID
  console.log('\n[TEST 2] Add nonexistent ID (should return 404)...');
  req = { params: { listingId: fakeId }, user: { id: buyer._id } };
  res = mockResponse();
  await addWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 404) console.log('PASS'); else console.log('FAIL');

  // Test 3: Add pending/non-active listing
  console.log('\n[TEST 3] Add pending listing (should return 400)...');
  req = { params: { listingId: pendingListing._id.toString() }, user: { id: buyer._id } };
  res = mockResponse();
  await addWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 400 && res.jsonData.message.includes('active')) console.log('PASS'); else console.log('FAIL');

  // Test 4: Add valid active listing
  console.log('\n[TEST 4] Add active listing (should return 200)...');
  req = { params: { listingId: activeListing._id.toString() }, user: { id: buyer._id } };
  res = mockResponse();
  await addWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 200 && res.jsonData.message.includes('added')) console.log('PASS'); else console.log('FAIL');

  // Test 5: Add duplicate listing
  console.log('\n[TEST 5] Add duplicate listing (should return 400)...');
  req = { params: { listingId: activeListing._id.toString() }, user: { id: buyer._id } };
  res = mockResponse();
  await addWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 400 && res.jsonData.message.includes('already')) console.log('PASS'); else console.log('FAIL');

  // Test 6: Get wishlist populated
  console.log('\n[TEST 6] Get wishlist (should return populated listing array)...');
  req = { user: { id: buyer._id } };
  res = mockResponse();
  await getWishlist(req, res, next);
  console.log('Status:', res.statusCode, 'Data length:', res.jsonData.length);
  if (res.statusCode === 200 && res.jsonData.length === 1 && res.jsonData[0].brand === 'Honda') {
    console.log('Populated seller field:', res.jsonData[0].seller);
    if (res.jsonData[0].seller && res.jsonData[0].seller.name === 'Seller User') {
      console.log('PASS');
    } else {
      console.log('FAIL - seller not populated');
    }
  } else {
    console.log('FAIL');
  }

  // Test 7: Remove wishlisted item
  console.log('\n[TEST 7] Remove wishlisted item (should return 200)...');
  req = { params: { listingId: activeListing._id.toString() }, user: { id: buyer._id } };
  res = mockResponse();
  await removeWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 200 && res.jsonData.savedListings.length === 0) console.log('PASS'); else console.log('FAIL');

  // Test 8: Remove wishlisted item again (idempotent, should return 200)
  console.log('\n[TEST 8] Remove item again (should return 200)...');
  req = { params: { listingId: activeListing._id.toString() }, user: { id: buyer._id } };
  res = mockResponse();
  await removeWishlistItem(req, res, next);
  console.log('Status:', res.statusCode, 'Data:', res.jsonData);
  if (res.statusCode === 200 && res.jsonData.savedListings.length === 0) console.log('PASS'); else console.log('FAIL');

  // Test 9: Dead references cleanup
  console.log('\n[TEST 9] Test dead references cleanup...');
  // Add listing first
  req = { params: { listingId: activeListing._id.toString() }, user: { id: buyer._id } };
  res = mockResponse();
  await addWishlistItem(req, res, next);
  // Delete the listing physically from the database
  await Listing.findByIdAndDelete(activeListing._id);
  console.log('Listing physically deleted from database.');
  // Fetch wishlist (should gracefully filter out the null and clean up the database reference)
  req = { user: { id: buyer._id } };
  res = mockResponse();
  await getWishlist(req, res, next);
  console.log('Status:', res.statusCode, 'Returned wishlist length:', res.jsonData.length);
  // Check user document directly
  const updatedUser = await User.findById(buyer._id);
  console.log('Database savedListings length after retrieval:', updatedUser.savedListings.length);
  if (res.statusCode === 200 && res.jsonData.length === 0 && updatedUser.savedListings.length === 0) {
    console.log('PASS');
  } else {
    console.log('FAIL');
  }

  // Cleanup test users & remaining listing
  await User.findByIdAndDelete(seller._id);
  await User.findByIdAndDelete(buyer._id);
  await Listing.findByIdAndDelete(pendingListing._id);
  console.log('\nCleanup complete.');
  
  await mongoose.disconnect();
};

const runHttpTests = async () => {
  console.log('--- RUNNING HTTP ENDPOINT TESTS ---');
  const authUrl = 'http://127.0.0.1:5000/api/auth';
  const wishlistUrl = 'http://127.0.0.1:5000/api/wishlist';
  const listingsUrl = 'http://127.0.0.1:5000/api/listings';

  const sellerEmail = `seller_w_${Date.now()}@valora.com`;
  const buyerEmail = `buyer_w_${Date.now()}@valora.com`;
  const password = 'securepassword123';

  let sellerToken = '';
  let buyerToken = '';
  let activeListingId = '';

  // Setup: Connect to Mongoose DB to verify DB state at the end
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('DB Connected for HTTP verification.');
    }
  } catch (err) {
    console.error('Mongoose DB connection failed:', err.message);
  }

  // Setup: Register buyer and seller
  try {
    let res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seller User', email: sellerEmail, password, role: 'seller' })
    });
    let data = await res.json();
    sellerToken = data.token;

    res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Buyer User', email: buyerEmail, password, role: 'buyer' })
    });
    data = await res.json();
    buyerToken = data.token;

    // Create listing as seller
    res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2021,
        kmDriven: 15000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        price: 2200000
      })
    });
    data = await res.json();
    activeListingId = data._id;

    console.log('HTTP Setup: Done. Active listing ID:', activeListingId);
  } catch (err) {
    console.error('HTTP Setup failed. Is the backend server running on port 5000?', err.message);
    throw err;
  }

  // 1. POST add wishlist item
  console.log('\n[HTTP TEST 1] Add item to wishlist (should return 200)...');
  try {
    const res = await fetch(`${wishlistUrl}/${activeListingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Message:', data.message);
    if (res.status === 200) console.log('PASS'); else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 2. Add the same listing twice (should fail 400 "already in wishlist")
  console.log('\n[HTTP TEST 2] Add duplicate item (should return 400)...');
  try {
    const res = await fetch(`${wishlistUrl}/${activeListingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Message:', data.message);
    if (res.status === 400 && data.message.includes('already')) console.log('PASS'); else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 3. Add with a malformed ID (e.g. "abc123") (should return 404)
  console.log('\n[HTTP TEST 3] Add malformed listing ID (should return 404)...');
  try {
    const res = await fetch(`${wishlistUrl}/abc123`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Message:', data.message);
    if (res.status === 404) console.log('PASS'); else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 4. Add with a well-formed but nonexistent ObjectId (should return 404)
  const nonexistentObjectId = new mongoose.Types.ObjectId().toString();
  console.log(`\n[HTTP TEST 4] Add nonexistent listing ID (${nonexistentObjectId}) (should return 404)...`);
  try {
    const res = await fetch(`${wishlistUrl}/${nonexistentObjectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Message:', data.message);
    if (res.status === 404) console.log('PASS'); else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 5. Remove a listing that was never saved (should return 200, idempotent)
  console.log('\n[HTTP TEST 5] Remove unsaved item (should return 200)...');
  try {
    const res = await fetch(`${wishlistUrl}/${nonexistentObjectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Message:', data.message);
    if (res.status === 200) console.log('PASS'); else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 6. Call all three endpoints with no auth token (should return 401)
  console.log('\n[HTTP TEST 6] Call all endpoints with no auth token (should return 401)...');
  try {
    const resGet = await fetch(wishlistUrl, { method: 'GET' });
    const resPost = await fetch(`${wishlistUrl}/${activeListingId}`, { method: 'POST' });
    const resDel = await fetch(`${wishlistUrl}/${activeListingId}`, { method: 'DELETE' });

    console.log('GET Wishlist status:', resGet.status);
    console.log('POST Wishlist status:', resPost.status);
    console.log('DELETE Wishlist status:', resDel.status);

    if (resGet.status === 401 && resPost.status === 401 && resDel.status === 401) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 7. Self-healing case: save a listing, then delete that listing entirely via
  // the normal DELETE /api/listings/:id flow (as owner), then call GET /api/wishlist.
  // Confirm the dead reference is filtered out of the response AND actually removed
  // from the user's savedListings array in the database.
  console.log('\n[HTTP TEST 7] Self-healing case: delete listing entirely and call GET...');
  try {
    // Delete listing entirely using the seller's token
    const deleteRes = await fetch(`${listingsUrl}/${activeListingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sellerToken}`
      }
    });
    console.log('DELETE /api/listings/:id status:', deleteRes.status);
    const deleteData = await deleteRes.json();
    console.log('DELETE Response:', deleteData.message);

    // Call GET /api/wishlist as buyer
    const wishlistRes = await fetch(wishlistUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    console.log('GET /api/wishlist status:', wishlistRes.status);
    const wishlistData = await wishlistRes.json();
    console.log('GET Response wishlist length (should be 0):', wishlistData.length);

    // Query database directly to confirm it was removed from user's savedListings array
    const userInDb = await User.findOne({ email: buyerEmail });
    console.log('User savedListings array in database (should be empty):', userInDb.savedListings);

    if (
      deleteRes.status === 200 &&
      wishlistRes.status === 200 &&
      wishlistData.length === 0 &&
      userInDb.savedListings.length === 0
    ) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // Cleanup: delete the created users from database
  try {
    await User.deleteOne({ email: sellerEmail });
    await User.deleteOne({ email: buyerEmail });
    console.log('\nHTTP Cleanup complete.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

const runAll = async () => {
  try {
    // Try HTTP tests first (requires server running)
    const health = await fetch('http://127.0.0.1:5000/api/health');
    if (health.ok) {
      await runHttpTests();
    } else {
      throw new Error('Server not OK');
    }
  } catch (e) {
    console.log('HTTP server not available. Running direct controller tests instead.');
    await runDirectTests();
  }
  process.exit(0);
};

runAll();
