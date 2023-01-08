<script>
    import { createEventDispatcher } from 'svelte';
    import {
      Button,
      Content,
        Grid,
        Row,
        Column,
    } from "carbon-components-svelte";
   
    export let pluginname;
    export let pluginemoji;
    export let parent;

   let open=true;
   
   const dispatch = createEventDispatcher();

   function exitInfo(){
        dispatch("exitinfo");
        open = false;
    }
</script>

<Content>
    <Grid>
      <Row>
        <Column>
            <h1 style="text-align:center">{pluginemoji}</h1>
            <h2 style="text-align:center">{pluginname}</h2>
            <h5 style="text-align:center">General Information</h5>
            <hr>
            <h4>General:</h4>
            <h6>This is a plugin for {parent}. This plugin will support guided breathings. After a breathing exercise the plugin will log the results (repeats & total time) in {parent}</h6>
            <hr><br>
            <h4>Licence:</h4>
            <h6>The {parent} Breathe Plugin is licenced under the MIT licence</h6>
            <h6>Copyright Ronald de Lange.
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </h6>
            <hr><br>
            <h4>Support:</h4>
            <h6>Please contact me @ ronald_de_lange@hotmail.com</h6>
        </Column>
      </Row>
      <Row>
        <Column>
            <br>
             <span><Button on:click={exitInfo} style="float: right;">Exit</Button></span>
             <br>
        </Column>
    </Row>
    </Grid>
 </Content>

  <style>
    h2 {
       margin: 0;
       padding: 0;
       font-size: 2.5em;
       font-weight: 400;
   }


 h6 {
       margin: 0;
       padding: 0;
       text-align: left;
       font-size: 1em;;
       font-weight:200;
     }


 </style>

