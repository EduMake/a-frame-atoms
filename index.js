var fs = require("fs");
var Handlebars = require("handlebars");

var aShellMaxes = [2,8,8,18] ;
var aAngles = [0, 180, 90,  270, 45, 215, 135, 315];

var aElectonPoses = [];
var i = 0 ;
var iInnerOrbit = 3000;


for(var j = 0; j<aShellMaxes.length; j++){
  for(var k = 0; k<aShellMaxes[j]; k++){
    aElectonPoses.push({
      shell:j+1,
      angle:aAngles[i%aAngles.length],
      angle2:i*20,
      angle3:i*15,
      dist: j+1,
      dur : (j+1)*iInnerOrbit,
      anti : i%2 == 0
    });
    i++;
  }
}

var source = fs.readFileSync("templates/atom.hbs", "utf8");
var template = Handlebars.compile(source);

var sPT = fs.readFileSync("Periodic-Table-JSON/PeriodicTableJSON.json", "utf8");
var oElements = JSON.parse(sPT);

var aAtoms = [];

//console.log(oElements);
for (var sName in oElements){
  var oElement = oElements[sName];
  oElement.number = parseInt(oElement.number, 10);

  if(oElement.number < 37){ // Less than Potassium
    oElement.name = sName;
    oElement.filename = "dist/"+sName+".html";
    
    oElement.protons = oElement.number;
    oElement.neutrons = Math.round(oElement.atomic_mass) - oElement.number;
    oElement.electrons = [];
    
    oElement.x = oElement.xpos * 5;
    oElement.y = (oElement.ypos * -5);
    for(i = 0; i<oElement.number; i++){
      oElement.electrons.push(aElectonPoses[i]);
    }
    
    var html = template(oElement);  
    fs.writeFileSync(oElement.filename, html, "utf8");
    console.log("Written", oElement.filename);
    aAtoms.push(oElement);
  }
}


var TableSource = fs.readFileSync("templates/table.hbs", "utf8");
var TableTemplate = Handlebars.compile(TableSource);
console.log(aAtoms.length);

var sFilename = "dist/table.html";
var html = TableTemplate({atoms:aAtoms});  
fs.writeFileSync(sFilename, html, "utf8");
console.log("Written", sFilename);
