/**** efw3.X Copyright 2017 efwGrp ****/
/**
 * efw framework 4iap adapter
 * @author Chang Kejun
 */
/**
* load efw into procedure.
*/
if (Procedure.efwGlobal==undefined){
	eval(Packages.efw.script.ScriptManager.loadResource("efw/resource/server/efw-4iap-script.js"));
}
/**
* redefine these objects for function container js.
*/
var properties = Procedure.efwGlobal.properties;
var session = Procedure.efwGlobal.session;
var db = Procedure.efwGlobal.db;
var event = Procedure.efwGlobal.event;
var file = Procedure.efwGlobal.file;
var absfile = Procedure.efwGlobal.absfile;
var brms = Procedure.efwGlobal.brms;
var mail =Procedure.efwGlobal.mail;
var pdf = Procedure.efwGlobal.pdf;
var cookie =Procedure.efwGlobal.cookie;
var barcode =Procedure.efwGlobal.barcode;
/**
* define doPost function to receive ajax.
*/
function doPost(req){
	return Procedure.efwGlobal.doPost(req);
}
