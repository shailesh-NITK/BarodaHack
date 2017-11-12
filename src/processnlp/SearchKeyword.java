package processnlp;

import java.sql.Connection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.sun.org.apache.xalan.internal.xsltc.runtime.Hashtable;

public class SearchKeyword {
	String rawInput;
	String attribute;
	String type;
	String getSearchKeywords(Connection con, String keyword, HashMap<String, String> metadata){
		String response="";
		String key;
		HashSet<String> keySet = new HashSet<>();
		JSONArray result = new JSONArray();
		
		for(Map.Entry m:metadata.entrySet()){
			key = (String) m.getKey();
			if(!keySet.contains(key))
			{
				keySet.add(key);
				if(key.matches(keyword+"(.*)")){
					rawInput = keyword;
					attribute = key;
					type = metadata.get(key).toString();
					JSONObject obj = new JSONObject();
					obj.put("rawInput", attribute);
					obj.put("attribute",attribute);
					obj.put("type", type);
					result.add(obj);
				}
			}
			//System.out.println(m.getKey()+" "+m.getValue());  
		} 
		
		return result.toString();
	}
}
