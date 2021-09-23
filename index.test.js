require('dotenv').config();
let {AutotaskRestApi, FilterOperators} = require('.');
var autotask = null;
var api = null;

beforeAll(async ()=>{
  autotask = new AutotaskRestApi(
    process.env.AUTOTASK_USER, 
    process.env.AUTOTASK_SECRET, 
    process.env.AUTOTASK_INTEGRATION_CODE );
  api = await autotask.api();
});

it('must load zoneInfo on initialization', async () => {
  expect(autotask.zoneInfo).toBeDefined();
  // console.log('zoneInfo result: %o', autotask.zoneInfo);
  expect(autotask.zoneInfo.url).toBeDefined();
});

it('can get by id', async () => {
  let result = await api.Companies.get(0);
  // console.log('get result: %o', result);
  let company = result.item;
  expect(company).toBeDefined();
  expect(company.id).toBe(0);
});

test('can query multiple.', async () => {

  let result = await api.Companies.query({filter:[
    {
      field: "companyName",
      op: FilterOperators.beginsWith,
      value: "A"
    },
    {
      field: "id",
      op: FilterOperators.gt,
      value: 0
    }
  ]});
  // console.log('query result: %o', result);
  expect(result.items).toBeDefined();
  let item = result.items[0];
  expect(item.id).toBeGreaterThan(0);
  expect(item.companyName).toMatch(/A.*/);
});

let contactIdCreated = null;
test('can create an entity', async () => {
  let contact = {
    companyID: 0,
    firstName: "Tester",
    middleInitial: "Xavier",
    lastName: "Testington",
    isActive: 0,
  };
  let result = await api.CompanyContacts.create(0, contact);
  // console.log('create result: %o', result);
  let itemId = result.itemId;
  expect(itemId).toBeDefined();
  expect(itemId).toBeGreaterThan(0); 
  contactIdCreated = itemId;
});

test('can update an entity', async () => {
  let contactUpdate = {
    id: contactIdCreated,
    firstName: "Ingrid",
    isActive: 0,
  };
  let result = await api.CompanyContacts.update(0, contactUpdate);
  // console.log('update result: %o', result);
  expect(result).toBeDefined();
  let {item: contactAfterUpdate} = await api.Contacts.get(contactIdCreated);
  expect(contactAfterUpdate).toBeDefined();
  expect(contactAfterUpdate.id).toBe(contactIdCreated);
  expect(contactAfterUpdate.firstName).toMatch(/Ingrid/);
  expect(contactAfterUpdate.middleInitial).toMatch(/Xavier/);
  expect(contactAfterUpdate.lastName).toMatch(/Testington/);
});

test('can replace an entity', async () => {
  let contactUpdate = {
    id: contactIdCreated,
    title: "Commander",
    firstName: "William",
    lastName: "Adama",
    isActive: 1,
  };
  let result = await api.CompanyContacts.replace(0, contactUpdate); 
  // console.log('update result: %o', result);
  expect(result).toBeDefined();
  let {item: contactAfterUpdate} = await api.Contacts.get(contactIdCreated);
  expect(contactAfterUpdate).toBeDefined();
  expect(contactAfterUpdate.id).toBe(contactIdCreated);
  expect(contactAfterUpdate.title).toMatch(/Commander/);
  expect(contactAfterUpdate.firstName).toMatch(/William/);
  expect(contactAfterUpdate.lastName).toMatch(/Adama/);
  expect(contactAfterUpdate.middleInitial).toBe(null);
  expect(contactAfterUpdate.isActive).toBe(1);
});


test('can delete an entity', async () => {
 
  let result = await api.CompanyContacts.delete(0, contactIdCreated);
  // console.log('delete result: %o', result);
  expect(result).toBeDefined();
  let {item: contactAfterUpdate} = await api.Companies.get(contactIdCreated);
  expect(contactAfterUpdate).toBeDefined();
});
