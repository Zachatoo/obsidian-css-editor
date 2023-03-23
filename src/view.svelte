<script lang="ts">
	export let data: string;
	export let updateData: (data: string) => void;

	function handleInput(e: any) {
		updateData(e.path[0].innerHTML);
	}
</script>

<pre>
<code class="w-full" contentEditable="true" on:input={handleInput}>
{data}
</code>
</pre>
