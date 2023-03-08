<script lang="ts">
   import {
      Button,
      Tile,
      InlineLoading,
    } from "carbon-components-svelte";

  import { ApiStore } from './api-store';
</script>

<style>
  .row {
  display: flex;
}

.column {
  flex: 50%;
  text-align:center;
}
</style>

<Tile>
  <h1 style="text-align:center">🚀</h1>
  <h4 style="text-align:center">No API Key Setup</h4>
  <br>
  {#if !$ApiStore.generating}
  <h6 style="text-align:center">Get an API Key and use services like IFTTT or Zapier to push data to Nomie6-OSS</h6>
  <br>
  <div class="row">
    <div class="column"><Button on:click={ApiStore.restoreKeys}>Restore</Button></div>
    <div class="column"><Button on:click={ApiStore.register}>New Key</Button></div>
  </div> 
   
  {:else}
  <InlineLoading description="Generating..." style="text-align:center"/>
  {/if}
</Tile>

