import { redirect } from '@sveltejs/kit';
import { userStore } from 'sveltefire';
import { auth } from '$lib/firebase.js';
import { Cookies } from '@sveltejs/kit';
let user = userStore(auth);
export function load() {
	if (auth.currentUser && auth.currentUser?.emailVerified) throw redirect(302, `/todo`);
	const sessionid = Cookies.get('sessionid');

	return {
		user: await db.getUser(sessionid)
	};
}
