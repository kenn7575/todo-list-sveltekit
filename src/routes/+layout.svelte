<script lang="ts">
	// This contains the bulk of Skeletons required styles:
	import '@skeletonlabs/skeleton/styles/skeleton.css';

	// Finally, your application's global stylesheet (sometimes labeled 'app.css')
	import '../app.postcss';
</script>

<div data-name="main" class="max-h-full overflow-y-auto w-full">
	<main class="w-full flex justify-center min-h-screen items-center">
		<slot />
	</main>
</div>

<style>
</style>
