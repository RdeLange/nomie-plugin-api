<script lang="ts">
  import {
      Tag,
    } from "carbon-components-svelte";
  import { ApiStore } from "./api-store";

  import type { NapiLog } from "./api-cli";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

  export let log: NapiLog;
</script>

<div class="row">
  <div class="column" style="flex:10%;text-align:right;font-size:90%"><span on:click={() => ApiStore.discard(log)}><TrashCan size={16} style="cursor:pointer;"/></span></div>
  <div class="column" style="flex:30%;text-align:left;font-size:70%"><span>{log.note}</span></div>
  <div class="column" style="flex:30%;text-align:right;font-size:70%"><span> {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}</span></div>
  <div class="column" style="flex:30%;text-align:right;font-size:35%">
    {#if log.discarded}
    <Tag size="sm" type="red" on:click={() => ApiStore.restoreLog(log)}>Restore</Tag>
      {:else if log.saved}
      <Tag size="sm" type="green">Saved</Tag>
      {:else if !log.saved}
      <Tag size="sm" type="cyan" on:click={() => ApiStore.import([log])}>Save</Tag>
      {/if}
  </div>  
</div> 



<style>

 .row {
display: flex;
}

.column {
flex: 50%;
text-align:center;
}

</style>