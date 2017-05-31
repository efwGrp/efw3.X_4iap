<H1>Step by Step to Build a Batch Environment</H1>

<h2>Prerequisites</h2>
<table>
<tr>
	<th>Item</th><th>Description</th><th>Notes</th>
</tr>
<tr>
	<td>JDK</td>
	<td>java JDK 1.8</td>
	<td>Imart Accel Platform recommends it.
	</td>
</tr>
<tr>
	<td>Application Server</td>
	<td>Resin4 and iAP.</td>
	<td>Imart Accel Platform recommends it.
	</td>
</tr>
</table>
<h2>Steps</h2>
<table>
<tr>
	<th>Step</th><th>Description</th><th>Notes</th>
</tr>
<tr>
	<td>Build a Running Environment</td>
	<td>
1. Be sure <b>imaca_client-X.X.X-main.jar</b> and <b>imaca_provider-X.X.X-main.jar</b> is included when you build the imart war file.<br>
2. Create imart environment by <a href="./step_by_step_web.md">Step by Step to Build a Running Environment</a> .<br>
3. Add the next line into resin-pro-4.X.XX/conf/resin.xml.
<pre>
			&lt;/host>
		&lt;/cluster>
		<b>&lt;system-property jp.co.intra_mart.foundation.service.provider.application.core.PresentationPageHTTPActionEvent.enable="true"/></b>
	&lt;/resin>
</pre>
	</td>
	<td></td>
</tr>
<tr>
	<td>Batch file</td>
	<td>
1. Set imart lib path, be sure to correct the jar version in the sample .<br/>
2. Set the properties file path.<br/>
3. set the event file path and the params in JSON format. 
<pre>
	set LIB=C:\resin-pro-4.0.51\webapps\imart\WEB-INF\lib
	set CLASSPATH=%LIB%\efw-4iap-3.X.XXX.jar;%LIB%\imaca_client-X.X.X-main.jar;
	set PROPERTIES=C:\batchtest\yourbatch.properties

	java efw.efwBatch "{\"eventId\":\"test/helloworld\",\"params\":{\"param1\":\"value1\",\"param2\":\"value2\"}"
</pre>
	</td>
	<td></td>
</tr>
<tr>
	<td>Properties file</td>
	<td>
1. Set login info in the batch properties file.<br>
2. Set Imart host info<br>
3. Set log info.<br>
<pre>
	#tenantId = default
	#userCd = tenant
	#password =
	#hostPort = http://localhost:8080/imart
	#efw.logging.path = /logs
	#efw.logging.name = efwlog%g.txt
	#efw.logging.num = 5<br/>
	#efw.logging.level = WARNING
</pre>
	</td>
	<td></td>
</tr>
</table>
