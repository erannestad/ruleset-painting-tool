var workspace = document.querySelector('#workspace');

var jsonData;
var memory = [];
var hoverMemory = [];

var controls = {
  "state": {
    "editor": {
      "currentBrush": {},
      "currentBrushSize": "",
      "paintMode": [],
      "viewMode": "valueMode",
      "currentFill": "",
      "currentRuleset": ""
    },
    "workspace": {
      "tooltips": true,
      "loop" : false,
      "fileType": ""
    }
  },
  "canvas": {
    "width": 800,  
    "height": 600, 
    "padding": 30,
    "mode": "",
    "fromMemory": false,
    "background": true
  },
  "cells": {
    "width": 8,
    "height": 8, 
    "strokeWeight": "",
    "display": "stroke-horizontal", 
  },
  "editor": {
    "brushes": {
      "squareErasor": {
        "name": "Square Erasor",
        "id": "squareErasor"
      },
      "squareBrush": {
        "name": "Square Brush",
        "id": "squareBrush"
      }
    },
    "fills": {
      "solid": {
        "label": "Black Fill",
        "paintMode": "value",
        "id": "solid",
        "preview": "thumbnails/thumbnails_square-black-fill.png",
        "value": 1,
        "default": false
      },
      "empty": {
        "label": "White Fill",
        "paintMode": "value",
        "id": "empty",
        "preview": "thumbnails/thumbnails_square-white-fill.png",
        "value": 0,
        "default": false
      },
      "noise": {
        "label": "Noise Fill",
        "paintMode": "value",
        "id": "noise",
        "preview": "thumbnails/thumbnails_square-noise-fill.png",
        "value": .5,
        "default": false
      }
    }
  },
  "rulesets": {
    "ruleset0": {
        "label": "Ruleset 0",
        "paintMode": "rule",
        "hue": 40,
        "preview": "",
        "id": "ruleset0",
        "idNumber": 0,
        "lock": false,
        "wrap": true,
        "default": true,
        "assignments": [{"if": [1, "*", "*", "*", "*", "*", "*", "*", "*"], "then": 0, "RSYM": 1 },
                        {"if": ["*", "*", "*", 1, "*", "*", "*", "*", "*"], "then": 1, "RSYM": 1 },
                        {"if": ["*", "*", "*", "*", "*", "*", 1, "*", "*"], "then": 0, "RSYM": 1 }]
    },
    "ruleset1": {
        "label": "Ruleset 1",
        "paintMode": "rule",
        "hue": 80,
        "preview": "",
        "id": "ruleset1",
        "idNumber": 1,
        "lock": false,
        "wrap": true,
        "default": false,
        "assignments": [{"if": [1, "*", "*", "*", "*", "*", "*", "*", "*"], "then": 1, "RSYM": 1 },
                        {"if": ["*", "*", "*", 1, "*", "*", "*", "*", "*"], "then": 0, "RSYM": 1 },
                        {"if": ["*", "*", "*", "*", "*", "*", 1, "*", "*"], "then": 0, "RSYM": 1 }]

    }
  }
}

let sketch = function(p) {

        p.padding = controls.canvas.padding;
        p.w = controls.cells.width; // Cell width
        p.h = controls.cells.height // Cell height
        p.columns;
        p.rows;
        p.board;
        p.cell;

        // console.log(p.ruleset);

        // Cell class
        class Cell {
          constructor(xPos, yPos, rulesetObject, value, nextValue) {
            this.x = xPos;
            this.y = yPos;
            this.ruleset = rulesetObject.id;
            this.value = value;
            this.nextValue = nextValue;
            this.hoverStatus = false;
          }

          clicked(fillValue) {
            if (controls.state.editor.paintMode.includes("value")) {
              
              // transform fill value
              var binaryFill
              var testVal = Math.random();
              if ( testVal >= fillValue) binaryFill = 0;
              if ( testVal <= fillValue) binaryFill = 1;

              this.value = binaryFill;
              this.nextValue = binaryFill;
          }
            if (controls.state.editor.paintMode.includes("rule")) {
              this.ruleset = controls.state.editor.currentRuleset.id;
            }
          }

          display() {

              if (this.hoverStatus == true) {
                var hoverModifier = function(inputVal) {  
                  if (180 - inputVal > 50) {return inputVal * 1.3}
                  if (180 - inputVal <= 50) {return inputVal * .7};
                } 
              } else {
                var hoverModifier = function(inputVal){return inputVal};
              }


              if (this.value > .5) {                  
                  // DISPLAY
                  if (controls.cells.display == 'rect') {
                          p.layer1.noStroke();
                          if (controls.state.editor.viewMode == 'valueMode') { p.layer1.fill(0, 0, 30); }
                          if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.fill(controls.rulesets[this.ruleset].hue, 230, 130); }                    
                          p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
                  } if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'stroke-horizontal') || (controls.cells.display == 'line')) { // added line as backward compatible
                          if (controls.state.editor.viewMode == 'ruleMode') { 
                            p.layer1.push();
                            p.layer1.noStroke();
                            p.layer1.fill(controls.rulesets[this.ruleset].hue, 230, hoverModifier(230));                      
                            p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
                            p.layer1.pop();
                          }
                          p.layer1.noFill();
                          p.layer1.strokeCap(p.SQUARE);
                          if (controls.state.editor.viewMode == 'valueMode') { p.layer1.stroke(0, 0, hoverModifier(30)); }
                          if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.stroke(controls.rulesets[this.ruleset].hue, 230, hoverModifier(130)); }  
                          p.layer1.line(this.x * p.layer1.w + p.layer1.padding + p.layer1.floor(p.layer1.w/2), this.y * p.layer1.h + p.layer1.padding, this.x * p.layer1.w + p.layer1.padding + p.layer1.floor(p.layer1.w/2), this.y * p.layer1.h + p.layer1.padding + p.layer1.h);
                          if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'line')) {  // if vertical line
                              if (controls.cells.strokeWeight) p.layer1.strokeWeight(controls.cells.strokeWeight);
                              else p.layer1.strokeWeight(controls.cells.width);
                              p.layer1.line(this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding, this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding + p.h);
                          } 
                          if (controls.cells.display == 'stroke-horizontal') { // if horizontal line 
                              if (controls.cells.strokeWeight) p.layer1.strokeWeight(controls.cells.strokeWeight);
                              else p.layer1.strokeWeight(controls.cells.height);
                              p.layer1.line(this.x * p.w + p.padding, this.y * p.h + p.padding + p.floor(p.h/2), this.x * p.w + p.padding + p.w, this.y * p.h + p.padding + p.floor(p.h/2));
                          }   
                  }
              }
              
              else {
                  // DISPLAY
                  if (controls.cells.display == 'rect') {
                          p.layer1.noStroke();
                          if (controls.state.editor.viewMode == 'valueMode') { p.layer1.fill(0,0, hoverModifier(360)); }
                          if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.fill(controls.rulesets[this.ruleset].hue, 180, hoverModifier(200)); }                    
                          p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
                  } if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'stroke-horizontal') || (controls.cells.display == 'line')) { // added line as backward compatible
                          if (controls.state.editor.viewMode == 'ruleMode') { 
                            p.layer1.push();
                            p.layer1.noStroke();
                            p.layer1.fill(controls.rulesets[this.ruleset].hue, 180, hoverModifier(250));                    
                            p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
                            p.layer1.pop();
                          }
                          p.layer1.noFill();
                          p.layer1.strokeCap(p.SQUARE);
                          if (controls.state.editor.viewMode == 'valueMode') { p.layer1.stroke(controls.rulesets[this.ruleset].hue, 0, hoverModifier(360)); }
                          if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.stroke(controls.rulesets[this.ruleset].hue, 180, hoverModifier(200)); }
                          if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'line')) {  // if vertical line
                            if (controls.cells.strokeWeight) p.layer1.strokeWeight(controls.cells.strokeWeight);
                            else p.layer1.strokeWeight(controls.cells.width);
                            p.layer1.line(this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding, this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding + p.h);
                          } 
                          if (controls.cells.display == 'stroke-horizontal') { // if horizontal line 
                            if (controls.cells.strokeWeight) p.layer1.strokeWeight(controls.cells.strokeWeight);
                            else p.layer1.strokeWeight(controls.cells.height);
                            p.layer1.line(this.x * p.w + p.padding, this.y * p.h + p.padding + p.floor(p.h/2), this.x * p.w + p.padding + p.w, this.y * p.h + p.padding + p.floor(p.h/2));
                          }                     
                  }              
              }



              // if (this.value > .5) {                  
              //     // DISPLAY
              //     if (controls.cells.display == 'rect') {
              //             p.layer1.noStroke();
              //             if (controls.state.editor.viewMode == 'valueMode') { p.layer1.fill(0, 0, 30); }
              //             if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.fill(controls.rulesets[this.ruleset].hue, 230, 130); }                    
              //             p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
              //     } if (controls.cells.display == 'line') {
              //             if (controls.state.editor.viewMode == 'ruleMode') { 
              //               p.layer1.push();
              //               p.layer1.noStroke();
              //               p.layer1.fill(controls.rulesets[this.ruleset].hue, 230, hoverModifier(230));                      
              //               p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
              //               p.layer1.pop();
              //             }
              //             p.layer1.noFill();
              //             if (controls.cells.strokeWeight) p.layer1.strokeWeight(controls.cells.strokeWeight);
              //             else p.layer1.strokeWeight(controls.cells.width);
              //             p.layer1.strokeCap(p.SQUARE);
              //             if (controls.state.editor.viewMode == 'valueMode') { p.layer1.stroke(0, 0, hoverModifier(30)); }
              //             if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.stroke(controls.rulesets[this.ruleset].hue, 230, hoverModifier(130)); }  
              //             p.layer1.line(this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding, this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding + p.h);

              //     }
              // }
              
              // else {
              //     // DISPLAY
              //     if (controls.cells.display == 'rect') {
              //             p.layer1.noStroke();
              //             if (controls.state.editor.viewMode == 'valueMode') { p.layer1.fill(0,0, hoverModifier(360)); }
              //             if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.fill(controls.rulesets[this.ruleset].hue, 180, hoverModifier(200)); }                    
              //             p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
              //     } if (controls.cells.display == 'line') {
              //             if (controls.state.editor.viewMode == 'ruleMode') { 
              //               p.layer1.push();
              //               p.layer1.noStroke();
              //               p.layer1.fill(controls.rulesets[this.ruleset].hue, 180, hoverModifier(250));                    
              //               p.layer1.rect(this.x * p.w + p.padding, this.y * p.h + p.padding, p.w, p.h);
              //               p.layer1.pop();
              //             }
              //             p.layer1.noFill();
              //             if (controls.cells.strokeWeight) p.layer1.strokeWeight(controls.cells.strokeWeight);
              //             else p.layer1.strokeWeight(controls.cells.width);
              //             p.layer1.strokeCap(p.SQUARE);
              //             if (controls.state.editor.viewMode == 'valueMode') { p.layer1.stroke(controls.rulesets[this.ruleset].hue, 0, hoverModifier(360)); }
              //             if (controls.state.editor.viewMode == 'ruleMode') { p.layer1.stroke(controls.rulesets[this.ruleset].hue, 180, hoverModifier(200)); }
              //             p.layer1.line(this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding, this.x * p.w + p.padding + p.floor(p.w/2), this.y * p.h + p.padding + p.h);
              //     }              
              // }
          }
        }


        p.setup = function() {
            p.frameRate(10);
            p.columns = p.floor(controls.canvas.width / p.w);
            p.rows = p.floor(controls.canvas.height / p.h);

            var c = p.createCanvas(controls.canvas.width + p.padding*2, controls.canvas.height + p.padding*2);
            // Create Main Graphics Layer
            p.layer1 = p.createGraphics(controls.canvas.width + p.padding*2, controls.canvas.height + p.padding*2);
            p.layer1.colorMode(p.HSB, 360);

            p.board = new Array(p.columns);
            for (let i = 0; i < p.columns; i++) {
              p.board[i] = new Array(p.rows);
            }

            // Going to use multiple 2D arrays and swap them
            p.next = new Array(p.columns);
            for (i = 0; i < p.columns; i++) {
              p.next[i] = new Array(p.rows);
            }

            p.init(controls.canvas.fromMemory);
        }

        p.saveCanvas = function() {
            console.log("saved: " + 'ca_'+p.month()+'-'+p.day()+'.' + controls.state.workspace.fileType)
            p.save('ca_'+p.month()+'-'+p.day()+'.' + controls.state.workspace.fileType);
        }

        p.mouseDragged = function(e){ 
            if( e.target !== p.canvas) { return }; // block non-canvas click events
            var point = { x: p.mouseX, y: p.mouseY }
            if ((point.x < p.width) && (point.y < p.height)) {
              p.drawing(false);            
            }
        }

        p.mouseClicked = function(e){ 
            if( e.target !== p.canvas) { return }; // block non-canvas click events
            var point = { x: p.mouseX, y: p.mouseY }
            if ((point.x < p.width) && (point.y < p.height)) {
              console.log(point)
              p.drawing(false);            
            }
        }


        p.draw = function() {

          if (controls.state.workspace.loop == true) { p.stepForward(); }

          if ((p.mouseX < p.width) && (p.mouseY < p.height)) {
            p.drawing(true);            
          }

        }


        p.drawing = function(hovering) {

          var currentBrushSize = controls.state.editor.currentBrushSize;

          var brushCenter = {
            x: p.mouseX,
            y: p.mouseY,
            xLookup: p.floor((p.mouseX - p.padding)/p.w),
            yLookup: p.floor((p.mouseY- p.padding)/p.h ),
          }

          var brushCells = [];
          for (let i = 1; i < currentBrushSize+1; i++) {
            for (let j = 1; j < currentBrushSize+1; j++) {

                halfBrushX = p.floor(i - currentBrushSize/2);
                halfBrushY = p.floor(j - currentBrushSize/2);
                // console.log('halfX:' + halfBrushX + ', halfY:' +  halfBrushY)
                
                if ( p.board[(brushCenter.xLookup + halfBrushX)] ) {
                  if ( p.board[(brushCenter.xLookup + halfBrushX)][(brushCenter.yLookup + halfBrushY)] ) {
                    var cellLookup = p.board[(brushCenter.xLookup + halfBrushX)][(brushCenter.yLookup + halfBrushY)];
                    brushCells.push(cellLookup);
                  }
                }
            }
          }

          if (hovering) {
            for (i in hoverMemory) { // reset previous hover targets 
              if (hoverMemory[i]) {
                  hoverMemory[i].hoverStatus = false;
                  hoverMemory[i].display();
              }
            }
            hoverMemory = brushCells; //set global hover memory to current brush cells
            for (i in brushCells) {
              if (brushCells[i]) {
                  brushCells[i].hoverStatus = true; // set hover to true and draw new hover cells
                  brushCells[i].display();
              }
            }
          }

          // console.log(brushCells);

          if (!hovering) {
            for (i in brushCells) {
              if (brushCells[i]) {
                  brushCells[i].clicked(controls.state.editor.currentFill.value);
                  brushCells[i].display();
              }
            }
          }


          p.image(p.layer1, 0,0);

          return false;    // prevent default
        }



        // Fill board randomly
        p.init = function(fromMemory) {
          if (fromMemory) {
            p.board = memory
          } else if (jsonData) {
            for (let i = 0; i < p.columns; i++) {
              for (let j = 0; j < p.rows; j++) {
                p.board[i][j] = new Cell(jsonData.board[i][j].x, jsonData.board[i][j].y, controls.rulesets[jsonData.board[i][j].ruleset], jsonData.board[i][j].value, jsonData.board[i][j].nextValue);
              }
            } 
          } else {
            for (let i = 0; i < p.columns; i++) {
              for (let j = 0; j < p.rows; j++) {

                // Lining the edges with 0s
                if (i == 0 || j == 0 || i == p.columns-1 || j == p.rows-1) {
                  p.board[i][j] = new Cell(i, j, controls.state.editor.currentRuleset, 0, 0); 
                }
                // Filling the rest randomly
                else {
                  p.board[i][j] = p.board[i][j] = new Cell(i, j, controls.state.editor.currentRuleset, p.floor(p.random(2)), 0);  //selfX, selfY, ruleset, value, nextVal
                }
              }
            }
          }
          p.stepForward(true);
        }

        p.stepForward = function(initialize) {
          
          p.layer1.clear();

          //Canvas background
          if (controls.canvas.background == true) {
            p.layer1.push();
            p.layer1.drawingContext.setLineDash([4, 6]);
            p.layer1.noFill();
            p.layer1.stroke(360);
            p.layer1.strokeWeight(1.5);
            p.layer1.rect(0, 0, p.width, p.height)
            p.layer1.pop();

            // p.layer1.push();
            // p.layer1.noFill();
            // p.layer1.stroke(250);
            // p.layer1.rect(0 + p.padding, 0 + p.padding, p.width - p.padding*2, p.height - p.padding*2)
            // p.layer1.pop();
          }

          if (!initialize){
            p.generate();
            p.swap();
          }

          for ( let i = 0; i < p.columns; i++) {
            for ( let j = 0; j < p.rows; j++) {
                p.clear();
                p.board[i][j].display();
            }
          }

          p.image(p.layer1, 0, 0);
        }

        // The process of creating the new generation
        p.generate = function() {

          // Loop through every spot in our 2D array and check neighbors
          for (let x = 0; x < p.columns ; x++) {
            for (let y = 0; y < p.rows ; y++) {


              const neighborsCoords = [];
              
              // Collect neighbors in array  (could store this permanently in cell object)
              for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // if ( x + i < 0 || x + i > cols)
                    // p.board[x+i % p.columns][y+j % p.rows].value
                    if(controls.rulesets[p.board[x][y].ruleset].wrap == false) {if (x + i <= 0  || x + i >= p.columns  || y + j <= 0 || y + j >= p.rows) break}
                    neighborCol = (x + i + p.columns) % p.columns;
                    neighborRow = (y + j + p.rows) % p.rows;
                    neighborsCoords.push({ i: i, j: j, value: p.board[neighborCol][neighborRow].value });   // USING LOOP
                }
              }

              // 3. Check [X][Y] cell's ruleset
              // 4. Call activation function

              // DIRECT ASSIGNMENT
              function directAssignment(cell, neighborhood) { 

                
                var applyRule = false;
                var thenValue = cell.value; // defaults to the cell's value unless it is changed via loop below
                if ((cell.x == 1) && (cell.y == 1)) console.log('inital cell value: ' + cell.value)

                for (r in controls.rulesets[cell.ruleset].assignments) { // for each rule assignment

                  if ((applyRule == true) || (controls.rulesets[cell.ruleset].lock == true)) {  // (applyRule == true) makes the cell resolve to the first match
                    break
                  };


                  var rotSymRuleAssignments = new Array(controls.rulesets[cell.ruleset].assignments[r].RSYM)
                  rotSymRuleAssignments[0] = JSON.parse(JSON.stringify(controls.rulesets[cell.ruleset].assignments[r])) //make "deep" copy
                  for (let rotations = 1; rotations < controls.rulesets[cell.ruleset].assignments[r].RSYM; rotations++) {
                      // if ((cell.x == 0) && (cell.y == 0)) console.log(rotations)
                      // EXAMPLE: {"if": [1, "*", "*", "*", "*", "*", "*", "*", "*"], "then": 1, "RSYM": 4},
                      rotSymRuleAssignments[rotations] = JSON.parse(JSON.stringify(rotSymRuleAssignments[rotations-1])) //make "deep" copy
                      rotSymRuleAssignments[rotations].if[0] = rotSymRuleAssignments[rotations - 1].if[2]
                      rotSymRuleAssignments[rotations].if[1] = rotSymRuleAssignments[rotations - 1].if[5]
                      rotSymRuleAssignments[rotations].if[2] = rotSymRuleAssignments[rotations - 1].if[8]
                      rotSymRuleAssignments[rotations].if[3] = rotSymRuleAssignments[rotations - 1].if[1]
                      //rotSymRuleAssignments[rotations].if[4] = rotSymRuleAssignments[rotations - 1].if[0] stays the same
                      rotSymRuleAssignments[rotations].if[5] = rotSymRuleAssignments[rotations - 1].if[7]
                      rotSymRuleAssignments[rotations].if[6] = rotSymRuleAssignments[rotations - 1].if[0]
                      rotSymRuleAssignments[rotations].if[7] = rotSymRuleAssignments[rotations - 1].if[3]
                      rotSymRuleAssignments[rotations].if[8] = rotSymRuleAssignments[rotations - 1].if[6]
                  }


                  for (symmetries in rotSymRuleAssignments) {
                    
                    if ((cell.x == 0) && (cell.y == 0)) console.log(rotSymRuleAssignments[symmetries]);

                    if (applyRule == true) break
                    
                    for (i in neighborhood) { // test the neighborhood
                      // if the neighbor has an assignment (not a wildcard) and the neighbor's value does not match the rule...
                      if ((rotSymRuleAssignments[symmetries].if[i] != '*') && (neighborhood[i].value != rotSymRuleAssignments[symmetries].if[i])) { 
                        applyRule = false; // assign false
                        thenValue = cell.value;
                        // if ((cell.x == 1) && (cell.y == 1)) console.log('Evaluating Cell: [' + cell.x +','+ cell.y +']\nRuleset evaluated ' + applyRule + "\nRuleset: " + rotSymRuleAssignments[symmetries].if + "\nSetting thenValue to : " + cell.value)
                        break; // breaks neighborhood "for" loop
                      } 
                      thenValue = controls.rulesets[cell.ruleset].assignments[r].then;
                      applyRule = true; // assign true if loop executes this far
                      // if ((cell.x == 1) && (cell.y == 1)) console.log('Evaluating Cell: [' + cell.x +','+ cell.y +']\nRuleset evaluated ' + applyRule + "\nRuleset: " + rotSymRuleAssignments[symmetries].if + "\nSetting thenValue to : " + rotSymRuleAssignments[symmetries].then)
                    } // for each cell neighbor

                  } // for each symmetry

                } // for each ruleset     
                
                if ((cell.x == 1) && (cell.y == 1)) console.log(applyRule + " | final cell value: " + thenValue +'\n' +'____________');
                return thenValue;

              }


              // //Activation
              // // function activation(c) { return 1 / (1 + p.exp(-c))}
              // function activation1(neighborhood) { 
              //   // Apply ruleset weights [COULD BE COMBINED WITH LOOP ABOVE]
              //   var neighborsWeighted = 0;
              //   for (i in neighborhood) { // apply ruleset weights
              //         neighborhood[i].weightedValue = neighborhood[i].value * p.board[x][y].ruleset.weights[i];
              //         neighborsWeighted += neighborhood[i].weightedValue;   
              //   }
              //   // console.log("neighborsWeighted: " + neighborsWeighted);
              //   // return neighborsWeighted / neighborhood.length
              //   return 1 / (1 + p.exp(-neighborsWeighted)) // sigmoid normalization equation to between [0 - 1]
              // }

              var output = directAssignment(p.board[x][y], neighborsCoords);
              // console.log("output: " + output);

              if (p.board[x][y].ruleset.lock) {
                p.board[x][y].nextValue = p.board[x][y].value; // assign output 
              } else {
                p.board[x][y].nextValue = output; // assign output 
              }
                                                        
            }
          }
        }

        p.swap = function() {
          for ( let i = 0; i < p.columns; i++) {
            for ( let j = 0; j < p.rows; j++) {
              p.board[i][j].value = p.board[i][j].nextValue;
            }
          }
        }

}

var myp5 = new p5(sketch, workspace);



// Create Temporary SVG Canvas
var createCanvas = function() {

    var tempWorkspace = document.querySelector('#temp-workspace');

    var tempSketch = function(temp) {

      temp.padding = controls.canvas.padding;
      temp.w = controls.cells.width; // Cell width
      temp.h = controls.cells.height; // Cell width
      temp.columns;
      temp.rows;
      temp.board;
      temp.cell;

      // console.log(temp.ruleset);

      // Cell class
      class tempCell {
        constructor(xPos, yPos, rulesetObject, value, nextValue) {
          this.x = xPos;
          this.y = yPos;
          this.ruleset = rulesetObject;
          this.value = value;
          this.nextValue = nextValue;

        }

        tempDisplay() {

              if (this.value > .5) {                  
                  // DISPLAY
                  if (controls.cells.display == 'rect') {
                          temp.noStroke();
                          if (controls.state.editor.viewMode == 'valueMode') { temp.fill(0, 0, 30); }
                          if (controls.state.editor.viewMode == 'ruleMode') { temp.fill(controls.rulesets[this.ruleset].hue, 230, 130); }                    
                          temp.rect(this.x * temp.w + temp.padding, this.y * temp.h + temp.padding, temp.w, temp.h);
                  } if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'stroke-horizontal') || (controls.cells.display == 'line')) { // added line as backward compatible
                          if (controls.state.editor.viewMode == 'ruleMode') { 
                            temp.push();
                            temp.noStroke();
                            temp.fill(controls.rulesets[this.ruleset].hue, 230, 230);                      
                            temp.rect(this.x * temp.w + temp.padding, this.y * temp.h + temp.padding, temp.w, temp.h);
                            temp.pop();
                          }
                          temp.noFill();
                          temp.strokeCap(temp.SQUARE);
                          if (controls.state.editor.viewMode == 'valueMode') { temp.stroke(0, 0, 30); }
                          if (controls.state.editor.viewMode == 'ruleMode') { temp.stroke(controls.rulesets[this.ruleset].hue, 230, 130); }  
                          if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'line')) {  // if vertical line
                            if (controls.cells.strokeWeight) temp.strokeWeight(controls.cells.strokeWeight);
                            else temp.strokeWeight(controls.cells.width);
                            temp.line(this.x * temp.w + temp.padding + temp.floor(temp.w/2), this.y * temp.h + temp.padding, this.x * temp.w + temp.padding + temp.floor(temp.w/2), this.y * temp.h + temp.padding + temp.h);
                          } 
                          if (controls.cells.display == 'stroke-horizontal') { // if horizontal line 
                            if (controls.cells.strokeWeight) temp.strokeWeight(controls.cells.strokeWeight);
                            else temp.strokeWeight(controls.cells.height);
                            temp.line(this.x * temp.w + temp.padding, this.y * temp.h + temp.padding + temp.floor(temp.h/2), this.x * temp.w + temp.padding + temp.w, this.y * temp.h + temp.padding + temp.floor(temp.h/2));
                          }
                  }
              }
              
              else {
                  // DISPLAY
                  if (controls.cells.display == 'rect') {
                          temp.noStroke();
                          if (controls.state.editor.viewMode == 'valueMode') { temp.fill(0,0, 360); }
                          if (controls.state.editor.viewMode == 'ruleMode') { temp.fill(controls.rulesets[this.ruleset].hue, 180, 200); }                    
                          temp.rect(this.x * temp.w + temp.padding, this.y * temp.h + temp.padding, temp.w, temp.h);
                  } if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'stroke-horizontal') || (controls.cells.display == 'line')) { // added line as backward compatible
                          if (controls.state.editor.viewMode == 'ruleMode') { 
                            temp.push();
                            temp.noStroke();
                            temp.fill(controls.rulesets[this.ruleset].hue, 180, 250);                    
                            temp.rect(this.x * temp.w + temp.padding, this.y * temp.h + temp.padding, temp.w, temp.h);
                            temp.pop();
                          }
                          temp.noFill();
                          temp.strokeCap(temp.SQUARE);
                          if (controls.state.editor.viewMode == 'valueMode') { temp.stroke(controls.rulesets[this.ruleset].hue,0, 360); }
                          if (controls.state.editor.viewMode == 'ruleMode') { temp.stroke(controls.rulesets[this.ruleset].hue, 180, 200); }
                          if ((controls.cells.display == 'stroke-vertical') || (controls.cells.display == 'line')) {  // if vertical line
                            if (controls.cells.strokeWeight) temp.strokeWeight(controls.cells.strokeWeight);
                            else temp.strokeWeight(controls.cells.width);
                            temp.line(this.x * temp.w + temp.padding + temp.floor(temp.w/2), this.y * temp.h + temp.padding, this.x * temp.w + temp.padding + temp.floor(temp.w/2), this.y * temp.h + temp.padding + temp.h);
                          } 
                          if (controls.cells.display == 'stroke-horizontal') { // if horizontal line 
                            if (controls.cells.strokeWeight) temp.strokeWeight(controls.cells.strokeWeight);
                            else temp.strokeWeight(controls.cells.height);
                            temp.line(this.x * temp.w + temp.padding, this.y * temp.h + temp.padding + temp.floor(temp.h/2), this.x * temp.w + temp.padding + temp.w, this.y * temp.h + temp.padding + temp.floor(temp.h/2));
                          }                  
                  }              
              }
          }

      }


      temp.setup = function() {
        temp.columns = temp.floor(controls.canvas.width / temp.w);
        temp.rows = temp.floor(controls.canvas.height / temp.h);

        var c = temp.createCanvas(controls.canvas.width + temp.padding*2, controls.canvas.height + temp.padding*2, temp.SVG);
        // temp.background(100,100,100)
        temp.colorMode(temp.HSB, 360);


        temp.board = new Array(temp.columns);
        for (let i = 0; i < temp.columns; i++) {
          temp.board[i] = new Array(temp.rows);
        }

        for (let i = 0; i < temp.columns; i++) {
          for (let j = 0; j < temp.rows; j++) {
              // console.log(memory[i][j].ruleset)
              temp.board[i][j] = temp.board[i][j] = new tempCell(memory[i][j].x, memory[i][j].y, memory[i][j].ruleset, memory[i][j].value, 0);  //selfX, selfY, ruleset, value, nextVal
              if (temp.board[i][j]) temp.board[i][j].tempDisplay();
          }
        }


        // SAVE FUNCTION
        console.log("saved: " + 'ca_'+temp.month()+'-'+temp.day()+'.svg')
        temp.save('ca_'+temp.month()+'-'+temp.day()+'.svg');

        temp.remove();
        tempWorkspace.innerHTML = '';
      }


    }
    var tempP5 = new p5(tempSketch, tempWorkspace)
}   







