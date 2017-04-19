/**** efw3.X Copyright 2016 efwGrp ****/
/**
 * efw framework server library
 * @author Chang Kejun
 */
///////////////////////////////////////////////////////////////////////////////
//The global variables
///////////////////////////////////////////////////////////////////////////////
/**
 * The event folder absolute path.
 */
var _eventfolder="";
/**
 * The boolean flag to show the mode is debug or not.
 */
var _isdebug=false;
// /////////////////////////////////////////////////////////////////////////////
// The customization to javax.script
// /////////////////////////////////////////////////////////////////////////////
/**
 * Add load function if the javascript engine is Rhino 1.7
 */
var _eval=this.eval;
function loadResource(filename) {
	_eval(Packages.efw.script.ScriptManager.loadResource(filename));
}
function loadFile(filename) {
	filename=filename.replace(".js","");
	load(filename);
}
/**
 * Add clone function to JSON for deep copy
 */
JSON.clone = function(obj) {
	if (obj === null || obj === undefined) { // null copy
		return obj;
	} else if (typeof obj == "function") { // function executed value
		return obj();
	} else if (typeof obj !== "object") { // simple value copy
		return obj;
	}
	if (obj instanceof Array) { // array deep copy
		var cloneA = [];
		for (var i = 0; i < obj.length; i++)
			cloneA[i] = JSON.clone(obj[i]);
		return cloneA;
	}
	if (obj instanceof Date) { // date copy
		return new Date(obj);
	} else { // object deep copy
		var cloneO = {};
		for ( var key in obj){
			if (key=="debug") continue;// debug function is skipped
			cloneO[key] = JSON.clone(obj[key]);
		}
		return cloneO;
	}
};
// /////////////////////////////////////////////////////////////////////////////
// The classes of the framework
// /////////////////////////////////////////////////////////////////////////////
/**
 * The Efw class
 */
function Efw() {
};
/**
 * Load all classes
 */
loadResource("efw/resource/server/efw.server.messages.js");
loadResource("efw/resource/server/efw.server.js");
loadResource("efw/resource/server/efw.server.format.js");
loadResource("efw/resource/server/efw.server.properties.js");
_isdebug=EfwServerProperties.prototype.get("efw.debug",false);
loadResource("efw/resource/server/efw.server.session.js");
loadResource("efw/resource/server/efw.server.db.js");
loadResource("efw/resource/server/efw.server.event.js");
loadResource("efw/resource/server/efw.server.file.js");
loadResource("efw/resource/server/efw.server.brms.js");
loadResource("efw/resource/server/efw.server.pdf.js");
loadResource("efw/resource/server/efw.server.mail.js");
loadResource("efw/resource/server/efw.server.record.js");
loadResource("efw/resource/server/efw.server.result.js");
loadResource("efw/resource/server/efw.server.excel.js");
loadResource("efw/resource/server/efw.server.cookie.js");
loadResource("efw/resource/server/efw.server.barcode.js");
loadResource("efw/resource/server/efw.server.debug.js");
loadResource("efw/resource/server/base64.min.js");
/**
 * create instances.
 */
var properties = new EfwServerProperties();
var session = new EfwServerSession();
var db = new EfwServerDb();
var event = new EfwServerEvent();
var file = new EfwServerFile();
var brms = new EfwServerBRMS();
var mail =new EfwServerMail();
var pdf = new EfwServerPdf();
var cookie =new EfwServerCookie();
var barcode =new EfwServerBarcode();

///////////////////////////////////////////////////////////////////////////////
//The initialization of system.
///////////////////////////////////////////////////////////////////////////////
/**
 * Client Tag Define
 */
Imart.defineType("efwClient",executeClientTag);
function executeClientTag(attributes,innerContent){

	var jsspQuery = new Packages.jp.co.intra_mart.system.session.IMQuery();
	jsspQuery.setNextPage("efw-4iap-adapter");
	jsspQuery.setNextEventName("doPost");
	jsspQuery.setFromPage(Web.current());
	var url = Web.getContextPath()+"/"+jsspQuery.createQueryParameter();
	url=url.replace("jssps","jssprpc");

	var ret="";
	ret +='<script type="text/javascript" charset="UTF-8" src="./efw/js.cookie.min.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8" src="./efw/efw.client.messages.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8" src="./efw/efw.client.format.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8" src="./efw/efw.client.inputbehavior.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8" src="./efw/efw-4iap-script.client.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8" src="./efw/efw-4iap-script.js"></script>';
	ret +='<script type="text/javascript" src="./csjs/im_json.js"></script>';
	ret +='<script type="text/javascript" src="./csjs/im_ajax_request.js"></script>';
	ret +='<script type="text/javascript" src="./csjs/im_jssp_rpc.js"></script>';
	ret +='<script type="text/javascript">';
	ret +='var efw_first = new Object();';
	ret +='efw_first["doPost"] = function() {';
	ret +='    var argsArray = new Array();';
	ret +='    for (var idx = 0, max = efw_first.doPost.arguments.length; idx < max; idx++) {';
	ret +='        argsArray[idx] = efw_first.doPost.arguments[idx]';
	ret +='    }';
	ret +='    return ImJsspRpc.sendJsspRpcRequest("'+url+'", argsArray, efw.first_success, efw.first_error, "post");';
	ret +='};';
	ret +='var efw_second = new Object();';
	ret +='efw_second["doPost"] = function() {';
	ret +='    var argsArray = new Array();';
	ret +='    for (var idx = 0, max = efw_second.doPost.arguments.length; idx < max; idx++) {';
	ret +='        argsArray[idx] = efw_second.doPost.arguments[idx]';
	ret +='    }';
	ret +='    return ImJsspRpc.sendJsspRpcRequest("'+url+'", argsArray, efw.second_success, efw.second_error, "post");';
	ret +='};';
	ret +='</script>';
	return ret;
}
// /////////////////////////////////////////////////////////////////////////////
/**
 * The ajax service function<br>
 * It will be called by efwServlet
 * 
 * @param req:
 *            JSON String from client
 * @returns: JSON String to client
 */
function doPost(req) {
	var eventId = req.eventId; // get eventId from json object
	var params = req.params; // get params from json object
	try{
		var eventInfo=EfwServerEvent.prototype._events[eventId];// to load or get a event
		if (eventInfo==null||eventInfo.from=="file"){
			eventInfo=EfwServerEvent.prototype._loadFromFile(eventId);
		}
		if(eventInfo.enable==false){
			var message=EfwServerMessages.prototype.EventDisableMessage;
			return (new Result())
					.alert(message,{"eventId":eventId});
		}
		var event=eventInfo.event;
		var beginTime = new Date(); // the begin time of event calling
		if (params == null) {
			var ret = JSON.clone(event.paramsFormat);
			var endTime = new Date(); // the end time of event first calling
			EfwServerEvent.prototype._updateStatistics(eventId, "first", beginTime,
					endTime);
			return ret;
		} else {
			//login check
			var ret = EfwServer.prototype.checkLogin(eventId);
			if (ret==null){
				var fireFlag = "error"; // the second calling is error
				ret = EfwServer.prototype.checkStyle(event, params);
				try {
					if (ret == null)
						ret = EfwServer.prototype.fire(event, params);
					fireFlag = "second"; // the second calling is success
				} finally {
					var endTime = new Date(); // the end time of event second calling
					EfwServerEvent.prototype._updateStatistics(eventId, fireFlag,
							beginTime, endTime);
				}
				
			}
			// if it is null, return blank array to client as a success
			if (ret == null) ret=new Result();
			// change data to string and return it to client
			return ret;
		}
	}catch(e){
		var result=(new Result())
		.error("RuntimeErrorException", {"eventId":eventId,"message":""+e});
		var systemErrorUrl=EfwServerProperties.prototype.get("efw.system.error.url","");
		if (systemErrorUrl!=""){
			result.navigate(systemErrorUrl);
		}
		return result;
	}
};
