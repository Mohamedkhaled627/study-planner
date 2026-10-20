import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { clientApp } from "./firebase";

export const db = getFirestore(clientApp);
export const firebaseAuth = getAuth(clientApp);
