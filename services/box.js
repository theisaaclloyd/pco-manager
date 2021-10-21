const EventEmitter = require('events');
//const fs = require('fs');
const snekfetch = require("snekfetch");
const tokens = require('../tokens.json');

class BoxClient extends EventEmitter {
	baseUri = "https://api.box.com/2.0/";

	constructor(clid, accesstkn) {
		super();

		this.accessToken = accesstkn;

		this.testAccessToken(this.accessToken);
	}

	//log = require('./logger.js')(this)

	// --- tests ----
	testAccessToken = async (token) => {
		const res = await snekfetch.get(this.baseUri + 'users/me', {
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			}
		});

		if (res.statusCode == 200 && res.body.type == "user") {
			this.emit('authenticated', this);
			return true;
		}
		return false;
	};

	// ---- methods ----
	getFoldersList = async () => {
		const res = await snekfetch.get(this.baseUri + 'folders/0/items?fields=name,type', {
			headers: {
				'Authorization': 'Bearer ' + this.accessToken,
				'Content-Type': 'application/json'
			}
		});

		if (res.statusCode == 200) {
			const items = res.body.entries;

			var folders = [];
			for (var i = 0; i < items.length; i++) {
				if (items[i].type === "folder") {
					folders.push({ name: items[i].name, id: items[i].id });
				}
			}

			return folders;
		}
	};

	uploadFile = async (newFile, folderID) => {
		var data = Utilities.newBlob(
			"------pco-manager\r\n"
			+ "Content-Disposition: form-data; name=\"attributes\"\r\n\r\n"
			+ "{\"name\":\"" + newFile.getName() + "\", \"parent\":{\"id\":\"" + folderID + "\"}}\r\n"
			+ "------pco-manager\r\n"
			+ "Content-Disposition: form-data; name=\"file\"; filename=\"" + newFile.getName() + "\"\r\n"
			+ "Content-Type: " + newFile.getContentType() + "\r\n\r\n").getBytes()
			.concat(newFile.getBytes())
			.concat(Utilities.newBlob("\r\n------pco-manager--\r\n").getBytes());

		const res = await snekfetch.post('https://upload.box.com/api/2.0/files/content', {
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': '"multipart/form-data; boundary=----pco-manager'
			},
			
			data: data
		});
		

		const json = JSON.parse(response);

		if (json.type == 'error') { Logger.log(`Error: ${json.message}`); }
		else { Logger.log(`Sucess! '${json.entries[0].name}' created by ${json.entries[0].created_by.name}`); }
	};


	// ---- helpers ----



}

module.exports = BoxClient;

//this.emit('update', this );