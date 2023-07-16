var viewModeSelectors = document.querySelectorAll('.viewModeSelection');
var allBrushesDOM = [] //added in config
var valueBrushesContainer = document.querySelector('#value-brushes-container') //brushes container
var valueBrushesDOM = valueBrushesContainer.querySelectorAll('.brush');; // empty brushes array
var ruleBrushesContainer = document.querySelector('#rule-brushes-container') //brushes container
var ruleBrushesDOM = ruleBrushesContainer.querySelectorAll('.brush');; // empty brushes array
var brushSizeSelection = document.querySelector('#brushSizeSelection')
var brushSizeSelectionNum = document.querySelector('#brushSizeSelectionNum')
var saveControls = document.querySelector('#save-controls') //save controls input group
var editorPanel = document.querySelector('#editor-panel') // editor panel for burshes
var editorPanelInner = editorPanel.querySelector('.editor-panel-inner');
var sidebar = document.querySelector('.sidebar') // editor panel for burshes




// Key Controls
document.addEventListener('keydown', function (evt) {
  var isShift = !!evt.shiftKey;
	console.log(isShift)
  if ((evt.keyCode === myp5.RIGHT_ARROW) || (evt.keyCode === 32) && (!isShift)) { // space or right arrow
  	if ( document.activeElement.classList.contains('blacklist-spacebar') ) return console.log('default spacebar')  // check if active element prevents custom spacebar function
	    console.log('SPACEBAR')
	    evt.preventDefault();
	    step();
  } else if (evt.keyCode === 27) { // ESCAPE
    	resetCanvas();
  } if (evt.keyCode == '13') { // on enter trigger click event for the active element
      document.activeElement.click();
  } if ( ((evt.keyCode === myp5.SHIFT) && (evt.keyCode === 221)) || (evt.keyCode === 221) ) { // right bracket
    	loadSize({elem: document.querySelector('#brush-size-selection input'), type: "", modifier: 1});
  } if ( ((evt.keyCode === myp5.SHIFT) && (evt.keyCode === 219)) || (evt.keyCode === 219) ) { // right bracket
    	loadSize({elem: document.querySelector('#brush-size-selection input'), type: "", modifier: -1});
  } if ( evt.keyCode === 88 ) { // X key
    	for (i in viewModeSelectors) {
    		if (!viewModeSelectors[i].classList.contains('active')) {
	    		viewModeSelectors[i].click(); // triggers loadViewMode on clicked element
	    		break
	    	}
    	}
  } if ((isShift) && (evt.keyCode === 32)) { // CMD + SPACE
  	  if ( document.activeElement.classList.contains('blacklist-spacebar') ) return console.log('default spacebar')  // check if active element prevents custom spacebar function
      evt.preventDefault();
      playContainer = document.querySelector('#play-controls .play-container');
      playContainer.click();
  }
});



////////////////////////////////
//        VIEW MODE           //
////////////////////////////////

viewModeSelectors.forEach(selector => { // for each selector
		if ( controls.state.editor.viewMode == selector.getAttribute('value') ) { 
			selector.classList.add('active')
  	} else {
  		selector.classList.remove('active')
  	}
	});

for (let i=0; i < viewModeSelectors.length; i++) {
	if (viewModeSelectors[i].checked) {
		controls.state.editor.viewMode = viewModeSelectors[i].value;
	}
}

function toggleViewMode(targetMode) {
	console.log('RUNNING FUNCTION')
	viewModeSelectors.forEach(selector => { // for each selector
		if (targetMode == selector.getAttribute('value')) { 
			console.log(`active: ${selector.getAttribute('value')} `)
			selector.classList.add('active')
  	} else {
  		selector.classList.remove('active')
  	}
	});
  console.log('View Mode: ' + targetMode);
  controls.state.editor.viewMode = targetMode;
	myp5.stepForward('initialize');
}


///////////////////////////
//    CANVAS CONTROLS    //
///////////////////////////


// RESET FUNCTION
resetCanvas = function(resetType) {
	if ((!resetType) || (resetType == 'all')) {
		myp5.init()
	}
}

// set initial value of controls....

// form submit function...
submitCanvasSettings = function(form) {
	console.log(form);
	console.log(`canvas width: ${ form.srcElement.canvasWidth.value }`)
	console.log(`canvas height: ${ form.srcElement.canvasHeight.value  }`)
	console.log(`cell width: ${ form.srcElement.cellWidth.value  }`)
	console.log(`cell height: ${ form.srcElement.cellHeight.value  }`)

	controls.canvas.width = parseInt(form.srcElement.canvasWidth.value)
	controls.canvas.height = parseInt(form.srcElement.canvasHeight.value)
	controls.cells.width = parseInt(form.srcElement.cellWidth.value)
	controls.cells.height = parseInt(form.srcElement.cellHeight.value)
	console.log(controls)


	// reset sketch with new canvas
	myp5.remove();
  workspace.innerHTML = '';
	// ruleBrushesContainer.innerHTML = ""; // delete existing rules DOM
	myp5 = new p5(sketch, workspace);
}


setCellDisplayMode = function(elem) {
	console.log(`Cell display mode set to ${elem.value}`)
	controls.cells.display = elem.value;
	myp5.stepForward(true);
}



//////////////////////////
//    TOAST CONTROLS    //
//////////////////////////

const toastTrigger = document.getElementById('liveToastBtn')
const toastLiveExample = document.getElementById('liveToast')

if (toastTrigger) {
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
  toastTrigger.addEventListener('click', () => {
  	if (toastLiveExample.classList.contains('show')) {
  		toastBootstrap.hide()
  	}
    toastBootstrap.show()
  })
}


////////////////////////////////
//       PLAY CONTROLS        //
////////////////////////////////

step = function(DOMelem) {
  if (controls.state.workspace.loop == true) {
    playContainer = document.querySelector('#play-controls .play-container');
    playPause(playContainer);
  }
  stepContainer = document.querySelector('#play-controls .step-container');
  stepContainer.classList.add('active');
  async function asyncCall() {
      setTimeout(() => {
        console.log('remove')
        stepContainer.classList.remove('active');
      }, 200);
  }
  asyncCall();
  myp5.stepForward();
}

playPause = function(DOMelem) {
	if (!DOMelem) DOMelem = document.querySelector('#play-controls .play-container');
  if (controls.state.workspace.loop == true) {
    controls.state.workspace.loop = false;
  	DOMelem.classList.remove("play","active")
  	DOMelem.classList.add("pause")
    return
  }
  if (controls.state.workspace.loop == false) {
  	DOMelem.classList.remove("pause")
  	DOMelem.classList.add("play","active")
    controls.state.workspace.loop = true;
    return
  }
}


////////////////////////////////
//           BRUSHES          //
////////////////////////////////


var createBrushes = function(type, container, brushesSelectionPanel) {
	for (i in brushesSelectionPanel) {
		var brush = Object.assign(
		    document.createElement('a'), { 
		    	id: brushesSelectionPanel[i].id,
		    	rulesetID : brushesSelectionPanel[i].id,
		    	type: type,
		    	value: brushesSelectionPanel[i].value,
		    	href: "#",
		    	classList: `brush ${type} p-0 list-group-item list-group-item-action ${brushesSelectionPanel[i].default ? 'active' : ''}` ,
	    		innerHTML: `<div class="d-flex align-items-center">
		    								<div class="brush-main d-flex align-items-center justify-content-left" style="pointer-events:none;">
										    	<div  class="preview ratio m-1 ratio-1x1 rounded" style="background-color: hsl(${brushesSelectionPanel[i].hue}, 45%, 45%); background-image: url('${brushesSelectionPanel[i].preview}')"></div>
										      <h3 class="brush-label m-0 ms-2 text-nowrap ui-type">${brushesSelectionPanel[i].label}</h3>
										    </div>
										    <div class="brush-settings orange-focus highlight-focus d-flex gap-1 border-start align-items-center justify-content-center" ${ type == 'rule' ? 'data-bs-toggle="tooltip" data-bs-title="Rule Settings" data-bs-placement="right"' : '' }  ">
										    	${ type == 'rule' ? '<div type="button" id="'+type+'-settings-'+brushesSelectionPanel[i].id+'" data-brushid = "'+brushesSelectionPanel[i].id+'" brushid = "'+brushesSelectionPanel[i].id+'" class="btn py-1 px-2"> <i class="bi bi-braces" style="font-size: 1rem;"></i> </div>' : ''}
										    	${ type == 'value' ? '<div type="button" id="'+type+'-settings-'+brushesSelectionPanel[i].id+'" data-brushid = "'+brushesSelectionPanel[i].id+'" data-type="' + type + '" brushid = "'+brushesSelectionPanel[i].id+'" class="btn py-1 px-2"> <i class="bi bi-pencil-fill" style="font-size: 1rem;"></i> </div>' : ''}
										    </div>
									    </div>
									    `
		    }
		  )
		container.appendChild(brush);
		var brushSettingsButton = document.querySelector(`.brush-settings #${type}-settings-${brushesSelectionPanel[i].id}`);
		brushSettingsButton.addEventListener("click", function(e) {
    		e.preventDefault();

    		var clickedBrush = document.querySelector(`#brush-selection #${this.dataset.brushid}`);

				if (clickedBrush.classList.contains('opened')){ 		// if toggle...
					closeBrushEditor(type, this)
				} else {																						// if click new
					closeBrushEditor(type, this)
					clickedBrush.classList.add('active');
					clickedBrush.classList.add('opened');
					openBrushEditor(type, this);	
				}

			});
	}
}

var setDefaultBrush = function(type, brushes, brushesDOM){
	for (let i in brushes) {
			if (brushes[i].default == true) {
					// console.log("setting default brush to: " + brushes[i].label)
				  if (type == 'value') controls.state.editor.currentFill = brushes[i];
				  if (type == 'rule') controls.state.editor.currentRuleset = brushes[i];

	  			controls.state.editor.paintMode.push(brushes[i].paintMode);
			}
	}
}

var configBrushes = function(type, container, brushesDOM){ // brush click behavior
	
	allBrushesDOM[type] = [] //create sub array in allBrushesDOM obj for brush type
	
	brushesDOM = container.querySelectorAll('.brush');
	for (let i = 0; i < brushesDOM.length; i++) {
			allBrushesDOM[type].push(brushesDOM[i]);
			brushesDOM[i].addEventListener("click", function(e) {
    		e.preventDefault();
				var shiftClick = (e.shiftKey) ? true : false;
				loadBrush(type, this, brushesDOM, allBrushesDOM, shiftClick);
			});
	}
}

var loadBrush = function(type, currentTarget, brushesDOM, allBrushesDOM, multiSelect) {

  	// console.log(allBrushesDOM);

  	// HANDLE ACTIVE CLASS
  	if (multiSelect == false ) { // clears all on normal click
	  	for (cat in allBrushesDOM) {
		    for (let i = 0; i < allBrushesDOM[cat].length; i++) { allBrushesDOM[cat][i].classList.remove('active'); }	
  		}
  	}
  	if (multiSelect == true ) {  // loop removes other selected brushes within the selection category during multiselect
	  	for (cat in allBrushesDOM) {
	  		if ( cat == type ){
			    for (let i = 0; i < allBrushesDOM[cat].length; i++) { 
		    		allBrushesDOM[cat][i].classList.remove('active'); 
		   	 	}	
	  		}
  		}
  	}

  	event.currentTarget.classList.add('active'); // clicked brush is always active

  	var activeBrushesDOM = [];
  	for (cat in allBrushesDOM) { // add active brushes to an array
	    for (let i = 0; i < allBrushesDOM[cat].length; i++) { 
	    	if (allBrushesDOM[cat][i].classList.contains('active')) {
	    		activeBrushesDOM.push(allBrushesDOM[cat][i]);
	  			// console.log(`Active Brush Id:\n${allBrushesDOM[cat][i].id}`)
	    	}
	    }
	  }

  	// SET CURRENT BRUSH STATE
	  if (type == "value") controls.state.editor.currentFill = controls.editor.fills[currentTarget.id];
	  if (type == "rule") controls.state.editor.currentRuleset = controls.rulesets[currentTarget.id];

	  // SET PAINT MODE
		controls.state.editor.paintMode = []; // clear
		for (i in activeBrushesDOM) {
			controls.state.editor.paintMode.push(activeBrushesDOM[i].type)
		}

		// SET VIEW
	  if ((type == "rule") && (multiSelect == false)) {
	  	controls.state.editor.viewMode = "ruleMode";
	  	document.querySelector('.viewModeSelection#ruleMode').click();
			myp5.stepForward('initialize');
		}
  	if ((type == "value") && (multiSelect == false)) {
	  	controls.state.editor.viewMode = "valueMode";
	  	document.querySelector('.viewModeSelection#valueMode').click();
			myp5.stepForward('initialize');
		}

  console.log(controls.state.editor);
}


createBrushes("value", valueBrushesContainer, controls.editor.fills);
configBrushes("value", valueBrushesContainer, valueBrushesDOM);
setDefaultBrush("value", controls.editor.fills, valueBrushesDOM);

createBrushes("rule", ruleBrushesContainer, controls.rulesets);
configBrushes("rule", ruleBrushesContainer, ruleBrushesDOM);
setDefaultBrush("rule", controls.rulesets, ruleBrushesDOM);

console.log(controls.state.editor)


var deleteBrush = function(type, brushID) {
	if (type != "rule") return;
	console.log(`Deleting ${brushID.rulesetID} from rule brushes`);
	if (Object.keys(controls.rulesets).length <= 1) {  // if final brush is deleted create a new blank brush
		addBrush(type, 0);
	}

	var rulesets = Object.keys(controls.rulesets)
	let remaindingRulesets = rulesets.filter(a => a !== brushID.rulesetID)
	console.log(remaindingRulesets[0])

	console.log(remaindingRulesets)
	for (let i=0; i < myp5.columns; i++) {
		for (let j=0; j < myp5.rows; j++) {
			console.log("Adjusting board rulesets...")
			if ((myp5.board[i][j].ruleset == brushID.rulesetID) || (!myp5.board[i][j].ruleset)) {
				myp5.board[i][j].ruleset = remaindingRulesets[0]

			}
		}
	}
	delete controls.rulesets[brushID.rulesetID];
	ruleBrushesContainer.innerHTML = ""; // delete existing rules DOM
	createBrushes("rule", ruleBrushesContainer, controls.rulesets);
	configBrushes("rule", ruleBrushesContainer, ruleBrushesDOM);
	setDefaultBrush("rule", controls.rulesets, ruleBrushesDOM);
	myp5.stepForward(true);
	closeBrushEditor();
}

var addBrush = function(type, brushPosition) {
	if (type != "rule") return;
	console.log(`Adding new ruleset to rule brushes`);

	// Ruleset ID Number
	var rulesetidNumbers = []
	for (i in controls.rulesets) { rulesetidNumbers.push(controls.rulesets[i].idNumber); }
	newIDNumber = Math.max(...rulesetidNumbers)+1;

	// Ruleset Hue
	var rulesetHues = []
	for (i in controls.rulesets) { rulesetHues.push(controls.rulesets[i].hue); }
	var newHue = function() {
		console.log(rulesetHues)
		initialVal = rulesetHues[rulesetHues.length - 1]+40 ;
		console.log(initialVal)
		if (initialVal > 360) { initialVal = initialVal % 360} 
		console.log(initialVal)
		return initialVal;
	}


	var newRuleset = { 
        "label": `Ruleset ${newIDNumber}`,
        "paintMode": "rule",
        "hue": newHue(),
        "preview": "",
        "id": `ruleset${newIDNumber}`,
        "idNumber": newIDNumber,
        "lock": false,
        "wrap": true,
        "default": false,
        "assignments": [{"if": [ "*", "*", "*", "*", "*", "*", "*", "*", "*"], "then": 1, "RSYM": 1 }]
    }

		controls.rulesets[`ruleset${newIDNumber}`] = newRuleset;
		ruleBrushesContainer.innerHTML = ""; // delete existing rules DOM
		createBrushes("rule", ruleBrushesContainer, controls.rulesets);
		configBrushes("rule", ruleBrushesContainer, ruleBrushesDOM);
		setDefaultBrush("rule", controls.rulesets, ruleBrushesDOM);
}


// var brush = Object.assign(
// 		    document.createElement('a'), { 
// 		    	id: brushesSelectionPanel[i].id,
// 		    	rulesetID : brushesSelectionPanel[i].id,
// 		    	type: type,
// 		    	value: brushesSelectionPanel[i].value,
// 		    	href: "#",
// 		    	classList: `brush ${type} p-0 list-group-item list-group-item-action ${brushesSelectionPanel[i].default ? 'active' : ''}` ,
// 	    		innerHTML: `<div class="d-flex align-items-center">
// 		    								<div class="brush-main d-flex align-items-center justify-content-left" style="pointer-events:none;">
// 										    	<div  class="preview ratio m-1 ratio-1x1 rounded" style="background-color: hsl(${brushesSelectionPanel[i].hue}, 45%, 45%); background-image: url('${brushesSelectionPanel[i].preview}')"></div>
// 										      <h3 class="brush-label m-0 ms-2 text-nowrap ui-type">${brushesSelectionPanel[i].label}</h3>
// 										    </div>
// 										    <div class="brush-settings d-flex gap-1 border-start align-items-center justify-content-center" data-bs-toggle="tooltip" data-bs-title="${ type.charAt(0).toUpperCase() + type.slice(1) } Settings" data-bs-placement="right">
// 										    	${ type == 'rule' ? '<div type="button" id="'+type+'-settings-'+brushesSelectionPanel[i].id+'" data-brushid = "'+brushesSelectionPanel[i].id+'" brushid = "'+brushesSelectionPanel[i].id+'" class="btn py-1 px-2"> <i class="bi bi-braces" style="font-size: 1rem;"></i> </div>' : ''}
// 										    	${ type == 'value' ? '<div type="button" id="'+type+'-settings-'+brushesSelectionPanel[i].id+'" data-brushid = "'+brushesSelectionPanel[i].id+'" data-type="' + type + '" brushid = "'+brushesSelectionPanel[i].id+'" class="btn py-1 px-2"> <i class="bi bi-pencil-fill" style="font-size: 1rem;"></i> </div>' : ''}
// 										    </div>
// 									    </div>
// 									    `
// 		    }
// 		  )



var addRuleButton = Object.assign(
	    document.createElement('div'), { 
		    classList: `p-0 list-group-item list-group-item-action add-brush-container dashed-gradient` ,
    		innerHTML: `<div class="d-flex align-items-center highlight-focus" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="Create New Brush" data-bs-placement="right" onclick="addBrush('rule','push')"  tabindex="2">
							    		<div class="brush-main d-flex align-items-center justify-content-left" style="pointer-events:none;">

															<div class="preview m-1 d-flex align-items-center justify-content-center">
																<i class="bi bi-plus-circle" style="font-size: 1rem;"></i>
															</div>
													    <h3 class="brush-label m-0 ms-2 text-nowrap ui-type">Add Brush...</h3>

									    </div>
								    </div>
					    			` 
    	}
	  )
document.querySelector('.rule-brushes-footer').appendChild(addRuleButton);



////////////////////////////////
//        SIZE CONTROLS       //
////////////////////////////////
controls.state.editor.currentBrushSize = parseInt(brushSizeSelection.value);

function loadSize({elem: elem, type: type, modifier: modifier}) {

	if (type == 'event'){
	  console.log('Brush size is ' + elem.target.value + 'px');
  	brushSizeSelectionNum.value = parseInt(elem.target.value)
  	brushSizeSelection.value = parseInt(elem.target.value)
	  controls.state.editor.currentBrushSize = parseInt(elem.target.value);
	  console.log(controls.state.editor);
	  return;
	}
  elem.value = parseInt(elem.value) + modifier;
  brushSizeSelectionNum.value = parseInt(elem.value)
  brushSizeSelection.value = parseInt(elem.value)
  controls.state.editor.currentBrushSize = parseInt(elem.value);
  console.log('Brush size is ' + elem.value + 'px');
}

brushSizeSelection.addEventListener("change", function(){
    loadSize({elem: event, type: "event" })
}, false);
brushSizeSelectionNum.addEventListener("change", function(){
    loadSize({elem: event, type: "event" })
}, false);

loadSize({elem: brushSizeSelection }) // init the text input with the value of the slider


////////////////////////////////
//        SAVE CONTROLS       //
////////////////////////////////

function save(event) {
	controls.state.workspace.fileType = saveControls.querySelector("select").value // set initial value
	console.log(`File Type: ${controls.state.workspace.fileType} `);
  memory = myp5.board;
  if ( controls.state.workspace.fileType == 'svg') {
  	createCanvas();
  } if ( controls.state.workspace.fileType == 'json') { 
  	var jsonData = {"controls": controls, "board": myp5.board}
  	
  	function download(filename, text) { // hacky way to download json file without a server
		  var element = document.createElement('a');
		  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		  element.setAttribute('download', filename);
		  element.style.display = 'none';
		  document.body.appendChild(element);
		  element.click();
		  document.body.removeChild(element);
		}
		// Start file download.
		download("data.json",JSON.stringify(jsonData));


  } else {
  	myp5.saveCanvas();
  }
}

controls.state.workspace.fileType = saveControls.querySelector("select").value // set initial value
console.log(controls.state.workspace.fileType);
saveControls.querySelector(".save-file").addEventListener("click", save);


////////////////////////////////
//        LOAD CONTROLS       //
////////////////////////////////

function loadFile(event) {

	brushesOnly = document.querySelector('#brush-load-settings input').checked;

	var reader = new FileReader();
  reader.onload = function(event) {
    var jsonObj = JSON.parse(event.target.result);
    console.log(jsonObj);
    jsonData = jsonObj; // make global
    if (brushesOnly) { // only brushes
    	if (document.querySelector('#brushLoadType').value == 'append'){
			    	var lastKeyValue = controls.rulesets[Object.keys(controls.rulesets)[Object.keys(controls.rulesets).length - 1]].idNumber // "get last key in rulesets object (EX: ruleset2)"
			    	console.log(lastKeyValue)
			    	for (i in jsonData.controls.rulesets) {
			    		var newIDNumber = lastKeyValue+1+jsonData.controls.rulesets[i].idNumber
			    		controls.rulesets[`ruleset${newIDNumber}`] = jsonData.controls.rulesets[i]
			    		controls.rulesets[`ruleset${newIDNumber}`].id = `ruleset${newIDNumber}`
			    		controls.rulesets[`ruleset${newIDNumber}`].idNumber = newIDNumber
			    	}
    	} else {
    		  	controls.rulesets = jsonData.controls.rulesets;
    	}
    	controls.fills = jsonData.controls.fills;
			ruleBrushesContainer.innerHTML = ""; // delete existing rules DOM

			// check rulesets
			var newRulesetIDs = []
			for (i in controls.rulesets) {
				 newRulesetIDs.push(controls.rulesets[i].id)
			}
			for ( let i = 0; i < myp5.columns; i++) {
            for ( let j = 0; j < myp5.rows; j++) {
            		console.log(myp5.board[i][j].ruleset)
            		console.log(newRulesetIDs)
            		if (newRulesetIDs.includes(myp5.board[i][j].ruleset) == false) {
            			console.log("ruleset does not exist...")
            			myp5.board[i][j].ruleset = newRulesetIDs[0]
            			myp5.board[i][j].display()
            		}
            }
      }
			createBrushes("rule", ruleBrushesContainer, controls.rulesets);
			configBrushes("rule", ruleBrushesContainer, ruleBrushesDOM);
			setDefaultBrush("rule", controls.rulesets, ruleBrushesDOM);	
	} else { // whole project
	    controls = jsonData.controls;
	    myp5.remove();
	    workspace.innerHTML = '';
			ruleBrushesContainer.innerHTML = ""; // delete existing rules DOM
			createBrushes("rule", ruleBrushesContainer, controls.rulesets);
			configBrushes("rule", ruleBrushesContainer, ruleBrushesDOM);
			setDefaultBrush("rule", controls.rulesets, ruleBrushesDOM);		
			myp5 = new p5(sketch, workspace);
		}
  }	
  var object = reader.readAsText(event.target.files[0]);

}

document.querySelector("#loadJSON").addEventListener("change", loadFile);



////////////////////////////////
//       BRUSH EDITOR         //
////////////////////////////////

var closeBrushEditor = function() {
	for (i in allBrushesDOM) {
		for (let b=0; b<allBrushesDOM[i].length; b++) {
			// if (allBrushesDOM[type][b] != currentTarget) { 
				allBrushesDOM[i][b].classList.remove('opened');
			// }
		}
	}

	console.log("close editor")
	editorPanel.classList.remove('open')
	editorPanelInner.innerHTML = '';
	
	var p5canvasDOM = document.querySelector('.p5Canvas') // editor panel for burshes
	p5canvasDOM.style.marginLeft = `${editorPanel.offsetWidth}px`;
}

var openBrushEditor = function(type, currentTarget) {

	console.log(currentTarget)

	// SET CSS
	var sidebar = document.querySelector('.sidebar');
	editorPanel.style.left = `${sidebar.offsetWidth}px`;
	console.log(`${sidebar.offsetWidth}px`);

	editorPanelInner.innerHTML = '';

	var brushID = currentTarget.getAttributeNode("brushid").value;
	var brush = controls.rulesets[brushID];

	if (type == 'rule') { 
		console.log(`____________\nEditor: ${brush.label}\nType: ${type}, Brush ID: ${brushID}`)
		editorPanel.classList.add('open')
	}
	if (type == 'value') { 
		console.log(`Editor: ${controls.editor.fills[brushID].label}\nType: ${type}, Brush ID: ${brushID}`)
		editorPanel.classList.add('open')
	}

		var header = Object.assign(
		    document.createElement('div'), { 
		    	id: `header-${brush.id}`,
		    	type: type,
		    	classList: `header-brush header-${type} ${type}`,
	    		innerHTML: `
	    								<div class="editor-panel-header">
	    									<div class="brush-editor-controls d-flex justify-content-between align-items-center">
		    									<div type="button" onclick="deleteBrush('${type}', ${brushID})" class="btn p-0"><i class="bi bi-trash" style="font-size: 1rem;" data-bs-toggle="tooltip" data-bs-title="Delete Brush" data-bs-placement="bottom"></i></div>
													<button type="button" class="btn-close" onclick="closeBrushEditor()" aria-label="Close" data-bs-toggle="tooltip" data-bs-title="Close Editor" data-bs-placement="bottom"></button>
	    									</div>
	    								</div>

											<h4 class="ui-type ui-label  mt-2"> GENERAL SETTINGS </h4>
	    								<form class="mb-3">
											  <input type="text" class="blacklist-spacebar form-control" id="label-${brush.id}" placeholder="${brush.label}" onkeyup="setLabel(this.value, '${brush.id}')">
											</form>											
											<div id="general-brush-settings-container" class="d-flex gap-3">
									  		<div id="lock-settings" class="form-check form-switch">
												  <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onclick="setLock('${brush.id}')" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Lock cells with this Ruleset' data-bs-placement="bottom">
												  <label class="form-check-label small" for="flexSwitchCheckDefault">Lock</label>
												</div>
												<div id="wrap-settings" class="form-check form-switch">
												  <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" onclick="setWrap('${brush.id}')" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Wrap cells with this Ruleset' data-bs-placement="bottom">
												  <label class="form-check-label small" for="flexSwitchCheckChecked">Wrap</label>
												</div>
									  	</div>
											<h4 class="ui-type ui-label mt-4"> RULES </h4>
										`
		    }
		  )
		editorPanelInner.appendChild(header);


		/////////////////////////////////
		//// GENERAL BRUSH SETTINGS /////
		/////////////////////////////////

		// WRAP //
		var wrapSettings = document.querySelector('#wrap-settings input');
		if (controls.rulesets[brushID].wrap == true) {
			wrapSettings.checked = true;
		}
		window.setWrap = function(brushID) {
			if (controls.rulesets[brushID].wrap == true) { 	// toggle to false
				controls.rulesets[brushID].wrap = false
				console.log('wrap: "false"')
			} else { 																					// toggle to true
				controls.rulesets[brushID].wrap = true
				console.log('wrap: "true"')
			}
		}

		// LOCK //
		var lockSettings = document.querySelector('#lock-settings input');
		if (controls.rulesets[brushID].lock == true) {
			lockSettings.checked = true;
		}
		window.setLock = function(brushID) {
			if (controls.rulesets[brushID].lock == true) { 	// toggle to false
				controls.rulesets[brushID].lock = false
				console.log('lock: "false"')
			} else { 																					// toggle to true
				controls.rulesets[brushID].lock = true;
				console.log('lock: "true"')
			}
		}

		// LABEL //
		window.setLabel = function(inputVal, brushID) {
				controls.rulesets[brushID].label = inputVal
				let brushLabelDOM = document.querySelector(`#brush-selection #${brushID} .brush-label`);
				brushLabelDOM.innerHTML = `${inputVal}`;
		}


		var rules = Object.assign(
		    document.createElement('div'), { 
		    	id: `rules-${brush.id}`,
		    	type: type,
		    	classList: `rules-brush rules-${type} ${type}`,
	    		innerHTML: `<div class="rules-container"></div>
	    								<div class="rules-footer-container"></div>` 
	    	}
		  )

		var createToggles = function() { // Toggle Behavior
			console.log('creating toggles...')
			var valueToggles = {
				if: document.querySelectorAll('.if .value-toggle'),
				then: document.querySelectorAll('.then .value-toggle')
			}
			for (let i=0; i < valueToggles.if.length; i++) {
				valueToggles.if[i].addEventListener("click", function(e) {
					var tempAssignments = brush.assignments[this.dataset.rule] 
					var toggleValue = this.dataset.value;
					if (toggleValue == 0) {
						toggleValue = '*';
					} else if (toggleValue == 1) {
						toggleValue = 0;
					} else if (toggleValue == '*') {
						toggleValue = 1;
					}
					this.dataset.value = toggleValue;
					this.className = `value-toggle val-${toggleValue}`;
					tempAssignments.if[this.dataset.cellassignment] = this.dataset.value
					brush.assignments[this.dataset.rule].if = tempAssignments.if;
				});
			}
			for (let i=0; i < valueToggles.then.length; i++) {
				valueToggles.then[i].addEventListener("click", function(e) {  // loop is unnessessary right now, only 1 in array
					var tempAssignments = brush.assignments[this.dataset.rule] 
					console.log(`brush.assignments for "this.dataset.rule: ${parseInt(this.dataset.rule)}`);
					console.log(brush.assignments[parseInt(this.dataset.rule)] );
	    		// e.preventDefault();
					var toggleValue = parseInt(this.dataset.value);
					if ((toggleValue == 1)) {
						toggleValue = 0;
					} else if ((toggleValue == 0)) {
						toggleValue = 1;
					}
					this.dataset.value = toggleValue;
					this.className = `value-toggle val-${toggleValue}`;
					tempAssignments.then = parseInt(this.dataset.value) // change
					brush.assignments[parseInt(this.dataset.rule)].then = tempAssignments.then;
				});
			}
		}

		var p5canvasDOM = document.querySelector('.p5Canvas') // editor panel for burshes
		p5canvasDOM.style.marginLeft = `${editorPanel.offsetWidth}px`;


		window.addRule = function(newRulePosition) {
		    		console.log(`Add Rule to ${brush.label}`);
		    		if(controls.state.workspace.loop == true) playPause();
		    		if ((document.querySelector('.rules-container')) && (newRulePosition != "push")) {
		    			brush.assignments.splice(newRulePosition, 0, {"if": ["*", "*", "*", "*", "*", "*", "*", "*", "*"], "then": 0,  "RSYM": 1});
							document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
		    			createRules(); // recreate rules from brush object
							createToggles();
		    		} if ((document.querySelector('.rules-container')) && (newRulePosition == "push")) { // if last in array use push
		    			brush.assignments.push({"if": ["*", "*", "*", "*", "*", "*", "*", "*", "*"], "then": 0,  "RSYM": 1 });
							document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
		    			createRules(); // recreate rules from brush object
							createToggles();
		    		}
		}
		window.moveRule = function(currentRulePosition, direction) {
		    		console.log(`Moving rule ${direction}...`);
		    			var tempAssignments = brush.assignments[currentRulePosition]
	    				brush.assignments.splice(currentRulePosition, 1); //deletes rule at current position
		    			brush.assignments.splice(currentRulePosition + direction, 0, tempAssignments);
							document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
		    			createRules(); // recreate rules from brush object
							createToggles();
		    		
		}
		window.deleteRule = function(deleteRulePosition) {
		    		console.log(`Deleting Rule #${deleteRulePosition} from ${brush.label}`);
		    		console.log(deleteRulePosition);
	    			brush.assignments.splice(deleteRulePosition, 1);
						document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
	    			createRules(); // recreate rules from brush object
						createToggles();
		}
		window.duplicateRule = function(duplicateRulePosition) {
		    		console.log(`Duplicating Rule #${duplicateRulePosition} to ${brush.label} (${brush.id})`);
		    		if ((document.querySelector('.rules-container')) && (duplicateRulePosition != "push")) {
		    			brush.assignments.splice(duplicateRulePosition, 0, {"if": ["*", "*", "*", "*", "*", "*", "*", "*", "*"], "then": 0, "RSYM": 1 } ); //brush.assignments[duplicateRulePosition]
							brush.assignments[duplicateRulePosition].if = brush.assignments[duplicateRulePosition+1].if.slice()
							brush.assignments[duplicateRulePosition].then = brush.assignments[duplicateRulePosition+1].then
							brush.assignments[duplicateRulePosition].RSYM = brush.assignments[duplicateRulePosition+1].RSYM
							document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
		    			createRules(); // recreate rules from brush object
							createToggles();
		    		} if ((document.querySelector('.rules-container')) && (duplicateRulePosition == "push")) { // if last in array use push
		    			brush.assignments.push(rule);
							document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
		    			createRules(); // recreate rules from brush object
							createToggles();
		    		}
		}

		window.rotateRule = function(rotateRulePosition) {
						if (brush.assignments[rotateRulePosition].RSYM == 4 ) { 
							brush.assignments[rotateRulePosition].RSYM = 1 
						} else { 
							brush.assignments[rotateRulePosition].RSYM++ 
						};

						// const tooltip = bootstrap.Tooltip.getInstance('#rotate-rule') // Returns a Bootstrap tooltip instance
						// tooltip.setContent({ '.tooltip-content': 'another title' })

		    		console.log(`Rotating Rule #${rotateRulePosition} to ${brush.assignments[rotateRulePosition].RSYM}`);
		    		document.querySelector('.rules-container').innerHTML = ""; // delete existing rules DOM
	    			createRules(); // recreate rules from brush object
						createToggles();
		}


		var createRules = function() { // END CREATE RULES
			console.log('creating rules...')
			for (i = 0; i < brush.assignments.length; i++){
				rule = brush.assignments[i];
				var ruleDOM = Object.assign(
				    document.createElement('div'), { 
				    	id: `rule-${i}-${brush.id}`,
				    	classList: `rule-container` ,
			    		innerHTML: `<div class="rule-header d-flex align-items-center justify-content-start"> 
			    									<div type="button" onclick="addRule(${i})" class="add-rule  p-0" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Add Rule' data-bs-placement="left"> <i class="bi bi-plus-circle" style="font-size: 14px;"></i> </div>
			    									<span style="width: 100%;" class="dashed-2 ms-2"></span>
		    									</div>
			    								<div class='rule-main d-flex gap-2 justify-content-between'>
				    								<div class="move-container d-flex flex-column">
				    									<div type="button" onclick="moveRule(${i}, -1)" class=" p-0" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Move Up' data-bs-placement="left" tabindex="3"> <i class="bi bi-chevron-up" style="font-size: 14px;"></i> </div>
															<div type="button" onclick="moveRule(${i}, 1)" class=" p-0" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Move Down' data-bs-placement="left" tabindex="3"> <i class="bi bi-chevron-down" style="font-size: 14px;"></i> </div>
														</div>	
				    								<div class="assignments-container d-flex gap-0 align-items-center">
					    								<table class="table assignments rule assignment-${i} if table-bordered">
															  	<tr>
																		<td class="NW">		<div data-rule="${i}" data-cellassignment="${0}" data-value="${rule.if[0]}" class="value-toggle val-${rule.if[0]}" data-bs-toggle="tooltip" data-bs-title="NW Neighbor" data-bs-placement="top" tabindex="3">	<i class="bi bi-asterisk"></i>	</div></td>
																  	<td class="N">		<div data-rule="${i}" data-cellassignment="${3}" data-value="${rule.if[3]}" class="value-toggle val-${rule.if[3]}" data-bs-toggle="tooltip" data-bs-title="N Neighbor" data-bs-placement="top" tabindex="3">		<i class="bi bi-asterisk"></i>	</div></td>
																  	<td class="NE">		<div data-rule="${i}" data-cellassignment="${6}" data-value="${rule.if[6]}" class="value-toggle val-${rule.if[6]}" data-bs-toggle="tooltip" data-bs-title="NE Neighbor" data-bs-placement="top" tabindex="3">	<i class="bi bi-asterisk"></i>	</div></td>
															  	</tr>
															  	<tr>
																		<td class="W">		<div data-rule="${i}" data-cellassignment="${1}" data-value="${rule.if[1]}" class="value-toggle val-${rule.if[1]}" data-bs-toggle="tooltip" data-bs-title="W Neighbor" data-bs-placement="left" tabindex="3">	<i class="bi bi-asterisk"></i>	</div></td>
																  	<td class="SELF">	<div data-rule="${i}" data-cellassignment="${4}" data-value="${rule.if[4]}" class="value-toggle val-${rule.if[4]}" data-bs-toggle="tooltip" data-bs-title="SELF" data-bs-placement="top" tabindex="3">				<i class="bi bi-asterisk"></i>	</div></td>
																  	<td class="E">		<div data-rule="${i}" data-cellassignment="${7}" data-value="${rule.if[7]}" class="value-toggle val-${rule.if[7]}" data-bs-toggle="tooltip" data-bs-title="E Neighbor" data-bs-placement="right" tabindex="3">	<i class="bi bi-asterisk"></i>	</div></td>
															  	</tr>
															  	<tr>
																		<td class="SW">		<div data-rule="${i}" data-cellassignment="${2}" data-value="${rule.if[2]}" class="value-toggle val-${rule.if[2]}" data-bs-toggle="tooltip" data-bs-title="SW Neighbor" data-bs-placement="bottom" tabindex="3">	<i class="bi bi-asterisk"></i>	</div></td>
																  	<td class="S">		<div data-rule="${i}" data-cellassignment="${5}" data-value="${rule.if[5]}" class="value-toggle val-${rule.if[5]}" data-bs-toggle="tooltip" data-bs-title="W Neighbor" data-bs-placement="bottom" tabindex="3">		<i class="bi bi-asterisk"></i>	</div></td>
																  	<td class="SE">		<div data-rule="${i}" data-cellassignment="${8}" data-value="${rule.if[8]}" class="value-toggle val-${rule.if[8]}" data-bs-toggle="tooltip" data-bs-title="SE Neighbor"data-bs-placement="bottom" tabindex="3">	<i class="bi bi-asterisk"></i>	</div></td>
															  	</tr>
															</table>
															<div class="arrow-container ms-1 me-1"><i style="font-size:14px; color: var(--RULE-tan-4);" class="bi bi-arrow-right"></i></div>
															<table class="table rule assignment-${i} then table-borderless">
															  	<tr>
																		<td></td>
																  	<td></td>
																  	<td></td>
															  	</tr>
															  	<tr>
																		<td></td>
																  	<td class="SELF"><div data-rule="${i}" data-value="${rule.then}" class="value-toggle val-${rule.then}" data-bs-toggle="tooltip" data-bs-title="Next State" data-bs-placement="top" tabindex="3"><i class="bi bi-asterisk" ></i>
																  	</div></td>
																  	<td></td>
															  	</tr>
															  	<tr>
																		<td></td>
																  	<td></td>
																  	<td></td>
															  	</tr>
															</table>
														</div>
														<div class="ruleControls d-flex flex-column">

															<div type="button" onclick="deleteRule(${i})" id="delete-rule" class=" p-0" data-bs-toggle="tooltip" data-bs-title="Delete Rule" data-bs-placement="right" tabindex="3"> <i class="bi bi-trash" style="font-size: 14px;"></i> </div>
															<div type="button" onclick='duplicateRule(${i})' id="duplicate-rule" class=" p-0" data-bs-toggle="tooltip" data-bs-title="Duplicate Rule" data-bs-placement="right" tabindex="3"> <i class="bi bi-files" style="font-size: 14px;"></i> </div>		
															<div type="button" onclick='rotateRule(${i})' id="rotate-rule" class="p-0" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Rotational Symmetry' data-bs-placement="right" tabindex="3"> <div style="width: 15px; height: 15px" class="rule-icons rotation-${rule.RSYM}" ></div> </div>		

														</div> 
													</div>
													`					
				    }
				  )
				
				rules.querySelector('.rules-container').appendChild(ruleDOM);
				
			}

  	}	 // END CREATE RULES

		var rulesFooter = Object.assign(
	    document.createElement('div'), { 
	    	id: `rules-footer-${brush.id}`,
	    	type: type,
	    	classList: `rules-brush rules-${type} ${type}`,
    		innerHTML: `<div class="rule-header d-flex align-items-center justify-content-start"> 
			    									<div type="button" onclick="addRule('push')" class="add-rule  p-0" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title='Add Rule' data-bs-placement="left"> <i class="bi bi-plus-circle" style="font-size: 14px;"></i> </div>
			    									<span style="width: 100%;" class="dashed-2 ms-2"></span>
		    									</div>` 
    	}
	  )


		createRules();
		rules.querySelector('.rules-footer-container').appendChild(rulesFooter);
		editorPanelInner.appendChild(rules);
		createToggles();

		createTooltips(true)

		// for (let i=0; i < valueToggles.then.length; i++) {
		// 	valueToggles.then[i].addEventListener("click", function(e) {
    // 		e.preventDefault();
		// 		var toggleValue = this.dataset.value;
		// 		if (toggleValue == 0) {
		// 			toggleValue = '*';
		// 		} else if (toggleValue == 1) {
		// 			toggleValue = 0;
		// 		} else if (toggleValue == '*') {
		// 			toggleValue = 1;
		// 		}
		// 		console.log('changed to: ' + toggleValue)
		// 		this.dataset.value = toggleValue;
		// 		this.className = `value-toggle val-${toggleValue}`;
		// 	});
		// }
}


////////////////////////////////
//     OFFCANVAS BUTTON       //
////////////////////////////////

const offcanvasinfo = document.getElementById('offcanvasinfo')
offcanvasinfo.addEventListener('hide.bs.offcanvas', event => {
  document.querySelector('#info-offcanvas-control').classList.remove('active')
})
offcanvasinfo.addEventListener('show.bs.offcanvas', event => {
  document.querySelector('#info-offcanvas-control').classList.add('active')
})



////////////////////////////////
//         TOOLTIPS           //
////////////////////////////////


function createTooltips(reset){
		if (reset) tooltipList.forEach((tooltip) => {tooltip.dispose()});
		const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
		window.tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
			delay: { "show": 200, "hide": 0 }
		}))
}

var toggleTooltips = function() {
	if (controls.state.workspace.tooltips == true) {
		controls.state.workspace.tooltips = false
		console.log('disabling tooltips')
		tooltipList.forEach(tt => {
			tt.disable()
		})
	} else {
		controls.state.workspace.tooltips = true

		console.log('enabling tooltips')
		tooltipList.forEach(tt => {
			tt.enable()
		})
	}
}

var tooltipControlsContainer = document.querySelector('#tooltip-container')

if (controls.state.workspace.tooltips == true) {
	tooltipControlsContainer.querySelector('input').checked = true;
}

createTooltips();

var clickTargetElem = function(selector) {
	document.querySelector(selector).click()
}

var activeTTList = []
var showTargetTT = function(selector) {
	document.querySelectorAll('.tooltip.show').forEach(tt => {
		activeTTList.push(tt)
		tt.classList.add('hide')
		tt.classList.remove('show')
		document.querySelector(selector).classList.remove('focus'); 
	})
		focusElements.forEach(elem => { 
			elem.classList.remove('focus'); 
		})
	document.querySelector(selector).classList.add('focus'); 
	var targetInstanceTT = bootstrap.Tooltip.getInstance(selector);
	targetInstanceTT.toggle()
}

var hideTargetTT = function(selector) {
	var targetInstanceTT = bootstrap.Tooltip.getInstance(selector);
	document.querySelector(selector).classList.remove('focus'); 
	targetInstanceTT.hide()
	var activeTTList = [];
}





////////////////////////////////
//           MASONRY          //
////////////////////////////////
// imagesloaded: https://imagesloaded.desandro.com/
// masonry: https://masonry.desandro.com/layout.html

var masonryContainer = document.querySelector('.grid');

new imagesLoaded( masonryContainer, function() {
			var msnry = new Masonry( masonryContainer, {
			  // options
				"percentPosition": true 
			});
} )




////////////////////////////////
//        ON LOAD INTRO       //
////////////////////////////////


window.onload = (event) => {

    let myAlert = document.querySelector('#intro-toast');
    let bsAlert = new bootstrap.Toast(myAlert);
    bsAlert.show();


    // Create Intro Tooltips
		tooltipList.forEach(tt => {
			tt.show()
		})

		focusElements = document.querySelectorAll(`.highlight-focus`)
		focusElements.forEach(elem => { 
			elem.classList.add('focus'); 
		})


		var clearIntroTooltips = function() {
		 	tooltipList.forEach(tt => {
				tt.hide()
			}) 
			focusElements.forEach(elem => { 
				elem.classList.remove('focus'); 
			})
		}

		window.addEventListener("click", function(event) {
			clearIntroTooltips();
		});

		setTimeout(function(){
			clearIntroTooltips();
		}, 8000);
}





