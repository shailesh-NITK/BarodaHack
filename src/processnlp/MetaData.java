package processnlp;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.HashSet;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import javafx.util.Pair;

public class MetaData {

	String _id;
	String _name;
	String _type;
	int _aggrgatorType;
	public HashMap<String, HashMap<String, HashSet<String>>> getMetaData(Connection con){
		String response = "";
		String key1 = "_id";
		String key2 = "_name";
		String key3 = "_type";
		String key4 = "_aggrgatorType";
		JSONArray result = new JSONArray();
		HashSet<String> hs = new HashSet<>();
		HashMap<String, HashSet<String>> tables = new HashMap<>();
		String sql = "SELECT COLUMN_NAME,DATA_TYPE,COLUMN_TYPE "
				+ "FROM INFORMATION_SCHEMA.COLUMNS"
				+ " WHERE TABLE_NAME = ";// + table +"\"" ;
		//table 1 accounts
		try{
			String table ="\'accounts\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("accounts", tb);
		}catch(Exception e){
			
		}
		
		//table 2 atm
		try{
			String table ="\'atm\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("atm", tb);
		}catch(Exception e){

		}
		
		//table 3 billers
		try{
			String table ="\'billers\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("billers", tb);
		}catch(Exception e){

		}		

		//table 4 branchrevised
		try{
			String table ="\'branchrevised\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("branchrevised", tb);
		}catch(Exception e){

		}	
		
		//table 5 card_details
		try{
			String table ="\'card_details\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("card_details", tb);
		}catch(Exception e){

		}
		
		//table 6 cheque
		try{
			String table ="\'cheque\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("cheque", tb);
		}catch(Exception e){

		}
		
		//table 7 customers
		try{
			String table ="\'customers\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("customers", tb);
		}catch(Exception e){

		}

		//table 8 loan
		try{
			String table ="\'loan\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put(table, tb);
		}catch(Exception e){

		}

		//table 9 loan_add
		try{
			String table ="\'loan_add\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("loan", tb);
		}catch(Exception e){

		}

		//table 10 clockers
		try{
			String table ="\'lockers\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key1, _name);
					obj.put(key1, _type);
					obj.put(key1, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("lockers", tb);
		}catch(Exception e){

		}

		//table 11 neft_rtgs
		try{
			String table ="\'neft_rtgs\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("neft_rtgs", tb);
		}catch(Exception e){

		}

		//table 11 rewards
		try{
			String table ="\'rewards\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			HashSet<String> tb = new HashSet<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				tb.add(name);
				if(!hs.contains(name)){
					hs.add(name);
					JSONObject obj = new JSONObject();
					_id = name;
					_name = name;
					if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
						_type = "DIMENSION";
						_aggrgatorType = 0;
					}else{
						_type = "MEASURE";
						_aggrgatorType = 1;
					}
					obj.put(key1, _id);
					obj.put(key2, _name);
					obj.put(key3, _type);
					obj.put(key4, _aggrgatorType);
					result.add(obj);
				}
			}
			tables.put("rewards", tb);
		}catch(Exception e){

		}
		HashSet<String> res = new HashSet<>();
		res.add(result.toString());
		HashMap<String, HashSet<String>> resMap = new HashMap<>();
		resMap.put("response", res);
		HashMap<String, HashMap<String,HashSet<String>>> ans = new HashMap<>();
		ans.put("tables", tables);
		ans.put("response", resMap);
		return ans;
	}
}
