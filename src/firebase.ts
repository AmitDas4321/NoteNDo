import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Note: Modern Firebase SDKs require an API Key for Auth.
// Since we only have the RTDB URL and Secret, we'll use a placeholder API Key
// to prevent the SDK from crashing issues.
const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER-KEY", 
  databaseURL: "https://notendo-ai-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const DB_SECRET = "Wm9CUHnUMFeV8bkmupaSEAB53FlRzZPZhfHa6W8G";
