/**
 * Sample Firebase Data Seeder
 * 
 * This script helps you seed sample hymns and bulletins to your Firestore database.
 * 
 * Setup:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download your Firebase service account key from Firebase Console
 * 3. Save it as serviceAccountKey.json in the scripts folder
 * 4. Run: node scripts/seedFirebase.js
 */

// Uncomment and use this if you want to seed Firebase from Node.js
/*
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleHymns = [
  {
    number: 1,
    title: 'Amazing Grace',
    lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me...',
    category: 'Praise',
  },
  {
    number: 2,
    title: 'How Great Thou Art',
    lyrics: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made...',
    category: 'Worship',
  },
  {
    number: 3,
    title: 'Blessed Assurance',
    lyrics: 'Blessed assurance, Jesus is mine\nO what a foretaste of glory divine...',
    category: 'Faith',
  },
];

const sampleBulletins = [
  {
    title: 'Sunday Worship Service',
    description: 'Join us for worship this Sunday at 10:00 AM. Special guest speaker: Pastor John.',
    date: admin.firestore.Timestamp.now(),
    category: 'announcement',
    priority: 'high',
  },
  {
    title: 'Youth Group Meeting',
    description: 'Youth group will meet on Friday at 7:00 PM in the fellowship hall.',
    date: admin.firestore.Timestamp.now(),
    category: 'event',
    priority: 'medium',
  },
  {
    title: 'Prayer Request',
    description: 'Please pray for Sister Mary who is recovering from surgery.',
    date: admin.firestore.Timestamp.now(),
    category: 'prayer',
    priority: 'medium',
  },
];

async function seedData() {
  try {
    console.log('Seeding hymns...');
    for (const hymn of sampleHymns) {
      await db.collection('hymns').add(hymn);
    }
    
    console.log('Seeding bulletins...');
    for (const bulletin of sampleBulletins) {
      await db.collection('bulletins').add(bulletin);
    }
    
    console.log('✅ Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
*/

console.log('Firebase seeding script');
console.log('To use this script:');
console.log('1. Install firebase-admin: npm install firebase-admin');
console.log('2. Download your service account key from Firebase Console');
console.log('3. Uncomment the code in this file');
console.log('4. Run: node scripts/seedFirebase.js');
console.log('\nAlternatively, you can manually add data through Firebase Console.');
