package connection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class Test1 {
	Connection _con;
	String _host;
	String _uName;
	String _uPass;
	public static String table ="accounts";
	public void connect(){
		try {
		    Class.forName("com.mysql.jdbc.Driver");
		} 
		catch (ClassNotFoundException e) {
		    // TODO Auto-generated catch block
		    e.printStackTrace();
		} 
		try{
			_host = "jdbc:mysql://localhost:3306/baroda";
			_uName = "root";
			_uPass = "root";
			_con = DriverManager.getConnection(_host, _uName, _uPass);
			Statement stmt=_con.createStatement();
			ResultSet rs=stmt.executeQuery("select * from accounts;");
			//while(rs.next())
				//System.out.println(rs.getBigDecimal(2));
			String sql = "SELECT COLUMN_NAME,DATA_TYPE,COLUMN_TYPE "
					+ "FROM INFORMATION_SCHEMA.COLUMNS"
					+ " WHERE TABLE_NAME =\'" + table +"\'";
			rs = stmt.executeQuery(sql);
			while(rs.next())
				System.out.println(rs.getString(1) + " " + rs.getString(2));
			_con.close();
		}catch(SQLException e){
			System.out.print(e.getMessage());
		}
	}
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Test1 t = new Test1();
		t.connect();
	}
}