package cs.toronto.edu;

import java.sql.*;
import java.nio.file.*;


public class DBFunctions {
	Connection conn = null;

	public DBFunctions(String dbname, String username, String password){
		try{
			conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/" + dbname, "postgres", "Suhaniuni1");
			System.out.println("Opened database successfully");
		} catch(Exception e){
			System.out.println("Failed when connecting to Database ...");
		}
	}

	public void executeQuery(String query) {
		try {
			// Create a statement object
			Statement stmt = conn.createStatement();
			ResultSet rs = stmt.executeQuery(query);
		} catch (SQLException e){
			System.out.println("This is the error:"+ e.getMessage());
		}
	}


	/**
	 *
	 * @param tbname
	 *
	 * get all the tuples in tbname
	 */
	public void getTheTable(String tbname){
		try {
			String query = "SELECT * FROM " + tbname;
			Statement stmt = conn.createStatement();
			ResultSet rs = stmt.executeQuery(query);

			// Get ResultSet metadata
			ResultSetMetaData rsmd = rs.getMetaData();
			int columnCount = rsmd.getColumnCount();

			// Print column names
			for (int i = 1; i <= columnCount; i++) {
				System.out.print(rsmd.getColumnName(i));
				if (i < columnCount) {
					System.out.print("\t"); // Print tab-separated columns
				} else {
					System.out.println(); // Move to the next line after printing all columns
				}
			}

			// Iterate through the ResultSet
			while (rs.next()) {
				// Iterate through each column
				for (int i = 1; i <= columnCount; i++) {
					// Retrieve data by column index
					Object value = rs.getObject(i);  // Get value of the column dynamically

					// Print column value
					System.out.print(value);
					if (i < columnCount) {
						System.out.print("\t"); // Print tab-separated columns
					} else {
						System.out.println(); // Move to the next line after printing all columns
					}
				}
			}

			// Close ResultSet and Statement
			rs.close();
			stmt.close();

		} catch (SQLException e) {
			// Handle SQL exceptions
			e.printStackTrace();
		}
	}

	/**
	 * create all the tables in the database
	 */
	public void createAllTables() {
		try {
			Statement stmt = conn.createStatement();

			Path currentPath = Paths.get("").toAbsolutePath();
			System.out.println("Current Path: " + currentPath.toString());
			//Stocks
			String sqlTable1 = "CREATE TABLE Stocks(timestamp DATE, open REAL, high REAL, low REAL, close REAL, " +
					"volume INT, symbol VARCHAR(5), PRIMARY KEY(symbol, timestamp));";

			String sqlCopyData = "COPY Stocks(timestamp, open, high, low, close, volume, symbol) FROM '" + "/data/SP500History.csv' DELIMITER ',' CSV HEADER;";

			//stmt.executeUpdate(sqlTable1);
			//stmt.executeUpdate(sqlCopyData);

			//Friends
			String sqlTable2 = "CREATE TABLE Friends(receiverId INT, requesterId INT, reqStatus VARCHAR());";
		}
		catch (SQLException e) {
			e.printStackTrace();
		}

	}

	public void disconnect() {
		try {
			if (conn != null) conn.close();

			System.out.println("Disconnected from the database");
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
//		Statement stmt = null
//		Connection conn = null;

		try {

			// Register the PostgreSQL driver
			Class.forName("org.postgresql.Driver");


//
//			String sqlInsert2 = "INSERT INTO testtbl (name, value) " +
//					"VALUES ('sddmdsfmdsf', 1022);";
//			stmt.executeUpdate(sqlInsert2);
//
//			System.out.println("Tuple inserted successfully");
//
//			//
//			// Create SQL statement to query all tuples
//			//
//			//
//			String sqlSelect = "SELECT name, value FROM testtbl;";
//			ResultSet rs = stmt.executeQuery(sqlSelect);

		} catch (Exception e) {
			e.printStackTrace();
			System.err.println(e.getClass().getName() + ": " + e.getMessage());
			System.exit(1);
		}
		// Connect to the database
		String dbname = "postgres";
		String username = "postgres";
		String password = "59796kpd";
		DBFunctions myDB = new DBFunctions(dbname, username, password);

		//myDB.createAllTables();

		myDB.getTheTable("Stocks");


		myDB.disconnect();
	}
}

