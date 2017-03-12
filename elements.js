var fs = require("fs");

const HTMLDecoderEncoder = require("html-encoder-decoder");

var Elements = function () {
  
  this.aShellMaxes = [2,8,8,18] ;
  this.aAngles = [0, 180, 90,  270, 45, 215, 135, 315];

  this.aElectonPoses = [];
  var i = 0 ;
  this.iInnerOrbit = 5000;


  for(var j = 0; j<this.aShellMaxes.length; j++){
    for(var k = 0; k<this.aShellMaxes[j]; k++){
      this.aElectonPoses.push({
        shell:  j+1,
        angle:  this.aAngles[i%this.aAngles.length],
        angle2: i * 20,
        angle3: i*15,
        dist:   j+1,
        dur:    this.iInnerOrbit,
        anti:   i%2 == 0
      });
      i++;
    }
  }
  
  this.aAtoms = [];
  
  var sPT = fs.readFileSync("Periodic-Table-JSON/PeriodicTableJSON.json", "utf8");
  this.oElements = JSON.parse(sPT);
  for (var sName in this.oElements){
    this.oElements[sName].name = sName;
  }
  
  this.aNucleusPositions = {1:  [{lat:0, lon:0, radius:0}]};
  
  this.getBallCount = function getBallCount(Radius){
    var MinAngleBetweenBalls = 2 * Math.atan(1/Radius);
    var MaxBallsAroundLine = Math.floor( 2 * Math.PI / MinAngleBetweenBalls);
    return MaxBallsAroundLine;
  };
  
  this.getAngleFromBalls = function getAngleFromBalls(MaxBallsAroundLine){
    var Angle = 2 * Math.PI / MaxBallsAroundLine;
    return Angle;
  } ;
    
  this.getAnglesAtRadius = function getAnglesAtRadius(Radius){
    var MaxBallsAroundLine = this.getBallCount(Radius);
    var Angle = this.getAngleFromBalls(MaxBallsAroundLine);
    var Angles = [];
    for (var i = 0 ; i < MaxBallsAroundLine; i++){
      Angles.push(i * Angle);
    }
    return Angles;
  };
  
  this.getNucleonPositions = function getNucleonPositions(Balls){
    var SmallestContainerRadius = (Math.pow(Math.ceil(Balls/(Math.PI * (4/3))), 1/3));
    var OuterBallRadius = SmallestContainerRadius;
    var RadialPositions = [];
    var RemainingBalls = Balls;
    for(var r = 0; r <= Math.floor(SmallestContainerRadius/2) ; r++){
      if(RemainingBalls > 0){
        RemainingBalls -= this.getNucleonLayer(RemainingBalls, OuterBallRadius - (r), RadialPositions);
      }
    }
    return RadialPositions;
  };
  
  this.getNucleonLayer = function getNucleonLayer(Balls, OuterBallRadius, RadialPositions){
    
    var MaxBallsAroundEquator = this.getBallCount(OuterBallRadius);
    var Angle = this.getAngleFromBalls(MaxBallsAroundEquator);
    
    var UpwardsLayers = Math.floor(0.5 + (MaxBallsAroundEquator/4));
    for(var q = 0; q <= UpwardsLayers ; q++){
      var UpAngle = q * Angle;
      var RadiusAtHeight = OuterBallRadius * Math.cos(UpAngle);
      var Angles = this.getAnglesAtRadius(RadiusAtHeight);
      for (var w = 0; w < Angles.length; w++){
        RadialPositions.push({lat:UpAngle * 180 / Math.PI, lon:Angles[w] * 180 / Math.PI, radius:OuterBallRadius});
        if(q > 0){
          RadialPositions.push({lat:-1 * UpAngle * 180 / Math.PI, lon:Angles[w] * 180 / Math.PI, radius:OuterBallRadius});
        }
      }
    }
    
    return RadialPositions.length;
  };
  
  this.calcAllPositions = function (){
    for (var sName in this.oElements){
      this.calcPositions(sName);
    }
  };
  
  this.getAll = function (){
    var aPositions = [];
    for (var sName in this.oElements){
      if(this.oElements[sName].hasOwnProperty("nucleons")){
        aPositions.push(this.oElements[sName]);
      }
    }
    return aPositions;
  };
  
  this.getAllPositions = function (){
    var aPositions = [];
    for (var sName in this.oElements){
      this.calcPositions(sName);
      if(this.oElements[sName].hasOwnProperty("nucleons")){
        aPositions.push(this.getPositions(sName));
      }
    }
    return aPositions;
  };
  
  this.getPositions = function(sName){
    sName = this.getElementName(sName);
    var oElement = this.oElements[sName];
    if(!oElement.hasOwnProperty("nucleons")){
      this.calcPositions(sName);
    }
    return oElement;
  };
  
  this.getElementName = function(sName){
    sName =  sName[0].toUpperCase() + sName.substring(1);
    return sName;
  };
  
  this.getByNumber = function(iNum){
    for (var sName in this.oElements){
      var oElement = this.oElements[sName];
      oElement.number = parseInt(oElement.number, 10);
      if(oElement.number == iNum){
        if(!oElement.hasOwnProperty("nucleons")){
          this.calcPositions(sName);
        }
        return oElement;
      }
    }
  };
  
  this.calcPositions = function(sName){
    sName = this.getElementName(sName);
    var oElement = this.oElements[this.getElementName(sName)];
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
      var aPositions = this.getNucleonPositions(oElement.nucleons).map(function(pos){
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
        oElement.electrons.push(this.aElectonPoses[i]);
      }
    }
  };
};

module.exports = exports = Elements;
