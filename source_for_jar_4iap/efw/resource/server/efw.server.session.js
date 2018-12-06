/**** efw3.X Copyright 2016 efwGrp ****/
/**
 * The class to operate session.
 * 
 * @author Chang Kejun
 */
function EfwServerSession() {
};
/**
 * The function to get data from session.
 * 
 * @param {String}
 *            key: the session key.
 * @returns {Any}
 */
EfwServerSession.prototype.get = function(key) {
	var value= Packages.efw.efwServlet.getRequest().getSession().getAttribute(key);
	if (typeof value == "object") {
		if (value == null) {
			value = null;
		} else if (value.getClass().getName() == "java.lang.String") {
			value = "" + value;
		} else if (value.getClass().getName() == "java.lang.Boolean") {
			value = true && value;
		} else if (value.getClass().getName() == "java.lang.Byte"
				|| value.getClass().getName() == "java.lang.Short"
				|| value.getClass().getName() == "java.lang.Integer"
				|| value.getClass().getName() == "java.lang.Long"
				|| value.getClass().getName() == "java.lang.Float"
				|| value.getClass().getName() == "java.lang.Double"
				|| value.getClass().getName() == "java.math.BigDecimal") {
			value = 0 + new Number(value);
		} else if (value.getClass().getName() == "java.sql.Date"
				|| value.getClass().getName() == "java.sql.Time"
				|| value.getClass().getName() == "java.sql.Timestamp") {
			var dt = new Date();
			dt.setTime(value.getTime());
			value = dt;
		}
	}
	return value;
};
/**
 * The function to set data in session.
 * 
 * @param {String}
 *            key: the session key.
 * @param {Any}
 *            value: the data you want to set in session.
 */
EfwServerSession.prototype.set = function(key, value) {
	Packages.efw.efwServlet.getRequest().getSession().setAttribute(key, value);
};
/**
 * The function to create a new session.
 */
EfwServerSession.prototype.create = function() {
	Packages.efw.efwServlet.getRequest().getSession(true);
};
/**
 * The function to invalidate the current session.
 */
EfwServerSession.prototype.invalidate = function() {
	Packages.efw.efwServlet.getRequest().getSession().invalidate();
};
