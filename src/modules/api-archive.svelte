<script lang="ts">
  import ApiLogItem from "./api-log-item.svelte";
  import {
      Button,
      
    } from "carbon-components-svelte";
  import { ApiStore } from "./api-store";

  import type { NapiLog } from "./api-cli";
  
  let saved: Array<NapiLog> = []; // Holder of saved
  let discarded: Array<NapiLog> = []; // holder of disacrded
  let notsaved: Array<NapiLog> = []; // hodler of posts from the API itself

  $: {
    saved = $ApiStore.inArchive.filter((l) => l.saved);
    discarded = $ApiStore.inArchive.filter((l) => l.discarded);
    notsaved = $ApiStore.inArchive.filter((l) => !l.saved && !l.discarded);
  }
</script>

  <br> 
  {#if notsaved.length > 0}
  <h4 style="text-align:center">Not Saved</h4>
  <hr>
      {#each notsaved as log, index (log.id)}
        <ApiLogItem {log} />
        {#if index < notsaved.length - 1}
          <hr>
        {/if}
      {/each}
  {/if}

  {#if discarded.length > 0}
  <h4 style="text-align:center">Discarded</h4>
  <hr>
      {#each discarded as log, index (log.id)}
        <ApiLogItem {log} />
        {#if index < discarded.length - 1}
         <hr>
        {/if}
      {/each}
  {/if}

  {#if saved.length > 0}
  <h4 style="text-align:center">Saved</h4>
  <hr>
      {#each saved as log, index (log.id)}
        <ApiLogItem {log} />
        {#if index < saved.length - 1}
          <hr>
        {/if}
      {/each}
  {/if}

  {#if saved.length + discarded.length > 0}
    
      <Button kind="danger-ghost" on:click={ApiStore.clearArchives}>Clear Archives</Button>
  
  {:else}
    <h1 style="text-align:center">🤙</h1>
    <h4 style="text-align:center">Empty Archive</h4>
    <br>
    <h6 style="text-align:center">This is ok, the archive is used as a backup for your API logs. So if a log isn't properly saved, you can get to it here.</h6>
  {/if}

