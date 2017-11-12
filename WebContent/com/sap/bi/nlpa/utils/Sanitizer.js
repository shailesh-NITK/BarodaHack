var Sanitizer = {};

Sanitizer.sanitizeName = function(name){
	if(name.indexOf("_")<0 && name.indexOf("-")<0){
		return name;
	}
	var newName = name;
	newName = newName.split("_").join(" ");
	newName = newName.split("-").join(" ");
	return newName;
};

Sanitizer.getDescription = function(type){
	var desc = "";
	switch(type){
		case "DIMENSION":
			desc = "(D)";
			break;
		case "MEASURE":
			desc = "(M)";
			break;
		case "DIMENSION_VALUE":
			desc = "(V)";
			break;
		
	}
	desc = "";
	return desc;
};
Sanitizer.getPascalCase = function(str){
	var pascalCaseStr =  str.charAt(0).toUpperCase() + str.slice(1,str.length);
	return pascalCaseStr;
};