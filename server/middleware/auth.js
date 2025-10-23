import admin from 'firebase-admin';
import { createRequire } from 'module';
import User from '../models/User.js'; // Import our User model

// We have to use createRequire to import the JSON file in ES Modules
const require = createRequire(import.meta.url);
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin only if it hasn't been already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const authMiddleware = async (req, res, next) => {
  console.log('--- Auth Middleware Triggered ---'); // <-- NEW LOG
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.log('Auth failed: No token provided.'); // <-- NEW LOG
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    // 1. Verify the token
    console.log('Step 1: Verifying Firebase token...'); // <-- NEW LOG
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Step 2: Token verified. UID:', decodedToken.uid); // <-- NEW LOG
    
    // 2. Find or create a user in *our* MongoDB
    console.log('Step 3: Finding user in MongoDB...'); // <-- NEW LOG
    let user = await User.findOne({ firebaseId: decodedToken.uid });

    if (!user) {
      console.log('Step 4: User not found. Creating new user...'); // <-- NEW LOG
      // If user doesn't exist in our DB, create them
      user = new User({
        firebaseId: decodedToken.uid,
        name: decodedToken.name || decodedToken.email, // Use email if name is null
        email: decodedToken.email,
      });
      await user.save();
      console.log('Step 5: New user created in MongoDB:', user.email); // <-- NEW LOG
    } else {
      console.log('Step 4: User found in MongoDB.'); // <-- NEW LOG
    }
    
    // 3. Add the *MongoDB user document* to the request
    req.user = user; 
    
    console.log('Step 5: Auth complete. Calling next().'); // <-- NEW LOG
    next(); // Move to the next function (our main API logic)

  } catch (error) {
    console.error('--- CRITICAL AUTH ERROR ---:', error); // <-- NEW LOG
    return res.status(403).json({ error: 'Forbidden: Invalid token.' });
  }
};

export default authMiddleware;