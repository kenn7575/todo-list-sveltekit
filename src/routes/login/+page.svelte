<script lang="js">
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
	let smallScreen;
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
	function signUp(e) {
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
	function signIn(e) {
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
				class="container"
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
						<form on:submit|preventDefault={signUp}>
							<h1>Opret konto</h1>

							<div class="social-container">
								<button type="button" on:click={githubAuth} class="provider social"
									><i class="fa-brands fa-github" /></button
								>

								<button type="button" on:click={googleAutn} class="provider social"
									><i class="fa-brands fa-google" /></button
								>
							</div>
							<span>eller opret dig med email og adgangskode.</span>
							<input autocomplete="name" bind:value={name} type="text" placeholder="Name" />
							<input autocomplete="email" bind:value={email} type="email" placeholder="Email" />
							<input
								bind:value={password}
								type="password"
								placeholder="Adgangskode"
								autocomplete="current-password"
							/>
							<button type="submit">Opret konto</button>
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
						<form on:submit|preventDefault={signIn}>
							<h1>Log ind</h1>

							<div class="social-container">
								<button type="button" on:click={githubAuth} class="provider social"
									><i class="fa-brands fa-github" /></button
								>
								<button type="button" on:click={googleAutn} class=" provider rsocial"
									><i class="fa-brands fa-google" /></button
								>
							</div>
							<span>eller log ind med email.</span>
							<input autocomplete="email" bind:value={email} type="email" placeholder="Email" />
							<input
								autocomplete="current-password"
								bind:value={password}
								type="password"
								placeholder="Adgangskode"
							/>
							<button
								type="button"
								class="link-white"
								on:click={() => {
									forgotPasswordMode = true;
									error = '';
								}}>Glemt din adgangskode?</button
							>
							<button type="submit">Log ind</button>
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
						<div class="overlay bg-gradient-to-br variant-gradient-primary-secondary">
							<div class="overlay-panel overlay-left">
								<h1>Har vi ik' set dig før?</h1>
								<p>Log ind hvis du allerede har en konto.</p>
								<button
									class="ghost"
									on:click={() => {
										signInMode = true;
										error = '';
									}}
									id="signIn">Log ind</button
								>
							</div>
							<div class="overlay-panel overlay-right">
								<h1>Er du ny her?</h1>
								<p>Opret dig og start eventyret.</p>
								<button
									class="ghost"
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
						class="forgot-password"
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
							style="color: #000"
							class="link-white"><i class="fa-solid fa-arrow-left" /> Tilbage</button
						>
						<form
							on:submit={(e) => {
								e.preventDefault();
								resetPassword();
							}}
						>
							<h1>Nulstil Adgangskode</h1>
							<span>Skriv e-mail adressen til din konto.</span>

							<input autocomplete="email" bind:value={email} type="email" placeholder="Email" />
							<button class="reset-btn">Nulstil</button>
							<p id="error">{error}</p>
						</form>
					</div>
				{:else}
					<div
						class="forgot-password"
						transition:fly={{
							y: -200,
							duration: transitionDuration,
							delay: transitionDuration
						}}
					>
						<h1>Email sendt</h1>
						<p>Tjek din email og følg instruktionerne.</p>
						<button
							on:click={() => {
								forgotPasswordMode = false;
								awaitPasswordReset = false;
							}}
							class="link-white"><i class="fa-solid fa-arrow-left" /> Tilbage</button
						>
					</div>
				{/if}
			</div>
		</div>
		<!-- class:minimize={emailVerificationMode} -->
		<div class=" flip-card-back">
			<div class="email">
				<h1>Vi har sendt en email til</h1>
				<button class="link-color" on:click={cancelCreateUser}>
					<strong><i class="fa-solid fa-arrow-left" /> {$user?.email}</strong>
				</button>
				<p>Tjek din mail og bekræft din email adresse. Tip: Tjek spam</p>
				<!-- resend button -->
				<button
					class="link-color"
					on:click={() => {
						sendEmailVerification(auth.currentUser);
					}}>Send ny email</button
				>
				<button
					on:click={async () => {
						await reload(auth.currentUser);
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

<style>
	.provider {
		margin: 0 0.5rem;
		background: transparent;
		font-size: 25px;
		color: #000;
		width: 35px;
		height: 35px;
		padding: 0;
		border-radius: 50%;
		border: none;
		cursor: pointer;
	}
	.forgot-password {
		padding: 1rem !important;
		width: 100%;
	}
	.forgot-password form {
		width: 100%;
		padding: 0;
		max-width: 600px;
	}
	.forgot-password .reset-btn {
		background: -webkit-linear-gradient(
			to right,
			#1a2980,
			#26d0ce
		); /* Chrome 10-25, Safari 5.1-6 */
		background: linear-gradient(to right, #1a2980, #26d0ce);
		border: none;
		margin-top: 1rem;
		cursor: pointer;
	}
	.forgot-password h1 {
		margin: 1rem;
		font-size: 2.5rem;
	}
	.forgot-password p {
		font-weight: 300;
	}
	.forgot-password {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	.email {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: #1a2980; /* fallback for old browsers */
		background: -webkit-linear-gradient(
			to right,
			#1a2980,
			#26d0ce
		); /* Chrome 10-25, Safari 5.1-6 */
		background: linear-gradient(45deg, #1a2980, #26d0ce);
		border-radius: 10px;
		color: #fff;
		border: solid 1px #fff;
		box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
	}
	.email strong {
		margin: 0.5rem 0;
		font-weight: 500;
	}
	.email p {
		font-weight: 300;
	}
	.email h1 {
		font-size: 2.8rem;
	}
	.email button {
		background: #fff;
		color: #1a2980;
	}

	#error {
		color: red;
		font-weight: 300;
	}

	* {
		box-sizing: border-box;
	}
	h1 {
		font-weight: bold;
		margin: 0;
	}
	p {
		font-size: 14px;
		font-weight: 100;
		line-height: 20px;
		letter-spacing: 0.5px;
		margin: 20px 0 30px;
	}
	span {
		font-size: 12px;
	}
	a {
		color: #333;
		font-size: 14px;
		text-decoration: none;
		margin: 15px 0;
	}
	a i {
		font-size: 22px;
	}
	button {
		border-radius: 20px;
		border: 1px solid color-mix(in srgb, #1a2980 65%, #26d0ce);
		background-color: color-mix(in srgb, #1a2980 65%, #26d0ce);
		color: #ffffff;
		font-size: 12px;
		font-weight: bold;
		padding: 12px 45px;
		letter-spacing: 1px;
		text-transform: uppercase;
		transition: transform 80ms ease-in;
	}
	button:active {
		transform: scale(0.95);
	}
	button:focus {
		outline: none;
	}
	button.ghost {
		background-color: transparent;
		border-color: #ffffff;
	}
	form {
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 0 50px;
		height: 100%;
		text-align: center;
	}
	input {
		background-color: #eee;
		border: none;
		padding: 12px 15px;
		margin: 8px 0;
		width: 100%;
	}
	.container {
		background-color: #fff;
		border-radius: 10px;
		box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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
	@keyframes show {
		0%,
		49.99% {
			opacity: 0;
			z-index: 1;
		}

		50%,
		100% {
			opacity: 1;
			z-index: 5;
		}
	}
	/* this */
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
	.social-container {
		margin: 20px 0;
	}
	.social-container a {
		border: 1px solid #dddddd;
		border-radius: 50%;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		margin: 0 5px;
		height: 40px;
		width: 40px;
	}
	.flip-card {
		background-color: transparent;
		border-radius: 10px;

		perspective: 1000px; /* Remove this if you don't want the 3D effect */
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
	.link-white {
		background: transparent !important;
		color: #000 !important;
		text-decoration: underline;
		width: fit-content;
		height: min-content;
		border: none;
		cursor: pointer;
		padding: 0;
		margin: 1rem;
	}
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
	.full-screen {
		display: flex;
		height: 100%;
		min-height: 100vh;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
</style>
