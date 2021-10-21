const PCOSClient = require('./services/pco.js');
const BoxClient = require('./services/box.js');
const tkns = require('./tokens.json');

const ss = new PCOSClient(tkns.pco_app_id, tkns.pco_secret, 624425);
const box = new BoxClient(tkns.box_client_id, tkns.box_primary_token);

ss.on('authenticated', async () => {
	console.log('PCO: Authenticated');

	/*const next_plan = await ss.getNextPlan();
	console.log('Next plan: ' + next_plan);

	const plan_settings = await ss.getPlanSettings(next_plan);
	console.log(plan_settings);*/
});

box.on('authenticated', async () => {
	console.log('BOX: Authenticated');

	const folders = await box.getFoldersList();
	console.log(JSON.stringify(folders));
});