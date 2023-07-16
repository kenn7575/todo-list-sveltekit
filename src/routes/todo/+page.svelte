<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script>
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { auth } from '$lib/firebase.js';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import logo from '$lib/logo.png';
</script>

<div class="w-full h-screen">
	<header
		class="w-20 h-full variant-filled-surface flex flex-col items-center py-2 gap-4 justify-between"
	>
		<div class="flex flex-col gap-4">
			<img class="aspect-square w-16 h-16 object-contain" src={logo} alt="logo" />
			<hr class="w-full border-primary-500" />
		</div>
		<nav class="w-full flex">
			<ul class="w-full flex flex-col items-center gap-8 text-3xl">
				<li class="w-14 h-14 hover:bg-surface-400 duration-300 rounded-lg">
					<button class="w-full h-full">
						<i class="text-primary-900 fa-regular fa-note-sticky" />
						<p class="text-primary-900 text-sm font-token">Noter</p>
					</button>
				</li>
				<li class="w-14 h-14 hover:bg-surface-400 duration-300 rounded-lg">
					<button class="w-full h-full">
						<i class="text-primary-900 fa-solid fa-bars-staggered" />
						<p class="text-primary-900 text-sm font-token">Lister</p>
					</button>
				</li>
				<li class="w-14 h-14 hover:bg-surface-400 duration-300 rounded-lg">
					<button class="w-full h-full">
						<i class="text-primary-900 fa-solid fa-ellipsis" />
						<p class="text-primary-900 text-sm font-token">Andet</p>
					</button>
				</li>
			</ul>
		</nav>
		<!-- signout button  -->
		<button
			on:click={() => {
				console.log('🚀 ~ file: +page.svelte:43 ~ click:');

				signOut(auth);
				goto('/login');
			}}><i class="text-primary-900 fa-solid fa-person-through-window text-2xl" /></button
		>
		<LightSwitch />
	</header>
</div>
