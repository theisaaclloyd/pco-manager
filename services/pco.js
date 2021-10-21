const EventEmitter = require('events');
const snekfetch = require("snekfetch");

class PCOSClient extends EventEmitter {
	baseUri = "https://api.planningcenteronline.com/services/v2/";

	constructor(usr_app_id, usr_srt, def_service) {
		super();

		this.app_id = usr_app_id;
		this.secret = usr_srt;

		this.service = def_service;

		this.authHeader = `${Buffer.from(`${this.app_id}:${this.secret}`, 'utf-8').toString('base64')}`; //Authorization: Basic 

		this.testAuth();
	}

	// --- tests ----
	async testAuth() {
		const body = await snekfetch.get(this.baseUri, {
			headers: {
				'Authorization': 'Basic ' + this.authHeader,
				'Content-Type': 'application/json'
			}
		});

		//console.log(body.body.toString());
		if (body.statusCode == 200) {
			this.emit('authenticated', this);
		}
	}

	// ---- helpers ----
	servicesUri(id, extra) { return `${this.baseUri}service_types/${id}/${extra || ''}`; }
	plansUri(id, extra) { return `${this.baseUri}plans/${id}/${extra || ''}`; }
	fullPlansUri(serviceID, planID, extra) { return `${this.baseUri}service_types/${serviceID}/plans/${planID}/${extra || ''}`; }

	// ---- methods ----
	async createPlan(service_type_id = this.service, count = 1) {
		var payload = {
			data: {
				type: 'create_plans',
				attributes: {
					"count": count,
					"copy_items": true,
					"copy_people": true,
					"team_ids": [2395236, 2395238, 3796195], //band: 2395236, a/v: 2395238, sermon/announcements team: 3796195
					"copy_notes": true,
					//"as_template": false,
					//"base_date": false,
				},
				relationships: {
					template: {
						data: [
							{ type: 'PlanTemplate', id: 54397992 },
						],
					},
				},
			},
		};

		let res = await fetch(this.baseUri, {
			method: 'post',
			body: JSON.stringify(payload),
			headers: this.authHeader
		});

		console.log(res.json());
	}

	async getNextPlan(service_type_id = this.service) {
		const uri = this.servicesUri(service_type_id, "plans?filter=future");
		const res = await snekfetch.get(uri, {
			headers: {
				'Authorization': 'Basic ' + this.authHeader,
				'Content-Type': 'application/json'
			}
		});

		const plans = JSON.parse(res.body.toString());

		const next_plan = plans.data[0];
		const next_plan_id = next_plan.id;
		if (next_plan_id == undefined || !next_plan_id) {
			console.log(`No upcoming plans matching service type: ${service_type_id}`);
			return false;
		}

		//console.log(`Got upcoming plan: ${next_plan.attributes.title == null ? next_plan.id : next_plan.attributes.title} for service type: ${service_type_id}`);

		//console.log(next_plan_id);

		return next_plan_id;
	}

	async getPlanSettings(plan_id) {
		const uri = this.plansUri(plan_id, "notes");
		const res = await snekfetch.get(uri, {
			headers: {
				'Authorization': 'Basic ' + this.authHeader,
				'Content-Type': 'application/json'
			}
		});

		const settings = JSON.parse(JSON.parse(res.body.toString()).data[0].attributes.content);
		return settings;
	}

}


/*const uri = this.servicesUri(service_type_id, "plans?filter=future");
const res = await snekfetch.get(uri, {
	headers: {
		'Authorization': 'Basic ' + this.authHeader,
		'Content-Type': 'application/json'
	}
});

const plans = JSON.parse(res.body.toString());*/

module.exports = PCOSClient;

//this.emit('update', this );