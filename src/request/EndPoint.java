package request;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import connection.DBConnection;
import processnlp.NLPEntry;

/**
 * Servlet implementation class EndPoint
 */
@WebServlet("/EndPoint")
public class EndPoint extends HttpServlet {
	private static final long serialVersionUID = 1L;
	DBConnection db = null;
	Connection con = null;
    /**
     * @see HttpServlet#HttpServlet()
     */
	public void init(){
		db = new DBConnection();
	}
    public EndPoint() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		try{
			con = db.getConnection();
			/*BufferedReader req = new BufferedReader(new InputStreamReader(request.getInputStream()));
			StringBuilder q = new StringBuilder();
			String temp;
			while((temp=req.readLine())!=null){
				q.append(temp);
			}*/
			NLPEntry nlp = new NLPEntry();
			//String result = nlp.process(con,q.toString());
			String result = nlp.process(con,request.getParameter("request"));
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
	    	response.getWriter().append(result);
		}catch(Exception e){
			System.out.println(e);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
