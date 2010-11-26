
        /*
        
        * ukládání do JSON
        * opravit přepínače
        * opravit vytváření kabelů
        * opravit výchozí stavy bloků
        * typ tlačítka press-push
        * rename wireID na id
        * rename blockID na id
        * 						
        * po odstraneni vodice nalezt na ktere strane je pin OUT a podle toho 
        * deaktivovat jen druhou stranu vetve																						        
				        

        */
        

        var temp;

                     
(function(window, undefined){
 
	var logic = 
	{
  
        readTranslate : function(obj)
        {
        	var transform = obj.getAttribute("transform");
        	var px = parseInt(transform.split("(")[1]);
        	var py = parseInt(transform.split(",")[1]);
        	if(!py)
        		py = 0;
        	return {x: px, y: py};
        },
        
        getJSON : function()
        {
          out = new Object();
          
          out.block = new Array();
          
          for(var i = 0; i &lt; logic.block.length; i++)
          	out.block.push({
          	name: logic.block[i].name,
          	pos: logic.readTranslate(logic.block[i])
						});
          	
          alert(JSON.stringify(out));
        },
        
        clear : function()
        {
        	   logic.block[0].remove();
        },
        
        init : function(elm)
        {
        	logic.pinNo = 0;
					logic.wire = new Array();
					logic.block = new Array(); 
        
          logic.mySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					logic.mySvg.setAttribute("version", "1.2");
					logic.mySvg.setAttribute("baseProfile", "tiny");
					elm.appendChild(logic.mySvg);
					return logic.mySvg;
        },
        
        addWire : function(fromBlock, fromPin, toBlock, toPin)
        {
					var newWire = logic.wireConstructor(fromBlock, fromPin, toBlock, toPin)
					newWire.setValue( fromBlock.pin[fromPin].pinValue || toBlock.pin[toPin].pinValue);
					logic.mySvg.appendChild(newWire);
          logic.wire.push(newWire);
        },
        
        wireConstructor : function(fromBlock, fromPin, toBlock, toPin)
        {
					var wireID = logic.wire.length;
        
					var newWire = document.createElementNS("http://www.w3.org/2000/svg", "line");
					from = fromBlock.getPinPos(fromPin);
					to = toBlock.getPinPos(toPin);
					newWire.setAttribute("x1", from.x);
					newWire.setAttribute("y1", from.y);
					newWire.setAttribute("x2", to.x);
					newWire.setAttribute("y2", to.y);
					newWire.setAttribute("class", "wire");
					newWire.wireValue = false;
					newWire.wireID = wireID;
					
					
					newWire.ondblclick = function()
					{
						this.remove();
					}
					
					newWire.remove = function()
					{
					    for(var i = 0; i &lt; logic.wire.length; i++)
								if(logic.wire[i].wireID == this.wireID)
								{
									this.setValue(false);
									Dom.remove(this);
									logic.wire.remove(i);	
								}	
					}
					
					newWire.findSignalSource = function(wire)
					{
							
					}
					
					newWire.setValue = function(val)
					{
						// exit if the value is already set, avoid infinite loops
						if(val == newWire.wireValue)
							return;
							
						newWire.wireValue = val;
						
						if(val==true) {
							newWire.setAttribute("style","stroke:red");
						} else {
							newWire.setAttribute("style","stroke:black");
						}
						
						if(fromBlock.pin[fromPin].pinDir == "in")
							fromBlock.pin[fromPin].setValue(val);
						if(toBlock.pin[toPin].pinDir == "in")
							toBlock.pin[toPin].setValue(val);		

					}
					
					newWire.fromBlock = fromBlock;
					newWire.fromPin = fromPin;
					newWire.toBlock = toBlock;
					newWire.toPin = toPin;
					
					return newWire;
        },
        
        addBlock : function()
        {
        	var newBlock = logic.getAnd();
        	newBlock.inputUpdate = function() { this.setPin("Q", !(this.getPin("A") &amp; this.getPin("B"))); }
        	logic.mySvg.appendChild(newBlock);
        	logic.block.push(newBlock);
        },
        
        getAnd : function()
        {
         	return logic.svgBlock("nand", [["A", "B"], ["Q"]]);
        },
        
        getButton : function()
        {
         	newBlock = logic.svgBlock("BTN", [[], ["Q"]]);
         	newBlock.actState = false;
         	newBlock.ondblclick = function() {this.actState = !this.actState; this.setPin("Q", this.actState);}
         	logic.mySvg.appendChild(newBlock);
        	logic.block.push(newBlock);
        	return newBlock;
        },
        
        getD : function()
        {
         	newBlock = logic.svgBlock("D", [["A"], ["Q"]]);
         	newBlock.inputUpdate = function(pinName, oldVal) {if(this.getPin("A") &amp;&amp; pinName == "A" &amp;&amp; oldVal == false) this.setPin("Q", !this.getPin("Q"));}
         	logic.mySvg.appendChild(newBlock);
        	logic.block.push(newBlock);
        	return newBlock;
        },
        
        svgBlock : function(name, io)
        {
        
        	var blockID = logic.block.length;
          var pinNo = 0;
          var pinPos = new Array();
          
          var pinSpacing = 20;
          var pin = new Array();
          
          var borderBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
					borderBox.setAttribute("x", "0");
					borderBox.setAttribute("y", "0");
					borderBox.setAttribute("width", "30");
					borderBox.setAttribute("height", "60");
					
					var txtName = document.createElementNS("http://www.w3.org/2000/svg", "text");
					txtName.setAttribute("x", "5");
					txtName.setAttribute("y", "20");
					var data = document.createTextNode(name);
					txtName.appendChild(data);
					
					var boxGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
					boxGroup.appendChild(borderBox);
					boxGroup.appendChild(txtName);
					boxGroup.setAttribute("class", "logicBox");
					
					var logicGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
					logicGroup.setAttribute("transform", "translate(100,"+(blockID*90+50)+")");
					logicGroup.setAttribute("class", "logicBlock");
          
          for(var j = 0; j &lt; 2; j++)
				  for(var i = 0; i &lt; io[j].length; i++)
				  {
						var output = document.createElementNS("http://www.w3.org/2000/svg", "line");
						output.setAttribute("x1", "0");
						output.setAttribute("y1", "0");
						output.setAttribute("x2", "20");
						output.setAttribute("y2", "0");
						// is the pin input?
						if(j==0)
						{
							output.setAttribute("transform", "translate("+(-20)+","+(10+i*pinSpacing)+")");
							output.pinType = "din";
							output.pinDir = "in";
						}
						else
						{
							output.pinType = "dout";
							output.pinDir = "out";
							output.setAttribute("transform", "translate("+30+","+(10+i*pinSpacing)+")");
						}
							
						output.setAttribute("class", "pin");
						output.pinNo = pinNo;
						output.pinName = io[j][i];
						output.pinValue = false;
						output.parentBlock = logicGroup;
						
						// set value to pin
						output.setValue = function(val)
						{
							// avoid infinite loops
							if(this.pinValue == val)
								return;
								
							this.setAttribute("style", "stroke:" + ((val) ? "red;" : "black;"));
							var oldVal = this.pinValue;
							this.pinValue = val;
							if(this.pinType == "din")
								this.parentBlock.inputUpdate(this.pinName, oldVal);
								
							// Now go throught the wires
							// Now go through all wires connected to pin
							for(var i = 0; i &lt; logic.wire.length; i++)
								if((logic.wire[i].fromBlock.blockID == blockID &amp;&amp; logic.wire[i].fromPin == this.pinNo) ||
								 (logic.wire[i].toBlock.blockID == blockID &amp;&amp;  logic.wire[i].toPin == this.pinNo))
									logic.wire[i].setValue(val);
						}
						pin.push(output);
						
						
		        var lineTerm = document.createElementNS("http://www.w3.org/2000/svg", "rect");
						lineTerm.setAttribute("x", "-10");
						lineTerm.setAttribute("y", "-5");
						lineTerm.setAttribute("width", "10");
						lineTerm.setAttribute("height", "10");
						lineTerm.setAttribute("class", "lineTerm");
						if(j==0)
						{
							lineTerm.setAttribute("transform", "translate("+(-10)+","+(10+i*pinSpacing)+")");
							pinPos.push({x:-20, y: 10+i*pinSpacing});
						}
						else
						{
							lineTerm.setAttribute("transform", "translate("+50+","+(10+i*pinSpacing)+")");
							pinPos.push({x:50, y: 10+i*pinSpacing});
						}
						lineTerm.setAttribute("pinNo", pinNo);
						lineTerm.setAttribute("pinType", "output");
						lineTerm.setAttribute("blockID", blockID);
						
						lineTerm.onmousedown = function(evt)
						{
						 	var that = this;
							actPos = logic.readTranslate(that);
							clickX = evt.clientX;
							clickY = evt.clientY;
		
							var pinNoFrom = that.getAttribute("pinNo");
							var blockFrom = that.getAttribute("blockID");
							
							var tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
							tempLine.setAttribute("x1", clickX);
						  tempLine.setAttribute("y1", clickY);
						  tempLine.setAttribute("x2", clickX);
						  tempLine.setAttribute("y2", clickY);
						  tempLine.setAttribute("stroke", "5");
	
							logic.mySvg.appendChild(tempLine);
							
							document.onmouseup = function(evt)
							{
								document.onmousemove=null;
								document.onmouseup=null;
								Dom.remove(tempLine);
								var pinNoTo = evt.target.getAttribute("pinNo");
								var blockTo = evt.target.getAttribute("blockID");
								if(blockTo)
									logic.addWire(logic.block[blockFrom],pinNoFrom,logic.block[blockTo],pinNoTo);
							};
							document.onmousemove = function(evt)
							{	
								tempLine.setAttribute("x2", evt.clientX);
						  	tempLine.setAttribute("y2", evt.clientY);
							};
							return false;	
							 					
						}
						logicGroup.appendChild(output);
						logicGroup.appendChild(lineTerm);
						pinNo++;
					}
					
					logicGroup.appendChild(boxGroup);

					boxGroup.onmousedown = function(evt)
					{
						var that = this.parentNode;
						actPos = logic.readTranslate(that);
						clickX = evt.clientX;
						clickY = evt.clientY;
						document.onmouseup = function(evt) {document.onmousemove=null; document.onmouseup=null};
						document.onmousemove = function(evt)
						{	
							that.setAttribute("transform", "translate("+(actPos.x + evt.clientX-clickX)+","+(actPos.y + evt.clientY-clickY)+")");
							for(var i = 0; i &lt; logic.wire.length; i++)
							{
								var w = logic.wire[i];
							 	if(blockID == w.fromBlock.blockID)
							 	{
							 		var p = that.getPinPos(w.fromPin);
							 		w.setAttribute("x1", p.x);
							 		w.setAttribute("y1", p.y);
							 	}
								if(blockID == w.toBlock.blockID)
							 	{
							 	  var p = that.getPinPos(w.toPin);
							 		w.setAttribute("x2", p.x);
							 		w.setAttribute("y2", p.y);
							 	}
							}
						};
						return false;	
					}

					logicGroup.inputUpdate = function(pinName, oldVal)
					{
					    // Logic function
					};
					
					logicGroup.remove = function()
					{
					 	for(var i = 0; i &lt; logic.wire.length; i++)
					 	{
					 		if( logic.wire[i].fromBlock == this.blockID || logic.wire[i].toBlock == this.blockID )
					 			logic.wire[i].remove();
					 	}
					 	
					}
					
					logicGroup.getPinPos = function(pinNo)
					{                     
						var tr = logic.readTranslate(this);
						return {x:pinPos[pinNo].x + tr.x, y:pinPos[pinNo].y + tr.y};
					};
					
					// Set pin value by pin ID
					logicGroup.setPinById = function(id, val)
					{	
						pin[id].setValue(val);
					}
					
					// Set pin value by it's pin name                 
					logicGroup.setPin = function(pinName, val)
					{
						for(var i = 0; i &lt; pin.length; i++)
							if(pin[i].pinName == pinName)
									logicGroup.setPinById(i, val);
					}
					
					
					logicGroup.getPin = function(pinName)
					{
					  for(var i = 0; i &lt; pin.length; i++)
							if(pin[i].pinName == pinName)
									return pin[i].pinValue;
					}
					
					
					logicGroup.remove = function()
					{
					  logic.block.remove(blockID);
					  Dom.remove(logicGroup);
					}
					
					logicGroup.blockID = blockID;
					logicGroup.name = name;
					logicGroup.pin = pin;
					
					return logicGroup;
        }
	
	
	
	}

	window.logic = logic;
 
})(this);	                      
                     

window.onload = function() {

var container = Dom.get("svgContainer");
                 
mySvg = logic.init(container);

logic.getButton();
logic.getD();
logic.addBlock();
logic.addBlock();
//logic.addBlock();

logic.getButton();


            }        
