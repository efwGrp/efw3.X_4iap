/**** efw3.X Copyright 2016 efwGrp ****/
package efw.db;

import java.io.PrintWriter;
import java.util.logging.Logger;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;

import javax.sql.DataSource;

public class BatchDataSource implements DataSource {

    protected volatile String password = null;
    public String getPassword() {return this.password;}
    public void setPassword(String password) {this.password = password;}
    
    protected String url = null;
    public synchronized String getUrl() {return this.url;}
    public synchronized void setUrl(String url) {this.url = url;}
    
    protected String username = null;
    public String getUsername() {return this.username;}
    public void setUsername(String username) {this.username = username;}
    
	public Connection getConnection() throws SQLException {
		Connection cn=DriverManager.getConnection(url, username, password);
		return cn;
	}
	
	/**以下の関数は実装していない**/
	public PrintWriter getLogWriter() throws SQLException {return null;}
	public void setLogWriter(PrintWriter out) throws SQLException {}
	public void setLoginTimeout(int seconds) throws SQLException {}
	public int getLoginTimeout() throws SQLException {return 0;}
	public Logger getParentLogger() throws SQLFeatureNotSupportedException {return null;}
	public <T> T unwrap(Class<T> iface) throws SQLException {return null;}
	public boolean isWrapperFor(Class<?> iface) throws SQLException {return false;}
	public Connection getConnection(String username, String password) throws SQLException {return null;}
}
