/**** efw3.X Copyright 2016 efwGrp ****/
package efw.sql;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import efw.efwException;

/**
 * Sqlを外部化するXMLのsqlタグとマッピングし、1つのSqlを表すクラス。
 * @author Chang Kejun
 *
 */
public final class Sql {
	/**
	 * SqlタグからSqlオブジェクトを作成する。
	 * @param element　Sql外部化XMLのsqlタグ
	 * @param lastModifytime　最終更新日時
	 * @throws efwException　タグ不正のエラー。
	 */
	protected Sql(Element element,Date lastModifytime) throws efwException{
		//もしSQLに:がある場合、paramPrefixを別文字に設定するようにできる
		String tmpParamPrefix=element.getAttribute("paramPrefix");
		if(tmpParamPrefix!=null&&tmpParamPrefix.length()>0)paramPrefix=tmpParamPrefix;
		//もしSQLに@がある場合、dynamicPrefixを別文字に設定するようにできる
		String tmpDynamicPrefix=element.getAttribute("dynamicPrefix");
		if(tmpDynamicPrefix!=null&&tmpDynamicPrefix.length()>0)dynamicPrefix=tmpDynamicPrefix;
		
		this.lastModifytime=lastModifytime;
		NodeList nodes=element.getChildNodes();
		for(int i=0;i<nodes.getLength();i++){
			Node node=nodes.item(i);
			if (node.getNodeType() == Node.ELEMENT_NODE){
				Element step= (Element)node;
				if (step.getTagName().equals("if")){
					steps.add(new SqlIf(step));
				}else{
					String information;
					try{
						StreamResult xmlOutput = new StreamResult(new StringWriter());
						Transformer transformer = TransformerFactory.newInstance().newTransformer();
						transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
						transformer.transform(new DOMSource(node), xmlOutput);
						information = xmlOutput.getWriter().toString();
					}catch(Exception e){
						information=e.getMessage();
					}
					throw new efwException(efwException.XMLTagIsNotLegalException,information);
				}
			}else if(node.getNodeType()==Node.TEXT_NODE){
				String step= node.getNodeValue();
				steps.add(new SqlText(step));
			}
		}
	}	
	/**
	 * Sqlに動的キーワードを識別するための頭文字
	 */
	private String dynamicPrefix="@";
	protected String getDynamicPrefix(){
		return dynamicPrefix;
	}

	/**
	 * Sqlにパラメータを識別するための頭文字
	 */
	private String paramPrefix=":";
	protected String getParamPrefix(){
		return paramPrefix;
	}
	
	/**
	 * 最終更新日時。
	 */
	private Date lastModifytime;
	protected Date getLastModifytime() {
		return lastModifytime;
	}
	/**
	 * 文字列Sql文を作成する。
	 * @param params Sqlパラメータのマップ。
	 * @return　文字列のSql文を返す。
	 * @throws ScriptException 
	 */
	public String getSqlString(Map<String,Object> params) throws ScriptException{
		StringBuffer bf=new StringBuffer();
		ArrayList<String> paramKeys=new ArrayList<String>();
		for(int i=0;i<steps.size();i++){
			Object obj=steps.get(i);
			if (obj.getClass().getName().equals("efw.sql.SqlText")){
				SqlText sqltext=(SqlText)obj;
				bf.append(sqltext.getSQL(paramPrefix,dynamicPrefix,params));
				paramKeys.addAll(sqltext.getParamKeys(paramPrefix));
			}else if(obj.getClass().getName().equals("efw.sql.SqlIf")){
				SqlIf sqlif=(SqlIf)obj;
				if ((!Sql.isBlank(sqlif.getExists())&&!Sql.isBlank(params,sqlif.getExists()))
				||(!Sql.isBlank(sqlif.getNotExists())&&Sql.isBlank(params,sqlif.getNotExists()))
				||(!Sql.isBlank(sqlif.getIsTrue())&&Sql.isTrue(params,sqlif.getIsTrue()))
				||(!Sql.isBlank(sqlif.getIsFalse())&&!Sql.isTrue(params,sqlif.getIsFalse()))){
					bf.append(sqlif.getSqlString(paramPrefix,dynamicPrefix,params));
					paramKeys.addAll(sqlif.getParamKeys());
				}
			}
		}
		sqlParams=new ArrayList<Object>();
        for(int i=0;i<paramKeys.size();i++){
        	String key=paramKeys.get(i);
        	if (params.containsKey(key)){
        		sqlParams.add(params.get(key));
        	}else{
        		sqlParams.add(null);
        	}
        }
		return bf.toString();		
	}
	/**
	 * Sqlパラメータのマップから、Sql文にパラメータの順番により値の配列を作る。
	 * もし存在しないパラメータがあったら、nullを代入する。
	 * @return Sqlパラメータ値の配列。
	 */
	private ArrayList<Object> sqlParams;
	public ArrayList<Object> getSqlParams(){
		return sqlParams;
	}
	/**
	 * sqlタグの中に、ifタグにより、分割される部品を格納する。
	 */
	private ArrayList<Object> steps=new ArrayList<Object>();
	/**
	 * パラメータマップに指定キーのパラメータが空白か否か判断する。
	 * 指定キーのパラメータが存在しない場合、true。
	 * 指定キーのパラメータがnullの場合、true。
	 * 指摘キーのパラメータが""の場合、true。
	 * @param params　パラメータマップ。
	 * @param key　指定キー。
	 * @return　判断結果。
	 * @throws ScriptException 
	 */
	protected static boolean isTrue(Map<String,Object> params,String script) throws ScriptException{
    	ScriptEngine se=(new ScriptEngineManager()).getEngineByName("JavaScript");
    	for(Map.Entry<String, Object> entry : params.entrySet()) {
    		se.put(entry.getKey(), entry.getValue());
    	}
    	return (Boolean)se.eval(script);
    }
    /**
	 * パラメータマップに指定キーのパラメータが空白か否か判断する。
	 * 指定キーのパラメータが存在しない場合、true。
	 * 指定キーのパラメータがnullの場合、true。
	 * 指摘キーのパラメータが""の場合、true。
	 * @param params　パラメータマップ。
	 * @param key　指定キー。
	 * @return　判断結果。
	 */
    protected static boolean isBlank(Map<String,Object> params,String key){
    	if (isBlank(key)){
    		return true;
    	}else{
    		if (!params.containsKey(key)){
    			return true;
    		}else{
    			if (isBlank(params.get(key))){
    				return true;
    			}else{
    				return false;
    			}
    		}
    	}
    }
    /**
     * 指定値は空白か否か判断する。
     * nullの場合、true。
     * ""の場合、true。
     * @param value　指定値。
     * @return　判断結果。
     */
    protected static boolean isBlank(Object value){
    	if (value==null){
    		return true;
    	}else if("".equals(value)){
    		return true;
    	}else{
    		return false;
    	}
    }
}
