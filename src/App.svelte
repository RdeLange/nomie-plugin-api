<script>
  import { onMount , onDestroy} from 'svelte';
  import { globalplugin } from './store/stores';
	import Toast from './components/toast.svelte'
  import "carbon-components-svelte/css/all.css";
  import {
    Header,
    HeaderUtilities,
    HeaderGlobalAction,
    SkipToContent,
    Theme,
  } from "carbon-components-svelte";
  import Main from "./pages/main.svelte";
  import Info from "./pages/info.svelte";
  import Settings from "./pages/settings.svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import Sun from "carbon-icons-svelte/lib/Sun.svelte";
  import Information from "carbon-icons-svelte/lib/Information.svelte";

  import { ApiStore } from "./modules/api-store";

  const pluginname = "Nomie API";
  const pluginemoji = "🪝";
  var parent = "";

  const API_DEVICE_DISABLED = 'napi-device-disabled';
  const CLIENT_RUNNING = 'napi-client-runing';
  const BACKGROUND_RUNNING = 'napi-background-running';
  const LATEST_API_CONFIG = 'napi-latest-config';
  
  const plugin = new NomiePlugin({
        name: pluginname,
        emoji: pluginemoji,
        description: "Plugin to enable self hosted API",
        uses: ["createNote", "onLaunch", "getLocation"],
        version: "0.9",
        addToCaptureMenu: true,
        addToMoreMenu: true,
        addToWidgets: true,
      }); 

  
  let config =  {
    deviceDisabled: true,
    registered: undefined,
    domainName: null,
    apiKey: null,
    privateKey: null,
    autoImport: false,
    ready: false,
    items: [],
    inArchive: [],
    inAPI: [],
    generating: false,
  };
  let inNomie = false;
  let isSideNavOpen = false;
  let theme = "g10";
  let mode = "hidden";
  let loading = true;
  let view = "main";

  $: if($ApiStore){
    setTimeout(()=>{
      let config = $ApiStore;
     if(mode == "modal"){localStorage.setItem(LATEST_API_CONFIG, JSON.stringify(config));}
      plugin.storage.setItem('config', config);
    },500)
  }

  function clientRunning(){
    localStorage.setItem(CLIENT_RUNNING,new Date());
    setTimeout(()=>{
      //ApiStore.init();
    },5000); // was 5000 rdl
    setInterval(()=>{
      localStorage.setItem(CLIENT_RUNNING,new Date());
    },5000)
  }

  // Load init params
  function loadInitParams() {
    parent = getParentUrl();
    globalplugin.set(plugin);
    plugin.onUIOpened(async () => {
      mode = 'modal';
      clientRunning();
      console.log("==================🪝🪝=================");
      console.log("🪝 Nomie API Plugin Client Started");
      console.log("==================🪝🪝=================");
    if ($ApiStore.registered && !$ApiStore.deviceDisabled) {
      showMain();
    }
    else {showSettings()}
      
    });
    plugin.onLaunch(async () => {
      console.log("==================🪝🪝=================");
      console.log("🪝 Nomie API Plugin onLaunch");
      console.log("==================🪝🪝=================");
     // onLaunchStart();
      
    });
    plugin.onWidget(() => {
      if (plugin.prefs.theme == "light") {
        theme = "white"}
      else if (plugin.prefs.theme == "dark") {
        theme = "g100"}  
      else {theme = "g10"} 
      mode = "widget";
    });

    plugin.onRegistered(async () => {
      await plugin.storage.init()
      config = await plugin.storage.getItem('config') || JSON.parse(localStorage.getItem(LATEST_API_CONFIG)) || {
    deviceDisabled: true,
    registered: undefined,
    domainName: "testing",
    apiKey: null,
    privateKey: null,
    autoImport: false,
    ready: false,
    items: [],
    inArchive: [],
    inAPI: [],
    generating: false,
  };
      if (config.deviceDisabled) {
        localStorage.setItem(API_DEVICE_DISABLED, '1');}
      else { localStorage.removeItem(API_DEVICE_DISABLED);}
      ApiStore.set(config);
      let cliconfig = {"apiKey":config.apiKey,"privateKey":config.privateKey,"domain":config.domainName};
      localStorage.setItem(API_CLI_CONFIG, JSON.stringify(cliconfig));
     
      if (plugin.prefs.theme == "light") {
        theme = "g10"}
      else if (plugin.prefs.theme == "dark") {
        theme = "g90"}  
      else {theme = "g10"} 
      loading = false;
      inNomie = true;
    })

  setTimeout(() => {
    if (plugin.prefs) {
      inNomie = true;
      loading = false;
    }}, 700)
  }

  // change theme
  function toggleTheme(){
    if (theme == "white"){
      theme = "g10"}
    else if (theme == "g10"){
      theme = "g80"}
    else if (theme == "g80"){
      theme = "g90"}
    else if (theme == "g90"){
      theme = "g100"}
    else {
      theme = "white"}
 }

  // Get parent
  function getParentUrl() {
    var isInIframe = (parent !== window),
        parentUrl = null;

    var parentfound = null;
    
    if (isInIframe) {
        parentUrl = document.referrer;
    }

    if (parentUrl.includes("smarter4ever")) {
      parentfound = "Smarter4Ever"
    }
    else {parentfound = "Nomie"}

    return parentfound;
}



async function onLaunchStart(){
  ApiStore.init();
  localStorage.setItem(BACKGROUND_RUNNING,"1");
  setInterval(async ()=>{
  if (localStorage.getItem(CLIENT_RUNNING)){
    console.log("🪝 Nomie Api Plugin detecting client is running")
    if (localStorage.getItem(BACKGROUND_RUNNING)){
      ApiStore.stopMonitoring();
      localStorage.removeItem(BACKGROUND_RUNNING);
      console.log("🪝 Nomie Api Plugin client will take over processing as long as it is open");} 
    
    let lastclienttick = new Date(localStorage.getItem(CLIENT_RUNNING));
    let now = new Date();
    let deltaseconds = Math.abs(lastclienttick.getTime() - now.getTime())/1000;
    //keep config synced
    ApiStore.set(JSON.parse(localStorage.getItem(LATEST_API_CONFIG)));
    
    // validate if client has not been running for more then 6 secs, then take over central processing again
    if (deltaseconds > 6) {
      localStorage.removeItem(CLIENT_RUNNING);
      localStorage.setItem(BACKGROUND_RUNNING, new Date());
      //final config sync
      ApiStore.set(JSON.parse(localStorage.getItem(LATEST_API_CONFIG)));
      setTimeout(async()=>{let latestconfig = JSON.parse(localStorage.getItem(LATEST_API_CONFIG));
        ApiStore.setArchivesLogs(latestconfig.inArchive);
        if (latestconfig.registered == false){
          await ApiStore.init(true); // need this (true) in order to destroy previously set keys in keylocker
        }
        else {await ApiStore.init()}},200);
       
      console.log("🪝 Nomie Api Plugin detecting client is closed")
      console.log("🪝 Nomie Api Plugin background will take over processes")
    }
    
  }
  else {
    // background processes are running
  }
},5000);
}

//view main page
function showMain(){
  view = "main"
  window.scrollTo(0,0);
 }
 
 //view info page
 function showInformation(){
  view = "info"
  window.scrollTo(0,0);
 }

 //view settings page
 function showSettings(){
  view = "settings"
  window.scrollTo(0,0);
 }

 function saveSettings(){
  showMain();
 }


 onMount(async () => {
  loadInitParams();
 })

</script>

{#if mode == "modal"  || mode =="widget"}
<Theme bind:theme />
{#if inNomie}
{#if mode == "modal"}
<Header company={parent} platformName={pluginname} on:click={showMain}>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderUtilities>
    <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust} on:click={showSettings}/>
    <HeaderGlobalAction aria-label="Theme" icon={Sun} on:click={toggleTheme}/>
    <HeaderGlobalAction aria-label="Theme" icon={Information} on:click={showInformation}/>
  </HeaderUtilities>
</Header>

{#if view == "main"}
<Main pluginname={pluginname} pluginemoji={pluginemoji}/>
{:else if view == "info"}
<Info parent={parent} pluginname={pluginname} pluginemoji={pluginemoji} on:exitinfo={showMain}/>
{:else if view == "settings"}
<Settings pluginname={pluginname} pluginemoji={pluginemoji} bind:config={config} on:exitsettings={showMain} on:savesettings={saveSettings}/>
{/if}
{:else if mode == "widget"}
<p>Widget Placeholder</p>
{/if}
{/if}

{:else if !inNomie}
        <h1 style="text-align:center">{pluginemoji}</h1>
        <h2 style="text-align:center">{pluginname}</h2>
        <h5 style="text-align:center">This is a plugin for Nomie</h5>
        <hr>
{/if}
{#if loading}
<div class="startup">
<p>Loading....</p>
</div>
{/if}
<Toast/>