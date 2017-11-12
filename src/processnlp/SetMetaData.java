package processnlp;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.sun.org.apache.xalan.internal.xsltc.runtime.Hashtable;

import javafx.util.Pair;

public class SetMetaData {

	String _id;
	String _name;
	String _type;
	int _aggrgatorType;
	public HashMap<String, String> getMetaData(Connection con){
		String response = "";
		String key1 = "_id";
		String key2 = "_name";
		String key3 = "_type";
		String key4 = "_aggrgatorType";
		JSONArray result = new JSONArray();
		HashSet<String> hs = new HashSet<>();
		HashMap<String,String> metadata = new HashMap<>();
		String sql = "SELECT COLUMN_NAME,DATA_TYPE,COLUMN_TYPE "
				+ "FROM INFORMATION_SCHEMA.COLUMNS"
				+ " WHERE TABLE_NAME = ";// + table +"\"" ;
		//table 1 accounts
		try{
			String table ="\'accounts\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					obj.put(key1, _id);
					obj.put(key1, _name);
					obj.put(key1, _type);
					obj.put(key1, _aggrgatorType);
					result.add(obj);
				}
			}
		}catch(Exception e){
			
		}
		
		//table 2 atm
		try{
			String table ="\'atm\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}
		
		//table 3 billers
		try{
			String table ="\'billers\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}		

		//table 4 branchrevised
		try{
			String table ="\'branchrevised\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}	
		
		//table 5 card_details
		try{
			String table ="\'card_details\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}
		
		//table 6 cheque
		try{
			String table ="\'cheque\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}
		
		//table 7 customers
		try{
			String table ="\'customers\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}

		//table 8 loan
		try{
			String table ="\'loan\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}

		//table 9 loan_add
		try{
			String table ="\'loan_add\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}

		//table 10 clockers
		try{
			String table ="\'lockers\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}

		//table 11 neft_rtgs
		try{
			String table ="\'neft_rtgs\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}

		//table 11 rewards
		try{
			String table ="\'rewards\'";
			String query1 = sql + table;
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(query1);
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
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
					metadata.put(_id, _type);
					result.add(obj);
				}
			}
		}catch(Exception e){

		}
		
		return metadata;
	}
}
