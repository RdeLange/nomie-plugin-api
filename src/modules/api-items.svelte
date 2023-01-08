<script lang="ts">
  import ApiLogItem from "./api-log-item.svelte";
  import { ApiStore } from "./api-store";

  
</script>

  <br>
  {#if $ApiStore.inAPI.length === 0}
  <h1 style="text-align:center">📭</h1>
  <h4 style="text-align:center">No new API entries</h4>
  <br>
  <h6 style="text-align:center">Use services like IFTTT and Zapier to post Nomie data notes directly to this device.</h6>
  {/if}

  {#if $ApiStore.inAPI.length}
  <h4 style="text-align:center">Unsaved Api Logs</h4>
  <br>
      {#each $ApiStore.inAPI as log (log.id)}
        <ApiLogItem {log} />
        <hr>
      {/each}
  {/if}

