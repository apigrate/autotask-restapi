/*
  Copyright 2020 Apigrate LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
const fetch = require('node-fetch');
const qs = require('query-string');
const debug = require('debug')('autotask:restapi');
const verbose = require('debug')('autotask:restapi:verbose');

class AutotaskRestApi {
  /**
   * Create an Autotask Rest API connector instance.
   * @param {string} user Autotask API user identifier (required)
   * @param {string} secret Autotas API secret associated with the user (required)
   * @param {string} code Autotask API integration tracking code (required)
   * @param {object} options
   * @param {string} options.base_url the REST API base url. (Default https://webservices2.autotask.net/ATServicesRest/)
   * @param {string} options.version Autotask REST API decimal version (e.g. 1.0). (Default 1.0);
   * 
   */
  constructor(user, secret, code, options){
    if(!user)throw new Error(`An API user is required.`);
    if(!secret) throw new Error(`An API user secret is required.`);
    if(!code) throw new Error(`An API integration code is required.`);

    this.user = user;
    this.secret = secret;
    this.code = code;
    
    //TODO: change entrypoint base url once released... 
    this.base_url = `https://webservices2.autotask.net/ATServicesRest/`; //As returned by zoneInformation.url
    this.version = '1.0';
    
    if(options){
      if(options.base_url){
        this.base_url = options.base_url;
      }
      if(options.version){
        this.version = options.version;
      }
    }

    //read-only. See the init method.
    this.zoneInfo = null;
    this.available_entities=[
      {name: "zoneInformation" },
      {name:'ActionTypes'},
      {name:'AdditionalInvoiceFieldValues'},
      {name:'Appointments'},
      {name:'AttachmentInfo'},
      {name:'ProjectCharges'},
      {name:'BillingCodes'},
      {name:'BillingItems'},
      {name:'BillingItemApprovalLevels'},
      {name:'ChangeOrderCharges'},
      {name:'ChangeRequestLinks'},
      {name:'ChecklistLibraries'},
      {name:'ChecklistLibraryChecklistItems', childOf: 'ChecklistLibraries', subname: 'ChecklistItems'},
      {name:'ClassificationIcons'},
      {name:'ClientPortalUsers'},
      {name:'ComanagedAssociations'},
      {name:'Companies'},
      {name:'CompanyAlerts', childOf: 'Companies', subname: 'Alerts'},
      {name:'CompanyAttachments', childOf: 'Companies', subname: 'Attachments'},
      {name:'CompanyContacts', childOf: 'Companies', subname: 'Contacts'},
      {name:'CompanyLocations', childOf: 'Companies', subname: 'Locations'},
      {name:'CompanyNotes', childOf: 'Companies', subname: 'Notes'},
      {name:'CompanySiteConfigurations', childOf: 'Companies', subname: 'SiteConfigurations'},
      {name:'CompanyTeams', childOf: 'Companies', subname: 'Teams'},
      {name:'CompanyToDos', childOf: 'Companies', subname: 'ToDos'},
      {name:'CompanyWebhooks'},
      {name:'CompanyWebhookExcludedResources', childOf: 'CompanyWebhooks', subname: 'ExcludedResources'},
      {name:'CompanyWebhookFields', childOf: 'CompanyWebhooks', subname: 'Fields'},
      {name:'CompanyWebhookUdfFields', childOf: 'CompanyWebhoosk', subname: 'UdfFields'},
      {name:'ConfigurationItems'},
      {name:'ConfigurationItemBillingProductAssociations', childOf: 'ConfigurationItems', subname: 'BillingProductAssociations'},
      {name:'ConfigurationItemCategories'},
      {name:'ConfigurationItemCategoryUdfAssociations', childOf: 'ConfigurationItemCategories', subname: 'UdfAssociations'},
      {name:'ConfigurationItemNotes', childOf: 'ConfigurationItems', subname: 'Notes'},
      {name:'ConfigurationItemTypes'},
      {name:'Contacts'},
      {name:'ContactBillingProductAssociations', childOf: 'Contacts', subname: 'BillingProductAssociationis'},
      {name:'ContactGroups'},
      {name:'ContactGroupContacts', childOf: 'ContactGroups', subname: 'Contacts'},
      {name:'ContactWebhooks'},
      {name:'ContactWebhookExcludedResources', childOf: 'ContactWebhooks', subname: 'ExcludedResources'},
      {name:'ContactWebhookFields', childOf: 'ContactWebhooks', subname: 'Fields'},
      {name:'ContactWebhookUdfFields', childOf: 'ContactWebhooks', subname: 'UdfFields'},
      {name:'Contracts'},
      {name:'ContractBillingRules', childOf: 'Contracts', subname: 'BillingRules'},
      {name:'ContractBlocks', childOf: 'Contracts', subname: 'Blocks'},
      {name:'ContractBlockHourFactors', childOf: 'Contracts', subname: 'BlockHourFactors'},
      {name:'ContractCharges', childOf: 'Contracts', subname: 'Charges'},
      {name:'ContractExclusionBillingCodes', childOf: 'Contracts', subname: 'ExclusionBillingCodes'},
      {name:'ContractExclusionRoles', childOf: 'Contracts', subname: 'ExclusionRoles'},
      {name:'ContractExclusionSets'},
      {name:'ContractExclusionSetExcludedRoles', childOf: 'ContractExclusionSets', subname: 'ExcludedRoles'},
      {name:'ContractExclusionSetExcludedWorkTypes', childOf: 'ContractExclusionSets', subname: 'ExcludedWorkTypes'},
      {name:'ContractMilestones', childOf: 'Contracts', subname: 'Milestones'},
      {name:'ContractNotes', childOf: 'Contracts', subname: 'Notes'},
      {name:'ContractRates', childOf: 'Contracts', subname: 'Rates'},
      {name:'ContractRetainers', childOf: 'Contracts', subname: 'Retainers'},
      {name:'ContractRoleCosts', childOf: 'Contracts', subname: 'RoleCosts'},
      {name:'ContractServices', childOf: 'Contracts', subname: 'Services'},
      {name:'ContractServiceAdjustments', childOf: 'Contracts'},
      {name:'ContractServiceBundles', childOf: 'Contracts', subname: 'ServiceBundles'},
      {name:'ContractServiceBundleAdjustments', childOf: 'Contracts', subname: 'ServiceBundleAdjustments'},
      {name:'ContractServiceBundleUnits', childOf: 'Contracts', subname: 'ServiceBundleUnits'},
      {name:'ContractServiceUnits', childOf: 'Contracts', subname: 'ServiceUnits'},
      {name:'ContractTicketPurchases', childOf: 'Contracts', subname: 'TicketPurchases'},
      {name:'Countries'},
      {name:'Currencies'},
      {name:'Departments'},
      {name:'Expenses'},
      {name:'ExpenseItems', childOf: 'Expenses', subname: 'Items'},
      {name:'ExpenseReports'},
      {name:'Holidays', childOf: 'HolidaySets', subname: 'Holidays'},
      {name:'HolidaySets'},
      {name:'InternalLocations'},
      {name:'InternalLocationWithBusinessHours'},
      {name:'InventoryItems'},
      {name:'InventoryItemSerialNumbers', childOf: 'InventoryItems', subname: 'SerialNumbers'},
      {name:'InventoryLocations'},
      {name:'InventoryTransfers'},
      {name:'Invoices'},
      {name:'InvoiceTemplates'},
      {name:'NotificationHistory'},
      {name:'Opportunities'},
      {name:'OpportunityAttachments', childOf: 'Opportunities', subname: 'Attachments'},
      {name:'OrganizationalLevel1'},
      {name:'OrganizationalLevel2'},
      {name:'OrganizationalLevelAssociations'},
      {name:'OrganizatonalResources', childOf: 'OrganizationalLevelAssociations', subname: 'Resources'},
      {name:'PaymentTerms'},
      {name:'Phases', childOf: 'Projects', subname: 'Phases'},
      {name:'PriceListMaterialCodes'},
      {name:'PriceListProducts'},
      {name:'PriceListProductTiers'},
      {name:'PriceListRoles'},
      {name:'PriceListServices'},
      {name:'PriceListServiceBundles'},
      {name:'PriceListWorkTypeModifiers'},
      {name:'Products'},
      {name:'ProductNotes', childOf: 'Products', subname: 'Notes'},
      {name:'ProductTiers', childOf: 'Products', subname: 'Tiers'},
      {name:'ProductVendors', childOf: 'Products', subname: 'Vendors'},
      {name:'Projects'},
      {name:'ProjectAttachments', childOf: 'Projects', subname: 'Attachments'},
      {name:'ProjectCharges', childOf: 'Projects', subname: 'Charges'},
      {name:'ProjectNotes', childOf: 'Projects', subname: 'Notes'},
      {name:'PurchaseApprovals'},
      {name:'PurchaseOrders'},
      {name:'PurchaseOrderItems', childOf: 'PurchaseOrders', subname: 'Items'},
      {name:'PurchaseOrderItemReceiving', childOf: 'PurchaseOrderItems', subname: 'Receiving'},
      {name:'Quotes'},
      {name:'QuoteItems', childOf: 'Quotes', subname: 'Items'},
      {name:'QuoteLocations'},
      {name:'QuoteTemplates'},
      {name:'Resources'},
      {name:'ResourceRoles'},
      {name:'ResourceRoleDepartments', childOf: 'Resources', subname: 'RoleDepartments'},
      {name:'ResourceRoleQueues', childOf: 'Resources', subname: 'RoleQueues'},
      {name:'ResourceServiceDeskRoles', childOf: 'Resources', subname: 'ServiceDeskRoles'},
      {name:'ResourceSkills', childOf: 'Resources', subname: 'Skills'},
      {name:'Roles'},
      {name:'SalesOrders', childOf: 'Opportunities', subname: 'SalesOrders'},
      {name:'Services'},
      {name:'ServiceBundles'},
      {name:'ServiceBundleServices', childOf: 'ServiceBundles', subname: 'Services'},
      {name:'ServiceCalls'},
      {name:'ServiceCallTasks', childOf: 'ServiceCalls', subname: 'Tasks'},
      {name:'ServiceCallTaskResource', childOf: 'ServiceCallTasks', subname: 'Resources'},
      {name:'ServiceCallTickets', childOf: 'ServiceCalls', subname: 'Tickets'},
      {name:'ServiceCallTicketResource', childOf: 'ServiceCallTickets', subname: 'Resources'},
      {name:'ServiceLevelAgreementResults', childOf: 'ServiceLevelAgreements', subname: 'Results'},
      {name:'ShippingTypes'},
      {name:'Skills'},
      {name:'Subscriptions'},
      {name:'SubscriptionPeriods', childOf: 'Subscriptions', subname: 'Periods'},
      {name:'Surveys'},
      {name:'SurveyResults'},
      {name:'Tasks', childOf: 'Projects', subname: 'Tasks'},
      {name:'TaskAttachments', childOf: 'Tasks', subname: 'Attachments'},
      {name:'TaskNotes', childOf: 'Tasks', subname: 'Notes'},
      {name:'TaskPredecessors', childOf: 'Tasks', subname: 'Predecessors'},
      {name:'TaskSecondaryResources', childOf: 'Tasks', subname: 'SecondaryResources'},
      {name:'Taxes'},
      {name:'TaxCategories'},
      {name:'TaxRegions'},
      {name:'ThresholdInformation'},
      {name:'Tickets'},
      {name:'TicketAdditionalConfigurationItems', childOf: 'Tickets', subname: 'AdditionalConfigurationItems'},
      {name:'TicketAdditionalContacts', childOf: 'Tickets', subname: 'AdditionalContacts'},
      {name:'TicketAttachments', childOf: 'Tickets', subname: 'Attachments'},
      {name:'TicketCategories'},
      {name:'TicketCategoryFieldDefaults', childOf: 'TicketCategories', subname: 'FieldDefaults'},
      {name:'TicketChangeRequestApprovals', childOf: 'Tickets', subname: 'ChangeRequestApprovals'},
      {name:'TicketCharges', childOf: 'Tickets', subname: 'Charges'},
      {name:'TicketChecklistItems', childOf: 'Tickets', subname: 'ChecklistItems'},
      {name:'TicketChecklistLibraries', childOf: 'Tickets', subname: 'ChecklistLibraries'},
      {name:'TicketHistory'},
      {name:'TicketNotes', childOf: 'Tickets', subname: 'Notes'},
      {name:'TicketRmaCredits', childOf: 'Tickets', subname: 'RmaCredits'},
      {name:'TicketSecondaryResources', childOf: 'Tickets', subname: 'SecondaryResources'},
      {name:'TimeEntries'},
      {name:'UserDefinedFieldDefinitions'},
      {name:'UserDefinedFieldListItems', childOf: 'UserDefinedFields', subname: 'ListItems'},//note, no parent native entity
      {name:'WebhookEventErrorLogs'},
      {name:'WorkTypeModifiers'},
      {name:'ZoneInformation'},
    ];
    this.connector = {};
  }

  /**
   * This initializes the connector methods and guarantees they used the correct global web services zone.
   * 
   * Calling init on the same instance more than once per instance has no effect and will not generate an error.
   */
  async _init(){
    if(!this.zoneInfo){
      this.zoneInfo = await this._get('/zoneInformation', {user: this.user});
      for(let entity of this.available_entities){
        
        let missingEntityErrorMsg = `No ${entity.name} parameter was provided. Please provide the ${entity.name} data.`;
        let missingIdErrorMessage = `The 'id' parameter is required. Please provide the ${entity.subname} id.`;
          
        this.connector[entity.name] = {
          parent: entity.childOf,
          isChild: entity.childOf ? true : false,

          query : async (search)=>{
            return await this._post(`/${entity.name}/query`, search);
          },

          count : async (search)=>{
            return await this._post(`/${entity.name}/query/count`, search);
          },

          get : async (id)=>{
            return await this._get(`/${entity.name}/${id}`);
          },

          update : async (toSave)=>{
            if(!toSave) throw new Error(`${missingEntityErrorMsg}`);
            return await this._patch(`/${entity.name}`, toSave);
          },

          create : async (toSave)=>{
            if(!toSave) throw new Error(`${missingEntityErrorMsg}`);
            return await this._post(`/${entity.name}`, toSave);
          },

          delete : async (id)=>{
            if(!toSave) throw new Error(`${missingIdErrorMessage}`);
            return await this._delete(`/${entity.name}/${id}`);
          },

          //missing properties set to null!
          replace : async (toSave)=>{
            if(!toSave) throw new Error(`${missingEntityErrorMsg}`);
            return await this._put(`/${entity.name}`, toSave);
          },

          info: async ()=>{
            return await this._get(`/${entity.name}/entityInformation`);
          },

          fieldInfo: async ()=>{
            return await this._get(`/${entity.name}/entityInformation/fields`);
          },

          udfInfo: async ()=>{
            return await this._get(`/${entity.name}/entityInformation/userDefinedFields`);
          },
        };

        //Adjust endpoints for child entities.
        if(entity.childOf){
          let missingParentIdErrorMsg = `${entity.name} are children of ${entity.childOf}. Please provide the id of the ${entity.childOf} entity as the first parameter.`;
          let missingEntityErrorMsg = `No ${entity.subname} was provided. Please provide the ${entity.subname} data as the second parameter.`;
          let missingIdErrorMessage = `The 'id' parameter is required. Please provide the ${entity.subname} id as the second parameter.`;
          //create, update, replace, and delete have different signatures
          this.connector[entity.name].update = async (parentId, toSave)=>{
            if(typeof parentId !== 'number') throw new Error(`${missingParentIdErrorMsg}`);
            if(!toSave) throw new Error(`${missingEntityErrorMsg}`);
            return await this._patch(`/${entity.childOf}/${parentId}/${entity.subname}`, toSave);
          };

          this.connector[entity.name].create = async (parentId, toSave)=>{
            if(typeof parentId !== 'number') throw new Error(`${missingParentIdErrorMsg}`);
            if(!toSave) throw new Error(`${missingEntityErrorMsg}`);
            return await this._post(`/${entity.childOf}/${parentId}/${entity.subname}`, toSave);
          };

          this.connector[entity.name].delete = async (parentId, id)=>{
            if(typeof parentId !== 'number') throw new Error(`${missingParentIdErrorMsg}`);
            if(id === null || typeof id === 'undefined' ) throw new Error(`${missingIdErrorMessage}`);
            return await this._delete(`/${entity.childOf}/${parentId}/${entity.subname}/${id}`);
          };

          this.connector[entity.name].replace = async (parentId, toSave)=>{
            if(typeof parentId !== 'number') throw new Error(`${missingParentIdErrorMsg}`);
            if(!toSave) throw new Error(`${missingEntityErrorMsg}`);
            return await this._put(`/${entity.childOf}/${parentId}/${entity.subname}`, toSave);
          };
        }


      }
    }
  }

  /**
   * Access the Autotask REST API. 
   * 
   * @returns the connector instance object, which has references to every
   * entity in the API. You can use each entity to perform API calls.
   * 
   * @example
   * let api = await autotask.api();
   * api.Companies.get(0);
   * api.Tickets.query( myTicketQuery );
   * api.Contacts.create( myContact );
   */
  async api(){
    if(!this.zoneInfo){
      await this._init();
    }
    return this.connector;
  }

  /** lookup/query an entity */
  async _get(endpoint, query){
    return await this._fetch('GET', endpoint, query);
  }
  /** delete an entity */
  async _delete(endpoint, query){
    return await this._fetch('DELETE', endpoint, query);
  }
  /** sparse update an entity */
  async _patch(endpoint, payload){
    return await this._fetch('PATCH', endpoint, null, payload);
  }
  /** full update an entity */
  async _put(endpoint, payload){
    return await this._fetch('PUT', endpoint, null, payload);
  }
  /** create an entity */
  async _post(endpoint, payload){
    return await this._fetch('POST', endpoint, null, payload);
  }

  /**
   * Handles HTTP API calls.
   * @param {string} method GET, POST, PUT, PATCH or DELETE
   * @param {string} endpoint beginning with a / appended to the base url
   * @param {object} query hash of query parameters, if applicable
   * @param {object} payload to be converted to JSON, if provided 
   * @param {object} opts additional options (typically omitted)
   * @param {boolean} omit_credentials omits the credentials on the request.
   */
  async _fetch(method, endpoint, query, payload, opts){
    try{
      let fetchParms = {
        method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Apigrate/1.0 autotask-restapi NodeJS connector"
        }
      };
      if(opts && opts.omit_credentials){
      } else {
        fetchParms.headers.ApiIntegrationcode = this.code;
        fetchParms.headers.UserName = this.user;
        fetchParms.headers.Secret = this.secret;
      }
      if(payload) fetchParms.body = JSON.stringify(payload)
      let querystring = query ? '?'+qs.stringify(query) : '';

      let full_url = `${this.zoneInfo ? this.zoneInfo.url : this.base_url}V${this.version}${endpoint}${querystring}`;
      debug(`${method}: ${full_url}`);
      if(payload) verbose(`  sending: ${JSON.stringify(payload)}`);

      let response = await fetch(`${full_url}`, fetchParms);
      
      if(response.ok){
        let result = await response.json();
        debug(`...ok. (HTTP ${response.status})`);
        verbose(`  received: ${JSON.stringify(result)}`);
        return result;
      } else {
        let result = await response.text();
        debug(`...error. (HTTP ${response.status})`);
        verbose(`  received: ${result}`);
       
        throw new AutotaskApiError(`HTTP ${response.status}\n${result}`);
      }
    }catch(ex){
      if(ex instanceof AutotaskApiError){
        throw ex;
      } else {
        console.error(ex);
      }
      
    }
  }


}

class AutotaskApiError extends Error {

}

exports.AutotaskRestApi = AutotaskRestApi;
exports.AutotaskApiError = AutotaskApiError;
