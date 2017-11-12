package processnlp;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import javafx.util.Pair;

import sun.swing.plaf.synth.Paint9Painter;

public class Attributes {
	public static String table ="accounts";
	public void attributes(Connection con, String sentance){
		String[] words = sentance.split(" ");
	}
	
	public List<Pair<String, String>> getDiamension(Connection con){
		List<Pair<String,String>> diamension = null;
		String sql = "SELECT COLUMN_NAME,DATA_TYPE,COLUMN_TYPE "
				+ "FROM INFORMATION_SCHEMA.COLUMNS"
				+ "WHERE TABLE_NAME =" + table +"\"" ;
		try{
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(sql);
			System.out.println(rs.getMetaData());
			diamension = new ArrayList<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				if(dataType.equals("varchar") || dataType.equals("date") || dataType.equals("text")){
					diamension.add(new Pair<String, String>(name, dataType));
				}
			}
		}catch(Exception e){
			System.out.print(e);
		}
		return diamension;
	}
	
	public List<Pair<String, String>> getMeasure(Connection con){
		List<Pair<String, String>> measure = null;
		String sql = "SELECT COLUMN_NAME,DATA_TYPE,COLUMN_TYPE "
				+ "FROM INFORMATION_SCHEMA.COLUMNS"
				+ "WHERE TABLE_NAME =" + table +"\"" ;
		try{
			Statement stmt=con.createStatement();
			ResultSet rs = stmt.executeQuery(sql);
			System.out.println(rs.getMetaData());
			measure = new ArrayList<>();
			while(rs.next()){
				String name = rs.getString(1);
				String dataType = rs.getString(2);
				if(dataType.equals("int") || dataType.equals("bigint") || dataType.equals("decimal")){
					measure.add(new Pair<String, String>(name, dataType));
				}
			}
		}catch(Exception e){
			System.out.print(e);
		}
		return measure;
	}
}
