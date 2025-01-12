
// each panel of the ui; comes in different kinds
class Panel {
    constructor(parentUI, kind, rowStart, rowEnd, columnStart, columnEnd, name=null, links=null) {
      // panel templats:
      // this.templates = {
      //     binin: {
      //         dom: {
  
      //         }
      //     }
      // }
      this.ui = parentUI;
      this.outer = document.createElement("div");
      this.ui.grid.append(this.outer);
      if (name != null){
          this.outer.id = name;
      }
      this.outer.className = "panel_outer";
  
      this.inner = document.createElement("div");
      if (name != null){
          this.inner.id = name+"_inner";
      }
      this.inner.className = "panel_inner";
  
      this.outer.appendChild(this.inner);
  
  
      this.settings = {};
  
      // set up the dragging "grid"
      for (let i=1; i<4; i++){
        for (let j=1; j<4; j++){
          var edge;
          if ( !( (i==2) && (j==2) ) ){
            edge = this.outer.appendChild( document.createElement("div") );
            edge.classList.add("panel_edge");
            edge.style.gridRow = `${i} / ${i+1}`;
            edge.style.gridColumn = `${j} / ${j+1}`;
            // edge.title = `row ${i} / col ${j}`; // debug
          }
          if ( (i==3) && (j==3) ){
            edge.style.cursor = "se-resize";
            // console.log(edge);
            this.assignResize(this, edge);
          }
        }
      }
  
  
      this.name = name;
      this.nameValid = this.name.replace(/\s/g, ""); // should make a valid html id
      this.kind = kind;
      this.source = null; // input data source
      this.links = []; // references to other panels that might have transformed a .source
      this.nexts = [];
      this.palette = pal; //TODO: re-work palette system
      this.fileInputs = []; // will be populated if there are file <input>s
      // assume it's an array
      if (links){
        links.forEach(d => this.links.push(this.ui.panels[d]) );
      }
  
      this.eventListeners = []; // need to add them after their on the page...?
  
      this.index = this.ui.panels.length;
      console.log(`panel  ${this.name} should be index ${this.index}`);
  
      // HEADER
      // create a header
      this.inner.appendChild(document.createElement("div") );
      this.panelHeader = this.inner.children[this.inner.children.length-1];
      this.panelHeader.id = this.name+"_header";
      this.panelHeader.className = "panel_header";
  
      // add the title
      this.title = document.createElement("div");
      this.title.innerHTML += this.index+') '+this.name;
      this.title.classList.add("panel_header_title");
      this.title = this.panelHeader.appendChild(this.title);
  
      // add the settings/menu button
      this.menuButton = document.createElement("div");
      this.menuButton.innerHTML += "☰";
      this.menuButton = this.panelHeader.appendChild(this.menuButton);
      this.menuButton.classList.add("panel_menu_button");
  
      // add the collapse button
      this.collapse = document.createElement("div");
      this.collapse.innerHTML += "˄";
      this.collapse.classList.add("collapser");
      this.collapse = this.panelHeader.appendChild(this.collapse);
      var collapseTime = 2000; // only source of collapse timing, to prevent redundancy
      this.collapse.style.transition = `height ${collapseTime/1000}s ease 0s`;
  
      // Event listener for collapsing the panelContent
      this.collapse.addEventListener("click", (event) => {
  
        // only if panel is not maximixed
        if ( this.inner.getAttribute("data-maximized")=="false" ) {
  
          // handle the css for transition animation
          event.target.classList.toggle("collapser_collapsed");
          this.panelContent.classList.add("panel_content_collapsing_expanding");
          this.panelContent.style.transition = `height ${collapseTime/1000}s ease 0s`;
          setTimeout( () => {this.panelContent.style.transition = ``;}, collapseTime );
  
          let headerHeight = this.panelHeader.getBoundingClientRect().height;
  
          // set the actual new height
          if (this.inner.getAttribute("data-collapsed")=="true"){
            this.menu.style.height = "max-content";
            this.panelContent.style.height = (this.inner.getAttribute("data-user-height")-headerHeight)+"px";
            this.inner.setAttribute("data-collapsed", "false");
          } else {
            this.menu.style.height = "0px";
            this.panelContent.style.height = "0px";
            this.inner.setAttribute("data-collapsed", "true");
          }
  
        }
      });
  
  
      // CONTENT
      // create the content
      this.inner.appendChild(document.createElement("div") );
      this.panelContent = this.inner.children[this.inner.children.length-1];
      this.panelContent.id = this.name+"_content";
      this.panelContent.className = "panel_content";
  
      // MENU
      // create the settings menu which will normally be hidden
      this.inner.appendChild(document.createElement("div") );
      this.menu = this.inner.children[this.inner.children.length-1];
      this.menu.id = this.name+"_menu";
      this.menu.className = "panel_menu";
      this.menu.innerHTML = "<h4>Settings</h4>";
  
      // Event listener for opening the menu
      //HACK: using setTimeout...
      setTimeout(
        ()=> {
          this.panelHeader.querySelector(".panel_menu_button").addEventListener("click", (event) => {
            this.toggleMenu(event);
              // console.log("toggling menu");
  
              // // change button appearance
              // event.target.classList.toggle("panel_menu_button_opened");
              // // change menu appearance (show it)
              // this.inner.querySelector(".panel_menu").classList.toggle("panel_menu_opened");
              // this.inner.querySelector(".panel_content").classList.toggle("panel_content_disabled");
  
            }
          );
          console.log("menu event listener added.");
        },
        2000);
  
  
      // create outer and inner html divs
      // let headerHeight = 0;
      var offsetsTop, m;
  
      switch (kind){
          case "textDescription":
            //TODO: move the below text to another file
            // this.panelContent.classList.add("panel_inner_text");
            this.panelContent.innerHTML += `\
              <div class="text_content" >
                <p>
                  <b>Hello!</b> This app decompresses graphics data from DKC, and provides visualizations that can help in ROM hacking.
                  <br><br>
                  It provides several panels with different applications:
                  <ul>
                    <li> <b>Hex Viewer</b>. View hexadecimal data from game files. If viewing a processed set of data, such as decompressed data, you can download it from the "☰" menu.<br>
                      <ul>
                        <li> After uploading valid compressed data, if there is a hex viewer panel for <i>de</i>compressed data, you can navigate to its "☰" menu and click "Animate Decompression Process". This will show you a visualization of the process, with data bytes given different shades to correspond to the decompression mode used. These graphics files contain many spans of compressed data, and each span has one of several possible compression/encoding modes, and usually an operand as well.</li>
                      </ul>
                    </li>
                    <li> <b>Bitplane Viewer</b>. Visualize SNES 4 bit per pixel graphics tiles and their weird intertwined format.<br>More details...
                      <ul>
                        <li> Upload a file to "Input - Compressed Data" to get started. This expects a .bin file that you might get in a disassembly of the game, usually in the "graphics/compressed" folder. Or, copy the hex values from the relevant offset of your ROM to a new file.</li>
                        <li> After uploading valid data, the bitplane diagram should appear, showing the first tile. In the diagram, you can see how the 32 bytes of data comprise the four bitplanes. Each pixel or "cell" of the 8x8 bitplane is stacked with those of the other bitplanes to form a color index of between 0 and 15 (0x0 to 0xF) for each pixel of the tile. For example, if the bitplanes read "1 0 1 0" from front to back for a given pixel, that pixel's index value will be "A".</li>
                        <li> The bitplane diagram is a 3d model and can rotate when dragged. ctrl+scroll to zoom in or out.</li>
                        <li> Click the "<" and ">" buttons near the top to flip through the tiles. Alternatively, if a tileset viewer panel is present, click a tile within that panel to show it in the bitplane viewer.</li>
                      </ul>
                    </li>
                    <li> <b>Palette Viewer</b>. View color palettes used in the game's levels. Select a row of colors (16-color sub-palette) to assign it to the indexed tile in the bitplane viewer. <br>(Currently uses the following forumla: <br>SNES 5 bit color channel  ×  8  =  RGB 8 bit channel<br> ... there are different ways to convert the colors.)</li>
                    <li> <b>Tileset Viewer</b>. View the 8x8 pixel tiles in their grayscale form, before they are assigned a color palette.</li>
                    <li> <b>Metatiles Viewer</b>. View 32x32 pixel metatiles. Each metatile is composed of 4x4 tiles, 16 total. Each of the metatiles is built using an associated color sub-palette, and potentially horizontal and/or vertical flip; hover to view these details. Requires graphics tiles, palette, and then tilemap32 to be uploaded. Make sure your tilemap32 matches your 8x8 tiles: for example, don't use a foreground/background tilemap on layer 3 tiles, or vice versa. Mainly meant for FG/BG.</li>
                    <li> <b>Level Map Viewer</b>. View level maps built from the metatiles. Currently only supports horizontal levels. Requires graphics tiles, palette, tilemap32, and then level map to be uploaded.</li>
                  </ul>
                  <br>
                  Most features require uploading a file to the relevant file input panels on the page. Data will be persist through page refreshes, but not page closes.
                </p>
                <br>
                  Panels can be:<br>
                  <ul>
                      <li> moved around the page by dragging their headers</li>
                      <li> resized by dragging the bottom right corner</li>
                      <li> collapsed by clicking "˄" in the header</li>
                      <li> and maximized by double clicking the header.</li>
                    </ul>
                  Some panels also have settings or other features hidden in the "☰" menu. You can zoom out of the page (usually ctrl+scroll) to have more space to organize your panels. Depending on the initial panelset template, some panels may be hidden off-screen at first.
  
                <br><br>
                <p>
                  The app's first release was made to celebrate DKC's 30th anniversary. The goal is to de-mystify DKC hacking and to provide even more appreciation for what Rare developed in the 1990s. More features will continue to be added. Works best in a full screen window, tested most thoroughly with firefox. You can expect more features for visualizing, documenting, and hacking the DKC series soon. Thanks!
                </p>
                <br><br>
                <p>
                  Special thanks to the DKC Atlas community members and their previous work. In particular Kingizor's dkcomp program. In the future I will update this page with additional guides and resources, and their proper credits.
                </p>
                <br><br><br>
                <p>
                <b>Disclaimer</b>. This software is not official or supported by Nintendo, nor any other commercial entity. It is provided AS IS, and its use is at your own risk.
                </p>
              </div>`;
            break;
  
          case "fileIn":
              // Create a file input, save it to the panel object, and add to panel gui
              //TODO: clean up
              // this.panelContent.appendChild( ff() );
              this.fileInputs.push(document.createElement("input"));
              this.fileInputs[this.fileInputs.length-1].id = "ii";
              this.fileInputs[this.fileInputs.length-1].className = "fileInput";
  
              this.fileInputs[this.fileInputs.length-1].type = "file";
              this.fileInputs[this.fileInputs.length-1].value = null;
              // this.input = input;
              // this.fileInputs.push(this.input);
              this.panelContent.appendChild(this.fileInputs[this.fileInputs.length-1]);
              // console.log("panelHeader children");
              // console.log(this.panelHeader.children);
              // headerHeight += this.input.style.height;
  
              // old way had no break; flow into hexviewer
  
              // give some time, then load stored data if it exists
              if (sessionStorage.getItem(this.nameValid+'_source')) 
                setTimeout( ()=> {
                  this.source = JSON.parse( sessionStorage.getItem(this.nameValid+'_source') );
                  // special handling
                  this.source.data = Object.entries(this.source.data).map(d=>d[1]) ; 
                  this.source.panel = this;
                  this.panelContent.innerHTML = '<i>Retrieved "'+this.source.filename+'" from browser session storage.<br>(Close & reopen page to clear)</i>';
                  this.propagateSource();
                }, 1000);
              
              break;
  
          case "bitplaneViewer":
              this.selectedTile = 1;
              // bitplane header (controls)
              //
  
  
  
              // `<div id="Bitplane Viewer - Decompressed Data_bitplane_header" class="bitplane_header">
              //   <button class="byteWidthButton">Change View</button>
              //   <div class="seekButtons">
              //     <button class="seekTileDownButton">&lt;</button>
              //     <a>Tile&nbsp;</a>
              //     <a>1</a>
              //     <a>&nbsp;of&nbsp;</a>
              //     <a>...</a>
              //     <button class="seekTileUpButton">&gt;</button>
              //   </div>
              // </div>`
  
              // header itself
              let bph = document.createElement("div")
              // bph = this.panelContent.children[this.panelContent.children.length-1];
              bph.id = this.name+"_bitplane_header";
              bph.className = "bitplane_header";
  
              // this.bitplaneHeader2 = this.panelContent.querySelector(".bitplane_header");
              // console.log("bitplane header query selector:");
              // console.log(this.bitplaneHeader2);
  
  
              // this.bitplaneHeader3 = this.inner.querySelector(".panel_content > .bitplane_header");
              // console.log(" inner query selector:");
              // console.log(this.bitplaneHeader3.innerHTML);
  
  
  
  
              // change view button
              // this.byteWidthButton = document.createElement("button");
              // this.byteWidthButton.innerHTML = "Change View";
              // this.byteWidthButton.className = "byteWidthButton";
              // bph.appendChild(this.byteWidthButton);
  
              // seek tile buttons
              // this.seekTileDownButton = document.createElement("button");
              // this.seekTileDownButton.append("<");
              // this.seekTileDownButton.className = "seekTileDownButton";
              // let seek0 = document.createElement("a");
              // seek0.innerHTML = "Tile&nbsp;";
              // let seek1 = document.createElement("a");
              // seek1.innerHTML = "1";
              // let seek2 = document.createElement("a");
              // seek2.innerHTML = "&nbsp;of&nbsp;";
              // let seek3 = document.createElement("a");
              // seek3.innerHTML = "...";
              // this.seekTileUpButton = document.createElement("button");
              // this.seekTileUpButton.append(">");
              // this.seekTileUpButton.className = "seekTileUpButton";
  
              // let seekButtons = document.createElement("div");
              // seekButtons.className = "seekButtons";
              // seekButtons.innerHTML = `<button class="seekTileDownButton">&lt;</button><a>Tile&nbsp;</a><a>1</a><a>&nbsp;of&nbsp;</a><a>...</a><button class="seekTileUpButton">&gt;</button>`;
              // this.seekButtons = bph.appendChild(seekButtons);
  
              // this.seekTileDownButton = this.seekButtons.appendChild(this.seekTileDownButton);
              // [ seek0, seek1, seek2, seek3 ].forEach(d => this.seekButtons.appendChild(d));
              // this.seekTileUpButton = this.seekButtons.appendChild(this.seekTileUpButton);
  
  
              // this.bitplaneHeader = this.panelContent.appendChild( bph );
  
              // console.log("bitplane header .children[last]:");
              // console.log(this.bitplaneHeader);
              this.inner.classList.add("panel_inner_bitplane");
              this.panelContent.classList.add("panel_content_b1");
  
              //HACK
              setTimeout(()=>{
  
                // this.inner.querySelector(".panel_content > .hex_header > .byteWidthButton").addEventListener("click",
                //   (event) => {
                //     console.log(event);
                //     // changeByteWidth(event.target.parentNode.parentNode);
                //     this.animate16to1();
                //   });
  
                this.inner.querySelector(".panel_content > .hex_header > .seekButtons > .seekTileUpButton").addEventListener("click",
                  (event) => {
                    console.log(event);
                    updateBitplaneSeek(event.target.parentNode.parentNode.parentNode, this, +1)
                  }
                );
  
                this.inner.querySelector(".panel_content > .hex_header > .seekButtons > .seekTileDownButton").addEventListener("click",
                  (event) => {
                    console.log(event);
                    updateBitplaneSeek(event.target.parentNode.parentNode.parentNode, this, -1)
                  }
  
                );
                // console.log("buttons nodes");
                // console.log(this.inner.querySelector(".panel_content > .hex_header > .byteWidthButton"));
                // console.log(this.inner.querySelector(".panel_content > .hex_header > .seekButtons > .seekTileUpButton"));
              }, 1000);
  
              m = "_b1";
  
              offsetsTop = `\
                <div class="hex_header_offset"><a>OFFSET</a></div>
                <div class="hex_header_labels_left hex_header_labels_left${m}">
                  <a class="hex_header_base_label hex_header_base_label${m}" style="grid-column: 1 / -1;  grid-row: 1;">Hex</a>
                </div>
                <div class="hex_header_labels_right  hex_header_labels_right${m}">
                  <a class="hex_header_base_label hex_header_base_label${m}" style="grid-column: 1 / -1;  grid-row: 1;">Binary</a>
                </div>
                <div class="seekButtons">
                  <button class="seekTileDownButton">&lt;</button>&nbsp;<a>Tile</a>&nbsp;<a id="currentTile">1</a>&nbsp;<a>o</a>f&nbsp;<a id="totalTiles">...</a>&nbsp;<button class="seekTileUpButton">&gt;</button>
                </div>`;
  
              this.panelContent.innerHTML +=
                  `<div class="hex_header hex_header_bitplane">${offsetsTop}</div>
                  <div class="hex_content hex_content_bitplane"
                   style="grid-template-rows: 100%;"></div>`;
                   //NOTE: need this grid-template-rows: 100%;  so that bp viewer doesn't
                   // overflow/scroll for wide aspect ratios.
  
              this.panelContent.setAttribute("data-mode","byte1");
  
              break;
  
          case "hexViewerComp":
          case "hexViewer":
              this.selectedTile = 1;
  
              
  
              this.scrollGroup = 0; // currently-viewed g256 group
              this.scrolling = false;
              this.groupSize = 64;
              // setTimeout(()=>{
              //   // add scroll tracker to hexContent
              //   this.inner.querySelector(".panel_content > .hex_content").addEventListener("scroll",
              //     (event)=>{
              //       // console.log("scroll");
              //       // console.log(event);
              //       // console.log(this.inner.querySelector(".panel_content > .hex_content").scrollTop);
  
              //       // scroll updating, with some debouncing.
              //       if (!this.scrolling){
              //         this.scrolling = true;
              //         this.hexScroll();
              //         setTimeout( this.hexScroll(), 500); //HACK: because "scrollend" isn't supported in safari yet.
              //       }
              //     });
              // }, 2000);
                
  
              ////////////////
  
              this.panelContent.innerHTML +=
                  `<div class="hex_header"></div>
                  <div class="hex_content"
                   style=""></div>`;
  
              this.panelContent.setAttribute("data-mode","byte16");
                  // this.inner.innerHTML +=
                  // `<div class="hexViewer" >
                  //     <div class="hexViewerTop"></div>
  
                  //     <div class="hexViewerScrollWrapper">
                  //         <div class="hexViewerScroll">${sbytes}</div>
                  //     </div>
                  // </div>`;
  
              this.panelContent.classList.add("hex_panel_content");
  
              // Add details about Line Height to settings:
              this.settings['Line Height'] = {value:3};
  
              // Add a byte-width change button to settings:
              this.settings['Number of Columns'] = {value:16};
              this.columnBits = (Math.log(this.settings['Number of Columns'].value)/Math.LN2);
              // this.lineHeightInPx = this.getLineHeightInPx();
              this.settings['Spacing Every x Bytes'] = {value:'None'}
              this.settings['Spacing Amount'] = {value:0}
              
  
              setTimeout( ()=>{
                let downloadButton = document.createElement("button");
                downloadButton.className = "downloadButtons";
                downloadButton.innerHTML = "Change Number of Columns";
                downloadButton.title = "Change Number of Columns (16/32)";
                downloadButton.style.height = "2em";
                this.byteWidthButton = this.inner.querySelector(".panel_menu").appendChild( downloadButton );
                this.settings['Number of Columns'].html = [this.byteWidthButton];
  
                this.byteWidthButton.addEventListener("click", (event) => {
                  this.panelContent.classList.toggle("hex_panel_content_32wide");
                  // toggle within settings for refering to elsewhere
                  this.settings['Number of Columns'].value = this.settings['Number of Columns'].value==16?1:16;
                  this.columnBits = (Math.log(this.settings['Number of Columns'].value)/Math.LN2);
                  this.setPanelContentColumns();
                  this.setPanelContentRows();
                  // Update line/group/row heights:
                  // this.updateLines();
  
                });
                console.log("byte width button added...");
              },
              2100
            );
  
            //TODO: settings for adjusting "line-spacing":
            // use:
            // let newLineHeight = "4em";
            // Array.from(document.getElementsByClassName("hex_byte")).forEach(d=>d.style.height=newLineHeight);
  
            this.settings['Byte Mode'] = 'byte'; // 'nibble', 'bit'
            // this.settings['Byte Mode'] = 'nibble';
            // this.settings['Byte Mode'] = 'bit';
  
  
            // debug 
  
            // if (kind=='hexViewer'){
  
            //   this.source = {
            //       name: "Debug",
            //       kind: "bytes",
            //       data: Array.from(Array(128*64).keys()).map(d=>Math.round(255*Math.random())),
            //       panel: this,
            //       from: this.links[0]
            //   };
            //   this.initHex(); //generates the strings
            //   this.generateLineSpacingRange();
            //   this.setPanelContentColumns();
              
            //   this.setPanelContentRows();
            //   this.generateHexHeaderHTML();
            //   this.generateHexHTML( this.source.data, 0, this.groupSize*2);
            //   // this.hexScroll();
            //   // setTimeout( ()=>{this.hexScroll();}, 1000); // will generate an appropriate amount of rows 
            //   // this.updateLines();
            //   // end debug
            // }
  
            // add scroll tracker to hexContent
            this.inner.querySelector(".panel_content > .hex_content").addEventListener("scroll",
                  (event)=>{
                    if (!this.scrolling){
                      requestAnimationFrame( ()=>{
                      // scroll updating, with some debouncing.
                        this.scrolling = true;
                        this.hexScroll();
                        // setTimeout( this.hexScroll(), 500); //HACK: because "scrollend" isn't supported in safari yet.
                      } );
                    }
                });
  
            break;
  
          case "paletteViewer":
            this.inner.classList.add("panel_inner_palette");
            this.panelContent.innerHTML +=
                  `<div class="palette_content" ></div>`;
            break;
  
          case "tilesetViewer":
            // this.inner.classList.add("panel_inner_tileset");
            // this.panelContent.innerHTML += `<div class="tileset_content"></div>`;
  
            // break;
  
          case "metatilesViewer":
            this.settings['Number of Columns'] = {value:4};
  
            this.inner.classList.add("panel_inner_tileset");
            this.panelContent.innerHTML += `\
              <div class="tileset_content">
                <div class="grid_placeholder" style="grid-column: 1 / -1; grid-row: 1;">
              </div>`;
              // this placeholder will help maintain the size of the grid even when we remove elements from it, so the scrollbar will be accurate
  
            // add scroll tracker to hexContent
            this.scrolling = false;
            this.scrollGroup = 0;
            this.groupSize = 1;
            this.inner.querySelector(".panel_content > .tileset_content").addEventListener("scroll", (event)=>{
  
                    console.log('tileset scroll event listener');
                    if (!this.scrolling){
                      requestAnimationFrame( ()=>{
                      // scroll updating, with some debouncing.
                        this.scrolling = true;
                        this.tileScroll();
                        // setTimeout( this.hexScroll(), 500); //HACK: because "scrollend" isn't supported in safari yet.
                      } );
                    }
                });
  
            break;
  
          case "levelMapViewer":
            this.inner.classList.add("panel_inner_tileset");
            this.panelContent.innerHTML += `<div class="levelMap_content"></div>`;
  
            // add scroll tracker to hexContent
            this.scrollGroup = {x:0,y:0};
            this.inner.querySelector(".panel_content > .levelMap_content").addEventListener("scroll",
                  (event)=>{
                    if (!this.scrolling){
                      requestAnimationFrame( ()=>{
                      // scroll updating, with some debouncing.
                        this.scrolling = true;
                        this.lvlScroll();
                        // setTimeout( this.hexScroll(), 500); //HACK: because "scrollend" isn't supported in safari yet.
                      } );
                    }
                });
  
            break;
      }
  
  
  
      this.rowStart = rowStart;
      this.rowEnd = rowEnd;
      this.columnStart = columnStart;
      this.columnEnd = columnEnd;
  
      this.fileData = null;
      this.fileBin = null;
  
      // Set the CSS:
      // old method, for grid
      // this.updateCSS();
  
      // new method, absolute/draggable
  
      // position the outer
      let pageWidth = document.body.querySelector(".main").clientWidth;
      let left = ((columnStart-1)*pageWidth/32) ;
      this.outer.setAttribute("data-user-left", left);
      this.outer.style.left = left+"px";
  
      let pageHeight = document.body.querySelector(".main").clientHeight;
      let top = ((rowStart-1)*pageHeight/28);
      this.outer.setAttribute("data-user-top", top);
      this.outer.style.top = top+"px";
  
      // set widths and height
      let startWidth = (columnEnd-columnStart)*pageWidth/32 ;
      this.inner.setAttribute("data-user-width", startWidth);
      this.inner.style.width = startWidth+"px";
      let bbox = this.inner.getBoundingClientRect();
  
  
      // this.inner.style.minHeight = `max-content`;
  
      // if (bbox.height > (rowEnd-rowStart)*height/28) this.inner.style.height = `${ (rowEnd-rowStart)*height/28 }px`;
      let headerHeight = this.panelHeader.getBoundingClientRect().height;
  
      // Calculate the height of this panel such that it does not exceed page height,
      // but tries to fit everything to the tallest of
      // its allocated "grid" space, OR its content
      let startHeightGrid = (rowEnd-rowStart)*pageHeight/28 ;
      let startHeightFitAllContent = this.panelContent.getBoundingClientRect().height + headerHeight;
      var startHeight;
      // But if there's a panel with a lot of content to start with, we'll assume it's meant to scroll
      // (text, for example)
      if (startHeightFitAllContent > pageHeight) startHeight = startHeightGrid;
      else startHeight = Math.min( Math.max(startHeightGrid, startHeightFitAllContent), pageHeight*0.9 );
  
      // save this for later, so we can collapse to 0,
      // but later expand back to the previous height
      this.inner.setAttribute("data-user-height", startHeight);
      // this.inner.setAttribute("data-collapsed", false);
      // now actually assign the calculated height to the panelContent
      // (the inner and outer should resize to accomodate, bc of max-content)
      let contentHeightCalculated = startHeight - headerHeight;
      this.panelContent.style.height = `${contentHeightCalculated}px`;
  
      // console.log(`${this.name}\npageHeight: ${pageHeight}; startHeightGrid: ${startHeightGrid}; startHeightFitAllContent: ${startHeightFitAllContent}; startHeight: ${startHeight}; `);
      // console.log(`${contentHeightCalculated}px`);
  
      this.outer.style.zIndex = this.index;
  
      this.assignDrag(this);
  
  
      this.inner.setAttribute("data-maximized", "false");
      this.outer.setAttribute('data-draggable', "true");
      this.assignMaximize(this);
  
    }
  
    sortZ(){
  
      var panelsZ = this.ui.panels.sort(
        (a,b) => a.outer.style.zIndex - b.outer.style.zIndex
      );
      var count = 1;
      // Assumes all Panel.index values are unique...
      panelsZ.forEach(
        (d,i) => {
          if ( d.index != this.index ){
            d.outer.style.zIndex = count;
            count++;
          }
        }
      );
      this.outer.style.zIndex = count; // put this at the end / on top
  
    }
  
    assignDrag(panel){
      // Drag the panel around by grabbing its header
      var element = panel.outer;
      var deltaX = 0, deltaY = 0, startX = 0, startY = 0, left, top;
  
      this.panelHeader.addEventListener("mousedown", (event) => {
        event = event || window.event;
        event.preventDefault();
        startX = event.clientX;
        startY = event.clientY;
        document.onmouseup = dragClose;
        document.onmousemove = dragMove;
  
        panel.sortZ();
      });
  
      function dragMove(event){
        event = event || window.event;
        event.preventDefault();
  
        if (element.getAttribute('data-draggable')=="false") return 0;
  
          deltaX = startX - event.clientX;
        deltaY = startY - event.clientY;
        startX = event.clientX;
        startY = event.clientY;
  
        left = element.offsetLeft - deltaX;
        element.style.left = `${left}px`;
        element.setAttribute('data-user-left', left);
  
        top = Math.max(element.offsetTop - deltaY, 0);
        element.style.top = `${top}px`;
        element.setAttribute('data-user-top', top);
  
      }
  
      function dragClose(event){
        document.onmouseup = null;
        document.onmousemove = null;
      }
  
    }
  
    assignMaximize(panel){
  
      let outer = panel.outer, inner = panel.inner;
  
      this.panelHeader.addEventListener("dblclick", (event) => {
  
        event = event || window.event;
        event.preventDefault();
        let content = inner.querySelector(".panel_content");
        console.log("content:");
        console.log(content);
  
        let headerHeight = inner.querySelector(".panel_header").getBoundingClientRect().height;
        let totalHeight = outer.parentNode.getBoundingClientRect().height;
  
        //
        switch(inner.getAttribute("data-maximized")){
          case "false":
            // move outer to the top left corner
            outer.style.top = "0px";
            outer.style.left = "0px";
            // expand inner's width and height to full screen
            inner.style.width = "100vw";
            console.log(`headerHeight: ${headerHeight}; panelUserHeight: ${inner.getAttribute("data-user-height")}`);
            // content.style.height = `calc(100vh - ${headerHeight}px)`;
            // content.style.height = "100vh";
            content.style.height = (totalHeight - headerHeight) + "px";
            //
            inner.setAttribute("data-maximized", "true");
            outer.setAttribute('data-draggable', "false");
  
            break;
  
          case "true":
            // return to previous size and position:
            [
              [outer,"data-user-top"],
              [outer,"data-user-left"],
              [inner,"data-user-width"],
              [inner,"data-user-height"]
            ].forEach(d => console.log(`${d[1]}: ${d[0].getAttribute(d[1])}` ));
  
            outer.style.top = outer.getAttribute("data-user-top")+"px";
            outer.style.left = outer.getAttribute("data-user-left")+"px";
            inner.style.width = inner.getAttribute("data-user-width")+"px";
            content.style.height = (inner.getAttribute("data-user-height")-headerHeight)+"px";
            inner.setAttribute("data-maximized", "false");
            outer.setAttribute('data-draggable', "true");
            break;
  
          default:
            inner.setAttribute("data-maximized", "false");
            break;
  
        }
  
        panel.sortZ();
      });
  
    }
  
    assignResize(panel, edge){
      // currently just the bottom right ("southeast") corner.
      var element = panel.inner;
  
      var startWidth, startHeight, startX, startY, bbox, cbox;
      var content, header, headerHeight, collapsed;
  
      edge.addEventListener("mousedown", (event) => {
        event = event || window.event;
        event.preventDefault();
  
        startX = event.clientX;
        startY = event.clientY;
  
        bbox = element.getBoundingClientRect();
        // cbox = element.querySelector(".panel_content").getBoundingClientRect();
  
        header = element.querySelector(".panel_header");
        content = element.querySelector(".panel_content");
        headerHeight = header.getBoundingClientRect().height;
        collapsed = this.inner.getAttribute("data-collapsed")=="true";
  
        startWidth = bbox.width;
        // startHeight = cbox.height;
        startHeight = bbox.height;
  
        document.onmouseup = resizeClose;
        document.onmousemove = resizeMove;
  
        panel.sortZ();
  
      });
  
      function resizeMove(event){
        event = event || window.event;
        event.preventDefault();
  
        let w = Math.max(startWidth + event.clientX - startX, 20) ;
        element.style.width = w+"px";
        element.setAttribute("data-user-width", w);
        // element.style.maxHeight = Math.max(h, element.style.maxHeight.split("px")[0]*1)+"px";
  
        // element.style.height = h;
        if (!collapsed) {
          let h = Math.max(startHeight + event.clientY - startY, headerHeight) ;
          element.setAttribute("data-user-height", h);
          content.style.height = `${h - headerHeight}px`;
        }
        // console.log( content.style.height );
  
        // console.log(w+" "+h);
  
      }
  
  
      function resizeClose(event){
        document.onmouseup = null;
        document.onmousemove = null;
        console.log("Resize ended.");
        console.log(element.querySelector(".panel_content"));
        console.log(element.querySelector(".panel_header").style.height);
        console.log(headerHeight);
      }
  
  
  
  
    }
    toggleMenu(event=null){
      if (event){
        event.preventDefault();
        event.stopPropagation();
      }
      
      console.log("toggling menu");
  
      // change button appearance
      // event.target
      this.panelHeader.querySelector(".panel_menu_button").classList.toggle("panel_menu_button_opened");
      // change menu appearance (show it)
      this.inner.querySelector(".panel_menu").classList.toggle("panel_menu_opened");
      this.inner.querySelector(".panel_content").classList.toggle("panel_content_disabled");
    }
  
    updateBox(rowStartDelta, rowEndDelta, columnStartDelta, columnEndDelta, widthDelta=0, heightDelta=0){
      this.rowStart += rowStartDelta;
      this.rowEnd += rowEndDelta;
      this.columnStart += columnStartDelta;
      this.columnEnd += columnEndDelta;
      // Set the CSS:
      this.updateCSS();
    }
    updateCSS(){
      this.outer.style.gridRowStart = this.rowStart;
      this.outer.style.gridRowEnd = this.rowEnd;
      this.outer.style.gridColumnStart = this.columnStart;
      this.outer.style.gridColumnEnd = this.columnEnd;
  
    }
  
    toOneByteWide(){
      // NOTE: needs fine-tuning; can't get the animations to synchronize for some weird reason.
      let ps = document.getElementsByClassName("panel_inner");
      for (let p of ps){
          p.style.width="20em";
      }
      let bs = document.getElementsByClassName("byte");
      for (let b of bs){
          b.style.width="100%";
          b.style.height = "calc(100%/32)";
      }
    }
  
    getByteLocationFromOffset( byteOffset, subPos = 0, bitPrecision='byte'){
      // byte node, the div containing the offset and all sub-characters (bytes, nibbles, or bits)
      let bnode = this.inner.querySelector(`.panel_content > .hex_content > .byte_group > #byte_${hex(byteOffset,6)}`);
      // // the sub-node: 'byte', 'nibble', 'bit'
      var snode;
      if (bnode) snode = bnode.querySelector(`.${bitPrecision}_${subPos}`);
      // // calculate the vertical and horizontal offsets from hex_content's top
      // // (doesn't factor in current scroll height)
      // // let numberOfRows = Math.ceil( this.source.data.length / this.settings['Number of Columns'].value );
      
      // var bitShift = this.columnBits;
      // let gridRow0Based = (byteOffset>>bitShift); // floor divides
      // return {
      //   fromTop: gridRow0Based*this.settings['Line Height'].value, 
      //   fromLeft: 0, 
      //   byteNode: bnode, 
      //   subNode: snode
      // };
  
      let em = parseInt(getComputedStyle(this.inner.querySelector('.panel_content')).fontSize);
      let rowHeightPx = this.settings['Line Height'].value * em;
      //
      // console.log('current row: '+Math.floor( fromTop / rowHeightPx ))
      let col = byteOffset % this.settings['Number of Columns'].value;
      // let xPos = 
      return {
        /* the start of the byte itself (might not work in bitplane mode?) */
        byte: {
          fromTop: rowHeightPx * Math.floor( byteOffset / this.settings['Number of Columns'].value ), 
          fromLeft: this.inner.querySelectorAll('.panel_content > .hex_header > div')[1+(col*2)].offsetLeft,
          node: this.inner.querySelector(`.panel_content > .hex_content > .byte_group > #byte_${hex(byteOffset,6)}`)
        },
        /* the sub-byte (nibble or bit) */
        subByte:{
          fromTop:0,
          fromLeft:0,
          node: undefined
        }
      };
  
    }
    
    getLineHeightInPx( ){
      return this.inner.querySelector(`.panel_content > .hex_content > .byte_group > .byte_container`).getBoundingClientRect().height;
    }
  
    getOffsetFromByteLocation( fromTop ){
      // can calculate these elsewhere, once, and change when we change num columns or row height?
      let em = parseInt(getComputedStyle(this.inner.querySelector('.panel_content')).fontSize);
      let rowHeightPx = this.settings['Line Height'].value * em;
      //
      // console.log('current row: '+Math.floor( fromTop / rowHeightPx ))
      return this.settings['Number of Columns'].value * Math.floor( fromTop / rowHeightPx ); 
    }
  
    getGroupOffsetFromByteLocation( fromTop ){
      // can calculate these elsewhere, once, and change when we change num columns or row height?
      let em = parseInt(getComputedStyle(this.inner.querySelector('.panel_content')).fontSize);
      let groupHeightPx = (this.groupSize / this.settings['Number of Columns'].value) * this.settings['Line Height'].value * em;
      //
      // console.log('current group: '+Math.floor( fromTop / groupHeightPx ))
      return this.groupSize * Math.floor( fromTop / groupHeightPx ); 
    }
    
    getNumberOfCells(){
      // varies by Panel class...?
      return this.source.data.length;
    }
  
    
    setPanelContentRows(){
      // update hexContent grid's grid-template-rows
      let hc = this.inner.querySelector(".panel_content > .hex_content");
      // let numberOfRows = Math.ceil( this.getNumberOfCells() / this.settings['Number of Columns'].value );
      // following two can be calculated elsewhere?
      let numberOfGroupRows = Math.ceil( this.getNumberOfCells() / this.groupSize);
      let rowsPerGroup = Math.ceil( this.groupSize / this.settings['Number of Columns'].value);
      //
      hc.style.gridTemplateRows = `repeat(${numberOfGroupRows}, ${ rowsPerGroup*this.settings['Line Height'].value}em)`;
  
      // update cells' line height
      // let cells = Array.from( hc.querySelectorAll("div"));
      // cells.forEach( d => d.style.height = this.settings['Line Height'].value +"em");
    }
    setPanelContentColumns(){
      var panelContent = this.inner.querySelector(".panel_content");
      // panelContent.style.gridTemplateColumns = `2fr repeat(16, 1fr) 0fr repeat(16, 1fr) 0fr`;
      var offsetsWidthString = '7ch';
      // if we want additional SCROLLING columns
      // note: 17px is Windows scrollbar width... 
      //TODO: better system for preventing scrollbar covering content.
      var leftbar = '0ch', rightbar = '17px'; 
      //NOTE: hex_header and byte_group span grid-column 2 / -2.
      // if we want to add additional columns,
      // we'd change those two classes to 3 / -3, or 3 / -4, etc.
      // if we want NON-scrolling columns, we'd need to change 
      // hex_content from grid-column: 1 / -1 to 2 / -2, etc.
      let byteSpacing = '0ch';
      let nibbleSpacing = '0ch';
      panelContent.style.gridTemplateColumns = [
        leftbar, 
        ...Array.from(Array(this.settings['Number of Columns'].value).keys()).flatMap((d,i)=>[
            i==0 ? offsetsWidthString : '0fr', 
            byteSpacing,
            '1fr', '1fr', '1fr', '1fr', 
            nibbleSpacing,
            '1fr', '1fr', '1fr', '1fr', 
        ]), 
        rightbar
      ].join(` `);
  
  
    }
    generateHexHeaderHTML(){
      // this probably should only be called once.
      const offsetString = 'OFFSET';
      var hexHeader = this.inner.querySelector(" .panel_content > .hex_header");
      //margin:0;padding:0;
      hexHeader.innerHTML = Array.from(
        Array(this.groupSize).keys()).flatMap(
        (d,i)=>[
          `<div style="grid-column: span 1;min-width:0ch;" >${ i==0 ? 'OFFSET' : ''}</div>`, 
          `<div style="grid-column: span 1; min-width:0ch;"></div>`,
          `<div style="grid-column: span 9;">${ hex(i, i>>4?2:1)}</div>`, 
        ]
      ).join(``);
      console.log('hex header generated');
    }
  
    initHex(){
      // initializes the offset values and strings that we'll probably use later
      console.log("init hex");
      // generate hexadecimal and binary strings for each byte
      // this.source.hexStrings = this.source.data.map((d,i)=>hex(this.source.data[i],2));
      // this.source.binStrings = this.source.data.map((d,i)=>binar(this.source.data[i],8));
      // this.source.offsets = this.source.data.map( (d,i) => i );
      // this.source.offsetsHexStrings = this.source.offsets.map(d=>hex(d,6));
  
      this.source.hexStrings = this.source.data.map((d,i)=>hex(d,2));
      this.source.binStrings = this.source.data.map((d,i)=>binar(d,8));
      this.source.offsets = this.source.data.map( (d,i) => i );
      this.source.offsetsHexStrings = this.source.offsets.map(d=>hex(d,6));
  
      // save the html nodes?
      this.source.groupNodes = Array(Math.ceil(this.source.data.length/this.groupSize));
  
      // console.log('hex data:');
      // console.log(this.source.hexStrings);
    }
  
    generateHexHTML( input = null, offset=0, length=this.groupSize){
      const startTime = Date.now();
      //NOTE: currently must pass in entire data and offsets to get accurate osset-based class names/ids.
      // Get indices of our bytes, and if we have an offset,
      // grab only those bytes and indices at the offset
      
      
      let start = offset;
      let end = Math.min(offset+length, input.length);
      
      // extract relevant data:
      // let bytesHex = this.source.hexStrings.slice(start, end);
      // let bytesBin = this.source.binStrings.slice(start, end); 
      
      // let offsetsHex = this.source.offsetsHexStrings.slice(start, end);
  
      
      // parent div for byte elements
      var hexContent = this.inner.querySelector(" .panel_content > .hex_content");
  
      var html = ``;
      
      var bitShift = this.columnBits;
      var numRows =  Math.ceil( this.getNumberOfCells() / this.settings['Number of Columns'].value );
      // var groupHeight = this.lineHeightInPx*(this.groupSize/this.settings['Number of Columns'].value);
      var groupHeightEm = this.settings['Line Height'].value*(this.groupSize/this.settings['Number of Columns'].value);
      // const groupDiv = `<div class="byte_group">`
      // var modes = ['byte','nibble'];
      // var mode = [this.settings['Byte Mode']];
      
      
      // let i=start;
      // let top = 100*(i>>bitShift)/numRows;
      // let gridRow = 1+(i>>bitShift); // essentially floor divides
  
      // html += `<div id="group_${this.source.offsetsHexStrings[i]}" class="byte_group" style="height:${groupHeightEm}em; top:${top}%; background-color: hsl(${Math.round(Math.random()*360)}deg, 70%, 30%);" data-offset="${i}" ></div>`;
      var group;
      var bytes = ''; // running innerHTML
  
      for (let i=start; i<end; i++){
        let r = Math.random();
        // let modes = r<0.01?['byte','nibble','bit']:(r<0.1?['byte','nibble']:['byte']);
        let modes = ['byte'];
        // let modes = ['byte','nibble','bit'];
  
        // let gridRow = 1+(i>>bitShift); // essentially floor divides
        let groupIndex = Math.floor(i/this.groupSize);
        let gridRow = 1+groupIndex;
        let rowPerByteContainer = modes.length;
        // let top = 100*(i>>bitShift)/numRows;
  
        // if we need to create a group (on first byte, or after the previous group completes)
        if (!group) {
          group = document.createElement('div');
          group.id = `group_${this.source.offsetsHexStrings[i]}`;
          group.classList = ["byte_group"];
          
          // group.style.gridRow = `${gridRow} / span ${this.groupSize/this.settings['Number of Columns'].value}`;
          group.style.gridRow = `${gridRow} / span 1`;
          // group.style.backgroundColor = `hsl(${Math.round(Math.random()*360)}deg, 60%, 20%)`;
          group.setAttribute('data-offset', i);
  
        }
  
        // if we need to create a group
        // if ( (i%this.groupSize==0) || (i==start) ) {
  
        //   if (i!=start) html += `</div>`; // close the previous
  
  
  
        //   // html += `<div id="group_${this.source.offsetsHexStrings[i]}" class="byte_group" style="height:${groupHeightEm}em; grid-row:${gridRow} / span ${this.groupSize/this.settings['Number of Columns'].value};background-color: hsl(${Math.round(Math.random()*360)}deg, 80%, 50%);" data-offset="${i}" >`;
  
        // }
  
        // group div
        // if ( (i%this.groupSize==0) || (i==start) ) html += `<div id="group_${this.source.offsetsHexStrings[i]}" class="byte_group" style="height:${groupHeight}px;position:absolute;top:${top}%; display:grid;  grid-template-columns: subgrid; grid-column: 1 / -1; grid-row:${gridRow} / span ${this.groupSize/this.settings['Number of Columns'].value};" data-offset="${i}" >`;
        
        // byte container    grid-row:${gridRow};
        bytes += `<div id="byte_${this.source.offsetsHexStrings[i]}" class="byte_container" style="display:grid; grid-template-rows: repeat(${rowPerByteContainer}, 1fr);  grid-column: span 11; grid-template-columns: subgrid;" data-offset="${i}">`;
  
        // offset
        // bytes += `<div style="display: grid; grid-row: 1 / -1; grid-column: span 1; min-width:0;overflow:hidden;"><a style="width:100%;user-select: none;" >${(i%this.settings['Number of Columns'].value)==0?this.source.offsetsHexStrings[i]:''}</a></div>`;
        bytes += `<div style="display: grid; grid-row: 1 / -1; grid-column: span 1; min-width:0;overflow:hidden;"><a style="width:100%;user-select: none;" >${this.source.offsetsHexStrings[i]}</a></div>`;
  
        // spacing
        bytes += `<div style="display: grid; grid-row: 1 / -1; grid-column: span 1; min-width:0;width:0;overflow:hidden;"></div>`;
  
        // this.settings['Spacing Every x Bytes'];
        // this.settings['Spacing Amount'];
        // this.settings['Number of Columns'];
        modes.forEach( (mode,j) => {
          let row = j+1;
          switch (mode){
  
            case 'byte':
              bytes += `<div class="byte" style="display: grid; grid-row: ${row}; grid-column: span 9;${this.byteColor?'color:'+this.byteColor:''}">${this.source.hexStrings[i]}</div>`;
              break;
  
            case 'nibble':
              bytes += `<div class="nibble" style="display: grid; grid-row: ${row}; grid-column: span 4;">${this.source.hexStrings[i][0]}</div>`;
              bytes += `<div style="display: grid; grid-row: ${row}; grid-column: span 1;"></div>`;
              bytes += `<div class="nibble" style="display: grid; grid-row: ${row}; grid-column: span 4;">${this.source.hexStrings[i][1]}</div>`;
              break;
  
            case 'bit':
              // console.log(bytesBin[i]);
              bytes += this.source.binStrings[i].split('').map((e,k)=>`<div class="bit" style="display: grid; grid-row: ${row}; grid-column: span 1;">${e}</div>${(k==3)?'<div style="display: grid; grid-row: '+row+'; grid-column: span 1;"></div>':''}`).join('');
              break;
  
          }
        });
  
        bytes += `</div>`; // close byte_container
  
        // close the group if it will be the last, or if this byte concludes the group
        if ( (((i+1)%this.groupSize)==0) || ((i+1)==end) ) {
  
          // first, add some placeholders if there would be empty space after
          if ( ((i+1)==end) && (((i+1)%this.groupSize)!=0)){
            for (let j=0; j<(this.groupSize-((i+1)%this.groupSize)); j++) bytes += `<div class="byte_placeholder" style="display:grid; grid-column: span 11; grid-template-columns: subgrid;""></div>`;
          }
  
          // now add all bytes to the gorup
          group.innerHTML = bytes;
          bytes = '';
          // and append the goup to the page
          group = hexContent.appendChild(group);
          this.source.groupNodes[groupIndex] = group; // save
          if (!((i+1)==end)) group = undefined; // clear if there are more
  
          // this is an example for how we'd add right_group containers.
          // they can span as many byte groups as needed in order to align with their left-side data
          // let rightItem = document.createElement('div');
          // rightItem.id = `right_group_${this.source.offsetsHexStrings[i]}`;
          // rightItem.classList = ["right_group"];
          // rightItem.style.gridRow = `${gridRow} / span 2`;
          // rightItem.style.position = 'relative';
          // rightItem.innerHTML = `<div style="position:absolute; height: 50%; top: 25%;background-color: hsl(${Math.round(Math.random()*360)}deg, 80%, 20%);" ></div>`;
          // hexContent.appendChild(rightItem);
  
        }
      }
  
      // html += `</div>`; // close the last group
  
      ////////////
  
      // var count = 0;
      // let groupSize = this.groupSize;
      // var tileIndex;
  
      // hexContent.innerHTML += html;
  
      // console.log("generateHexHTML: "+(Date.now()-startTime));
      return group; // will return the last group
    }
  
    hexScroll(){
      // this is called within an event listener of the hex_content being scrolled
      const start = Date.now();
  
      // var byteLocation = this.selectHexData( byteOffset);
      // var top = byteLocation.fromTop;
  
      // batch DOM reads/writes for performance
      // / reads:
      let hc = this.inner.querySelector(".panel_content > .hex_content");
      let windowHeight = hc.getBoundingClientRect().height; // performance issue?
      let windowScrollTop = hc.scrollTop;
  
      // Convert the current scroll top to the rounded-to-row-start offset
      var currentOffset = this.getOffsetFromByteLocation( windowScrollTop );
      // var currentOffsetGroup = this.groupSize * Math.floor( currentOffset/this.groupSize );
      var currentOffsetGroup = this.getGroupOffsetFromByteLocation( windowScrollTop );
  
      if ( currentOffsetGroup == this.scrollGroup ) {
        this.scrolling = false;
        return 0;
      }
  
      this.scrollGroup = currentOffsetGroup;
  
      // the scroll buffer top is max(current scroll - window height, 0)
      var bufferTopOffsetGroup = Math.max( this.getGroupOffsetFromByteLocation( windowScrollTop - windowHeight ), 0);
      // var bufferTopOffsetGroup = this.groupSize * Math.floor( bufferTopOffset/this.groupSize );
  
      // the scroll buffer bottom is min(current scroll + 2*window height, numRows)
      var bufferBottomOffsetGroup = this.getGroupOffsetFromByteLocation( windowScrollTop + (2*windowHeight) );
      // Math.min( this.getGroupOffsetFromByteLocation( windowScrollTop + (2*windowHeight) ), this.getNumberOfCells()-1 );
      // var bufferBottomOffsetGroup = this.groupSize * Math.floor( bufferBottomOffset/this.groupSize );
  
      console.log(`Window top: ${windowScrollTop}, height ${windowHeight}; Scroll buffer from ${bufferTopOffsetGroup} |<-- ${currentOffset} [${currentOffsetGroup}] -->| ${bufferBottomOffsetGroup} (window height ${windowHeight}).`);
  
      const setup = Date.now()-start;
  
      var removes = [];
      var adds = [];
  
      // look at existing and remove if they're outside our window + buffers
      Array.from(hc.querySelectorAll(`.byte_group`)).forEach(
        (d,i)=>{
          let ofs = d.getAttribute("data-offset")*1;
          // console.log(d);
          if ( ((ofs < bufferTopOffsetGroup) || (ofs > bufferBottomOffsetGroup)) && !d.classList.contains("keep_loaded") ) removes.push(d);
        }
      );
  
      const deleted = Date.now()-start;
      var existingCount = 0;
      // loop through all of what we should have, 
      for ( let i=bufferTopOffsetGroup; i<=bufferBottomOffsetGroup; i+=this.groupSize){
        // see if it exists
        if ( hc.querySelector(`#group_${hex(i,6)}`) ){
          existingCount++;
        } else{
          adds.push(i);
          
        }
  
      }
      console.log(existingCount+" groups were already existing.");
  
      adds.forEach((index)=>{
        let groupIndex = Math.floor(index/this.groupSize)
        if (this.source.groupNodes[groupIndex]){
          this.source.groupNodes[groupIndex] = hc.appendChild( this.source.groupNodes[groupIndex]);
        } else {
          this.generateHexHTML( this.source.data, index, this.groupSize);
        }
      });
  
      removes.forEach(d=>d.remove());
  
      console.log(`Added: ${adds.map(d=>hex(d,6)).join()}\nRemoved: ${removes.map(d=>d.id.substr((6))).join()}`);
      const added = Date.now()-start;
  
      // this.setPanelContentRows();
      
      // const setPanelRows = Date.now()-start;
  
      console.log(`hexScroll: setup: ${setup}; deleted: ${deleted}; added: ${added}; `);
  
      this.scrolling = false; // say we're done
  
    }
  
    tileScroll(){
      const start = Date.now();
  
      // var byteLocation = this.selectHexData( byteOffset);
      // var top = byteLocation.fromTop;
  
      // this is usually a separate function like this.getGroupOffsetFromByteLocation()  
      // function getTilePosition(){
      //   // assumes there's no horizontal scrolling.
  
      // }
  
      console.log("tileScroll()");
  
      // batch DOM reads/writes for performance
      // / reads:
      let hc = this.inner.querySelector(".panel_content > .tileset_content");
      let windowHeight = hc.getBoundingClientRect().height; // performance issue?
      let windowWidth = hc.getBoundingClientRect().width;
      let windowScrollTop = hc.scrollTop;
      let tileHeight = windowWidth/this.settings['Number of Columns'].value;
  
      let rowHeight =  hc.querySelector(`.tile_item`).getBoundingClientRect().height;
  
      // Convert the current scroll top to the rounded-to-row-start offset
      var currentOffset = Math.floor(this.settings['Number of Columns'].value*windowScrollTop/rowHeight);
      // var currentOffsetGroup = this.groupSize * Math.floor( currentOffset/this.groupSize );
      // var currentOffsetGroup = this.getGroupOffsetFromByteLocation( windowScrollTop );
  
      // var currentGroup = 
  
      if ( currentOffset == this.scrollGroup ) {
        this.scrolling = false;
        return 0;
      }
  
      var totalRows = Math.ceil(this.source.data.length/this.settings['Number of Columns'].value);
  
      // this.scrollGroup = currentOffsetGroup;
  
      // the scroll buffer top is max(current scroll - window height, 0)
      var bufferTopOffset = Math.max( Math.floor(this.settings['Number of Columns'].value*( windowScrollTop - windowHeight )/rowHeight), 0);
  
      // var bufferTopOffsetGroup = this.groupSize * Math.floor( bufferTopOffset/this.groupSize );
  
      // the scroll buffer bottom is min(current scroll + 2*window height, numRows)
      
      
      var bufferBottomOffset = Math.min( Math.floor(this.settings['Number of Columns'].value*( windowScrollTop + (2*windowHeight))/rowHeight)-1, this.source.data.length-1);
  
      // Math.min( this.getGroupOffsetFromByteLocation( windowScrollTop + (2*windowHeight) ), this.getNumberOfCells()-1 );
      // var bufferBottomOffsetGroup = this.groupSize * Math.floor( bufferBottomOffset/this.groupSize );
  
      console.log(`Window top: ${windowScrollTop}, height ${windowHeight}; Scroll buffer from ${bufferTopOffset} |<-- ${currentOffset} [${currentOffset}] -->| ${bufferBottomOffset} (window height ${windowHeight}).`);
  
      const setup = Date.now()-start;
  
      var removes = [];
      var adds = [];
  
      // look at existing and remove if they're outside our window + buffers
      // .metatile_wrapper .metatile_wrapper_viewer    (no id)
      // .tile_wrapper  data-tile-index    (1-based)    (no id)
      Array.from(hc.querySelectorAll(`.tile_item`)).forEach(
        (d,i)=>{
          let ofs = (d.getAttribute("data-tile-index")*1)-1; // from 1-based to 0-based
          // console.log(d);
          if ( (ofs < bufferTopOffset) || (ofs > bufferBottomOffset) ) removes.push(d);
        }
      );
  
      const deleted = Date.now()-start;
      var existingCount = 0;
      // loop through all of what we should have, 
      for ( let i=bufferTopOffset; i<=bufferBottomOffset; i+=this.groupSize){
        // see if it exists
        if ( hc.querySelector(`#tile_item_${i+1}`) ){
          existingCount++;
        } else{
          adds.push(i);
          
        }
  
      }
      console.log(existingCount+" groups were already existing.");
  
      adds.forEach(index => {
        if ( this.kind=="tilesetViewer" ) this.generateTilesetHTML( this.source.data, index, this.groupSize);
        if ( this.kind=="metatilesViewer" ) this.generateMetatilesetHTML( this.source.data, index, this.groupSize);
      });
      removes.forEach(d=>d.remove());
  
      // // update the "before" padding:
      // let before = hc.querySelector(`.grid_before`);
      // let precedingRows = Math.floor(bufferTopOffset/this.settings['Number of Columns'].value)-1;
      // before.style.gridRow = `1 / ${precedingRows+1}`;
      // before.style.aspectRatio = `${this.settings['Number of Columns'].value} / ${precedingRows}`;
  
      // // update the "after" padding:
      // let after = hc.querySelector(`.grid_after`);
      // let firstRowOfAfter = ((bufferBottomOffset+this.groupSize)/this.settings['Number of Columns'].value) + 1; // 1-based
      // let finalRow = Math.floor((this.source.data.length-1)/this.settings['Number of Columns'].value) + 1;
  
      // // let subsequentRows = Math.floor(bufferTopOffset/this.settings['Number of Columns'].value)-1;
      // after.style.gridRow = `${firstRowOfAfter} / ${finalRow}`;
      // after.style.aspectRatio = `${this.settings['Number of Columns'].value} / ${finalRow - firstRowOfAfter}`;
  
  
      console.log(`Added: ${adds.map(d=>hex(d,6)).join()}\nRemoved: ${removes.map(d=>d.id.substr((6))).join()}`);
  
      const added = Date.now()-start;
  
      // this.setPanelContentRows();
  
      // const setPanelRows = Date.now()-start;
  
      console.log(`hexScroll: setup: ${setup}; deleted: ${deleted}; added: ${added}; `);
  
      this.scrolling = false; // say we're done
  
  
    }
    initMetatiles(){
      console.log('init metatiles');
      this.source.rawPixels = this.source.data.map(mt=>prepMetatile({metatile:mt,vflip:0,hflip:0},this.palette));
      // generate canvas nodes?
      this.source.canvasNodes = Array(this.source.data.length);
  
      // update the placeholder to reflect rumber of rows.
      let hc = this.inner.querySelector(".panel_content > .tileset_content");
      let placeholder = hc.querySelector(`.grid_placeholder`);
      let finalRow = Math.floor((this.source.data.length-1)/this.settings['Number of Columns'].value) + 1; // 1-based
      placeholder.style.gridRow = `1 / ${finalRow}`;
      placeholder.style.aspectRatio = `${this.settings['Number of Columns'].value} / ${finalRow}`;
      placeholder.style.zIndex = "-1";
    }
    initTiles(){
      console.log('init tiles');
      // this.source.rawPixels = this.source.data.map(mt=>prepMetatile({metatile:mt,vflip:0,hflip:0},this.palette));
      this.source.rawPixels = this.source.data.map(tile=>tile.map(row=>row.map(colorIndex=>this.palette[colorIndex])));
      // generate canvas nodes?
      this.source.canvasNodes = Array(this.source.data.length);
  
      // update the placeholder to reflect rumber of rows.
      let hc = this.inner.querySelector(".panel_content > .tileset_content");
      let placeholder = hc.querySelector(`.grid_placeholder`);
      let finalRow = Math.floor((this.source.data.length-1)/this.settings['Number of Columns'].value) + 1; // 1-based
      placeholder.style.gridRow = `1 / ${finalRow}`;
      placeholder.style.aspectRatio = `${this.settings['Number of Columns'].value} / ${finalRow}`;
      placeholder.style.zIndex = "-1";
  
    }
    initLvl(){
      // initializes the offset values and strings that we'll probably use later
      console.log("init lvl");
      
      // rearrange and extract raw pixel data so we don't have to keep doing it
      this.source.rawPixels = this.source.data.map(mt=>prepMetatile(mt,this.palette));
      // generate canvas nodes?
      this.source.canvasNodes = Array(this.source.data.length);
  
      let rows = 16;
      let cols = Math.ceil(this.source.data.length/rows);
  
      let lc = this.inner.querySelector(".panel_content > .levelMap_content");
      lc.style.gridTemplateColumns = 'repeat('+cols+', 8ch)';
  
      
      // this.source.hexStrings = this.source.data.map((d,i)=>hex(d,2));
      // this.source.binStrings = this.source.data.map((d,i)=>binar(d,8));
      // this.source.offsets = this.source.data.map( (d,i) => i );
      // this.source.offsetsHexStrings = this.source.offsets.map(d=>hex(d,6));
  
      
    }
  
    lvlScroll(){
  
      console.log('lvlScroll()');
       
      // this is called within an event listener of the hex_content being scrolled
      const start = Date.now();
  
      // var byteLocation = this.selectHexData( byteOffset);
      // var top = byteLocation.fromTop;
  
      // batch DOM reads/writes for performance
      // / reads:
      let lc = this.inner.querySelector(".panel_content > .levelMap_content");
      let windowHeight = lc.getBoundingClientRect().height; // performance issue?
      let windowScrollTop = lc.scrollTop;
      let windowWidth = lc.getBoundingClientRect().width; // performance issue?
      let windowScrollLeft = lc.scrollLeft;
  
  
      // query any metatile; they should all be the same width and height.
      let mt = this.inner.querySelector(".panel_content > .levelMap_content > .level_metatile_wrapper");
      let mtWidth = mt.getBoundingClientRect().width
      let mtHeight = mt.getBoundingClientRect().height;
  
  
      // Convert the current scroll top to the rounded-to-row-start offset
      var currentOffset = {
        x: Math.floor(windowScrollLeft/mtWidth), 
        y: Math.floor(windowScrollTop/mtHeight)
      };
      console.log(currentOffset);
      
      if ( JSON.stringify(currentOffset)==JSON.stringify(this.scrollGroup)) {
        this.scrolling = false;
        return 0;
      }
  
      // otherwise, continue
      this.scrollGroup = currentOffset;
  
      let numRows = 16; // placeholder... different for vertical levels
      let numCols = Math.ceil(this.source.data.length/numRows);
  
      var buffer = {
        left: Math.max( Math.floor( (windowScrollLeft-windowWidth) / mtWidth), 0 ),
        right: Math.min( Math.floor( (windowScrollLeft+(2*windowWidth)) / mtWidth), numCols-1),
  
        top: Math.max( Math.floor( (windowScrollTop-windowHeight) / mtHeight), 0 ),
        bottom: Math.min( Math.floor( (windowScrollTop+(2*windowHeight)) / mtHeight), numRows-1),
  
      }
      console.log(buffer);
  
      const setup = Date.now()-start;
  
      var removes = [];
      var adds = [];
  
      // look at existing and remove if they're outside our window + buffers
      Array.from(lc.querySelectorAll(`.level_metatile_wrapper`)).forEach(
        (d,i)=>{
          let coords = d.getAttribute("data-coordinates").split("_"); // [x, y]
          // console.log(d);
          // if ( (ofs < bufferTopOffsetGroup) || (ofs > bufferBottomOffsetGroup) ) removes.push(d);
          if (  (coords[0] < buffer.left) || 
                (coords[0] > buffer.right) || 
                (coords[1] < buffer.top) || 
                (coords[1] > buffer.bottom) ) removes.push(d);
        }
      );
  
      const deleted = Date.now()-start;
      var existingCount = 0;
      // loop through all of what we should have, 
      // for ( let i=bufferTopOffsetGroup; i<=bufferBottomOffsetGroup; i+=this.groupSize){
      //   // see if it exists
      //   if ( hc.querySelector(`#group_${hex(i,6)}`) ){
      //     existingCount++;
      //   } else{
      //     adds.push(i);
          
      //   }
  
      // }
      for (let i = buffer.left; i <=buffer.right; i++)
        for (let j = buffer.top; j <=buffer.bottom; j++)
          if ( lc.querySelector('#metatile_'+i+'_'+j) ){
            existingCount++;
          } else{
            adds.push( (i*numRows) + j );
          }
  
      console.log(existingCount+" groups were already existing.");
  
      adds.forEach(index=>this.generateLevelMapHTML( this.source.data, index, 1));
      removes.forEach(d=>d.remove());
      console.log(`Added: ${adds.join()}\nRemoved: ${removes.map(d=>d.id.substr(9)).join()}`);
      const added = Date.now()-start;
  
      // this.setPanelContentRows();
      
      // const setPanelRows = Date.now()-start;
  
      console.log(`lvlScroll: setup: ${setup}; deleted: ${deleted}; added: ${added}; `);
  
      this.scrolling = false; // say we're done
  
    }
  
  
  
    generateBitplaneHTML(input = null, offset=0, mode=null, length=32, replace=[]){
      // does main work for generating hex editor-style view and bp viewer ui
      // console.log(input);
      var mode16;
  
      console.log("generateHexHTML");
      [input,
  offset,
  mode,
  length,
  replace].forEach(d=>console.log(d));
      var rbytes = [];
      if (input){
        // if we have an input, use it
        rbytes = input;
      }
      else{
        // if we don't  have an input, generate random data (mainly for debug)
        let nbytes = 128;
        // let rbytes = Array.from(Array(nbytes).keys()).map(d => Math.round(Math.random()*255) );
        rbytes = Array.from(Array(nbytes).keys());
      }
  
      // Get indices of our bytes, and if we have an offset,
      // grab only those bytes and indices at the offset
      let indices = Array.from( Array(rbytes.length).keys());
      if (offset!=null){
        // we will look only at these 32 bytes.
        rbytes = rbytes.slice(offset, Math.min(offset+length, rbytes.length));
        indices = indices.slice(offset, Math.min(offset+length, indices.length));
      }
  
      // parse the data mode to generate
      if ( mode=="plain") {
        mode16 = true;
      } else if (mode==null){
        mode16 = this.panelContent.getAttribute("data-mode")=='byte16';
      } else{
        mode16 = mode=='byte16';
      }
      var m = mode16?"_b16":"_b1"; // shorthand to be used later
      var notm = !mode16?"_b16":"_b1";
  
      console.log(`${this.name}: Generating hex html for data with ${rbytes.length} bytes...`);
  
      // generate hexadecimal and binary strings for each byte
      let rbytesHex = [];
      let rbytesBin = [];
      for (let i=0; i<rbytes.length;i++){
        rbytesHex.push(hex(rbytes[i],2));
        rbytesBin.push(binar(rbytes[i],8,4));
      }
  
      let sbytes = ``;
      let g32l = ``; //
      let g32r = ``; //
      let g32b = ``; // running strings
      let bw = 16; // byte width...
      let tw = 32; // total byte width possible...
      let th = 32; // total height (usually just 32 anyway )
      let rows = 1 + (bw<tw); // for normal width
      let tileCount = 0; // will track how many (unnecessary?)
      var g32elem;
      var g32selem;
      var classGen = ``;
  
      // parent div for following g32 elements
      var hexContent = this.inner.querySelector(" .panel_content > .hex_content");
      var replacing = replace.length!=0;
      if (!replacing){
        hexContent.innerHTML = ''; // clear it all first
        this.numberOfTiles = Math.ceil(rbytes.length/32);
      }
  
      // hexContent.style.gridTemplateRows = `repeat(${Math.ceil(rbytes.length/32)}, auto)`;
  
      // loop through all bytes.
      // note that each "tile", or 32 bytes, is contained in a class "g32" div,
      // made up of three columns:
      //
      //  g32l                  g32rr                 g32b       g32s
      //  (left-side offsets)   (actual bytes data)   (binary)   (svg bitplane)
      //                                               \  initially hidden   /
      // if ( !(mode=="plain")){
      for (let i=0; i< rbytes.length; i++){
          let ii = i%32;
  
          let j = i%th;
          // Mode 16: normal, 16-byte width:
          let row = 1*(j>=bw); // 0 or 1
          let col = j%bw; // 0 to bw
          let gtcn = `${col}fr 1fr ${bw-col-1}fr`;
          let gtrn = `${row}fr 1fr ${rows-(row+1)}fr`;
          let left =
  
          //TODO: mode 32...
  
          row = 1*(j>=tw); // 0 or 1
          col = j%tw; // 0 to bw
          let gtcnn = `${col}fr 1fr ${tw-col-1}fr`;
          let gtrnn = `${row}fr 1fr ${rows-(row+1)}fr`;
  
          // Mode 1: 1-byte-wide:
          let gtc1 = `0fr 1fr 0fr`;
          let gtr1 = `${j}fr 1fr ${th-j-1}fr`;
  
          //TODO: better method? Find bitplane
          let bp = (((i>>4)%2)*2)+(i%2);
          let row16Odd = (i>>4)%2;
  
          // // //
          let left16 = 100*((0.5+ii)%16)/16;
          let left1 = 50;
          let top16 = 25+(50*Math.floor(ii/16));
          let top1 = 100*(0.5+ii)/32;
          let classGens = [
            `.g32rb_item_${ii}_b16{top:${top16}%;left:${left16}%;}`,
            `.g32rb_item_${ii}_b1{top:${top1}%;left:${left1}%;}`,
            `.g32l_item_${ii}_b16{top:${top16}%;left:50%;}`,
            `.g32l_item_${ii}_b1{top:${top1}%;left:50%;}\n`
          ] ;
          classGen+=classGens.join(`\n`);
  
          let offsetType = ((i%16)==0)?'always':'sometimes';
          let fgType = mode16?'':('fg_bp'+bp);
  
          g32l+=`<div
            data-bitplane="${bp}"
          data-gridclass="g32l_item_${ii}"
          class="g32_item g32_item${m} ${fgType} g32l_offset_${offsetType} g32l_offset_${offsetType}${m} g32l_item_${ii}${m}"
            >${hex(indices[i],6)}</div>`;
  
          g32r += `\
          <div
            data-bitplane="${bp}"
          data-gridclass="g32rb_item_${ii}"
          class="g32_item g32_item${m} ${fgType} g32rb_item_${ii}${m}"
            >${rbytesHex[i]}</div>
          `;
  
          if ( !(mode=="plain")){
            g32b += `\
            <div
            data-bitplane="${bp}"
            data-gridclass="g32rb_item_${ii}"
            class="g32_item g32_item${m} ${fgType} g32rb_item_${ii}${m}"
            >${rbytesBin[i]}</div>
            `;
            console.log(`Adding binary HTML for ${1+Math.floor( (offset+i)/32 )}`);
          }
  
          // if we're 1 before the end of the 32-batch, or at the overall end, close up this group:
          if (  ((i+1)%32 == 0) || (i == (rbytes.length-1)) ){
  
              // wrapper g32
              if (replace[tileCount]){ // if we're replacing content in a pre-existing g32
                g32elem = replace[tileCount];
                g32elem.innerHTML = ''; // delete contents
                g32elem.classList.add("g32"+m);
                g32elem.classList.remove("g32"+notm);
                console.log(`within generateHexHTML, received mode ${mode}, parsed to mode16 ${mode16}, made a g32 with classes ${Array.from(g32elem.classList).join(", ")}`);
  
              } else { // creating a new g32
                g32elem = document.createElement('div');
                g32elem.className = "g32";
                g32elem.id = "tile_index_"+(1+Math.floor( (offset+i)/32 ) );
                g32elem.classList.add("g32"+m);
                // assign the tile index (1-based, not 0-based)
                g32elem.setAttribute("data-tile-index", 1+Math.floor( (offset+i)/32 ) );
                hexContent.appendChild(g32elem);
              }
  
              if ( !(mode=="plain")){
                // g32bg (background)
                let g32bgelem = document.createElement('div');
                g32bgelem.className = "g32bg";
                g32bgelem.classList.add("g32bg"+m);
  
                g32bgelem.innerHTML = Array.from(Array(32).keys()).map(
                  (ii)=>`<div class="g32bg_row bg_${Math.floor(ii/16)?(ii%2?"bp3":"bp2"):(ii%2?"bp1":"bp0")}"></div>`
                ).join("");
                g32elem.appendChild(g32bgelem);
              }
  
  
              // g32l
              let g32lelem = document.createElement('div');
              g32lelem.className = "g32l";
              g32lelem.innerHTML = `${g32l}`;
              g32elem.appendChild(g32lelem);
  
              // g32r
              let g32relem = document.createElement('div');
              g32relem.className = "g32r";
              g32relem.classList.add("g32r"+m);
              g32relem.innerHTML = `${g32r}`;
              g32elem.appendChild(g32relem);
  
              if ( !(mode=="plain")){
                // g32b
                let g32belem = document.createElement('div');
                g32belem.className = "g32b";
                g32belem.innerHTML = `${g32b}`;
                g32elem.appendChild(g32belem);
  
                // create the g32s, currently empty but will later contain an svg, if bitplane
                g32selem = document.createElement('div');
                g32selem.className = "g32s";
                g32selem.classList.add("g32s"+m);
                g32selem.id=`${this.nameValid}_g32s_${tileCount}`;
                g32elem.appendChild(g32selem); // comment these out for debugging (slow af)
  
                if ( !(mode16)){
  
                  var tileIndex0Based = Math.floor( (offset+i)/32 );
                  var offsetbp = tileIndex0Based*32;
                  console.log(`Creating bitplane with data ${offsetbp}, ${offsetbp+32}`);
                  console.log(g32selem);
                  this.generateBitplaneView(
                    g32selem,
                    this.source.data.slice(offsetbp, offsetbp+32),
                    tileIndex0Based);
  
                }
              }
  
              // increment and reset for next group of 32 bytes
              tileCount++;
              g32l = ``;
              g32r = ``;
          }
  
  
      }
  
    // if (!replacing){
    //   this.panelContent.querySelector(".hex_content").style.gridTemplateRows = `repeat(${this.numberOfTiles}, calc(100%/8))`;
    // }
    if (mode16){
      this.panelContent.querySelector(".hex_content").style.gridTemplateRows = `repeat(${this.numberOfTiles}, 4em)`;
    }
  
    }
  
    generateBitplaneView(parent, data, tileIndex){
  
      // get previous info, if any, to carry over to next tile's bitplane View
      let anglev = -0.78;    //
      let angleh = -0.36;    //
      let observation = 0.5; // good defaults
      if (this.bpsvgs){
        anglev = this.bpsvgs[0].anglev;
        angleh = this.bpsvgs[0].angleh;
        observation = this.bpsvgs[0].observation;
      }
      this.bpsvgs = []; // clear previous
  
      // let str = `${this.nameValid}_g32s_${ntiles}`;
      // let parent = document.getElementById(str); // parent element to which to append svg
  
      // let data = rbytes.slice(i, i+32);
  
      this.bpsvgs.push(
        makeBitplaneSVG(
          parent,
          "bpsvg_"+tileIndex,
          data,
          angleh,
          anglev,
          observation,
          this.palette
        )
      );
    }
    generateAnimateDecompButton( ){
      // initialize
      this.animateDecomp();
  
      setTimeout( ()=>{
          let animateButton = document.createElement("button");
          animateButton.className = "downloadButtons";
          animateButton.innerHTML = "Animate Decompression Process";
          animateButton.title = "This will demonstrate the 4 command modes in the compressed data.";
          animateButton.style.height = "2em";
          this.animateDecompButton = this.inner.querySelector(".panel_menu").appendChild( animateButton );
  
          this.animateDecompButton.addEventListener("click", (event) => {
            // begin animation
            this.animation.initDecomp( this, this.nexts[0] );
            this.toggleMenu();
          });
          console.log("Animate Decompression button added...");
        },
        1100
      );
    }
  
  
    generateDownloadButton(data, fileName, title, label="Download"){
      // let header = this.inner.querySelector(" .panel_header");
      setTimeout( ()=>{
          let downloadButton = document.createElement("button");
          downloadButton.className = "downloadButtons";
          downloadButton.innerHTML = label;
          downloadButton.title = title;
          downloadButton.style.height = "2em";
          this.downloadButton = this.inner.querySelector(".panel_menu").appendChild( downloadButton );
  
          console.log("beginning download button added... "+Date.now());
          this.downloadButton.addEventListener("click", (event) => {
            console.log("download button clicked. url object:");
            const dataBlob = new Blob( [data], {type: "application/octet-stream"});
            let urlObject = URL.createObjectURL( dataBlob );
  
            console.log(urlObject);
  
            let a = document.createElement("a");
            a.download = fileName;
  
            a.href = urlObject;
            a.click();
            setTimeout( () => { URL.revokeObjectURL( urlObject ); console.log("Download URL removed."); } );
          });
          console.log("download button added... "+Date.now());
        },
        1100
      );
  
  
    }
  
    updateLines(){
  
      // update hexContent grid's grid-template-rows
      let hc = this.inner.querySelector(".panel_content > .hex_content");
      let numberOfGroups = Math.ceil( this.source.data.length / this.groupSize );
      let groupHeight = this.settings['Line Height'].value * this.groupSize / this.settings['Number of Columns'].value ;
      let gtr = `repeat(${numberOfGroups}, ${ groupHeight}em)`;
      hc.style.gridTemplateRows = gtr;
      console.log("update lines() gtr");
  
      // update cells' line height
      let cells = Array.from( hc.querySelectorAll("div > div > div > .hex_cell"));
      cells.forEach( d => d.style.height = this.settings['Line Height'].value +"em");
    }
  
    generateLineSpacingRange(){
  
      let id = this.nameValid+'_'+('Line Height'.replace(/\s/g, ""));
  
      // overall text label html:
      this.lineSpacingDescription = document.createElement("a");
      this.lineSpacingDescription.innerHTML = 'Line Height' ;
      this.lineSpacingDescription = this.inner.querySelector(".panel_menu").appendChild( this.lineSpacingDescription );
  
      // "range" slider html:
      this.lineSpacingInput = document.createElement("input");
      this.lineSpacingInput.id = id;
      this.lineSpacingInput.type = "range";
      this.lineSpacingInput.min = "1";
      this.lineSpacingInput.max = "4";
      this.lineSpacingInput.step = "0.25";
      this.lineSpacingInput.value = this.settings['Line Height'].value;
      this.lineSpacingInput = this.inner.querySelector(".panel_menu").appendChild( this.lineSpacingInput );
  
      // indicator text html:
      this.lineSpacingLabel = document.createElement("label");
      this.lineSpacingLabel.for = id;
      this.lineSpacingLabel.innerHTML = this.settings['Line Height'].value;
      this.lineSpacingLabel = this.inner.querySelector(".panel_menu").appendChild( this.lineSpacingLabel );
  
  
      this.settings['Line Height'].html = [this.lineSpacingDescription, this.lineSpacingInput, this.lineSpacingLabel];
  
  
      this.lineSpacingInput.addEventListener("input", (event) => {
        // console.log(event);
        this.settings['Line Height'].value = event.target.value;
        // update indicator
        // event.target.label.innerHTML = this.settings['Line Height'].value;
        this.settings['Line Height'].html[2].innerHTML = this.settings['Line Height'].value;
        this.lineHeightInPx = this.getLineHeightInPx();
        //
        // this.updateLines();
        this.setPanelContentRows();
      });
  
  
    }
  
    generateTilesetHTML(input = null, startIndex=0, length=24){
      /*
      common btwn tiles and metatiles
  
      tileset_content
      tile_item
      data-tile-index
      #tile_item_${i+1}
    */
  
    
      var tilesPerRow = this.settings['Number of Columns'].value;
  
      let tilesetContent = this.panelContent.querySelector(".tileset_content");
      // tilesetContent.innerHTML = ""; //clear all content first
      // tilesetContent.style.maxHeight = "15em";
      // console.log("this.inner");
      // console.log(this.inner);
      // console.log("tileset content");
      // console.log(tilesetContent);
      var count = 1;
      for (let i=startIndex;i<startIndex+length;i++){
  
        let tile = input[i];
        count = i+1; // count is 1-based, i is 0-based
        var wrapper = document.createElement("div");
        // canvas.id = "canvas";
        wrapper = tilesetContent.appendChild(wrapper);
        wrapper.classList.add("tile_wrapper");
        wrapper.classList.add("tile_item");
        
        let title = `Tile ${count}\n(Click to view bitplanes)`;
        console.log("tileset content: "+title);
        wrapper.title = title;
        // if (count==1){
        //   console.log(title);
        //   console.log(wrapper);
        // }
        wrapper.setAttribute("data-tile-index", count);
        wrapper.id = `tile_item_${count}`;
        let y = Math.floor(i/tilesPerRow);
        let x = i%tilesPerRow;
        wrapper.style.gridRow = ''+(y+1);
        wrapper.style.gridColumn = ''+(x+1);
  
  
  
        // add event listener for
        // opening this tile's data in the linked bitplane viewer
        // and highlighting this tile's presence in metatiles.
        wrapper.addEventListener("click", (event) => {
  
          let clickedTile = event.target;
          // console.log(clickedTile);
          let parent = clickedTile.parentNode;
          // console.log(parent);
          let tileIndex = parent.getAttribute("data-tile-index")*1; // 1-based
          console.log("Selected Tile "+tileIndex+".");
  
          // toggle this tile's selected class:
          let alreadySelected = clickedTile.classList.contains("tile_item_selected");
          Array.from(parent.parentNode.querySelectorAll(".tile_wrapper > .tile_item_selected")).forEach(d=>d.classList.remove("tile_item_selected"));
          if (!alreadySelected) clickedTile.classList.add("tile_item_selected"); // add it back if it wasn't selected
  
          // update the bitplane viewer if it's available
          //HACK: assumes index 0 is the bitplane viewer
          if (this.links[0].source){
            // this.nexts[0].generateHexHTML( this.nexts[0].source.data);
            // A wrapper that prevents jumping to 1st tile
            // last argument, override, will ensure the svg is updated.
  
            // console.log(`this.links[2]: `);
            // console.log(this.links[2]);
            updateBitplaneSeek(this.links[2].inner, this.links[2], 0,
              tileIndex )
            this.selectedTile = tileIndex;
            // // this.links[0].scrollToTile( this.selectedTile );
  
  
  
            // // new method: affects normal hex viewer
            // // 
            // if ( !this.links[2].settings.bitplanes){
            //   this.links[2].settings.bitplanes = true;
            //   this.links[2].setPanelColumns(); // need to implement the bitplane column check in setPanelColumns
            // }
            
            // // set rows to 16 if not already
            // if ( this.links[2].settings['Number of Columns'].value != 1) {
            //   this.links[2].settings['Number of Columns'].value = 1;
            //   // set height of 16 rows to 100%...?
  
            // }
            // // generate the bitplanes
            // let bitplanesDiv = this.links[2].inner.querySelector(".panel_content > .hex_content > .right_group > .bpsvg");
            // if (bitplanesDiv) bitplanesDiv.remove();
            // let rightGroupId = this.links[2].groupSize / ...?
            // scroll to it
            this.links[0].inner.querySelector(".panel_content > .hex_content").scrollTo(
              {top: this.links[0].getByteLocationFromOffset( (tileIndex-1)*32).byte.fromTop, behavior:"smooth"}
            );
          }
  
  
          // highlight this tile's presence within linked metatile viewers
          var subtiles, tileClass;
  
          for (let panel of this.nexts){
            if ( (panel.kind == "metatilesViewer") && panel.source ){
  
              tileClass = "metatile_subtile_tile_index_"+tileIndex;
              subtiles = panel.inner.querySelectorAll(".panel_content > .tileset_content > .metatile_wrapper > canvas");
  
              // toggle selected class if this is the tile in question, else remove selected class
              for (let subtile of subtiles){
                if (subtile.classList.contains(tileClass) ) { subtile.classList.toggle("tile_item_selected"); }
                else { subtile.classList.remove("tile_item_selected"); }
              }
  
            }
  
          }
  
  
  
        });
  
        // add canvas image
        if (this.source.canvasNodes[i]){
          wrapper.appendChild(this.source.canvasNodes[i]);
          continue; // skip if we already have it
        }
  
        // add actual canvas
        let canvas = displayRaw( this.source.rawPixels[i],  wrapper ) ;
        canvas.style.width='100%';
        canvas.style.height='100%';
        this.source.canvasNodes[i] = canvas;
        count++;
      }
    }
  
    generateMetatilesetHTML(input = null, startIndex=0, length=24){
      
        /*
        common btwn tiles and metatiles
        
        tileset_content
        tile_item
        data-tile-index
        #tile_item_${i+1}
      */
  
      
      let tilesetContent = this.panelContent.querySelector(".tileset_content");
  
      // var mtCount = 1;
      // for (let i=startIndex;i<startIndex+length;i++){
      // // for (let mt of input){
      //   let mt = input[i];
      //   mtCount = i+1;
  
      //   let metatileWrapper = tilesetContent.appendChild( document.createElement("div"));
      //   metatileWrapper.className = "metatile_wrapper";
      //   metatileWrapper.classList.add("metatile_wrapper_viewer");
      //   metatileWrapper.classList.add("tile_item");
      //   metatileWrapper.setAttribute("data-tile-index", mtCount);
      //   metatileWrapper.id = `tile_item_${i+1}`;
  
      //   for (let st of mt) {
      //     let pidx = st.paletteIndex*16;
      //     let title = `Metatile ${mtCount}\n\nTile ${st.tileIndex+1}\nVertical Flip: ${st.vflip?"yes":"no"}\nHorizontal Flip: ${st.hflip?"yes":"no"}`;
      //     // Note that tile index is 1-based indexing, palette is 0-based
      //     let classes = [`metatile_subtile_tile_index_${st.tileIndex+1}`, `metatile_subtile_palette_index_${st.paletteIndex}`];
      //     display( [st.colorIndices],  metatileWrapper, this.palette.slice(pidx,pidx+16), 1, title, classes );
  
      //   }
      //   mtCount++;
      // }
  
      var mtsPerRow = this.settings['Number of Columns'].value;
  
      for (let i=startIndex; i<startIndex+length; i++){
        
        // let lt = input[i];
        var mt = input[i];
        // lt.metatile;
        // let vf = lt.vflip;
        // let hf = lt.hflip;
        let y = Math.floor(i/mtsPerRow);
        let x = i%mtsPerRow;
  
        console.log("generate metatiles: "+(i+1));
  
        // wrapper
        let metatileWrapper = tilesetContent.appendChild( document.createElement("div") );
        metatileWrapper.className = "metatile_wrapper";
        metatileWrapper.classList.add("metatile_wrapper_viewer");
        metatileWrapper.classList.add("tile_item");
        metatileWrapper.setAttribute("data-tile-index", i+1);
        metatileWrapper.id = `tile_item_${i+1}`;
        metatileWrapper.style.gridColumn = x+1;
        metatileWrapper.style.gridRow = y+1;
  
        // add canvas image
        if (this.source.canvasNodes[i]){
          metatileWrapper.appendChild(this.source.canvasNodes[i]);
          continue; // skip if we already have it
        }
  
  
        // add overlay ( for grid + tooltips)
        let sti = 0;
        for (let st of mt) {
          let yy = Math.floor(sti/4);
          let xx = sti%4;
          let pidx = st.paletteIndex*16;
          let title = `Metatile ${i+1}\n\nSub-tile (${xx+1},${yy+1}) [${1+sti} of 16] \nTile ${st.tileIndex+1}\nVertical Flip: ${st.vflip?"yes":"no"}\nHorizontal Flip: ${st.hflip?"yes":"no"}`;
          // Note that tile index is 1-based indexing, palette is 0-based
          let classes = [`metatile_subtile_tile_index_${st.tileIndex+1}`, `metatile_subtile_palette_index_${st.paletteIndex}`];
          let subgridItem = metatileWrapper.appendChild( document.createElement("div") );
          subgridItem.classList.add(...classes);
          subgridItem.title = title;
          subgridItem.style.gridRow = ''+(yy+1);
          subgridItem.style.gridColumn = ''+(xx+1);
          subgridItem.style.height = '100%';
          subgridItem.style.width = '100%';
          subgridItem.style.zIndex = '10';
          subgridItem.style.cursor = 'pointer';
          // subgridItem.style.border = '1px solid yellow';
          sti++;
        }
  
        // let cssflip = `${hf?'scaleX(-1) ':''}${vf?'scaleY(-1) ':''}`;
        // metatileWrapper.style.transform = cssflip;
        
        this.source.canvasNodes[i] = displayRaw( this.source.rawPixels[i],  metatileWrapper );
        // this.source.canvasNodes[i].style.gridArea = 'span 4 / span 4';
        this.source.canvasNodes[i].style.gridRow = '1 / -1';
        this.source.canvasNodes[i].style.gridColumn = '1 / -1';
  
        // if (vf || hf) console.log(`Level metatile ${count} should be flipped ${cssflip}.`)
        // count++;
        // if (count >= cutoff) break;
      }
  
    }
  
    generateLevelMapHTML(input = null, indexOffset=0, length=256){
      // console.log(`Generating level map (${input.length} metatiles)...`);
      let tilesetContent = this.panelContent.querySelector(".levelMap_content");
  
      let cutoff = length; //16*16;
      // let count = 0;
      let mtsPerCol = 16;
  
      for (let i=indexOffset; i<indexOffset+length; i++){
        
        let lt = input[i];
        let mt = lt.metatile;
        let vf = lt.vflip;
        let hf = lt.hflip;
        let x = Math.floor(i/mtsPerCol);
        let y = i%mtsPerCol;
        let metatileWrapper = tilesetContent.appendChild( document.createElement("div") );
        metatileWrapper.className = "level_metatile_wrapper";
        metatileWrapper.setAttribute("data-coordinates", x+'_'+y); // 0-based
        metatileWrapper.id = 'metatile_'+x+'_'+y;
        metatileWrapper.style.gridColumn = x+1;
        metatileWrapper.style.gridRow = y+1;
  
        if (this.source.canvasNodes[i]){
          metatileWrapper.appendChild(this.source.canvasNodes[i]);
          continue; // skip if we already have it
        }
  
        // old method; individual canvas per subtile
        // for (let st of mt) {
        //   let pidx = st.paletteIndex*16;
        //   display( [st.colorIndices],  metatileWrapper, this.palette.slice(pidx,pidx+16), 1 );
        // }
        // new method; one canvas per metatile
        
  
        // let cssflip = `${hf?'scaleX(-1) ':''}${vf?'scaleY(-1) ':''}`;
        // metatileWrapper.style.transform = cssflip;
        
        this.source.canvasNodes[i] = displayRaw( this.source.rawPixels[i],  metatileWrapper );
  
        // if (vf || hf) console.log(`Level metatile ${count} should be flipped ${cssflip}.`)
        // count++;
        // if (count >= cutoff) break;
      }
  
    }
  
    generatePaletteHTML(input = null){
      let paletteContent = this.panelContent.querySelector(".palette_content");
  
      for (let i=0; i<input.length; i++){
        let colorItem = document.createElement("div");
        colorItem.className = "color_item";
        colorItem.classList.add(`subPalette_${Math.floor(i/16)}`);
        colorItem.style.backgroundColor = `rgba(${input[i].join(", ")}, 1)`;
        colorItem.title = `Index 0x${hex(i,2)}\nSNES 15-bit RGB (${binart(rgb2snes(input[i]),15,5)})\n24-bit RGB (${input[i].join(", ")})`;
        // colorItem.style.color = `rgba(${input[i].map(d => (127+d)%255).join(", ")}, 1)`;
        let c = paletteContent.appendChild( colorItem);
  
        // let a = document.createElement("a");
        // a.innerHTML = hex(i,2);
        // a.className = "color_label";
        // c.appendChild(a);
  
  
        // Handle the selection of palettes:
  
        c.addEventListener("click", (event) => {
          let ClickedColorItem = event.target;
          // console.log(ClickedColorItem);
          let parent = ClickedColorItem.parentNode;
          // console.log(parent);
          let subPaletteClass = "subPalette_0"; // placeholder...
          // find the classname containing info about sub-palette:
  
          for (let className of event.target.classList){
            if ( className.includes("subPalette") ){
              subPaletteClass = className;
              break;
            }
          }
          if ( subPaletteClass == this.selectedSubPalette ){
            // clicking again will remove the palette, go back to grayscale.
            this.selectedSubPalette = "none";
            // Now that we know the current palette, go through and clear others and add to this one.
            for (let colorItem of parent.querySelectorAll(".color_item")){
              if ( colorItem.classList.contains( subPaletteClass ) ) colorItem.classList.remove( "color_item_selected" );
            }
            this.palette = pal;
  
          } else {
            // otherwise, switch to other subpalete
            this.selectedSubPalette = subPaletteClass;
  
  
            // Now that we know the current palette, go through and clear others and add to this one.
            for (let colorItem of parent.querySelectorAll(".color_item")){
              if ( colorItem.classList.contains( subPaletteClass ) ){
                // console.log("adding class: selected");
                colorItem.classList.add( "color_item_selected" );
              } else{
                colorItem.classList.remove( "color_item_selected" );
              }
            }
  
            // assign the palette values to this panel, so other things can reference it.
            // ( by default, this.palette is the global pal constant )
            let subPaletteIndex = subPaletteClass.split("_")[1]*1;
            // console.log("assigning palette "+subPaletteIndex);
            this.palette = input.slice( subPaletteIndex*16, (subPaletteIndex+1)*16 );
          }
  
          // update dependent panels' palettes:
          this.nexts.forEach( d => d.palette = this.palette);
  
          // update the bitplane viewer if it's available
          //HACK: assumes nexts index 1 is the bitplane viewer
          if (this.nexts[1].source){
            // this.nexts[0].generateHexHTML( this.nexts[0].source.data);
            // A wrapper that prevents jumping to 1st tile
            // last argument, override, will ensure the svg is updated.
            updateBitplaneSeek(this.nexts[1].inner, this.nexts[1], 0, true )
          }
          // update tileset view
          if (this.nexts[2].source){
            this.nexts[2].generateTilesetHTML( this.nexts[2].source.data);
            // A wrapper that prevents jumping to 1st tile
            // last argument, override, will ensure the svg is updated.
            // updateBitplaneSeek(this.nexts[0].inner, this.nexts[0], 0, true )
          }
  
        });
  
      }
  
    }
  
  
    scrollToTile( tileIndex ){
      // scrolls to a tile
      console.log("scrolling to tile "+tileIndex);
      let hc = this.panelContent.querySelector(".hex_content");
      // let newTile = hc.querySelector("#tile_index_"+tileIndex);
      // let oldTile = hc.querySelector("#tile_index_"+this.selectedTile);
  
      // let newTile = hc.querySelector("div > #g0x"+hex((tileIndex-1)*32,6));
  
      // if (!newTile) {
      //   // if this tile isn't already present, we'll have to calculate where it would be and scroll there:
      //   let newPosition = hc.querySelector("div > .hex_g32").getBoundingClientRect().height*(tileIndex-1);
      //   setTimeout( ()=>hc.scrollTo({top: newPosition, behavior: 'smooth'}), 0.1);
  
      // } else {
      //   // Just scroll directly to that tile (maybe more reliable?)
      //   setTimeout( ()=>hc.scrollTo({top: newTile.offsetTop-(newTile.offsetHeight), behavior: 'smooth'}), 0.1);
      // }
  
      // calculate where it would be and scroll there (seems more reliable that looking up div, if it even exists)
      let newPosition = hc.querySelector("div > .hex_g32").getBoundingClientRect().height * (tileIndex-1);
      setTimeout( ()=>hc.scrollTo({top: newPosition, behavior: 'smooth'}), 0.1);
  
      // update this panel's currently selected tile
      this.selectedTile = tileIndex;
  
    }
    /* some scroll functions may be redundant... */
    checkOffsetPosition( offset, bottomRowMargin=2, topRowMargin=0, winPos=null ){
      // pos is an override position, for example if we are planning where the content will be in the future
      var hc = this.panelContent.querySelector(".hex_content");
      var windowHeight = hc.getBoundingClientRect().height;
      var windowScrollTop, windowScrollBottom;
  
      if (winPos!=null){
        windowScrollTop = winPos;
        windowScrollBottom = winPos + windowHeight;
      } else {
        windowScrollTop = hc.scrollTop;
        windowScrollBottom = windowScrollTop + windowHeight;
  
      }
  
  
      // check where the offset would be:
      // (doesn't directly query, because html node might not exist yet, for performance reasons,
      // so we look at the first we can find )
      // let g32Height = hc.querySelector("div > .hex_g32").getBoundingClientRect().height;
      // let offsetPos = (g32Height*(offset>>5)); // relative to top of its container, NOT the window
      // let rowHeight = (this.settings['Number of Columns'].value==16) ? g32Height/2 : g32Height;
      let rowHeight = hc.querySelector(".byte_group > .byte_container").getBoundingClientRect().height;
      // if we're in the second row, add a rowHeight
      //TODO: make more modular for arbitrary col widths?
      // if ( (this.settings['Number of Columns'].value==16) && (((offset/16)%2)>=1) ) offsetPos += g32Height/2;
      let offsetPos = rowHeight * Math.floor(offset/this.settings['Number of Columns'].value); // relative to top of its container, NOT the window
      //
      var outs = {
        position: offsetPos,
        topMargin: topRowMargin*rowHeight,
        windowHeight: windowHeight,
        rowHeight: rowHeight,
  
      };
  
      if ( (offsetPos < (windowScrollTop + (topRowMargin*rowHeight))) || (offsetPos > (windowScrollBottom - (bottomRowMargin*rowHeight))) ){
        // setTimeout( ()=>hc.scrollTo({top: offsetPos, behavior: 'smooth'}), 0.1);
        return { ...outs, inView: false};
      } else {
        return { ...outs, inView: true};
      }
  
    }
    scrollToOffset( offset ){
      // scrolls to an offset: expects offset as a number, not string
      console.log("scrolling to offset "+hex(offset,6));
      let hc = this.panelContent.querySelector(".hex_content");
      let g32Height = hc.querySelector("div > .hex_g32").getBoundingClientRect().height;
      let newPosition = (g32Height*(offset>>5));
      if ( (this.settings['Number of Columns'].value==16) && (((offset/16)%2)>=1) ) newPosition += g32Height/2;
      setTimeout( ()=>hc.scrollTo({top: newPosition, behavior: 'smooth'}), 0.1);
    }
    scrollToView( offset ){
      let hc = this.panelContent.querySelector(".hex_content");
      let windowHeight = hc.getBoundingClientRect().height;
      let windowScrollTop = hc.scrollTop;
      let windowScrollBottom = windowHeight + windowScrollTop;
      // check where the offset would be:
      let g32Height = hc.querySelector("div > .hex_g32").getBoundingClientRect().height;
      let newPosition = (g32Height*(offset>>5));
      let rowHeight = (this.settings['Number of Columns'].value==16) ? g32Height/2 : g32Height;
      if ( (this.settings['Number of Columns'].value==16) && (((offset/16)%2)>=1) ) newPosition += g32Height/2;
      //
      if ( (newPosition < (windowScrollTop + rowHeight)) || (newPosition > windowScrollBottom - (2*rowHeight)) ){
        setTimeout( ()=>hc.scrollTo({top: newPosition, behavior: 'smooth'}), 0.1);
      }
  
    }
  
  
    animate16to1(overrideMode=null,tile=null){
  
      if (!this.tic) this.tic = 1.5; // in s
  
      var hexContent = this.panelContent.querySelector(".hex_content");
  
      if (tile==null){
        // var g32tile = hexContent.querySelector(".g32");
        var g32tile = hexContent.querySelector("#tile_index_"+this.selectedTile);
        // console.log(g32tile);
      }
      else{
        var g32tile = tile;
      }
      var tileIndex = g32tile.getAttribute("data-tile-index")*1;
  
      var oldMode = this.panelContent.getAttribute("data-mode");
      var newMode = "";
      if (overrideMode){
        newMode = overrideMode;
      }
      else{
        newMode = oldMode=="byte16"?"byte1":"byte16"; // simplified: toggle
      }
  
      var ani = {
        duration: 1,
        elapsed: 0,   // set to final element's delay for "backwards" order
        direction: 1, // set -1 for "backwards" order
        series: true, // set to false before running parallel animations
        timingFunction: 'ease',
        tic: function (duration, delay){
          if (!duration) duration = this.duration;
          if (!delay) delay = this.elapsed;
          this.elapsed+= ( duration * this.direction )
        },
        mate: function (elements, toggleClasses, duration, timingFunction, delay){
          if (!duration) duration = this.duration;
          if (!timingFunction) timingFunction = this.timingFunction;
          if (!delay) delay = this.elapsed; // usually won't specify anyway
  
          let trans = `${duration}s ${timingFunction} ${delay}s`;
          // console.log(toggleClasses[0]+":   "+trans);
  
          for (let element of elements){
  
            // // Directly assign a transition
            // element.style.transition = trans;
            // // Assign a timeout for the transition to be removed
            // setTimeout( () => {
            //   element.style.transition = ``;
            //   // console.log((delay+duration)+"s:  "+toggleClasses[0]+"");
            // }, ((delay+duration)*1000)-5 );
            // // toggle the classes
            // toggleClasses.forEach( (d)=> element.classList.toggle(d) );
  
  
            // Assign a timeout for the transition to be removed
            setTimeout( () => {
              // Directly assign a transition
              element.style.transition = trans;
              // toggle the classes
              toggleClasses.forEach( (d)=> element.classList.toggle(d) );
  
              setTimeout( () => element.style.transition = ``, ((delay+duration)*1000)-5 );
  
            }, ((delay)*1000) );
  
  
          }
          // increase the elapsed count
          if (this.series) this.tic(duration, delay);
        }
      };
  
      // // animation "steps" labeled according to order when going byte16 -> byte1
  
      // replace default "plain" with more detailed g32:
      this.generateHexHTML( this.source.data, (tileIndex-1)*32, oldMode, 32, [g32tile]);
      console.log("replacing with old mode "+oldMode+" to start with...");
  
      switch(newMode){
        case "byte16":
  
          // animation order settings ("backwards" order)
          var numTics = 5;
          ani.duration = this.tic;
          ani.elapsed = (numTics-1) * ani.duration;
          ani.elapsed = 6;
          ani.direction = -1;
          break;
  
        case "byte1":
          // "forwards" order
          ani.duration = this.tic;
          ani.elapsed = 0;
          ani.direction = 1;
  
          // if we are going to 1-bit-wide mode, update the html first
  
  
          // create the svg
          var tileIndex0Based = (1*g32tile.getAttribute("data-tile-index")) - 1;
          var offset = tileIndex0Based*32;
          this.generateBitplaneView(
            g32tile.querySelector(".g32s"),
            this.source.data.slice(offset, offset+32),
            tileIndex0Based);
          break;
      }
  
  
  
      // animation "steps" labeled according to order when going byte16 -> byte1
      ani.series = false;
  
      // already has a 1s grid temp rows transition permanently assigned.
      let before = tileIndex>1? `repeat(${tileIndex-1}, calc(100%/8)) ` : ``;
      let after = tileIndex<this.numberOfTiles? ` repeat(${this.numberOfTiles-tileIndex}, calc(100%/8))` : ``;
      hexContent.style.gridTemplateRows = before + '100%' + after;
  
  
      // instantly switch the data from taking up all remaining columns of g32 to only taking up one column
      ani.mate( g32tile.querySelectorAll(".g32r"), ["g32r_b16","g32r_b1"], 0.0 );
  
      // 0  expand/collapse height of this tile (g32l, g32rr, and g32s)
      console.log("Now, will toggle from g32 classes "+Array.from(g32tile.classList).join(", "));
      ani.mate( [g32tile], ["g32_b16","g32_b1"], 0.5 );
      ani.tic(0.5);
  
      // parallel animations
      // (some require custom parsing for each, so we turn of ani.series)
  
  
      // 1  hide/show offset labels 0-F
      ani.mate(  this.panelContent.querySelectorAll(".hex_header > div > .hex_header_offset_label"), ["hex_header_offset_label_b16","hex_header_offset_label_b1"], 2.5 );
      // 1  reposition the g32_items
      g32tile.querySelectorAll("div > .g32_item").forEach( d => ani.mate( [d], ["g32_item_b16","g32_item_b1",...["_b16","_b1"].map(e=>d.getAttribute(`data-gridclass`)+e)], 2.5)  );
  
      // 2  fade in/out the extra offsets
      ani.mate( g32tile.querySelectorAll(".g32l > .g32l_offset_sometimes"), ["g32l_offset_sometimes_b16", "g32l_offset_sometimes_b1"], 2.5);
  
      // 3  base labels, "hex" and "binary"   [ parallel w/ above ]
      ani.mate(
      this.panelContent.querySelectorAll(".hex_header > div > .hex_header_base_label"), ["hex_header_base_label_b16","hex_header_base_label_b1"], 2.5 );
      ani.tic(2.5);
  
  
  
      // // 3  expand/collapse the g32b (binary representation) column  [ parallel w/ below ]
      // ani.mate( [this.panelContent], ["panel_content_b16","panel_content_intermediate"], 2 );
      // ani.tic(2);
  
  
      // 5  expand/collapse the g32s (svg) column
      // ani.mate( [this.panelContent], ["panel_content_intermediate","panel_content_b1"], 1 );
      ani.mate( [this.panelContent], ["panel_content_b16","panel_content_b1"], 1.5 );
      ani.tic(1.5);
  
      // 4  change the coloring of the byte
      // foreground
      g32tile.querySelectorAll("div > .g32_item").forEach(d => ani.mate( [d], [`fg_bp${d.getAttribute('data-bitplane')}`], 1.5 )  );
      // background
      ani.mate( g32tile.querySelectorAll(".g32bg"), ["g32bg_b16","g32bg_b1"], 1.5 );
      ani.tic(1.5);
  
      // show/hide the svg
      ani.mate( g32tile.querySelectorAll(".g32s"), ["g32s_b16","g32s_b1"], 1.5 );
      ani.tic(1.5);
  
      this.panelContent.setAttribute("data-mode", newMode);
  
  
    }
    // generateBitplaneView(parent, data, tileIndex)
    // animate1to16(){
  
    // }
  
    animateDecomp(source, destination){
  
  
      // ---------------------------------------------------------------
      // define the functions that will be used frequently for animation:
  
  
  
      // Reducing those to the unique actions:
  
      // copy div, make its units rem, make larger with transform origin at reight or left
      function clone(node){
        var mover = node.cloneNode(true);
        mover.style.position = "absolute";
        var nodeBbox = node.getBoundingClientRect();
        // mover.style.perspective = `100px`;
        // mover.style.perspectiveOrigin = `100px`;
        mover.style.width = nodeBbox.width+"px";
        mover.style.height = nodeBbox.height+"px";
        mover.style.transform = `translate3D(${nodeBbox.x }px, ${nodeBbox.y }px, 0px)`;
        mover.style.zIndex = "100";
        mover = page.appendChild(mover);
        return mover;
      }
  
      // convert to binary
      function convertToBinary(mover){
        var hexToDec = {'0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, 'A':10, 'B':11, 'C':12, 'D':13, 'E':14, 'F':15};
        mover.innerHTML = binar(Array.from(mover.innerHTML).reverse().reduce((s,d,i)=>s+=hexToDec[d]*(16**i),s=0),8);
      }
  
      // split into 2 MSBs and 6 LSBs
  
      // highlight n bytes from left to right (sometimes wrapping around)
      function highlight(node){
      }
  
      // decrement visible n in sync with other things
  
      // move across screen and resize
      function move(node){
        var nodeBbox = node.getBoundingClientRect();
        // mover.style.perspective = `100px`;
        // mover.style.perspectiveOrigin = `100px`;
        mover.style.width = nodeBbox.width+"px";
        mover.style.height = nodeBbox.height+"px";
        mover.style.transform = `translate3D(${nodeBbox.x - (left?nodeBbox.width:0)}px, ${nodeBbox.y }px, 0px)`;
      }
  
      // replace destination styling with mover's (just colors?)
  
      // fade out movers and remove
  
      // take a div and make a stack of n duplicates of them as movers
  
      // swap bytes (just movement?)
  
  
      // move to left of offsets, scroll page, move right to specific byte
      function scroll(panel){
        panel.scrollToTile(Math.floor(offset/32)+1);
      }
  
      // pick up a group of bytes in unison
  
      // bit shift left / multiply by 2
  
      // ---------------------------------------------------------------
  
      //TODO: move this into its own class
      this.animation = new Animation();
  
  
  
    }
  
    propagateSource(){
      // this propagates the update of a source (or addition) out to dependent panels
      console.log(`propagateSource on panel ${this.index}: ${this.name} ( ${this.kind} )`);
      switch (this.kind){
        case "fileIn":
          0;
          break;
  
        case "hexViewer":
          // break;
          // decompress
          // if we have source compressed graphics (ignore for calls from others )
          if (this.links[0].source && !this.source ){
            this.source = {
                name: "Decompressed from "+this.links[0].source.filename,
                kind: "bytes",
                data: dkc1decompress( Array(...this.links[0].source.data) ),
                panel: this,
                from: this.links[0]
            };
            // updateBitplaneSeek(this.inner, this, 0 );
            // this.inner.querySelector(".panel_content > .hex_content").style.gridTemplateRows = `repeat(${Math.ceil(this.source.data.length/this.groupSize)}, ${ 4 * this.groupSize/32 }em)`;
  
            // this.generateLineSpacingRange();
  
            // this.generateHexHTML( this.source.data, 0, this.groupSize*2 ); // first two groups' worth
            // // Truncated version for performance
            // // this.generateHexHTML( this.source.data.slice(0,32*20), 0, 32*20);
  
            // download setup
            if (!this.downloadButton){
              let downloadFileName = this.links[0].source.filename.replace(".bin","_Decompressed.bin");
              this.generateDownloadButton(
                this.source.data, downloadFileName,
                "Download Decompressed Graphics File (.bin)");
            }
  
  
            // this.updateLines(); // should bring to full height, accurate scrollbar?
            // this.setPanelContentRows(); // ?
  
  
            this.initHex(); //generates the strings
            this.generateLineSpacingRange();
            this.setPanelContentColumns();
            
            this.setPanelContentRows();
            this.generateHexHeaderHTML();
            this.generateHexHTML( this.source.data, 0, this.groupSize*4);
            this.hexScroll(); // should generate enough to cover the view window
            
  
  
          }
  
          break;
        case "hexViewerComp":
          // compressed data hex viewer and animator
          // if we have source compressed graphics (ignore for calls from others )
          
          
          if (this.links[0].source && !this.source){
            this.source = {
                name: this.links[0].source.filename,
                kind: "bytes",
                data: Array(...this.links[0].source.data),
                panel: this,
                from: this.links[0]
            };
            // updateBitplaneSeek(this.inner, this, 0 );
            // this.inner.querySelector(".panel_content > .hex_content").style.gridTemplateRows = `repeat(${Math.ceil(this.source.data.length/this.groupSize)}, ${ 4 * this.groupSize/32 }em)`;
  
            // this.generateLineSpacingRange();
  
            // this.generateHexHTML( this.source.data, 0, this.groupSize*2 ); // first two groups' worth
            // // Truncated version for performance
            // // this.generateHexHTML( this.source.data.slice(0,32*20), 0, 32*20);
  
            // // download setup
            // // if (!this.downloadButton){
            // //   let downloadFileName = this.links[0].source.filename;
            // //   this.generateDownloadButton(
            // //     this.source.data, downloadFileName,
            // //     "Download Original Compressed Data File (.bin)");
            // // }
            // this.updateLines(); // should bring to full height, accurate scrollbar?
            // // this.setPanelContentRows(); // ?
  
            
            this.initHex(); //generates the strings
            this.generateLineSpacingRange();
            this.setPanelContentColumns();
            
            this.setPanelContentRows();
            this.generateHexHeaderHTML();
            this.generateHexHTML( this.source.data, 0, this.groupSize*4);          
            this.hexScroll(); // should generate enough to cover the view window
            
            
  
            // create the button used to run the decomp animation
            if (!this.animateDecompButton){
              this.generateAnimateDecompButton( );
            }
          }
  
          break;
  
        case "bitplaneViewer":
          // break;
  
          // decompress
          // if we have source compressed graphics (ignore for calls from others )
          if (this.links[0].source && !this.source){
            this.source = {
                name: this.links[0].source.name,
                kind: "bytes",
                data: this.links[0].source.data,
                panel: this,
                from: this.links[0]
            };
            // updateBitplaneSeek(this.inner, this, 0 );
            this.generateBitplaneHTML( this.source.data.slice(0,32), 0, "byte1", 32);
            //
            updateBitplaneSeek(this.inner, this, 0);
  
            // download setup
            // if (!this.downloadButton){
            //   let downloadFileName = this.name.replace(".bin","_Decompressed.bin");
            //   this.generateDownloadButton(
            //     this.source.data, downloadFileName,
            //     "Download Decompressed Graphics File (.bin)");
            // }
          }
  
          break;
  
        case "paletteViewer":
          this.source = {
              name: "Decompressed from "+this.links[0].source.filename,
              kind: "bytes",
              data: palette2rgb( this.links[0].source.data ),
              panel: this,
              from: this.links[0]
          };
          this.generatePaletteHTML( this.source.data);
          break;
  
        case "tilesetViewer":
          // break;
          // de-intertwine the bitplanes, show tilesets
          // (only if we have actual data (this.links[0]), not just palette (this.links[1]) )
          //TODO: better way to source filename
          if (this.links[0].source && !this.generated){
            this.source = {
                name: "De-intertwined from "+this.links[0].source.from.source.filename,
                kind: "tiles",
                data: unbitplane( this.links[0].source.data ),
                panel: this,
                from: this.links[0]
            };
            // Don't actually use the imported big palette, bc we don't know which subset goes to each 8x8 tile
            // if (this.links[1].source){
            //   this.palette =  this.links[1].source.data ;
            // }
            // this.panelContent.querySelector(".tileset_content").style.gridTemplateColumns = '';
            this.initTiles();
            this.generateTilesetHTML( this.source.data);
            this.generated = true;
          }
          break;
  
        case "metatilesViewer":
          // break;
          // create the 32x32 pixel meta tiles, composed of 4x4 tiles of 8x8 pixels, from tileset
          // (only if we palette (this.links[0]), tile data (this.links[1]), AND metatile32 map (this.links[2]) )
          //TODO: better way to source filename
          //TODO: have a default 8x16 palette in case we don't have a source
          if  (this.links[0].source && this.links[1].source && this.links[2].source ){
            console.log(`Building metatiles...`);
            this.source = {
                name: "Metatiles built from "+this.links[2].source.filename,
                kind: "metatiles",
                data: metatile( this.links[1].source.data, this.links[2].source.data ), /* tiles, tilemap32  */
                panel: this,
                from: this.links[1]
            };
            // get palette from the palette viewer, which has converted SNES format to RGB
            if (this.links[0].source){
              this.palette =  this.links[0].source.data;
            }
            this.initMetatiles();
            // this.panelContent.querySelector(".tileset_content").style.gridTemplateColumns = '';
            this.generateMetatilesetHTML( this.source.data);
          }
          break;
  
        case "levelMapViewer":
          // place the 32x32 pixel meta tiles, from metatileset
          // (only if we palette (this.links[0]), metatile data (this.links[1]), AND level map (this.links[2]) )
          //TODO: better way to source filename
          //TODO: have a default 8x16 palette in case we don't have a source
          if  (this.links[0].source && this.links[1].source && this.links[2].source ){
            console.log(`Building level map...`);
            this.source = {
                name: "Levels built from "+this.links[2].source.filename,
                kind: "metatiles",
                data: levelMap( this.links[1].source.data, this.links[2].source.data ), /* metatiles, level map  */
                panel: this,
                from: this.links[1]
            };
            // get palette from the palette viewer, which has converted SNES format to RGB
            if (this.links[0].source){
              this.palette =  this.links[0].source.data;
            }
            this.initLvl();
            this.generateLevelMapHTML( this.source.data);
          }
          break;
  
      }
      // now do the next one, if it exists:
      //HACK: paletteViewer was slowing things down,
      // propagating out to regenerate a bunch of stuff.
      // if (this.nexts[0] && (this.kind != "paletteViewer") ) { this.nexts[0].propagateSource(); }
      // if (this.nexts[0] ) { this.nexts[0].propagateSource(); }
      // this.nexts.forEach( d => d.propagateSource());
  
      if ( this.kind != "paletteViewer" ) {
        this.nexts.forEach( d => d.propagateSource());
      }
  
    }
  
  }