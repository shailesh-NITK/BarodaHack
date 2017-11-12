package processnlp;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class ProcessQuery {
	String attribute;
	String type;
	String rawInput;
	String parsableInput;
	boolean matched;
	
	public static boolean isNumeric(String s) {  
        return s != null && s.matches("[-+]?\\d*\\.?\\d+");  
    } 
	
	public static boolean isDouble(String str) {
		try {
			Double.parseDouble(str);
			return true;
		} catch (NumberFormatException e) {
			return false;
		}
	}
	
	HashSet<String> getStopWords(){
		HashSet<String> sw = new HashSet<>();
		String[] words = {"what,is,the"};
		for(int i=0;i<words.length;i++){
			sw.add(words[i]);
		}
		return sw;
	}
	
	String selectTable(HashMap<String, HashSet<String>> tables, List<String> attributs){
		String tabel="";
		for(Map.Entry m:tables.entrySet()){  
			String temp = (String) m.getKey();
			HashSet<String> vals = (HashSet<String>) m.getValue();
			int count = 0;
			for(int i=0;i<attributs.size();i++){
				String tm = attributs.get(i);
				if(vals.contains(tm)){
					count++;
				}else{
					break;
				}
			}
			if(count==attributs.size()){
				tabel = temp;
			}
		}
		return tabel;
	}
	
	String processQuery(Connection con, JSONArray queryTerm, HashMap<String, String> metadata, HashMap<String, HashSet<String>> tables, int ci, boolean owner){
		String response="";
		List<String> node = new ArrayList<String>();
		List<String> measures = new ArrayList<>();
		List<String> diamensions = new ArrayList<>();
		List<Integer> cardinalInt = new ArrayList<>();
		List<Double> cardinalD = new ArrayList<>();
		HashSet<String> operator = new HashSet<>();
		HashSet<String> sw = getStopWords();
		List<String> rmeasure = new ArrayList<>();
		List<String> rdiamesntion = new ArrayList<>();
		for(int i=0;i<queryTerm.size();i++){
			JSONObject obj = (JSONObject) queryTerm.get(i);
			attribute = (String) obj.get("attribute");
			if(metadata.get(attribute)!=null){
				node.add(attribute);
				type = (String) obj.get("type");
				if(type.equals("MEASURE")){
					measures.add(attribute);
					rmeasure.add(attribute);
				}else{
					rdiamesntion.add(attribute);
					diamensions.add(attribute);
				}
			}else if(attribute!=null){
				rawInput = (String) obj.get("rawInput");
				if(isNumeric(rawInput)){
					if(isDouble(rawInput)){
						cardinalD.add(Double.parseDouble(rawInput));
					}else{
						cardinalInt.add(Integer.parseInt(rawInput));
					}
				}else if(!sw.contains(rawInput)){
					operator.add(rawInput);
				}
			}
		}
		
		String table = selectTable(tables,node);
		
		StringBuilder sql = new StringBuilder();
		sql.append("SELECT ");
		boolean flag = true;
		while(flag){
			if(operator.contains("SUM") || operator.contains("sum")){
				sql.append("SUM(");
				String m = measures.get(0);
				measures.remove(0);
				sql.append(m);
				sql.append("),");
			}else if(operator.contains("Total") || operator.contains("total")){
				sql.append("SUM(");
				String m = measures.get(0);
				measures.remove(0);
				sql.append(m);
				sql.append("),");
			}else if(operator.contains("average") || operator.contains("average")){
				sql.append("AVG(");
				String m = measures.get(0);
				measures.remove(0);
				sql.append(m);
				sql.append("),");
			}else{
				flag = false;
			}
		}
		sql = sql.deleteCharAt(sql.length()-1);
		sql.append(" ");
		for(int i=0;i<measures.size();i++){
			sql.append(measures.get(i));
			sql.append(",");
		}
		for(int i=0;i<diamensions.size();i++){
			sql.append(diamensions.get(i));
			sql.append(",");
		}
		sql = sql.deleteCharAt(sql.length()-1);
		sql.append(" FROM ");
		sql.append(table);
		/*if(owner){
			sql.append(" ");
			sql.append("WHERE ");
			sql.append("Customer_Id=");
			sql.append("\'");
			sql.append(ci);
			sql.append("\'");
		}*/
		if(cardinalD.size()>=1){
			if(!owner){
				sql.append(" ");
				sql.append("WHERE ");
			}
			for(int i=0;i<cardinalD.size();i++){
				sql.append(diamensions.get(0));
				sql.append("=");
				sql.append("\'");
				sql.append(cardinalD.get(i));
				sql.append("\'");
				sql.append(" OR ");
			}
			sql = sql.delete(sql.length()-" OR ".length(), sql.length());
		}
		if(cardinalInt.size()>=1){
			if(!owner){
				sql.append(" ");
				sql.append("WHERE ");
			}
			for(int i=0;i<cardinalInt.size();i++){
				sql.append(measures.get(0));
				sql.append("=");
				sql.append("\'");
				sql.append(cardinalInt.get(i));
				sql.append("\'");
				sql.append(" OR ");
			}
			sql = sql.delete(sql.length()-" OR ".length(), sql.length());
		}
		
		JSONObject obj = new JSONObject();
		//columns
		JSONArray col = new JSONArray();
		/*for(int i=0;i<node.size();i++){
			col.add(node.get(i));
		}*/
		for(int i=0;i<rmeasure.size();i++){
			col.add(rmeasure.get(i));
		}
		for(int i=0;i<rdiamesntion.size();i++){
			col.add(rdiamesntion.get(i));
		}
		obj.put("columns", col);
		JSONArray rows = new JSONArray();
		try{
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(sql.toString());
			while(rs.next()){
				JSONArray temp = new JSONArray();
				for(int i=1;i<=node.size();i++){
					try{
						String tm = rs.getString(i);
						if(isNumeric(tm)){
							temp.add(Integer.parseInt(tm));
						}else{
							temp.add(tm);
						}
						//temp.add(tm);
					}catch(Exception e){
						try{
							BigDecimal tm = rs.getBigDecimal(i);
							temp.add(tm);
						}catch(Exception e1){
							try{
								Integer tm = rs.getInt(i);
								temp.add(temp);
							}catch(Exception e2){
								Date tm = rs.getDate(i);
								temp.add(temp);
							}
						}
					}
				}
				rows.add(temp);
			}
		}catch(Exception e){
			System.out.println(e);
		}
		obj.put("rows", rows);
		return obj.toJSONString();
	}
}
