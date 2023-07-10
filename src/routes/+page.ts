import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/firebase.js';
export function load() {
	if (!auth.currentUser || !auth.currentUser?.emailVerified) throw redirect(302, `/login`);
}
