package processnlp;

import java.sql.Connection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class NLPEntry {
	static HashMap<String, HashMap<String, HashSet<String>>> ans;
	static HashMap<String,String> metadata;
	static HashMap<String, HashSet<String>> tables;
	static int ci = 437725114;
	//static big ac = 430100001324;
	public void call(){
		ans = new HashMap<>();
		metadata = new HashMap<>();
		tables = new HashMap<>();
	}
	
	public String process(Connection con, String request){
		JSONObject obj = null;
		JSONParser parser = new JSONParser();
		org.json.simple.parser.JSONParser jsonParser = new org.json.simple.parser.JSONParser();
		String serviceName = "";
		String response = "";
		try{
			//obj = (JSONObject) parser.parse(request);
			obj = (JSONObject) jsonParser.parse(request);
			serviceName = obj.get("service").toString();
			if(serviceName.equals("prepare")){
				call();
				SetMetaData smd = new SetMetaData();
				metadata = smd.getMetaData(con);
				return response;
			}else if(serviceName.equals("getMetadata")){
				MetaData md = new MetaData();
				ans = md.getMetaData(con);
				tables = ans.get("tables");
				HashMap<String, HashSet<String>> res = ans.get("response");
				HashSet<String> resp = res.get("response");
				Iterator iterator = resp.iterator(); 
				while(iterator.hasNext()){
					response = (String) iterator.next();
				}
				return response;
			}else if(serviceName.equals("search")){
				String keyword = obj.get("keyword").toString();
				SearchKeyword sk = new SearchKeyword();
				response = sk.getSearchKeywords(con,keyword,metadata);
				return response;
			}else if(serviceName.equals("enrichQuery")){
				String str = (String) obj.get("query");
				JSONArray ar = (org.json.simple.JSONArray) jsonParser.parse(str);
				EnrichQuery en = new EnrichQuery();
				response = en.makeEnrichQuery(ar,metadata);
				return response;
			}else if(serviceName.equals("expressionTree")){
				return "{\"operands\":[]}";
			}else if(serviceName.equals("query")){
				String str = (String) obj.get("query");
				JSONArray queryTerms = (org.json.simple.JSONArray) jsonParser.parse(str);
				ProcessQuery pq = new ProcessQuery();
				response = pq.processQuery(con,queryTerms,metadata,tables,ci,false);
				return response;
			}
		}catch(Exception e){
			System.out.println(e);
		}
		
		return null;
	}
}
