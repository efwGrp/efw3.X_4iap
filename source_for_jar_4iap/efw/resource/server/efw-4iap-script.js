/**** efw3.X Copyright 2017 efwGrp ****/
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
Packages.efw.properties.PropertiesManager.init();//because script mode is loaded earlier than javaee mode.
_isdebug=EfwServerProperties.prototype.get("efw.isdebug",false);
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
loadResource("efw/resource/server/efw.server.batch.js");
loadResource("efw/resource/server/efw.server.cookie.js");
loadResource("efw/resource/server/efw.server.barcode.js");
//loadResource("efw/resource/server/efw.server.debug.js"); //Cannt customize object in script mode because imart products.
loadResource("efw/resource/server/base64.min.js");

/**
 * create instances.
 */
var properties = new EfwServerProperties();
var session = new EfwServerSession();
var db = new EfwServerDb();
var event = new EfwServerEvent();
var file = new EfwServerFile(false);
var absfile = new EfwServerFile(true);
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
Imart.defineType("efwclient",executeClientTag);
Imart.defineType("EFWCLIENT",executeClientTag);
function executeClientTag(attributes,innerContent){

	var jsspQuery = new Packages.jp.co.intra_mart.system.session.IMQuery();
	jsspQuery.setNextPage("efw-4iap-adapter");
	jsspQuery.setNextEventName("doPost");
	jsspQuery.setFromPage(Web.current());
	var url = Web.getContextPath()+"/"+jsspQuery.createQueryParameter();
	url=url.replace("jssps","jssprpc");

	var ret="";
	ret +='<link type="text/css" rel="stylesheet" href="./efw/efw.css">';
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
/**
 * efwChart Tag Define
 */
Imart.defineType("efwChart",executeEfwChartTag);
Imart.defineType("efwchart",executeEfwChartTag);
Imart.defineType("EFWCHART",executeEfwChartTag);
function executeEfwChartTag(attributes,innerContent){

	var id="chart";
	var chartType="column";
	var height="400";
	var width="auto";
	var attrs={};
	if(attributes.id){
		id=attributes.id;
	}
	if(attributes.chartType){
		chartType=attributes.chartType;
	}
	if(attributes.height){
		height=attributes.height;
	}
	if(attributes.width){
		width=attributes.width;
	}
	var ret="";
	var temp="";
	for(var attr in attrs) {
		temp+=attr+'="'+attrs[attr]+'" ';
	}
	ret+='<script type="text/javascript" charset="UTF-8" src="chart/googlechart4efw.js"></script>';
	ret+='<iframe id="iframe_'+id+'" name="iframe_'+id+'" frameborder="0" style="width:'+width+';height:'+height+';" "'+temp+'"></iframe>';
	ret+='<script>'
			+ 'var '+id+';'
			+ '$(function(){'+id+'=new EfwClientChart("'+id+'","'+attributes.data+'","'+chartType+'");'+id+'.draw();});</script>';
	return ret;
}
/**
 * elFinder Tag Define
 */
Imart.defineType("efwElFinder",executeElFinderTag);
Imart.defineType("efwElfinder",executeElFinderTag);
Imart.defineType("efwelfinder",executeElFinderTag);
Imart.defineType("EFWELFINDER",executeElFinderTag);

function executeElFinderTag(attributes,innerContent){

	var id="elFinder";
	var home="";
	var readonly=false;
	var lang="";
	var height="400";
	var width="auto";
	var attrs={};

	if(attributes.id){
		id=attributes.id;
	}
	if(attributes.home){
		home=attributes.home;
	}
	if(attributes.lang){
		lang=attributes.lang;
	}
	if(attributes.height){
		height=attributes.height;
	}
	if(attributes.width){
		width=attributes.width;
	}
	if(attributes.readonly){
		if ((""+attributes.readonly).toLowerCase()=="true"){
			readonly=true;
		}
	}
	
	var ret="";
	ret+='<link type="text/css" rel="stylesheet" href="elfinder/css/elfinder.min.css">';
	ret+='<link type="text/css" rel="stylesheet" href="elfinder/css/theme.css">';
	ret+='<script type="text/javascript" charset="UTF-8" src="elfinder/js/elfinder4efw.min.js"></script>';
	if(!"".equals(lang)){
		ret+='<script type="text/javascript" charset="UTF-8" src="elfinder/js/i18n/elfinder.'+lang+'.js"></script>';
	}
	ret+='<script type="text/javascript" charset="UTF-8">';
	ret+='var '+id+';$(function(){'+id+'=$("#'+id+'")'
			+ '.elfinder({'
			+ '"url":"efwServlet",'
			+ '"urlUpload":"uploadServlet",'
			+ '"soundPath":"elfinder/sounds",'
			+("".equals(lang)||"en".equals(lang)?'':'lang:"'+lang+'",')
			+'height:"'+height+'",'
			+'width:"'+width+'",'
			+ '"customData":{'
			+ '"home":"'+home+'",'
			+ '"readonly":'+readonly+','
			+ '}'
			+ '}).elfinder("instance");});';
	ret+='</script>';
	var temp="";
	for(var attr in attrs) {
		temp+=attr+'="'+attrs[attr]+'" ';
	}
	ret+='<div id="'+id+'" '+temp+'></div>';
	return ret;
}
try{
	loadResource("elfinder/resource/server/init.js");
}catch(e){}
/**
 * Signature Tag Define
 */
Imart.defineType("efwSignature",executeSignatureTag);
Imart.defineType("efwsignature",executeSignatureTag);
Imart.defineType("EFWSIGNATURE",executeSignatureTag);
function executeSignatureTag(attributes,innerContent){
	var id="signature";
	var height="200";
	var width="400";
	var attrs={};

	if(attributes.id){
		id = attributes.id;
	}
	if(attributes.height){
		height = attributes.height;
	}
	if(attributes.width){
		width = attributes.width;
	}

	var ret="";
	ret +='<link type="text/css" rel="stylesheet" href="signature/jquery.signature4efw.css">';
	ret +='<script type="text/javascript" charset="UTF-8" src="signature/jquery.signature4efw.min.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8" src="signature/jquery.ui.touch-punch.min.js"></script>';
	ret +='<script type="text/javascript" charset="UTF-8">';
	ret +='var '+id+';';
	ret +='$(function(){'+id+'=$("#div_'+id+'").signature(';
	ret +='{change:function(){$("#'+id+'").val('+id+'.signature("toSVG"));}});';
	ret +='$("#'+id+'").val("");});</script>';

	var temp="";
	for(var attr in attrs) {
		temp+=attr+'="'+attrs[attr]+'" ';
	}
	ret +='<div id="div_'+id+'" style="width:'+width+'px;height:'+height+'px;"'+temp+'></div>';
	ret +='<a class="cls-signature" href="#" style="position:relative;left:-24px;top:-8px">';
	ret +='<img src="signature/reset.png" onclick="'+id+'.signature("clear");$("#'+id+'").val("");">';
	ret +='<input type="hidden" id="'+id+'"/></a>';
	
	return ret;
}
/**
 * ckEditor Tag Define
 */
Imart.defineType("efwCKEditor",executeCkEditorTag);
Imart.defineType("efwCKeditor",executeCkEditorTag);
Imart.defineType("efwCkeditor",executeCkEditorTag);
Imart.defineType("efwckeditor",executeCkEditorTag);
Imart.defineType("EFWCKEDITOR",executeCkEditorTag);
function executeCkEditorTag(attributes,innerContent){
	
	var id="ckeditor";
	var readonly=false;
	var lang="";// "" ja zh-cn en
	var height="400";
	var width="800";
	var pattern="standard";
	if(attributes.id){
		id=attributes.id;
	}
	if(attributes.lang){
		lang=attributes.lang;
	}
	if(attributes.height){
		height=attributes.height;
	}
	if(attributes.width){
		width=attributes.width;
	}
	if(attributes.readonly){
		if ((""+attributes.readonly).toLowerCase()=="true"){
			readonly=true;
		}
	}
	if(attributes.pattern){
		pattern=attributes.pattern;
	}
	var ret="";
	ret+='<script type="text/javascript" charset="UTF-8" src="ckeditor/ckeditor.js"></script>';
	ret+='<script type="text/javascript" charset="UTF-8" src="ckeditor/additions4efw.js"></script>';
	ret+='<textarea id="'+id+'" ></textarea>';
	ret+='<script type="text/javascript" charset="UTF-8">';
	ret+='var '+id+';';
	ret+='$(function(){'+id+'=CKEDITOR.replace("'+id+'",{';
	if (lang!=""){
		ret+='"language":"'+lang+'",';
	}
	if (readonly){
		ret+='"readOnly":"true",';
	}
	ret+='"width":"'+width+'",';
	ret+='"height":"'+height+'",';
	ret+='"resize_dir":"both",';
	//ret+="\"autoUpdateElement\":true,");
	
	if(pattern=="basic"){
		ret+='"toolbarGroups":CKEDITOR.editor.prototype.basicPattern.toolbarGroups,';
		ret+='"removeButtons":CKEDITOR.editor.prototype.basicPattern.removeButtons,';
		//ret+="\"toolbarGroups\":[{name:\"document\",groups:[\"mode\",\"document\",\"doctools\"]},{name:\"clipboard\",groups:[\"clipboard\",\"undo\"]},{name:\"editing\",groups:[\"find\",\"selection\",\"spellchecker\",\"editing\"]},{name:\"forms\",groups:[\"forms\"]},{name:\"basicstyles\",groups:[\"basicstyles\",\"cleanup\"]},{name:\"paragraph\",groups:[\"list\",\"indent\",\"blocks\",\"align\",\"bidi\",\"paragraph\"]},{name:\"links\",groups:[\"links\"]},{name:\"insert\",groups:[\"insert\"]},{name:\"styles\",groups:[\"styles\"]},{name:\"colors\",groups:[\"colors\"]},{name:\"tools\",groups:[\"tools\"]},{name:\"others\",groups:[\"others\"]},{name:\"about\",groups:[\"about\"]}],");
		//ret+="\"removeButtons\":\"Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Redo,Undo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Maximize,ShowBlocks,BGColor,TextColor,Styles,Format,Font,FontSize,Iframe,PageBreak,SpecialChar,Smiley,HorizontalRule,Table,Image,Flash,Anchor,Language,BidiRtl,BidiLtr,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,CreateDiv,Blockquote,CopyFormatting,Underline,Strike,Subscript,Superscript,RemoveFormat\",");
	}else if (pattern=="standard"){
		ret+='"toolbarGroups":CKEDITOR.editor.prototype.standardPattern.toolbarGroups,';
		ret+='"removeButtons":CKEDITOR.editor.prototype.standardPattern.removeButtons,';
		//ret+="\"toolbarGroups\":[{name:\"clipboard\",groups:[\"clipboard\",\"undo\"]},{name:\"editing\",groups:[\"find\",\"selection\",\"spellchecker\",\"editing\"]},{name:\"links\",groups:[\"links\"]},{name:\"insert\",groups:[\"insert\"]},{name:\"tools\",groups:[\"tools\"]},{name:\"document\",groups:[\"mode\",\"document\",\"doctools\"]},\"/\",{name:\"forms\",groups:[\"forms\"]},{name:\"basicstyles\",groups:[\"basicstyles\",\"cleanup\"]},{name:\"paragraph\",groups:[\"list\",\"indent\",\"blocks\",\"align\",\"bidi\",\"paragraph\"]},{name:\"styles\",groups:[\"styles\"]},{name:\"colors\",groups:[\"colors\"]},{name:\"others\",groups:[\"others\"]},{name:\"about\",groups:[\"about\"]}],");
		//ret+="\"removeButtons\":\"Save,NewPage,Preview,Print,Templates,SelectAll,Replace,Find,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Flash,Smiley,PageBreak,Iframe,ShowBlocks,Underline,Subscript,Superscript,CopyFormatting,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Font,FontSize,TextColor,BGColor\",");
	}else{
		ret+='"toolbarGroups":null,';
		ret+='"removeButtons":null,';
	}
	ret+='});';
	ret+=''+id+'.on("change",function(){$("#'+id+'").val(this.getData());});';
	ret+=''+id+'.replacedTextareaId="'+id+'";';
	ret+='});';
	ret+='</script>';

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
///////////////////////////////////////////////////////////////////////////////
/**
 * Set global into procedure
 */
Procedure.define("efwGlobal",this);
