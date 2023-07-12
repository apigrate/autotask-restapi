require('dotenv').config();
const {AutotaskRestApi, AutotaskApiError, FilterOperators} = require('.');
let autotask = new AutotaskRestApi(
  process.env.AUTOTASK_USER,
  process.env.AUTOTASK_SECRET, 
  process.env.AUTOTASK_INTEGRATION_CODE+'bad' );

(async()=>{
  try{
    let result = null;
    let api = await autotask.api();

    // console.log('%o',autotask.available_entities);
    // console.log('%o',autotask.available_entities.filter(e=>e.childOf));
    // Top level entities.
    // autotask.available_entities.forEach(e=>{
    //   if(!e.childOf){
    //     console.log(`  * ${e.name}`);
    //   }
    // });

    // Child entities.
    // autotask.available_entities.forEach(e=>{
    //   if(e.childOf){
    //     console.log(`  * ${e.name} &rarr; ${e.childOf}/${e.subname}`);
    //   }
    // });
    result = await api.Companies.info();

    // result = await api.Companies.fieldInfo();

    // let myCompany = {
    //   CompanyName: "Sirius Cybernetics Corporation",
    //   CompanyType: 3,
    //   Phone: '8005551212',
    //   OwnerResourceID: 29683995
    // };
    
    // result = await api.Companies.create(myCompany);
  


    // let myToDo = {
    //   ActionType: -3,
    //   AssignedToResourceID: 29683995,
    //   CompanyID: 0, 
    //   ActivityDescription: "Learn more about the Autotask REST API",
    //   StartDateTime: '2020-06-15',
    //   EndDateTime: '2020-06-16',
    // };
    
    // result = await api.CompanyToDos.create(0, myToDo);
  
    //  result = await api.Tickets.fieldInfo();

    // let status_field = result.fields.find(field=>field.name==="status");
  
    // result = await api.Companies.query({filter:[{field:'companyName', op:FilterOperators.beginsWith, value:'Bee'}]});

    console.log(`result:\n${JSON.stringify(result,null,2)}`);
  }catch(err){
    if( err instanceof AutotaskApiError ){
      // Custom handling is possible for Autotask REST API errors.
      console.error(`Error message: ${err.message}\nHTTP status: ${err.status}\nError Details: ${JSON.stringify(err.details)}`);
    } else {
      console.error(err);
    }
  }
})()