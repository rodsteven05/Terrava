require('dotenv').config();
const db = require('../models');
const { hashPassword } = require('../utils/password');

const seed = async () => {
  await db.sequelize.sync({ force: true });

  const admin = await db.User.create({
    email: 'admin@terra.com',
    password_hash: await hashPassword('Admin123@'),
    full_name: 'System Administrator',
    role: 'admin',
    phone: '09170000000'
  });

  const seller = await db.User.create({
    email: 'seller@terra.com',
    password_hash: await hashPassword('Admin123@'),
    full_name: 'Juan dela Cruz',
    role: 'seller',
    phone: '09171111111',
    branch: 'Main Tagum'
  });

  const buyer = await db.User.create({
    email: 'buyer@gmail.com',
    password_hash: await hashPassword('Admin123@'),
    full_name: 'Maria Santos',
    role: 'buyer',
    phone: '09172222222'
  });

  const panabo = await db.LandListing.create({
    seller_id: seller.id,
    title: 'Agricultural Lot in Panabo',
    description: 'Flat agricultural land suitable for farming or residential development.',
    price: 1500000,
    area_sqm: 1000,
    location_text: 'Brgy. San Francisco, Panabo City, Davao del Norte',
    branch: 'Panabo',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.6845, 7.3360],
        [125.6855, 7.3360],
        [125.6855, 7.3370],
        [125.6845, 7.3370],
        [125.6845, 7.3360]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Residential Lot in Main Tagum',
    description: 'Prime residential lot near the city center of Tagum.',
    price: 2500000,
    area_sqm: 500,
    location_text: 'Brgy. Magugpo West, Tagum City, Davao del Norte',
    branch: 'Main Tagum',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.8000, 7.4400],
        [125.8010, 7.4400],
        [125.8010, 7.4410],
        [125.8000, 7.4410],
        [125.8000, 7.4400]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Farm Lot in Sto. Tomas',
    description: 'Spacious farm lot ideal for agriculture and livestock.',
    price: 1800000,
    area_sqm: 2000,
    location_text: 'Brgy. Kimamon, Sto. Tomas, Davao del Norte',
    branch: 'Sto. Tomas',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.6200, 7.2100],
        [125.6210, 7.2100],
        [125.6210, 7.2110],
        [125.6200, 7.2110],
        [125.6200, 7.2100]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Commercial Lot in Davao City',
    description: 'Strategic commercial lot near major roads in Davao City.',
    price: 3500000,
    area_sqm: 800,
    location_text: 'Brgy. Poblacion, Davao City, Davao del Sur',
    branch: 'Davao City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.6080, 7.0680],
        [125.6090, 7.0680],
        [125.6090, 7.0690],
        [125.6080, 7.0690],
        [125.6080, 7.0680]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Beachfront Lot in Mati City',
    description: 'Beautiful beachfront property perfect for resort or vacation home.',
    price: 2800000,
    area_sqm: 1200,
    location_text: 'Brgy. Dahican, Mati City, Davao Oriental',
    branch: 'Mati City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [126.2150, 6.9540],
        [126.2160, 6.9540],
        [126.2160, 6.9550],
        [126.2150, 6.9550],
        [126.2150, 6.9540]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Residential Lot in Digos City',
    description: 'Affordable residential lot in a peaceful Digos City neighborhood.',
    price: 1200000,
    area_sqm: 400,
    location_text: 'Brgy. Aplaya, Digos City, Davao del Sur',
    branch: 'Digos City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.3560, 6.7480],
        [125.3570, 6.7480],
        [125.3570, 6.7490],
        [125.3560, 6.7490],
        [125.3560, 6.7480]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Residential Lot in Davao City',
    description: 'Peaceful residential lot in a secure Davao City subdivision.',
    price: 2200000,
    area_sqm: 450,
    location_text: 'Brgy. Buhangin, Davao City, Davao del Sur',
    branch: 'Davao City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.6120, 7.0720],
        [125.6130, 7.0720],
        [125.6130, 7.0730],
        [125.6120, 7.0730],
        [125.6120, 7.0720]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Industrial Lot in Davao City',
    description: 'Spacious industrial lot ideal for warehouses and logistics.',
    price: 4800000,
    area_sqm: 1500,
    location_text: 'Brgy. Sasa, Davao City, Davao del Sur',
    branch: 'Davao City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.6000, 7.0600],
        [125.6010, 7.0600],
        [125.6010, 7.0610],
        [125.6000, 7.0610],
        [125.6000, 7.0600]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Residential Lot in Mati City',
    description: 'Cozy residential lot near the beach in Mati City.',
    price: 1600000,
    area_sqm: 500,
    location_text: 'Brgy. Central, Mati City, Davao Oriental',
    branch: 'Mati City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [126.2200, 6.9580],
        [126.2210, 6.9580],
        [126.2210, 6.9590],
        [126.2200, 6.9590],
        [126.2200, 6.9580]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Farm Lot in Mati City',
    description: 'Large farm lot suitable for agriculture in Mati City.',
    price: 2100000,
    area_sqm: 2500,
    location_text: 'Brgy. Mayo, Mati City, Davao Oriental',
    branch: 'Mati City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [126.2100, 6.9500],
        [126.2110, 6.9500],
        [126.2110, 6.9510],
        [126.2100, 6.9510],
        [126.2100, 6.9500]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Agricultural Lot in Digos City',
    description: 'Fertile agricultural land ready for farming in Digos City.',
    price: 1900000,
    area_sqm: 1800,
    location_text: 'Brgy. Soong, Digos City, Davao del Sur',
    branch: 'Digos City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.3500, 6.7440],
        [125.3510, 6.7440],
        [125.3510, 6.7450],
        [125.3500, 6.7450],
        [125.3500, 6.7440]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.LandListing.create({
    seller_id: seller.id,
    title: 'Commercial Lot in Digos City',
    description: 'Prime commercial lot near the highway in Digos City.',
    price: 2400000,
    area_sqm: 600,
    location_text: 'Brgy. San Jose, Digos City, Davao del Sur',
    branch: 'Digos City',
    is_verified: true,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[
        [125.3600, 6.7520],
        [125.3610, 6.7520],
        [125.3610, 6.7530],
        [125.3600, 6.7530],
        [125.3600, 6.7520]
      ]]
    },
    photos: [],
    photo_geotags: []
  });

  await db.Inquiry.create({
    listing_id: panabo.id,
    buyer_id: buyer.id,
    message: 'Is this lot still available? Can I visit this weekend?'
  });

  console.log('Seeded successfully');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
