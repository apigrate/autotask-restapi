require('dotenv').config();
let {AutotaskRestApi} = require('.');

let autotask = new AutotaskRestApi(
  process.env.AUTOTASK_USER, 
  process.env.AUTOTASK_SECRET, 
  process.env.AUTOTASK_INTEGRATION_CODE );

it('must be initialized.', async () => {
  await autotask.init();
  expect(autotask.zoneInfo).toBeDefined();
  expect(autotask.zoneInfo.url).toBeDefined();
});

it('can get companies.', async () => {
  let account = await autotask.init().Companies.get(0);
  expect(account).toBeDefined();
});
