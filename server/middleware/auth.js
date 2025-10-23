import admin from 'firebase-admin';
import User from '../models/User.js'; // Import our User model

// --- NEW WAY TO GET CREDENTIALS ---
// Check if the environment variable exists
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Log a more descriptive error if the variable is missing during startup
  console.error("CRITICAL ERROR: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. Server cannot authenticate users.");
  // Optionally, you might want to exit the process if auth is absolutely essential
  // process.exit(1);
  // For now, we'll throw an error which should prevent the server from starting cleanly
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
}

let serviceAccount;
try {
  // Parse the JSON string from the environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error("CRITICAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Check if it's valid JSON.", error);
  // process.exit(1); // Exit if parsing fails
  throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON.');
}
// ------------------------------------

// Initialize Firebase Admin only if it hasn't been already
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("CRITICAL ERROR: Failed to initialize Firebase Admin SDK.", error);
    // process.exit(1); // Exit if initialization fails
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

const authMiddleware = async (req, res, next) => {
  console.log('--- Auth Middleware Triggered ---');
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.log('Auth failed: No token provided.');
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    // 1. Verify the token
    console.log('Step 1: Verifying Firebase token...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Step 2: Token verified. UID:', decodedToken.uid);

    // 2. Find or create a user in *our* MongoDB
    console.log('Step 3: Finding user in MongoDB...');
    let user = await User.findOne({ firebaseId: decodedToken.uid });

    if (!user) {
      console.log('Step 4: User not found. Creating new user...');
      // If user doesn't exist in our DB, create them
      user = new User({
        firebaseId: decodedToken.uid,
        name: decodedToken.name || decodedToken.email, // Use email if name is null
        email: decodedToken.email,
        // Initialize arrays
        uploadedResumes: [],
        generatedResumes: []
      });
      await user.save();
      console.log('Step 5: New user created in MongoDB:', user.email);
    } else {
      console.log('Step 4: User found in MongoDB.');
    }

    // 3. Add the *MongoDB user document* to the request
    req.user = user; // This now holds our full Mongoose user

    console.log('Step 5: Auth complete. Calling next().');
    next(); // Move to the next function (our main API logic)

  } catch (error) {
    console.error('--- AUTHENTICATION ERROR ---:', error.message); // Log specific error message
    // Differentiate between token verification errors and database errors
    if (error.code && error.code.startsWith('auth/')) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
    } else {
        return res.status(500).json({ error: 'Internal Server Error during authentication.' });
    }
  }
};

export default authMiddleware;