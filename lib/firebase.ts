import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAzCTSHgXkmt7YRapJFjolMluJ6FCYCc8",
  authDomain: "zamin-automation.firebaseapp.com",
  projectId: "zamin-automation",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);