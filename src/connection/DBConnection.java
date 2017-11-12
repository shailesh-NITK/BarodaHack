package connection;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {
	
	public Connection getConnection(){
		Connection con = null;
		String url = "jdbc:mysql://localhost:3306/baroda";
		String user = "root";
		String password = "root";
		try{
			Class.forName("com.mysql.jdbc.Driver"); 
			con = DriverManager.getConnection(url, user, password);
		}catch(Exception e){
			
		}
		return con;
	}
}
