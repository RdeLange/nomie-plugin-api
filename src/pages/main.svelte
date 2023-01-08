<script>
    import { createEventDispatcher } from 'svelte';
    import ApiArchives from "../modules/api-archive.svelte";
    import ApiItems from "../modules/api-items.svelte";
    import {
      Button,
      Content,
        Grid,
        Row,
        Column,
        ContentSwitcher, 
        Switch,
        Tile,
    } from "carbon-components-svelte";

   
    export let pluginname;
    export let pluginemoji;

   let selectedIndex = 0;
   
   const dispatch = createEventDispatcher();

</script>

<Content>
    <Grid>
      <Row>
        <Column>
          <h1 style="text-align:center">{pluginemoji}</h1>
          <h2 style="text-align:center">{pluginname}</h2>
          <h5 style="text-align:center">Loaded Succesfully</h5>
          <hr>
          </Column>
      </Row>
    </Grid>
    <Tile>
      <ContentSwitcher bind:selectedIndex>
        <Switch text="New"/>
        <Switch text="Archive"/>
      </ContentSwitcher>
      {#if selectedIndex == 0}
      <ApiItems />
    {:else if selectedIndex == 1}
      <ApiArchives />
    {/if}
    </Tile>


  </Content>
  


  <style>
    h2 {
       margin: 0;
       padding: 0;
       font-size: 2.5em;
       font-weight: 400;
   }




 </style>

