<script lang="ts">
	import google from '$lib/google.svg';
	import github from '$lib/github.svg';
	//redirect if loged in
	import { goto } from '$app/navigation';
	$: if ($user && $user.emailVerified) goto('/todo');
	function rd() {
		throw goto('/todo').then(() => {
			console.log('redirected');
		});
	}
	import { auth } from '$lib/firebase';
	import { userStore } from 'sveltefire';

	let user = userStore(auth);

	//styling

	import { fly } from 'svelte/transition';
	let signInMode = true;
	import MediaQuery from 'svelte-media-queries';
	let smallScreen: boolean;
	let error = '';
	let forgotPasswordMode = false;
	let awaitPasswordReset = false;
	let transitionDuration = 500;
	$: if ($user && $user?.emailVerified) {
		transitionDuration = 0;
	}

	$: emailVerificationMode = $user !== null && $user?.emailVerified === false;

	//auth
	import {
		signInWithEmailAndPassword,
		createUserWithEmailAndPassword,
		updateProfile,
		sendEmailVerification,
		reload,
		GoogleAuthProvider,
		signInWithPopup,
		GithubAuthProvider,
		sendPasswordResetEmail
	} from 'firebase/auth';

	const googleProvider = new GoogleAuthProvider();
	const githubProvider = new GithubAuthProvider();

	let email = '';
	let password = '';
	let name = '';

	function cancelCreateUser() {
		//delete user and sign out
		// @ts-ignore
		auth.currentUser
			.delete()
			.then(() => {
				// User deleted.
				auth.signOut();
				error = '';
			})
			.catch((_error) => {
				error = 'Felj! ' + _error.code;
			});
	}
	function githubAuth() {
		signInWithPopup(auth, githubProvider)
			.then((result) => {
				console.log('signed in with github');
				// @ts-ignore
				sendEmailVerification(auth.currentUser)
					.then(() => {
						error = '';
						transitionDuration = 0;
					})
					.catch((_error) => {
						error = 'Felj! ' + _error.code;
					});
			})
			.catch((_error) => {
				error = 'Felj! ' + _error.code;
			});
	}
	function googleAutn() {
		signInWithPopup(auth, googleProvider)
			.then((result) => {
				error = '';
				transitionDuration = 0;
			})
			.catch((_error) => {
				error = 'Felj! ' + _error.code;
			});
	}
	try {
	} catch (_error) {
		// @ts-ignore
		error = 'Felj! ' + _error.code;
	}
	function signUp(e: any) {
		e.preventDefault();
		if (email === '' || password === '' || name === '') {
			error = 'Udfyld venligst alle felter.';
			return;
		}
		createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				error = '';
				// @ts-ignore
				updateProfile(auth.currentUser, {
					displayName: name
				})
					.then(() => {
						error = '';
					})
					.catch((_error) => {
						error = 'Felj! ' + _error.code;
					});
				// @ts-ignore
				sendEmailVerification(auth.currentUser)
					.then(() => {
						error = '';
					})
					.catch((_error) => {
						error = 'Felj! ' + _error.code;
					});
			})
			.catch((_error) => {
				error = 'Felj! ' + _error.code;
			});
	}
	function signIn(e: any) {
		e.preventDefault();
		console.log('signing in');
		if (email === '' || password === '') {
			error = 'Udfyld venligst alle felter.';
			return;
		}
		signInWithEmailAndPassword(auth, email, password)
			.then((user) => {
				error = '';
				transitionDuration = 0;
			})
			.catch((_error) => {
				error = 'Felj! ' + _error.code;
			});
	}
	function resetPassword() {
		if (email === '') {
			error = 'Udfyld venligst alle felter.';
			return;
		}
		sendPasswordResetEmail(auth, email)
			.then(() => {
				awaitPasswordReset = true;
				error = '';
			})
			.catch((_error) => {
				error = 'Felj! ' + _error.code + ' ' + _error.message;
			});
	}
</script>

<MediaQuery query="(max-width: 850px)" bind:matches={smallScreen} />

<div
	class:sm={smallScreen}
	class:lg={!smallScreen}
	class:flipped={emailVerificationMode}
	class:minimize={(emailVerificationMode || forgotPasswordMode) && smallScreen}
	class="flip-card"
>
	<div
		class:sm={smallScreen}
		class:lg={!smallScreen}
		class:minimize={(emailVerificationMode || forgotPasswordMode) && smallScreen}
		class="flip-card-inner"
	>
		<div class="flip-card-front">
			<!-- login -->

			<div
				class:right-panel-active={!signInMode}
				class:sm={smallScreen}
				class:lg={!smallScreen}
				class:minimize={(emailVerificationMode || forgotPasswordMode) && smallScreen}
				class="container bg-white rounded-container-token relative overflow-hidden flex flex-col items-center justify-center"
				id="container"
			>
				{#if !forgotPasswordMode}
					<div
						out:fly={{ y: 200, duration: transitionDuration }}
						in:fly={{
							y: -200,
							duration: transitionDuration,
							delay: transitionDuration
						}}
						class:sm={smallScreen}
						class:lg={!smallScreen}
						class="form-container sign-up-container"
					>
						<form
							class="flex bg-white items-center justify-center flex-col py-0 px-14 h-full text-center"
							on:submit|preventDefault={signUp}
						>
							<h1 class=" font-heading-token text-3xl text-slate-900">Opret konto</h1>

							<div class="my-4">
								<button
									type="button"
									on:click={githubAuth}
									class=" text-black rounded-full aspect-square py-1 px-2 mx-3 cursor-pointer"
									><img src={github} alt="github signup" class="w-9 h-9" /></button
								>

								<button
									type="button"
									on:click={googleAutn}
									class=" text-black rounded-full aspect-square py-1 px-2 mx-3 cursor-pointer"
									><img src={google} alt="google signup" class="w-9 h-9" /></button
								>
							</div>
							<span class="font-token text-surface-400 text-sm font-normal"
								>eller opret dig med email og adgangskode.</span
							>
							<input
								class="text-slate-900 rounded-token bg-surface-50 border-none px-4 py-2 m-2 w-full"
								autocomplete="name"
								bind:value={name}
								type="text"
								placeholder="Name"
							/>
							<input
								class="text-slate-900 rounded-token bg-surface-50 border-none px-4 py-2 m-2 w-full"
								autocomplete="email"
								bind:value={email}
								type="email"
								placeholder="Email"
							/>
							<input
								class="text-slate-900 rounded-token bg-surface-50 border-none px-4 py-2 m-2 w-full"
								bind:value={password}
								type="password"
								placeholder="Adgangskode"
								autocomplete="current-password"
							/>
							<button
								class="variant-filled-primary w-44 py-2 rounded-token mt-6 mb-2 shadow-lg"
								type="submit">Opret konto</button
							>
							<p id="error">{error}</p>
						</form>
					</div>
					<div
						out:fly={{ y: 200, duration: transitionDuration }}
						in:fly={{
							y: -200,
							duration: transitionDuration,
							delay: transitionDuration
						}}
						class:sm={smallScreen}
						class:lg={!smallScreen}
						class="form-container sign-in-container"
					>
						<form
							class="flex bg-white items-center justify-center flex-col py-0 px-14 h-full text-center"
							on:submit|preventDefault={signIn}
						>
							<h1 class=" font-heading-token text-3xl text-slate-900">Log ind</h1>

							<div class="my-4">
								<button
									type="button"
									on:click={githubAuth}
									class=" text-black rounded-full aspect-square py-1 px-2 mx-3 cursor-pointer"
									><img src={github} alt="github signup" class="w-9 h-9" /></button
								>

								<button
									type="button"
									on:click={googleAutn}
									class=" text-black rounded-full aspect-square py-1 px-2 mx-3 cursor-pointer"
									><img src={google} alt="google signup" class="w-9 h-9" /></button
								>
							</div>
							<span class="font-token text-surface-400 text-sm font-normal"
								>eller log ind med email.</span
							>
							<input
								class="text-slate-900 rounded-token bg-surface-50 border-none px-4 py-2 m-2 w-full"
								autocomplete="email"
								bind:value={email}
								type="email"
								placeholder="Email"
							/>
							<input
								class="text-slate-900 rounded-token bg-surface-50 border-none px-4 py-2 m-2 w-full"
								autocomplete="current-password"
								bind:value={password}
								type="password"
								placeholder="Adgangskode"
							/>

							<button
								type="button"
								class="text-black font-token underline w-fit h-min border-none cursor-pointer p-0 bg-transparent mt-2"
								on:click={() => {
									forgotPasswordMode = true;
									error = '';
								}}>Glemt din adgangskode?</button
							>
							<button
								class="variant-filled-primary w-44 py-2 rounded-token mt-6 shadow-lg mb-2"
								type="submit">Log ind</button
							>
							<p id="error">{error}</p>
						</form>
					</div>
					<div
						out:fly={{ y: 200, duration: transitionDuration }}
						in:fly={{
							y: -200,
							duration: transitionDuration,
							delay: transitionDuration
						}}
						class:sm={smallScreen}
						class:lg={!smallScreen}
						class="overlay-container"
					>
						<div class="overlay bg-gradient-to-br variant-gradient-primary-tertiary">
							<div class="overlay-panel overlay-left">
								<h1 class=" font-heading-token text-3xl font-bold text-white">
									Har vi ik' set dig før?
								</h1>
								<p class="font-token text-white text-lg mt-5 mb-8 font-normal">
									Log ind hvis du allerede har en konto.
								</p>
								<button
									class="variant-glass w-44 py-2 rounded-token"
									on:click={() => {
										signInMode = true;
										error = '';
									}}
									id="signIn">Log ind</button
								>
							</div>
							<div class="overlay-panel overlay-right">
								<h1 class=" font-heading-token text-3xl font-bold text-white">Er du ny her?</h1>
								<p class="font-token text-white text-lg font-normal mt-5 mb-8">
									Opret dig og start eventyret.
								</p>
								<button
									class="variant-glass w-44 py-2 rounded-token"
									on:click={() => {
										signInMode = false;
										error = '';
									}}
									id="signUp">Opret konto</button
								>
							</div>
						</div>
					</div>
				{:else if !awaitPasswordReset}
					<div
						class="w-full"
						in:fly={{
							y: -200,
							duration: transitionDuration,
							delay: transitionDuration
						}}
						out:fly={{ y: 200, duration: transitionDuration }}
					>
						<button
							on:click={() => {
								forgotPasswordMode = false;
							}}
							class="link-white text-black underline w-fit h-min border-none cursor-pointer p-0 bg-transparent mt-2"
							><i class="fa-solid fa-arrow-left" /> Tilbage</button
						>
						<form
							class="flex bg-white items-center justify-center flex-col py-0 px-20 h-full text-center"
							on:submit={(e) => {
								e.preventDefault();
								resetPassword();
							}}
						>
							<h1 class="mt-6 font-heading-token text-3xl text-slate-900">Nulstil Adgangskode</h1>
							<span class="font-token text-slate-500 text-md font-normal my-4"
								>Skriv e-mail adressen til din konto.</span
							>

							<input
								class="text-slate-900 rounded-token border-none px-4 py-2 m-2 w-full bg-surface-50"
								autocomplete="email"
								bind:value={email}
								type="email"
								placeholder="Email"
							/>
							<button
								class="bg-gradient-to-br variant-gradient-tertiary-primary rounded-token font-token text-token px-8 py-2 my-4"
								>Nulstil</button
							>
							<p id="error">{error}</p>
						</form>
					</div>
				{:else}
					<div
						class="w-full"
						transition:fly={{
							y: -200,
							duration: transitionDuration,
							delay: transitionDuration
						}}
					>
						<h1 class="font-heading-token text-3xl text-slate-900">Email sendt</h1>
						<p>Tjek din email og følg instruktionerne.</p>
						<button
							on:click={() => {
								forgotPasswordMode = false;
								awaitPasswordReset = false;
							}}
							class="text-black font-token underline w-fit h-min border-none cursor-pointer p-0 bg-transparent mt-2"
							><i class="fa-solid fa-arrow-left" /> Tilbage</button
						>
					</div>
				{/if}
			</div>
		</div>
		<!-- class:minimize={emailVerificationMode} -->
		<div class=" flip-card-back">
			<div
				class="p-1 rounded-container-token bg-gradient-to-br variant-gradient-primary-tertiary flex flex-col items-center justify-center h-full"
			>
				<h1 class="font-bold font-heading-token text-3xl text-white">Vi har sendt en email til</h1>
				<button class="link-color" on:click={cancelCreateUser}>
					<strong><i class="fa-solid fa-arrow-left" /> {$user?.email}</strong>
				</button>
				<p>Tjek din mail og bekræft din email adresse. Tip: Tjek spam</p>
				<div class="flex gap-x-6 gap-y-4 flex-wrap w-full justify-center px-8 mt-8">
					<button
						on:click={() => {
							if (auth.currentUser) sendEmailVerification(auth.currentUser);
						}}
						class="variant-ghost-surface w-48 py-2 rounded-token"
						>Send ny email
					</button>

					<button
						class="variant-filled-primary w-48 py-2 rounded-token"
						on:click={async () => {
							if (auth.currentUser) await reload(auth.currentUser);
							if (auth.currentUser?.emailVerified || $user?.emailVerified) {
								location.reload();
							} else {
								console.log('not verified', $user, auth.currentUser);
							}
						}}>Jeg har godkendt</button
					>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	#error {
		color: red;
		font-weight: 300;
	}

	* {
		box-sizing: border-box;
	}

	.container.lg {
		width: 768px;
		max-width: 100%;
		min-height: 480px;
	}
	.container.sm {
		width: 100%;
		max-width: 100%;
		min-height: 980px;
	}
	/* this */
	.form-container {
		position: absolute;
		top: 0;
		transition: all 0.6s ease-in-out;
	}
	.form-container.lg {
		height: 100%;
	}
	.form-container.sm {
		height: 50%;
	}
	.sign-in-container {
		left: 0;
		z-index: 2;
	}
	.sign-in-container.lg {
		width: 50%;
	}
	.sign-in-container.sm {
		width: 100%;
	}
	.container.right-panel-active .sign-in-container.lg {
		transform: translateX(100%);
	}
	.container.right-panel-active .sign-in-container.sm {
		transform: translateY(100%);
	}
	.sign-up-container {
		left: 0;

		opacity: 0;
		z-index: 1;
	}
	.sign-up-container.lg {
		width: 50%;
	}
	.sign-up-container.sm {
		width: 100%;
	}
	.container.right-panel-active .sign-up-container {
		opacity: 1;
		z-index: 5;
		animation: show 0.6s;
	}
	.container.right-panel-active .sign-up-container.lg {
		transform: translateX(100%);
	}
	.container.right-panel-active .sign-up-container.sm {
		transform: translateY(100%);
	}

	.overlay-container {
		position: absolute;
		overflow: hidden;
		transition: transform 0.6s ease-in-out;
		z-index: 100;
	}
	.overlay-container.lg {
		width: 50%;
		height: 100%;
		top: 0;
		left: 50%;
	}
	.overlay-container.sm {
		bottom: 0;
		width: 100%;
		height: 50%;
	}
	.container.right-panel-active .overlay-container.lg {
		transform: translateX(-100%);
	}
	.container.right-panel-active .overlay-container.sm {
		transform: translateY(-100%);
	}
	.overlay {
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 0 0;
		color: #ffffff;
		position: relative;
		left: -100%;
		height: 100%;
		width: 200%;
		transform: translateX(0);
		transition: transform 0.6s ease-in-out;
	}
	.container.right-panel-active .overlay {
		transform: translateX(50%);
	}
	.overlay-panel {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 0 40px;
		text-align: center;
		top: 0;
		height: 100%;
		width: 50%;
		transform: translateX(0);
		transition: transform 0.6s ease-in-out;
	}
	.overlay-left {
		transform: translateX(-20%);
	}
	.container.right-panel-active .overlay-left {
		transform: translateX(0);
	}
	.overlay-right {
		right: 0;
		transform: translateX(0);
	}
	.container.right-panel-active .overlay-right {
		transform: translateX(20%);
	}

	.flip-card {
		background-color: transparent;
		border-radius: 10px;

		perspective: 1000px; /* Remove this if you don't want the 3D effect */
		box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
	}
	.flip-card.lg {
		width: 768px;
		max-width: 100%;
		min-height: 480px;
	}
	.flip-card.sm {
		width: 100%;
		max-width: min(90%, 500px);
		min-height: 980px;
		margin: 1.5rem 0;
	}
	/* This container is needed to position the front and back side */
	.flip-card-inner {
		position: relative;
		text-align: center;
		transition: transform 0.8s;
		transform-style: preserve-3d;
	}
	.flip-card-inner.lg {
		width: 768px;
		max-width: 100%;
		min-height: 480px;
	}
	.flip-card-inner.sm {
		width: 100%;
		max-width: 100%;
		min-height: 980px;
	}
	/* Do an horizontal flip when you move the mouse over the flip box container */
	.flip-card.flipped .flip-card-inner {
		transform: rotateY(180deg);
		height: 100%;
	}
	/* Position the front and back side */
	.flip-card-front,
	.flip-card-back {
		border-radius: 10px;
		z-index: 2;
		position: absolute;
		width: 100%;
		height: 100%;
		-webkit-backface-visibility: hidden; /* Safari */
		backface-visibility: hidden;
	}

	/* Style the back side */
	.flip-card-back {
		background-color: dodgerblue;

		transform: rotateY(180deg);
	}
	.minimize {
		min-height: 450px !important;
	}
	/* .link-white {
		background: transparent !important;
		color: #000 !important;
		text-decoration: underline;
		width: fit-content;
		height: min-content;
		border: none;
		cursor: pointer;
		padding: 0;
		margin: 1rem;
	} */
	.link-color {
		background: transparent !important;
		color: #fff !important;
		text-decoration: underline;
		width: fit-content;
		height: min-content;
		border: none;
		cursor: pointer;
		padding: 0;
		margin: 1rem;
	}
</style>
