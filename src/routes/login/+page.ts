import { redirect } from '@sveltejs/kit';
import { userStore } from 'sveltefire';
import { auth } from '$lib/firebase.js';
let user = userStore(auth);
export function load() {
	if (auth.currentUser && auth.currentUser?.emailVerified) throw redirect(302, `/todo`);
}
