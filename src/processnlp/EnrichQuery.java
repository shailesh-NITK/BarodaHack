package processnlp;

import java.util.HashMap;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class EnrichQuery {
	String attribute;
	String type;
	String rawInput;
	String parsableInput;
	boolean matched;
	String makeEnrichQuery(JSONArray ar, HashMap<String, String> metadata){
		JSONArray result = new JSONArray();
		for(int i=0;i<ar.size();i++){
			JSONObject obj = (JSONObject) ar.get(i);
			attribute = (String) obj.get("attribute");
			if(metadata.get(attribute)!=null){
				matched = true;
			}else{
				matched = false;
			}
			type = (String) obj.get("type");
			rawInput = (String) obj.get("rawInput");
			parsableInput = (String) obj.get("parsableInput");
			JSONObject ob = new JSONObject();
			ob.put("attribute", attribute);
			ob.put("type", type);
			ob.put("rawInput", rawInput);
			ob.put("parsableInput", parsableInput);
			ob.put("matched", matched);
			result.add(ob);
		}
		return result.toString();
	}
}
