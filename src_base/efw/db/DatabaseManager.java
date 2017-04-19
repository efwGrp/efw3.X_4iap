/**** efw3.X Copyright 2016 efwGrp ****/
package efw.db;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map.Entry;

import javax.naming.NamingException;

import jp.co.intra_mart.foundation.database.SharedDatabase;
import jp.co.intra_mart.foundation.database.TenantDatabase;
import jp.co.intra_mart.foundation.database.exception.DatabaseException;
/**
 * データベース接続を管理するクラス。
 * @author Chang Kejun
 *
 */
public final class DatabaseManager {
	/**
	 * フレームワークに利用するjdbcリソースの名称。
	 * <br>efw.propertiesのefw.jdbc.resourceで設定、
	 * デフォルトは「jdbc/efw」。
	 */
	private static String TenantDatabase="TenantDatabase";
	
    /**
     * データベースオブジェクト。
     * スレッドローカルにデータベースオブジェクトを格納する。サーバーサイトJavascriptに利用される。
     */
	private static ThreadLocal<HashMap<String,Database>> database=new ThreadLocal<HashMap<String,Database>>();
	
    public static Database getDatabase(){
    	try{
        	return (DatabaseManager.database.get()).get(DatabaseManager.TenantDatabase);
    	}catch(Exception e){
    		return null;
    	}
    }
    public static Database getDatabase(String jdbcResourceName){
    	try{
        	if(jdbcResourceName==null||"".equals(jdbcResourceName)){
        		return DatabaseManager.getDatabase();
        	}
        	return (DatabaseManager.database.get()).get(jdbcResourceName);
    	}catch(Exception e){
    		return null;
    	}
    }
    
    ///////////////////////////////////////////////////////////////////////////
	/**
	 * フレームワーク用データソースからデータベース接続を取得する。
	 * @return データベース接続を戻す。
	 * @throws SQLException データベースアクセスエラー。
	 * @throws DatabaseException 
	 */
    public static void open() throws SQLException, DatabaseException{
		if(DatabaseManager.database.get()==null)
			DatabaseManager.database.set(new HashMap<String,Database>());
		DatabaseManager.database.get()
		.put(DatabaseManager.TenantDatabase, new Database((new TenantDatabase()).getConnection()));
    }
    /**
     * jdbcリソース名称によりデータベース接続を取得する。
     * @param jdbcResourceName jdbcリソース名称
     * @return　データベース接続を戻す。
     * @throws NamingException　名称不正のエラー。　
     * @throws SQLException　データベースアクセスエラー。
     * @throws DatabaseException 
     */
    public static void open(String jdbcResourceName) throws NamingException, SQLException, DatabaseException{
    	if (jdbcResourceName==null||"".equals(jdbcResourceName)){
    		DatabaseManager.open();
    		return;
    	}else{
            Database otherdb = new Database((new SharedDatabase()).getConnection(jdbcResourceName));
    		if(DatabaseManager.database.get()==null)
    			DatabaseManager.database.set(new HashMap<String,Database>());
    		DatabaseManager.database.get()
    		.put(jdbcResourceName, otherdb);
    	}
    }
    /**
     * すべてのデータベースを閉じる。
     * @throws SQLException 　データベースアクセスエラー。
     */
    public static void closeAll() throws SQLException{
		if(DatabaseManager.database.get()==null)
			DatabaseManager.database.set(new HashMap<String,Database>());

		HashMap<String,Database> map=DatabaseManager.database.get();
		for(Entry<String, Database> e : map.entrySet()) {
			Database db=e.getValue();
			db.close();
		}
		DatabaseManager.database.remove();
    }
    /**
     * すべてのデータベースをコミット。
     * @throws SQLException
     */
    public static void commitAll() throws SQLException{
		if(DatabaseManager.database.get()==null)
			DatabaseManager.database.set(new HashMap<String,Database>());

		HashMap<String,Database> map=DatabaseManager.database.get();
		for(Entry<String, Database> e : map.entrySet()) {
			Database db=e.getValue();
			db.commit();
		}
    }
    
    public static void rollbackAll() throws SQLException{
		if(DatabaseManager.database.get()==null)
			DatabaseManager.database.set(new HashMap<String,Database>());

		HashMap<String,Database> map=DatabaseManager.database.get();
		for(Entry<String, Database> e : map.entrySet()) {
			Database db=e.getValue();
			db.rollback();
		}
    }

}
