//firebase
import { initializeApp } from 'firebase/app';
let firebaseConfig = {
	apiKey: 'AIzaSyCjNFo1ZqUHeLECc_bx8DmOMkuoVpbjXc4',
	authDomain: 'sveltekit-58cab.firebaseapp.com',
	projectId: 'sveltekit-58cab',
	storageBucket: 'sveltekit-58cab.appspot.com',
	messagingSenderId: '410900536786',
	appId: '1:410900536786:web:dbe6bb85c3bf14023bfc0b'
};
export const app = initializeApp(firebaseConfig);

//firestore
import { getFirestore } from 'firebase/firestore';
export const firestore = getFirestore(app);

//auth
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
