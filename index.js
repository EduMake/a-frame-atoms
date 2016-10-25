var fs = require("fs");
var Handlebars = require("handlebars");

const HTMLDecoderEncoder = require("html-encoder-decoder");

var aShellMaxes = [2,8,8,18] ;
var aAngles = [0, 180, 90,  270, 45, 215, 135, 315];

var aElectonPoses = [];
var i = 0 ;
var iInnerOrbit = 5000;


for(var j = 0; j<aShellMaxes.length; j++){
  for(var k = 0; k<aShellMaxes[j]; k++){
    aElectonPoses.push({
      shell:j+1,
      angle:aAngles[i%aAngles.length],
      angle2:i*20,
      angle3:i*15,
      dist: j+1,
      dur : iInnerOrbit,
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

var aNucleusPositions = {1:  [{lat:0, lon:0, radius:0}]};
  
function getBallCount(Radius){
  var MinAngleBetweenBalls = 2 * Math.atan(1/Radius);
  var MaxBallsAroundLine = Math.floor( 2 * Math.PI / MinAngleBetweenBalls);
  return MaxBallsAroundLine;
}  

function getAngleFromBalls(MaxBallsAroundLine){
  var Angle = 2 * Math.PI / MaxBallsAroundLine;
  return Angle;
}  
  
function getAnglesAtRadius(Radius){
  var MaxBallsAroundLine = getBallCount(Radius);
  var Angle = getAngleFromBalls(MaxBallsAroundLine);
  var Angles = [];
  for (var i = 0 ; i < MaxBallsAroundLine; i++){
    Angles.push(i * Angle);
  }
  return Angles;
}

function getNucleonPositions(Balls){
  //https://en.wikipedia.org/wiki/Packing_problems#Spheres_into_a_Euclidean_ball
  //var SmallestContainerRadius = 1 + Math.sqrt(2*(1-(1/Balls))); // Dosent seem to work
  var SmallestContainerRadius = (Math.pow(Math.ceil(Balls/(Math.PI * (4/3))), 1/3));
  
  //V = ⁴⁄₃πr³.
  
  //var SmallestContainerRadius = Math.floor(Math.sqrt(Balls));
  //var OuterBallRadius = (SmallestContainerRadius - 1);
  var OuterBallRadius = SmallestContainerRadius;
  var RadialPositions = [];
  var RemainingBalls = Balls;
  for(var r = 0; r <= Math.floor(SmallestContainerRadius/2) ; r++){
    if(RemainingBalls > 0){
      RemainingBalls -= getNucleonLayer(RemainingBalls, OuterBallRadius - (r), RadialPositions);
    }
  }
  return RadialPositions;
}

function getNucleonLayer(Balls, OuterBallRadius, RadialPositions){
  
  var MaxBallsAroundEquator = getBallCount(OuterBallRadius);
  var Angle = getAngleFromBalls(MaxBallsAroundEquator);
  
  console.log("Balls", Balls, "OuterBallRadius", OuterBallRadius,
   "Equator", MaxBallsAroundEquator, "Angle", Angle, "Degrees", Angle * 180 / Math.PI);
  
  
  var UpwardsLayers = Math.floor(0.5 + (MaxBallsAroundEquator/4));
  console.log("UpwardsLayers", UpwardsLayers);
  for(var q = 0; q <= UpwardsLayers ; q++){
    var UpAngle = q * Angle;
    var RadiusAtHeight = OuterBallRadius * Math.cos(UpAngle);
    var Angles = getAnglesAtRadius(RadiusAtHeight);
    //console.log("q,", q, "UpAngle", UpAngle * 180 / Math.PI, "RadiusAtHeight", RadiusAtHeight);//, "Angles", Angles);
    for (var w = 0; w < Angles.length; w++){
      RadialPositions.push({lat:UpAngle * 180 / Math.PI, lon:Angles[w] * 180 / Math.PI, radius:OuterBallRadius});
      if(q > 0){
        RadialPositions.push({lat:-1 * UpAngle * 180 / Math.PI, lon:Angles[w] * 180 / Math.PI, radius:OuterBallRadius});
      }
    }
  }
  
  return RadialPositions.length;
  //return RadialPositions;
}


//console.log(oElements);
for (var sName in oElements){
  var oElement = oElements[sName];
  oElement.number = parseInt(oElement.number, 10);

  if(oElement.number < 37){ // Less than Potassium
    oElement.name = sName;
    oElement.filename = "dist/"+sName+".html";
    oElement.nucleons = Math.round(oElement.atomic_mass);
    oElement.protons = oElement.number;
    oElement.neutrons =  oElement.nucleons - oElement.number;
    oElement.electrons = [];
    oElement.nucleus = [];
    oElement.summary =  HTMLDecoderEncoder.encode(oElement.summary);
    

    //Periodic Table Layout    
    oElement.x = oElement.xpos * 5;
    oElement.y = (oElement.ypos * -5);
    
    /*if(aNucleusPositions.length == oElement.nucleons){
      console.log("Creating Nucleon",aNucleusPositions.length == oElement.nucleons,aNucleusPositions.length, oElement.nucleons);
      aNucleusPositions.push(getNucleonPositions(oElement.nucleons));
    }*/
    
    var fProtonRadius = 0.2;
    var aPositions = getNucleonPositions(oElement.nucleons).map(function(pos){
        pos.radius = pos.radius*fProtonRadius;
        pos.fProtonRadius = fProtonRadius;
        return pos;
      });
    for (var i =0; i< Math.min(oElement.nucleons, aPositions.length); i++){
      var oNew = aPositions[i];
      oNew.type = (i%2 == 0)?"proton":"neutron";
      oElement.nucleus.unshift(oNew);
    }
    //console.log(oElement.name, oElement.nucleus.slice(0,-5));
      
      
    
    //electrons
    for(i = 0; i<oElement.number; i++){
      oElement.electrons.push(aElectonPoses[i]);
    }
    
    var html = template(oElement);  
    fs.writeFileSync(oElement.filename, html, "utf8");
    console.log("Written", oElement.filename);
    aAtoms.push(oElement);
  }
}

var indexSource = fs.readFileSync("templates/index.hbs", "utf8");
var indexTemplate = Handlebars.compile(indexSource);

var TableSource = fs.readFileSync("templates/table.hbs", "utf8");
var TableTemplate = Handlebars.compile(TableSource);
console.log(aAtoms.length);

var sFilename = "dist/table.html";
var html = TableTemplate({atoms:aAtoms});  
fs.writeFileSync(sFilename, html, "utf8");
console.log("Written", sFilename);

var sFilename = "dist/index.html";
var html = indexTemplate({atoms:aAtoms});  
fs.writeFileSync(sFilename, html, "utf8");
console.log("Written", sFilename);
