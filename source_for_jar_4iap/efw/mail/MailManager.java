/**** efw3.X Copyright 2016 efwGrp ****/
package efw.mail;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import jp.co.intra_mart.foundation.mail.MailSenderException;
import jp.co.intra_mart.foundation.mail.javamail.JavaMailSender;
import jp.co.intra_mart.foundation.mail.javamail.StandardMail;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import efw.efwException;


/**
 * MailテンプレートXMLを管理するクラス。
 * @author Chang Kejun
 *
 */
public final class MailManager {
	/**
	 * MailテンプレートXMLファイルの格納パス。
	 * サーブレットから渡される。
	 */
    private static String mailFolder;
    /**
     * デバッグモードを制御するフラグ。
	 * サーブレットから渡される。
     */
    private static boolean isDebug;
    /**
     * サーブレットから設定情報を受け取る。
     * @param mailFolder　MailテンプレートXMLファイルの格納パス。
     * @param isDebug　デバッグモード制御フラグ。
     * @throws efwException　MailテンプレートXMLファイルの読み取りエラー。
     */
	public synchronized static void init(String mailFolder,boolean isDebug) throws efwException{
		MailManager.mailFolder=mailFolder;
		MailManager.isDebug=isDebug;
	}

	/**
	 * メールを送信
	 * @param mailId
	 * @param params
	 * @throws efwException 
	 */
	public static void send(String groupId,String mailId,Map<String,String> params) throws efwException{
		Mail mail=get(groupId,mailId);
		StandardMail message= new StandardMail();
		try {
			String to=mail.getTo(params);
			if (to!=null&&!"".equals(to)){
				String[] ary=to.split(";");
				for(int i=0;i<ary.length;i++){
					if(!"".equals(ary[i]))message.addTo(ary[i]);
						//message.addRecipient(MimeMessage.RecipientType.TO, new InternetAddress(ary[i]));
				}
			}
			String cc=mail.getCc(params);
			if (cc!=null&&!"".equals(cc)){
				String[] ary=to.split(";");
				for(int i=0;i<ary.length;i++){
					if(!"".equals(ary[i]))message.addCc(ary[i]);
						//message.addRecipient(MimeMessage.RecipientType.CC, new InternetAddress(ary[i]));
				}
			}
			String bcc=mail.getBcc(params);
			if (bcc!=null&&!"".equals(bcc)){
				String[] ary=to.split(";");
				for(int i=0;i<ary.length;i++){
					if(!"".equals(ary[i]))message.addBcc(ary[i]);
						//message.addRecipient(MimeMessage.RecipientType.BCC, new InternetAddress(ary[i]));
				}
			}
			String subject=mail.getSubject(params);
			if (subject!=null&&!"".equals(subject)){
				message.setSubject(subject);
				//message.setSubject(subject,"UTF-8");
			}
			String body=mail.getBody(params);
			if (body!=null&&!"".equals(body)){
				message.setText(body);
				//message.setContent(body,"text/plain;charset=UTF-8");//text/html;charset=UTF-8
			}
			//message.setFrom();
			//Transport.send(message);
			(new JavaMailSender(message)).send();
		} catch (MailSenderException e) {
			e.printStackTrace();
    		throw new efwException(efwException.MailSendFailedExcepton,e.getMessage());
		}
	}
	/**
	 * ひとつのMailオブジェクトを取得する。 
	 * デバッグモードの場合、最終更新日時により再ロードするか否か判断する。
	 * 通常モードの場合、予めロード済みデータから、Sqlオブジェクトを探す。
	 * @param groupId MailテンプレートXMLファイルのファイル名（拡張子を除く）。
	 * @param mailId　mailタグに定義するid。
	 * @return　Mailオブジェクト。
	 * @throws efwException　Mail外部化XMLファイルの定義エラーか、存在しないエラーか。
	 */
	private static synchronized Mail get(String groupId,String mailId) throws efwException{
		//if it is debug mode,check the updating and reload xml if it is needed.
		if (MailManager.isDebug){
			if(checkModifyTime(groupId)){
				groups.remove(groupId);
				load(groupId);
			}
		}
		//get group
		HashMap<String,Mail> group=groups.get(groupId);
		//if group is not exists, try to load it.
		if (group==null){
			load(groupId);
			group=groups.get(groupId);
		}
		//if group is not exists, it is wrong group id
		if (group==null){
			throw new efwException(efwException.MailGroupIdIsNotExistsException,groupId);
		}else{
			//get mail
			Mail mail=group.get(mailId);
			//if mail is not exists, it is wrong mail id
			if(mail==null){
				throw new efwException(efwException.MailIdIsNotExistsException,mailId);
			}else{
				return mail;
			}
		}
	}
	/**
	 * 予めロード済みデータのMailオブジェクトの最終更新日時は、実ファイルと同じか否かをチェックする。
	 * @param groupId MailテンプレートXMLファイルのファイル名（拡張子を除く）。
	 * @return 最終更新日時が変更なしの場合 true　。
	 */
	private static synchronized boolean checkModifyTime(String groupId){
		HashMap<String,Mail> group=groups.get(groupId);
		if (group==null){
			return true;//xml file is not in memory,so it is need to reload
		}else{
			for(String key:group.keySet()){
				Mail mail=group.get(key);
				Date mailLastModifytime=mail.getLastModifytime();
				Date fileLastModifytime = new Date(new File(MailManager.mailFolder+"/"+groupId+".xml").lastModified());
				if (!mailLastModifytime.equals(fileLastModifytime)){
					return true;//xml file is modified, so it is need to reload
				}else{
					return false;//xml file is not modified
				}
			}
			return true;//mail is not exists ,so it is need to reload
		}
	}
	/**
	 * MailテンプレートXMLファイルのファイル名によりロードする。
	 * @param groupId MailテンプレートXMLファイルのファイル名（拡張子を除く）。
	 */
	///////////////////////////////////////////////////////////////////////////
	private static synchronized void load(String groupId) throws efwException{
		String filename=MailManager.mailFolder+"/"+groupId+".xml";
		File fl=new File(filename);
		Date lastModifytime=new Date(fl.lastModified());
		//add a new map by file name in aryData 
		groups.put(groupId,new HashMap<String,Mail>());
		//read xml to get Mails 
		NodeList mails;
		try {
			mails = DocumentBuilderFactory.newInstance().newDocumentBuilder()
								.parse(fl)
								.getDocumentElement()
								.getElementsByTagName("mail");
		} catch (SAXException e) {
			throw new efwException(efwException.XMLFileIsNotLegalException,filename);
		} catch (IOException e) {
			throw new efwException(efwException.XMLFileIsNotLegalException,filename);
		} catch (ParserConfigurationException e) {
			throw new efwException(efwException.XMLFileIsNotLegalException,filename);
		}
		//get sql from element
		for(int i=0;i<mails.getLength();i++){
			Node node = mails.item(i);
			if (node.getNodeType() == Node.ELEMENT_NODE){
				Element element= (Element)node;
				String mailId=element.getAttribute("id");
				if (groups.get(groupId).get(mailId)==null){
					groups.get(groupId).put(mailId, new Mail(element,lastModifytime));
				}else{
					throw new efwException(efwException.MailIdIsDuplicateException,mailId);
				}
			}
		}
	}
	/**
	 * ロードするMailテンプレートXMLファイルを格納するオブジェクト。
	 */
	private static HashMap<String,HashMap<String,Mail>> groups=new HashMap<String,HashMap<String,Mail>>();

}
