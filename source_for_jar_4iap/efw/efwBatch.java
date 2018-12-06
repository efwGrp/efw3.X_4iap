/**** efw3.X Copyright 2017 efwGrp ****/
package efw;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Writer;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import efw.log.LogManager;
import efw.properties.PropertiesManager;
import jp.co.intra_mart.foundation.service.client.application.HTTPActionEventHandler;
import jp.co.intra_mart.foundation.service.client.application.HTTPActionEventURL;
import jp.co.intra_mart.foundation.service.client.application.PasswordSecurityHTTPActionEventFilterHandler;
import jp.co.intra_mart.foundation.service.client.application.WebApplicationHTTPActionEventHandler;
import jp.co.intra_mart.foundation.service.client.application.content.AccessibleLinkHTTPActionEventFilterHandler;
import jp.co.intra_mart.foundation.service.provider.application.HTTPActionEvent;
import jp.co.intra_mart.foundation.service.provider.application.HTTPActionEventContext;
import jp.co.intra_mart.foundation.service.provider.application.core.HTTPActionEventController;
import jp.co.intra_mart.system.session.IMQuery;

/**
 *　iapのefwイベントを呼び出すバッチ
 * @author Chang Kejun
 */
public class efwBatch {
	/**
	 * ajaxURL作成するhandler
	 */
	public static class Handler extends WebApplicationHTTPActionEventHandler{
	    public Handler(){}
	    public String getName(){return "efw.efwBatch$Event";}
	    protected Properties getEventRequestParameterMap(){
	        return new Properties();
	    }
	}
	/**
	 * ajaxURL作成するEvent
	 */
	public static class Event implements HTTPActionEvent{
	    public Event(){}
	    public void action(HTTPActionEventContext context, HttpServletRequest request, HttpServletResponse response) throws ServletException{
            HTTPActionEventController controller = new HTTPActionEventController();
        	IMQuery imQuery = new IMQuery();
        	imQuery.setNextPage("efw-4iap-adapter");
        	imQuery.setNextEventName("doPost");
            String path = imQuery.createQueryParameter();

			try {
                path = controller.toAbsoluteURL(request, path);
			} catch (MalformedURLException e) {
				e.printStackTrace();
			}
            String url = controller
        		.createEventURL(request, response, path, "")
        		.replace("jssps","jssprpc");//ajax用urlに変換する
            Writer out;
			try {
				out = response.getWriter();
	            out.write(url);
	            out.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
	    }
	}
	
	/**
	 * プロパティファイルパスのキー
	 */
	private static final String PROPERTIES = "PROPERTIES";
	/**
	 * バッチ実行開始関数
	 * @param args　引数 args[0]はajaxのイベント引数と同じ
	 */
    @SuppressWarnings({ "rawtypes"})
	public static void main(String args[]) {
		
		BufferedReader bis = null;
		try {
			//システム初期化
			PropertiesManager.initBatch(System.getenv(PROPERTIES));
			LogManager.init();

			// イベント実行ハンドラの作成
	        HTTPActionEventHandler handler = new Handler();
	        // 絶対パスでリンクするための定義
	        handler = new AccessibleLinkHTTPActionEventFilterHandler(handler);
	        // ログイン・セキュリティ環境の構築
	        final String tenantId = PropertiesManager.getProperty("tenantId","default");
	        final String userCd = PropertiesManager.getProperty("userCd","tenant");
	        String password = PropertiesManager.getProperty("password","");
	        handler = new PasswordSecurityHTTPActionEventFilterHandler(handler, tenantId, userCd, password);
	        // URL を取得
	        HTTPActionEventURL httpActionEventURL=WebApplicationHTTPActionEventHandler.getURL(handler, PropertiesManager.getProperty("hostPort","http://localhost:8080")+"/HTTPActionEventListener");
	        //cookies を取得
			List<String> cookieList = httpActionEventURL.getConnection().getHeaderFields().get("Set-Cookie");
			String strCookie = "";
			for (String cookie : cookieList) {strCookie += cookie + ",";}
			strCookie = strCookie.substring(0, strCookie.length() - 1);
			
			// イベントを実行する
			URL url = new URL(httpActionEventURL.getURL());
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			http.setConnectTimeout(60*60*1000);//one hour
			http.setRequestProperty("Cookie", strCookie);
			http.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
			http.setDoOutput(true);
			http.setDoInput(true);
			http.setRequestMethod("POST");
			String json = args[0];// efw　eventを呼び出すパラメータ
			OutputStream os = http.getOutputStream();
			os.write(json.getBytes("UTF-8"));
			os.close();
			
			// 戻り値を取得
			bis = new BufferedReader(new InputStreamReader(http.getInputStream(), "UTF-8"));
			StringBuffer buffer = new StringBuffer();
		    String line;
		    while ((line = bis.readLine()) != null){buffer.append(line);}
		    String jsonString = buffer.toString();
		    
		    //戻り値をjsonに変換
		    try{
			    ScriptEngine engine=(new ScriptEngineManager()).getEngineByName("JavaScript");
			    Object obj = engine.eval(String.format("(%s)", jsonString));
			    Map<String, Object> map = jsonToMap(obj, engine.getClass().getName().equals("com.sun.script.javascript.RhinoScriptEngine"));
			    if (map.containsKey("errorlevel")){//batch objectの戻り値の場合
			    	int errorlevel=(new Integer(map.get("errorlevel").toString())).intValue();
					Object[] logs=((Map)map.get("logs")).values().toArray();
			    	for(int i=0;i<logs.length;i++){
			    		String log=(String)logs[i];
			    		LogManager.log(log);
			    	}
					Object[] echos=((Map)map.get("echos")).values().toArray();
			    	for(int i=0;i<echos.length;i++){
			    		String echo=(String)echos[i];
			    		System.out.println(echo);
			    	}
			    	if(errorlevel>0){
			    		System.exit(errorlevel);
			    	}
			    }else{//ほかの任意戻り値の場合
				    System.out.println(jsonString);
			    }
		    }catch(Exception e){//処理エラーの場合、
			    System.out.println(jsonString);
		    }
		} catch (Exception e) {
			e.printStackTrace();//接続エラー
			LogManager.ErrorDebug(e.getMessage());
		}
	}
	
	@SuppressWarnings("rawtypes")
	private static Map<String, Object> jsonToMap(Object obj, boolean rhino)
			throws Exception {
		// Nashorn の場合は isArray で obj が配列かどうか判断できますが、特に何もしなくても配列番号をキーにして値を取得し
		// Map に格納できるので、ここでは無視しています。
		// Rhino だとインデックスを文字列として指定した場合に値が返ってこないようなので、仕方なく処理を切り分けました。
		// 実際は HashMap なんか使わずに自分で定義したクラス（配列はそのオブジェクトの List
		// プロパティ）にマップすることになると思うので、動作サンプルとしてはこんなもんでよろしいかと。
		boolean array = rhino ? Class.forName(
				"sun.org.mozilla.javascript.internal.NativeArray").isInstance(
				obj) : false;
		Class scriptObjectClass = Class
				.forName(rhino ? "sun.org.mozilla.javascript.internal.Scriptable"
						: "jdk.nashorn.api.scripting.ScriptObjectMirror");
		// キーセットを取得
		Object[] keys = rhino ? (Object[]) obj.getClass().getMethod("getIds")
				.invoke(obj) : ((java.util.Set) obj.getClass()
				.getMethod("keySet").invoke(obj)).toArray();
		// get メソッドを取得
		Method method_get = array ? obj.getClass().getMethod("get", int.class,
				scriptObjectClass)
				: (rhino ? obj.getClass().getMethod("get",
						Class.forName("java.lang.String"), scriptObjectClass)
						: obj.getClass().getMethod("get",
								Class.forName("java.lang.Object")));
		Map<String, Object> map = new HashMap<String, Object>();
		for (Object key : keys) {
			Object val = array ? method_get.invoke(obj, (Integer) key, null)
					: (rhino ? method_get.invoke(obj, key.toString(), null)
							: method_get.invoke(obj, key));
			if (scriptObjectClass.isInstance(val)) {
				map.put(key.toString(), jsonToMap(val, rhino));
			} else {
				map.put(key.toString(), val.toString()); // サンプルなので、ここでは単純に
															// toString()
															// してますが、実際は val
															// の型を有効に活用した方が良いでしょう。
			}
		}
		return map;
	}
	
}
