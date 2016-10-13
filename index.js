function GetGCSEStructure(Atomic, Mass) 

Var Structure = {protons: Atomic, 

neutrons: Mass- Atomic, 

electrons: Atomic, 

shells:[] 

}  

Var Levels = [2,8,8,8] 

 

Var Remaining = Structure.electrons; 

Levels.forEach{function(Max, Shell){ 

Structure.shells[Shell] = Math.min(Remaining, Max) 

Remaining -= Structure.shells[Shell]; 

} 

Return Structure ;  

} 
