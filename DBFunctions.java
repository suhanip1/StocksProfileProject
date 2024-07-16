package cs.toronto.edu;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.nio.file.*;


public class DBFunctions {
	Connection conn = null;
	public DBFunctions(String dbname, String username, String password){
		try{
			conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/" + dbname, "postgres", "59796kpd");
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

			//User
			String user = "CREATE TABLE Client(uid INT, fname VARCHAR(20), lname VARCHAR(20), " +
					"username VARCHAR(20) UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(15), PRIMARY KEY(uid));";
			stmt.executeUpdate(user);

			//Friends
			String friends = "CREATE TABLE Friends(receiverId INT, requesterId INT, reqStatus VARCHAR(10), " +
					"timeOfRejection TIMESTAMP DEFAULT NULL, CHECK (reqStatus in ['accepted', 'requested', 'rejected'])" +
					"PRIMARY KEY(receiverId, requesterId), " +
					"FOREIGN KEY (receiverId) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE, " +
					"FOREIGN KEY (requesterId) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(friends);

			//HasPortfolio
//			String hasPortfolio = "CREATE TABLE HasPortfolio(pid INT, uid INT, PRIMARY KEY(pid), " +
//					"FOREIGN KEY (pid) REFERENCES Portfolio(pid) ON DELETE SET NULL ON UPDATE CASCADE, " +
//					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE);";
//			stmt.executeUpdate(hasPortfolio);

			//Portfolio
			String portfolio = "CREATE TABLE Portfolio(pid INT, pname CHAR(20), " +
					"uid INT, FOREIGN KEY (uid) REFERENCES User(uid)," +
					" PRIMARY KEY(pid));";
			stmt.executeUpdate(portfolio);

			//hasAccount
			String hasAccount = "CREATE TABLE HasAccount(pid INT, accId INT, PRIMARY KEY(pid), " +
					"FOREIGN KEY (pid) REFERENCES Portfolio(pid) ON DELETE SET NULL ON UPDATE CASCADE, " +
					"FOREIGN KEY (accId) REFERENCES CashAccount(accId) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(hasAccount);

			//cashAccount
			String cashAccount = "CREATE TABLE CashAccount(accId INT, balance REAL, PRIMARY KEY(accId));";
			stmt.executeUpdate(cashAccount);

			//leaveReviews
			String leavesReview = "CREATE TABLE LeavesReviews(rid INT, slid INT, uid INT, PRIMARY KEY(rid)," +
					"FOREIGN KEY (rid) REFERENCES Review(rid) ON DELETE SET NULL ON UPDATE CASCADE, " +
					"FOREIGN KEY (slid) REFERENCES StockLists(slid) ON DELETE SET NULL ON UPDATE CASCADE," +
					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(leavesReview);

			//Review
			String review = "CREATE TABLE Review(rid INT, reviewText VARCHAR(200), reviewDate TIMESTAMP, PRIMARY KEY(rid));";
			stmt.executeUpdate(review);

			//isAccessibleBy
			String isAccessibleBy = "CREATE TABLE IsAccessibleBy(slid INT, uid INT, PRIMARY KEY(slid, uid)," +
					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE, " +
					"FOREIGN KEY (slid) REFERENCES StockLists(slid) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(isAccessibleBy);

			//hasStockLists
//			String hasStockLists = "CREATE TABLE HasStockLists(slid INT, uid INT, PRIMARY KEY(slid)," +
//					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE," +
//					"FOREIGN KEY (slid) REFERENCES StockLists(slid) ON DELETE SET NULL ON UPDATE CASCADE);";
//			stmt.executeUpdate(hasStockLists);

			//stockLists
			String stockLists = "CREATE TABLE StockLists(slid INT, visibility VARCHAR(10), slName CHAR(20), " +
					"uid INT, PRIMARY KEY(slid), " +
					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(stockLists);

			//makesPurchase
//			String makesPurchase = "CREATE TABLE MakesPurchase(purchaseId INT, uid INT, PRIMARY KEY(purchaseId)," +
//					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE," +
//					"FOREIGN KEY (purchaseId) REFERENCES Purchase(purchaseId) ON DELETE SET NULL ON UPDATE CASCADE);";
//			stmt.executeUpdate(makesPurchase);

			//purchase
			String purchase = "CREATE TABLE Purchase(purchaseId INT, timestamp TIMESTAMP, quantity INT, " +
					"purchasePrice REAL, uid INT, symbol VARCHAR(5), PRIMARY KEY(purchaseId)" +
					"FOREIGN KEY (uid) REFERENCES Client(uid) ON DELETE SET NULL ON UPDATE CASCADE," +
					"FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(purchase);

			//StockHoldings
			String stockHoldings = "CREATE TABLE StockHoldings(pid INT, symbol VARCHAR(5), PRIMARY KEY(pid, symbol)," +
					"FOREIGN KEY (pid) REFERENCES Portfolio(pid) ON DELETE SET NULL ON UPDATE CASCADE," +
					"FOREIGN KEY (symbol) REFERENCES StockHolding(symbol) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(stockHoldings);


			//StockHolding
			String stockHolding = "CREATE TABLE StockHolding(symbol VARCHAR(5), sharesOwned INT, " +
					"PRIMARY KEY(symbol), " +
					"FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(stockHolding);


			//stockListItems
			String stockListItems = "CREATE TABLE StockListItems(slid INT, symbol VARCHAR(5), PRIMARY KEY(slid, symbol)," +
					"FOREIGN KEY (slid) REFERENCES StockLists(slid) ON DELETE SET NULL ON UPDATE CASCADE," +
					"FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE SET NULL ON UPDATE CASCADE);";
			stmt.executeUpdate(stockListItems);

			//Bought
//			String bought = "CREATE TABLE Bought(purchaseId INT, symbol VARCHAR(5), PRIMARY KEY(purchaseId), " +
//					"FOREIGN KEY (purchaseId) REFERENCES Purchase(purchaseId) ON DELETE SET NULL ON UPDATE CASCADE, " +
//					"FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE SET NULL ON UPDATE CASCADE);";
//			stmt.executeUpdate(bought);

			//Stock
			String stock = "CREATE TABLE Stock(symbol VARCHAR(5), strikePrice REAL, stockPrice REAL, PRIMARY KEY(symbol);";
			stmt.executeUpdate(stock);

			//Stock Performance
			Path currentPath = Paths.get("").toAbsolutePath();
			System.out.println("Current Path: " + currentPath.toString());
			//Stocks
			String stocks = "CREATE TABLE StockPerformance(timestamp DATE, open REAL, high REAL, low REAL, close REAL, " +
					"volume INT, symbol VARCHAR(5), PRIMARY KEY(symbol, timestamp), " +
					"FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE SET NULL ON UPDATE CASCADE);";

			String sqlCopyData = "COPY Stocks(timestamp, open, high, low, close, volume, symbol) FROM '" +
					currentPath.toString() + "/data/SP500History.csv' DELIMITER ',' CSV HEADER;";
			//stmt.executeUpdate(stocks);
			stmt.executeUpdate(sqlCopyData);

		}
		catch (SQLException e) {
			e.printStackTrace();
		}

	}

	public void addUser(int uid, String fname, String lname, String username, String email, String password) {
		String sql = "INSERT INTO Client (uid, fname, lname, username, email, password) VALUES (?, ?, ?, ?, ?, ?)";

		try (
				Statement stmt = conn.createStatement();
			 PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setInt(1, uid);
			pstmt.setString(2, fname);
			pstmt.setString(3, lname);
			pstmt.setString(4, username);
			pstmt.setString(5, email);
			pstmt.setString(6, password);

			int rowsAffected = pstmt.executeUpdate();
			System.out.println(rowsAffected + " row(s) inserted.");

		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
	}

	public void addFriendRequest(int receiverId, int requesterId, String reqStatus, String timeOfRejection) {
		String sql = "INSERT INTO Friends (receiverId, requesterId, reqStatus, timeOfRejection) VALUES (?, ?, ?, ?)";

		try (
			 PreparedStatement pstmt = conn.prepareStatement(sql)) {

			// Set the parameters for the PreparedStatement
			pstmt.setInt(1, receiverId);
			pstmt.setInt(2, requesterId);
			pstmt.setString(3, reqStatus);
			pstmt.setString(4, timeOfRejection);

			// Execute the statement
			int rowsAffected = pstmt.executeUpdate();
			System.out.println(rowsAffected + " row(s) inserted.");

		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
	}

	public  void addPortfolio(int pid, String pname, double totalCash, double totalPresentMarketValue) throws SQLException {
		String sql = "INSERT INTO Portfolio (pid, pname, totalCash, totalPresentMarketValue) VALUES (?, ?, ?, ?)";
		try (
			 PreparedStatement pstmt = conn.prepareStatement(sql)) {
			pstmt.setInt(1, pid);
			pstmt.setString(2, pname);
			pstmt.setDouble(3, totalCash);
			pstmt.setDouble(4, totalPresentMarketValue);
			pstmt.executeUpdate();
			System.out.println("Portfolio row inserted.");
		}catch (SQLException e){
			System.out.println(e.getMessage());

		}
	}
	public void addHasPortfolio(int pid, int uid) {
		String sql = "INSERT INTO HasPortfolio (pid, uid) VALUES (?, ?)";

		try (
			 PreparedStatement pstmt = conn.prepareStatement(sql)) {

			// Set the parameters for the PreparedStatement
			pstmt.setInt(1, pid);
			pstmt.setInt(2, uid);

			// Execute the statement
			int rowsAffected = pstmt.executeUpdate();
			System.out.println(rowsAffected + " row(s) inserted.");

		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
	}

	public void addHasAccount(int pid, int accId) throws SQLException {
		String sql = "INSERT INTO HasAccount (pid, accId) VALUES (?, ?)";
		try (
			 PreparedStatement pstmt = conn.prepareStatement(sql)) {
			pstmt.setInt(1, pid);
			pstmt.setInt(2, accId);
			pstmt.executeUpdate();
			System.out.println("HasAccount row inserted.");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
	}

	public void addCashAccount(int accId, double balance) throws SQLException {
		String sql = "INSERT INTO CashAccount (accId, balance) VALUES (?, ?)";
		try(PreparedStatement pstmt = conn.prepareStatement(sql)) {
			pstmt.setInt(1, accId);
			pstmt.setDouble(2, balance);
			pstmt.executeUpdate();
			System.out.println("CashAccount row inserted.");
		} catch (SQLException e) {
			System.out.println(e.getMessage());
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
//		Statement stmt = null;
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
		String dbname = "project";
		String username = "postgres";
		String password = "59796kpd";
		DBFunctions myDB = new DBFunctions(dbname, username, password);
		myDB.addUser(1, "Suhani", "Paul", "username", "user@mail.com", "password");

//		myDB.createAllTables();

//		myDB.getTheTable("Stocks");


		myDB.disconnect();
	}
}

