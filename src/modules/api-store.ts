/**
 * API Store
 * Svelte Store that interfaces with the Nomie API Client
 * */

// Svelte
import { writable } from "svelte/store";

import { globalplugin } from '../store/stores';

import APIClient from "./api-cli";
import {notifications} from '../components/notifications.js'

//import Storage from "../../modules/storage/storage";
// import Hyperstorage from "../../modules/hyperstorage/hyperstorage";

// import Note, { NoteGeo } from "../notes/note.class";

// import { ToastStore } from "../../components/toast/toast.store";
// import { AlertStore } from "../../components/alert/alert.store";
// import { NoteStore } from "../notes/note.store";
import _ from "lodash";
import NLog from "./nlog/nomie-log";
import tick from "./tick";

// import wait from "../../modules/utils/wait";
// import { DeviceStore } from "../device/device.store";

// const console = new Logger("🚦 Nomie API");
// Todo consider making this configurable
const NAPI = new APIClient({ domain: "s4eapi.smarter4ever.com" });
let plugin;
const unsubscribe = globalplugin.subscribe((value) => plugin = value);
const API_DEVICE_DISABLED = 'napi-device-disabled';
const API_AUTO_IMPORT_STATE = "napi-autoimport";


class SideStore {
  dbPath: string;
  data: any;
  constructor(path) {
    this.dbPath = `api-data/localDB/${path}`;
    this.data = JSON.parse(localStorage.getItem(this.dbPath) || "{}");
  }
  get(key) {
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  }
  put(key, value) {
    this.data[key] = value;
    localStorage.setItem(this.dbPath, JSON.stringify(this.data));
  }
}


export interface MassNapiLogImport {
  // success:Array<{nLog:any, log:NapiLog}>;
  success: Array<{ nlog: NLog; log: NapiLog }>;
  errors: Array<{ error: Error; log: NapiLog }>;
}

// From the Nomie API Service
export interface NapiLog {
  date: Date;
  id: string;
  lat?: number;
  lng?: number;
  note: string;
  source: string;
  saved?: boolean;
  discarded?: boolean;
}

// Store State Type
interface ApiStateConfig {
  domainName?: string | undefined;
  registered?: boolean;
  apiKey?: string | undefined;
  privateKey?: string | undefined;
  autoImport?: boolean;
  ready?: boolean;
  items?: Array<NapiLog>;
  inArchive?: Array<NapiLog>;
  inAPI?: Array<NapiLog>;
  generating?: boolean;
  deviceDisabled?: boolean;
}

const API_PING_TIME = 1000 * 60; // check every 4 minutes


// Nomie API Store
const createApiStore = () => {
  // Setup non syncing storage
  // const ApiLogStore = new Hyperstorage("api-logs");
  let ApiLogStore = new SideStore('napi/saved.json');
  // holder for the Auto Import Time Check
  let monitorInterval: any;
  // Create the State
  const _state: ApiStateConfig = {
    deviceDisabled: !canApiRunOnDevice(),
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
  // Get Store Items
  const { update, subscribe, set } = writable(_state);

  function canApiRunOnDevice():boolean {
    
    return localStorage.getItem(API_DEVICE_DISABLED) ? false : true;
  }

  /**
   * Get Store Logs from the Archives
   */
  function getArchives():Array<NapiLog> {
    return ApiLogStore.get("napi/saved.json") || [];
  }
  /**
   * Set Stored Logs to the Archive
   * @param stored
   */

  // function clearArchives() {
  //   return ApiLogStore.put("napi/saved.json", []);
  // }

  async function setArchives(stored: Array<NapiLog> = []) {
    ApiLogStore.put("napi/saved.json", stored);
    fuse({inArchive: stored.sort((a,b)=>{ return a.date < b.date ? 1 : -1})});
    return true;
  }

 
  /**
   * Fuse State
   * Getter and Updater for the Svelte Store State
   **/
  function fuse(_state: ApiStateConfig = {}): ApiStateConfig {
    let updatedState: ApiStateConfig;
    update((state) => {
      updatedState = { ...state, ..._state };
      return updatedState;
    });
    return updatedState;
  }


  const methods = {
    
    // Load the Napi - and fire things when ready
    async init(destroy = false) {
      // Auto clear sicne we can toggle now 
      methods.stopMonitoring();
      // Can it run on this device? 
      const canRun:boolean = canApiRunOnDevice();
      // Initialize the Client
      if(canRun === true) {
        await NAPI.init();
      }
      // When Ready
      NAPI.onReady(async () => {
        console.log("✅ S4E API Client Ready");
        // Are they registered
        let isRegistered: boolean = NAPI.isRegistered();
        if (destroy) {
          isRegistered = false;
        }
        var isAutoImport = (localStorage.getItem(API_AUTO_IMPORT_STATE) === 'true');
        // Update State Accordingly
        const state = fuse(
          isRegistered
            ? {
              registered: true,
              domainName: NAPI.domain,
                apiKey: NAPI.keyLocker.apiKey,
                privateKey: NAPI.keyLocker.privateKey,
                autoImport: isAutoImport ? true : false, //autoImport: ApiLogStore.get("auto-import") ? true : false
              }
            : {
                registered: false,
                domainName: undefined,
                apiKey: undefined,
                privateKey: undefined,
                autoImport: false,
              }
        );
        // Get the Logs if we're registered
        if (isRegistered && canRun) {
          await tick(200);
          methods.startMonitoringAPI(state.autoImport);
        }
      });
      console.log("✅ S4E API Store initialized");
    },
    clearArchives() {
      console.log("🪝 Clear?");
      ApiLogStore.put("napi/saved.json", []);
      methods.init();
    },
    toggleDeviceDisabled() {
      console.log("🪝 Toggling device disabled");
      if(canApiRunOnDevice()) {
        console.log("🪝 Currently Enabled switching to disabled");
        localStorage.setItem(API_DEVICE_DISABLED, '1');
        fuse({ deviceDisabled: true})
      } else {
        console.log("🪝 Currently Disabled switching to ENABLED");
        localStorage.removeItem(API_DEVICE_DISABLED);
        fuse({ deviceDisabled: false})
      }
      methods.init();
    },
    async toggleAutoImport() {
      update((state) => {
        console.log("🪝 Current Toggle state", state.autoImport);
        state.autoImport = !state.autoImport;
        console.log("🪝 After Toggle Toggle state", state.autoImport);
        localStorage.setItem(API_AUTO_IMPORT_STATE, state.autoImport.toString());
        //ApiLogStore.put("auto-import", state.autoImport);
        methods.startMonitoringAPI(state.autoImport);
        return state;
      });
      await tick(400);
    },
    /**
     * 
     * Discard a Log
     * This will remove a log from the archive
     * 
     * @param napiLog 
     */
    discard(napiLog: NapiLog) {
      let stored: Array<NapiLog> = getArchives() || [];
      setArchives(
        stored.map((log) => {
          if (log.id == napiLog.id) {
            log.discarded = true;
          }
          return log;
        })
      );
      update((state) => {
        state.items = stored.filter((l) => !l.discarded && !l.saved).sort((a,b)=>a.date > b.date ? 1 : -1);
        return state;
      });
    },
    /**
     * Get Archive Log
     * These are just stored in lcoal storage 
     */
    getArchivesLogs(): Array<NapiLog> {
      return getArchives() || [];
    },
    /**
     * Set Archives
     * Save them all in one big chunkt.
     * @param logs 
     */
    setArchivesLogs(logs: Array<NapiLog>) {
      return setArchives(logs);
      // ApiLogStore.put('napi/stored', logs);
    },
    /**
     * 
     * Destory the API 
     * 
     * This is to absolutely destory the API from the Device and the Server
     * 
     */
    async destroy(): Promise<boolean> {
      // Ask user for confirmation 
     // const ask = await Interact.confirm(
     //   "Destroy this API Key on the device and server?",
     //   `It will no longer work, ever. This will make the API completely unusable to external systems`
     // );
      const ask = await plugin.confirm("Destroy this API Key on the device and server?", `It will no longer work, ever. This will make the API completely unusable to external systems`);
      if (ask.value) {
        try {
          // Call Destory 
          await NAPI.destory();
          // Clear local config
          methods.clearConfig();
          return true;
        } catch (e) {
          // Clear config event if we get an error 
          methods.clearConfig();
          //Interact.error(e.message);
          plugin.alert('ERROR', e.message);
        }
      }
    },
    clearConfig() {
      NAPI.clearConfig();
      fuse({
        registered: false,
        apiKey: undefined,
        privateKey: undefined,
      });
    },
    async forget(): Promise<boolean> {
      //const ask = await Interact.confirm(
      //  "Forget the API Key and Private Key?",
      //  `The API key will still remain valid on the server, and you can use it later. But you'll need to restore using the api/private key.`
      //);
      const ask = await plugin.confirm("Forget the API Key and Private Key?", `The API key will still remain valid on the server, and you can use it later. But you'll need to restore using the api/private key.`);
      
      if (ask.value) {
        // const cleared = await clearArchives();
        // console.log("Cleared?", cleared);
         methods.clearConfig();
        notifications.default('API config forgotten', 3000)
        //Interact.toast(`API config forgotten`);
      } else {
        return false;
      }
    },
    

    async getLogs(): Promise<Array<NapiLog>> {
      // Get logs from API
      let logs: Array<NapiLog> = await NAPI.logs();
      // Get Saved / Cached Logs from Side Storage
      const stored: Array<NapiLog> = methods.getArchivesLogs();
      // Loop over logs from API
      logs.forEach((log: NapiLog) => {
        // Does it exist in Stored array?
        const fromStorage = stored.find((l) => l.id == log.id);
        // If not, it's new - lets add it
        if (!fromStorage) {
          // Mar it as not saved
          log.saved = false;
          // Pushed to Stored
          stored.push(log);
        }
      });
      
      // Save to Storage
      setArchives(stored);
      // Update State so UI can react
      const state = fuse({
        items : stored.filter((l) => !l.saved && !l.discarded),
        inArchive : stored,
        inAPI : stored.filter(l=>!l.saved && !l.discarded),
      })
      if(state.inAPI.length == 0 && logs.length > 0) {
        console.log("🔥 we have pointless logs in the API. DELETE THEM!");
        await NAPI.clear();
      }
      // Return Array of Items stored;
      return stored;
    },
    toLog(apiLog:NapiLog): NLog {
      let log: NLog = new NLog(apiLog);
      log.end = apiLog.date ? new Date(apiLog.date).getTime() : new Date().getTime();
      return log; 
    },
    async restoreKeys() {
      // Prepare user for needed info
      //const ask = await Interact.confirm(
      //  `Restore your API Key`,
      //  `To restore, you'll be asked to provide your API Key and Private Key. Continue?`
      //);
      const ask = await plugin.confirm(`Restore your API Key`, `To restore, you'll be asked to provide your API Key and Private Key. Continue?`);
      
      if (ask.value) {
        try {
          // Ask for API KEY
          let apik = await plugin.prompt("API Key", "Please provide your API Key");
          const apiKey = apik.value;
          // Ask for Private key
          let privatek = await plugin.prompt("PrivateKey", "Please provide your Private Key");
          const privateKey = privatek.value;
          // Ask for Domain
          let dmain = await plugin.prompt("Server", "Please provide API Server this key is registered");
          const domain = dmain.value;
          // If we are missing either - rerun this method again
          if (!privateKey || !apiKey || !domain) {
            methods.restoreKeys();
          } else {
            // Test if the combo is valid 
            NAPI.domain = domain.toString();
            const test = await NAPI.testAndSave(apiKey, privateKey);
            if (test === true) {
              methods.init();
              //Interact.alert(`👍  API Successfully Restored on `+domain);
              plugin.alert('Succesfully Restored', `👍  API Successfully Restored on `+domain);
            } else {
             // Interact.error("Unable to verify that API Key and Private Key combination on api server "+domain);
              plugin.alert('ERROR', "Unable to verify that API Key and Private Key combination on api server "+domain);
            }
          }
        } catch (e) {
          //Interact.error(e.message);
          plugin.alert('ERROR', e.message);

        }
      }
    },
    /**
     * Restore a Discarded Log
     * @param log 
     */
    restoreLog(log:NapiLog) {
      // Remove saved and discarded
      log.saved = false;
      log.discarded = false;
      // Get the latest archives
      const archives = getArchives();
      // SEt the archives with an updated log
      setArchives(archives.map((loopLog:NapiLog)=>{
        if(loopLog.id == log.id) {
          return log;
        } else {
          return loopLog
        }
      }))
    },
    async autoImport() {
      // Get all the logs from the API and Stored Locally
      // Filter out Saved and Discarded
      let allLogs: Array<NapiLog> = (await methods.getLogs()) || [];
      let logs: Array<NapiLog> = allLogs.filter((l) => !l.saved && !l.discarded);
      
      // If we have logs lets import them
      if (logs.length) {
        await tick(10000); // we wait for 10 seconds to avoid conflict when Nomie is starting up
        // Save the Logs
        let results: MassNapiLogImport = await methods.import(logs);
        // If no errors - show a toast notification
        if (results.errors.length == 0 && results.success.length == logs.length) {
          // Interact.toast(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
         // Interact.toast(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
         // await plugin.alert('Confirmed', `${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
         notifications.default(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`, 4000)
          // Clear the Nomie API
          await NAPI.clear();
        } else {
         // await Interact.alert( "Import incomplete",`Imported ${results.success.length} of ${logs.length}. Please go to settings / data / nomie api / captured to see all notes current available.`);
          await plugin.alert('Import incomplete', `Imported ${results.success.length} of ${logs.length}. Please go to main page to see all notes current available.`);
        }
        // Refresh
        methods.getLogs();
      }
    },
    async import(logs: Array<NapiLog>): Promise<MassNapiLogImport> {
      let archives:Array<NapiLog> = getArchives();
      // Block the UI
      //Interact.blocker(`Importing ${logs.length}  ${logs.length > 1 ? "notes" : "note"} from the API...`);
      await tick(500);
      // loop over each log
      let results: MassNapiLogImport = {
        errors: [],
        success: [],
      };
      // For loop (for async) over logs
      for (let i = 0; i < logs.length; i++) {
        // Get log
        let log: NapiLog = logs[i];
        await tick(1000); // we take the time for every log to avoid document errors
        try {
          // Add the Date
          // Convert it into an official Nomie Log
          // let nLog = methods.toLog(log);
          const nlog = methods.toLog(log);
          // Add a millsecond at the end to avoid duplicate IDs
          // await NoteStore.save(note);
          // Save the Log

          // RDL REMOVED const saved = await LedgerStore.saveLog(nlog);
          let saved = true;
          console.log("🪝 Nomie Api Plugin is Saving Imported Logs")
          saved = await plugin.createNote({
            note: nlog.note,
            end: nlog.end,
            lat: nlog.lat,
            lng: nlog.lng,
            location: nlog.location,
            score: nlog.score,
            source: nlog.source
          });
          
          log.saved = saved ? true : false;
          // Update the Archives for this Note / Log
          let foundInArchive:boolean = false;
          // Map map saved log in archive.
          archives = archives.map((loopLog:NapiLog)=>{
            if(loopLog.id == log.id) {
              foundInArchive = true;
              loopLog.saved = true;
            }
            return loopLog;
          });

          if(!foundInArchive) {
            log.saved = true;
            archives.push(log);
          }

          // Update the Archive 
          setArchives(archives);
          // Push successful save to results 
          results.success.push({ nlog, log });
        } catch (e) {
          // An error has happened
          results.errors.push({
            error: e.message,
            log,
          });
          // Show error to console
          console.error(e.message);
        }
      }
      // Stop the blocker
      //Interact.stopBlocker();
      methods.getLogs();
      // return the error, success arrays
      return results;
    },
    
    async changeDomain() {
      this.destroy();
      this.register();
    },

    /**
     * Register for a New API Key
     */
    async register() {
      // Notify user we're generating
      //let domainname = await Interact.prompt("Which Server","on which APi Server do you want to register?");
      let domain = await plugin.prompt("Which Server", "on which APi Server do you want to register?");
      let domainname = "";
      if (domain){
        domainname = domain.value;
        NAPI.domain = domainname.toString();
        fuse({ generating: true });
        try {
          // Get new API key and private key
          const registered = await NAPI.register() ;
          // If we're good 
          if (registered) {
            fuse({
              generating: false,
              registered: true,
              privateKey: NAPI.keyLocker.privateKey,
              apiKey: NAPI.keyLocker.apiKey,
              domainName: NAPI.domain,
            });
          } else {
            // Something bad happened
           // Interact.error("An unknown error occured while registering.");
            plugin.alert('ERROR', "An unknown error occured while registering.");
            console.error(registered);
          }
        } catch (e) {
          // Something really bad happened
          //Interact.error(e.message);
          plugin.alert('ERROR',e.message);
          fuse({ generating: false });
          console.error(e);
        }}
      else { // No domain given
       // Interact.error("Please provide a API Server address.");
        plugin.alert('ERROR', "Please provide a API Server address.");
        }  
    },
    /**
     * 
     * Monitor API
     * 
     * We will monitor the API from here - passing in the AutoImport is a way 
     * to avoid having to bring the UserStore into here causing a circular
     * dependency - which outputs a console warning and is annoying. 
     * But having to pass it in here is fucking annoying too. 
     * 
     * @param autoImport: boolean 
     */
    startMonitoringAPI(autoImport: boolean = false) {
      // Begin Monitoring 
      console.log("🟢🟢🟢 Starting to Monitor the API");
      // Clear the last Interval
      methods.stopMonitoring();
      // Function to call each interval 
      const monitor = () => {
        // If we're auto import or not 
        if (autoImport) {
          // Get and Import
          methods.autoImport();
        } else {
          // get logs only
          methods.getLogs();
        }
      };
      // Every N minutes 
      monitorInterval = setInterval(monitor, API_PING_TIME);
      // Immediate 
      monitor();
    },
    stopMonitoring() {
      clearInterval(monitorInterval);
    },

    unRegister() {
      NAPI.unRegister();
    }
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const ApiStore = createApiStore();
