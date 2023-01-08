<script>
    import { createEventDispatcher } from 'svelte';
    import {
      Button,
      Content,
        Grid,
        Row,
        Column,
        Tile,
        TextArea,
        Accordion, 
        AccordionItem,
        ProgressBar,
        Toggle,
    } from "carbon-components-svelte";
    import Copy from "carbon-icons-svelte/lib/Copy.svelte";

    import {notifications} from '../components/notifications.js'

    import { ApiStore } from "../modules/api-store";

    import ApiRegsiter from "../modules/api-register.svelte";
   
    export let pluginname;
    export let pluginemoji;
    export let config = {"apiKey":"","privateKey":"","domain":""};

   let open=true;
   
   const dispatch = createEventDispatcher();
   const API_CONFIG_CHANGED = 'napi-config-changed';

   let state = {
    apiExample: null,
    showPrivateKey: false,
    showExample: false,
    };

  // Generate an Example API Call
  $: if (config.apiKey) {
      state.apiExample = JSON.stringify(
      { note: "#mood(4) #sleep(07:43:32)", api_key: config.apiKey },
      null,
      2
      );
    }

  
  function copy(str) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText){
      notifications.default('Copied to Clipboard', 3000)
      return navigator.clipboard.writeText(str);
      
    }
    else {return Promise.reject('The Clipboard API is not available.');}
  }

  
   
</script>

<Content>
    <Grid>
      <Row>
        <Column>
          <h1 style="text-align:center">{pluginemoji}</h1>
          <h2 style="text-align:center">{pluginname}</h2>
          <h5 style="text-align:center">Plugin Settings</h5>
          <hr>
        </Column>
      </Row>
    </Grid>
    
    
    {#if $ApiStore.registered === undefined || !$ApiStore.registered}
    <Tile>
      <ApiRegsiter />
    </Tile>
    {:else}
    <Tile>
      <span><h6 style="font-size:80%; text-align:left">🟢 Registered and Valid on {$ApiStore.domainName}</h6></span>
      <hr>
    
       
    <div class="row">
      <div class="column" style="flex:90%"> <TextArea
        bind:value={$ApiStore.apiKey}
        rows={2}
      labelText="API Key"
      placeholder="API Key"
    /></div>
      <div class="column" style="flex:5%;"><span on:click={() => {copy($ApiStore.apiKey)}}><Copy size={16} style="cursor:pointer;"/></span></div>
    </div> 
    <br>
    <Accordion>
      <AccordionItem title="Example Request">
        <div class="row">
          <div class="column" style="flex:90%"> <TextArea
            bind:value={state.apiExample}
            rows={5}
          labelText="API Example"
          placeholder="API Example"
          style="font-size:70%"
        /></div>
          <div class="column" style="flex:5%;"><span on:click={() => {copy(state.apiExample)}}><Copy size={16} style="cursor:pointer;"/></span></div>
        </div> 
        <br>
        <div class="row">
          <div class="column" style="flex:30%;text-align:left;font-size:90%">URL</div>
          <div class="column" style="flex:60%;text-align:right;font-size:90%"><span> {$ApiStore.domainName}/log</span></div>
          <div class="column" style="flex:10%;text-align:right;font-size:90%"><span on:click={() => {copy($ApiStore.domainName+"/log")}}><Copy size={16} style="cursor:pointer;"/></span></div>
        </div> 
        <div class="row">
          <div class="column" style="flex:30%;text-align:left;font-size:90%">METHOD</div>
          <div class="column" style="flex:70%;text-align:right;font-size:90%"><span>POST application/json</span></div>
        </div> 
        <br>
        <h6 style="font-size:90%;font-weight:300">FIELDS</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">note (required)</h6>
        <h6 style="font-size:80%;font-weight:100">Accepts any text, including #tracker, @people, etc.</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">api_key (required)</h6>
        <h6 style="font-size:80%;font-weight:100">The api key provided above</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">date (optional)</h6>
        <h6 style="font-size:80%;font-weight:100">Any javascript friend Date format</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">lat (optional)</h6>
        <h6 style="font-size:80%;font-weight:100">Records Latitude</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">lng (optional)</h6>
        <h6 style="font-size:80%;font-weight:100">Records Longitude</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">source (optional)</h6>
        <h6 style="font-size:80%;font-weight:100">Source of the request (not currently displayed)</h6>
        <br>
        <h6 style="font-size:90%;font-weight:400">location (optional)</h6>
        <h6 style="font-size:80%;font-weight:100">Location name where the request was being initiated from</h6>
      </AccordionItem>
      </Accordion>
      <Accordion>
        <AccordionItem title="Advanced">
          <div class="row">
            <div class="column" style="flex:90%"> <TextArea
              bind:value={$ApiStore.privateKey}
              rows={4}
            labelText="Private Key"
            placeholder="Private Key"
            style="font-size:70%"
          /></div>
            <div class="column" style="flex:5%;"><span on:click={() => {copy($ApiStore.privateKey)}}><Copy size={16} style="cursor:pointer;"/></span></div>
          </div> 
        </AccordionItem>
      </Accordion>
    </Tile>
    <br>
    <Tile>
      <span><h6 style="font-size:80%; text-align:left">STORAGE</h6></span>
      <hr>
      <ProgressBar
        value={$ApiStore.inAPI.length}
        max={10}
        labelText="Api Storage Status"
        helperText="{$ApiStore.inAPI.length} logs of 10 logs Stored on {$ApiStore.domainName}"
      />
      <br>
      <span><h6 style="font-size:100%;font-weight:400; text-align:left;padding-bottom:10px">Auto save new logs?</h6></span>
      <Toggle toggled={$ApiStore.autoImport} labelText="Auto save new logs?" hideLabel on:toggle={()=>{ApiStore.toggleAutoImport();}}/>
    </Tile>
    <br>
    <Tile>
      <span><h6 style="font-size:80%; text-align:left">GENERAL</h6></span>
      <hr>
      <span><h6 style="font-size:100%;font-weight:400; text-align:left;padding-bottom:10px">Enabled</h6></span>
      <Toggle toggled={!$ApiStore.deviceDisabled} labelText="Auto save new logs?" hideLabel on:toggle={()=>{ApiStore.toggleDeviceDisabled();}}/>
    </Tile>
    <br>
    <Tile>
      <span><h6 style="font-size:80%; text-align:left">DANGER ZONE</h6></span>
      <hr>
      <Button kind="danger-ghost" on:click={ApiStore.forget}>Forget API on ALL Devices  / Change API Server</Button>
      <Button kind="danger-ghost" on:click={ApiStore.destroy}>Destory API Key / Change API Server</Button>
      </Tile>

    {/if}
    
</Content>


  <style>
    h2 {
       margin: 0;
       padding: 0;
       font-size: 2.5em;
       font-weight: 400;
   }

   .row {
  display: flex;
}

.column {
  flex: 50%;
  text-align:center;
}

 </style>

