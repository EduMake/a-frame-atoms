var fs = require("fs");
var Handlebars = require("handlebars");

var aShellMaxes = [2,8,8,8] ;
var aAngles = [0, 180, 90,  270, 45, 215, 135, 315];

var aElectonPoses = [];
var i = 0 ;
var iInnerOrbit = 3000;


for(var j = 0; j<aShellMaxes.length; j++){
  for(var k = 0; k<aShellMaxes[j]; k++){
    aElectonPoses.push({
      shell:j+1,
      angle:aAngles[i%aAngles.length],
      dist: j+1,
      dur : (j+1)*iInnerOrbit
    });
    i++;
  }
}

var source = fs.readFileSync("templates/atom.hbs", "utf8");
var template = Handlebars.compile(source);


var sPT = fs.readFileSync("Periodic-Table-JSON/PeriodicTableJSON.json", "utf8");
var oElements = JSON.parse(sPT);

//console.log(oElements);
for (sName in oElements){
  var oElement = oElements[sName];
  oElement.number = parseInt(oElement.number, 10);

  if(oElement.number < 19){ // Less than Potassium
    oElement.name = sName;
    oElement.filename = "dist/"+sName+".html";
    
    oElement.protons = oElement.number;
    oElement.neutrons = Math.round(oElement.atomic_mass) - oElement.number;
    oElement.electrons = [];
    for(i = 0; i<oElement.number; i++){
      oElement.electrons.push(aElectonPoses[i]);
    }
    
    var html = template(oElement);  
    fs.writeFileSync(oElement.filename, html, "utf8");
  }
}
