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
   * @param {string} options.base_url the REST API base url. (Default https://webservices2.autotask.net/ATServicesRest)
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
    this.base_url = `https://webservices2.autotask.net/ATServicesRest`; //As returned by zoneInformation.url
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
      {name:'BillingItems'},
      {name:'BillingItemApprovalLevels'},
      {name:'ChangeOrderCharges'},
      {name:'ChangeRequestLinks'},
      {name:'ChecklistLibraries'},
      {name:'ChecklistLibraryChecklistItems'},
      {name:'ClassificationIcons'},
      {name:'ClientPortalUsers'},
      {name:'ComanagedAssociations'},
      {name:'Companies'},
      {name:'CompanyAlerts'},
      {name:'CompanyAttachments'},
      {name:'CompanyLocations'},
      {name:'CompanyNotes'},
      {name:'CompanySiteConfigurations'},
      {name:'CompanyTeams'},
      {name:'CompanyToDos'},
      {name:'CompanyWebhook'},
      {name:'CompanyWebhookExcludedResource'},
      {name:'CompanyWebhookField'},
      {name:'CompanyWebhookUdfField'},
      {name:'ConfigurationItems'},
      {name:'ConfigurationItemBillingProductAssociations'},
      {name:'ConfigurationItemCategories'},
      {name:'ConfigurationItemCategoryUdfAssociations'},
      {name:'ConfigurationItemNotes'},
      {name:'ConfigurationItemTypes'},
      {name:'Contacts'},
      {name:'ContractBillingProductAssociations'},
      {name:'ContactGroups'},
      {name:'ContactGroupContacts'},
      {name:'ContactWebhook'},
      {name:'ContactWebhookExcludedResource'},
      {name:'ContactWebhookField'},
      {name:'ContactWebhookUdfField'},
      {name:'Contracts'},
      {name:'ContractBillingRules'},
      {name:'ContractBlocks'},
      {name:'ContractBlockHourFactors'},
      {name:'ContractCharges'},
      {name:'ContactExclusionBillingCodes'},
      {name:'ContractExclusionRoles'},
      {name:'ContractExclusionSets'},
      {name:'ContractExclusionSetExcludedRoles'},
      {name:'ContractExclusionSetExcludedWorkTypes'},
      {name:'ContractMilestones'},
      {name:'ContractNotes'},
      {name:'ContractRates'},
      {name:'ContractRetainers'},
      {name:'ContractRoleCosts'},
      {name:'ContractServices'},
      {name:'ContractServiceAdjustments'},
      {name:'ContractServiceBundles'},
      {name:'ContractServiceBundleAdjustments'},
      {name:'ContractServiceBundleUnits'},
      {name:'ContractServiceUnits'},
      {name:'ContractTicketPurchases'},
      {name:'Countries'},
      {name:'Currencies'},
      {name:'Departments'},
      {name:'ExpenseItems'},
      {name:'ExpenseReports'},
      {name:'Holidays'},
      {name:'HolidaySets'},
      {name:'InternalLocations'},
      {name:'InternalLocationWithBusinessHours'},
      {name:'InventoryItems'},
      {name:'InventoryItemSerialNumbers'},
      {name:'InventoryLocations'},
      {name:'InventoryTransfers'},
      {name:'Invoices'},
      {name:'InvoiceTemplates'},
      {name:'NotificationHistory'},
      {name:'Opportunities'},
      {name:'OpportunityAttachments'},
      {name:'OrganizationalLevel1'},
      {name:'OrganizationalLevel2'},
      {name:'OrganizationalLevelAssociations'},
      {name:'OrganizatonalResources'},
      {name:'PaymentTerms'},
      {name:'Phases'},
      {name:'PriceListMaterialCodes'},
      {name:'PriceListProducts'},
      {name:'PriceListProductTiers'},
      {name:'PriceListRoles'},
      {name:'PriceListServices'},
      {name:'PriceListServiceBundles'},
      {name:'PriceListWorkTypeModifiers'},
      {name:'Products'},
      {name:'ProductNotes'},
      {name:'ProductTiers'},
      {name:'ProductVendors'},
      {name:'Projects'},
      {name:'ProjectAttachments'},
      {name:'ProjectNotes'},
      {name:'PurchaseApprovals'},
      {name:'PurchaseOrders'},
      {name:'PurchaseOrderItems'},
      {name:'PurchaseOrderItemReceiving'},
      {name:'Quotes'},
      {name:'QuoteItems'},
      {name:'QuoteLocations'},
      {name:'QuoteTemplates'},
      {name:'Resources'},
      {name:'ResourceRoles'},
      {name:'ResourceRoleDepartments'},
      {name:'ResourceRoleQueues'},
      {name:'ResourceServiceDeskRoles'},
      {name:'ResourceSkills'},
      {name:'Roles'},
      {name:'SalesOrders'},
      {name:'Services'},
      {name:'ServiceBundles'},
      {name:'ServiceBundleServices'},
      {name:'ServiceCalls'},
      {name:'ServiceCallTasks'},
      {name:'ServiceCallTaskResource'},
      {name:'ServiceCallTickets'},
      {name:'ServiceCallTicketResource'},
      {name:'ServiceLevelAgreementResults'},
      {name:'ShippingTypes'},
      {name:'Skills'},
      {name:'Subscriptions'},
      {name:'SubscriptionPeriods'},
      {name:'Surveys'},
      {name:'SurveyResults'},
      {name:'Tasks'},
      {name:'TaskAttachments'},
      {name:'TaskNotes'},
      {name:'TaskPredecessors'},
      {name:'TaskSecondaryResources'},
      {name:'Taxes'},
      {name:'TaxCategories'},
      {name:'TaxRegions'},
      {name:'Tickets'},
      {name:'TicketAdditionalConfigurationItems'},
      {name:'TicketAdditionalContacts'},
      {name:'TicketAttachments'},
      {name:'TicketCategories'},
      {name:'TicketCategoryFieldDefaults'},
      {name:'TicketChangeRequestApprovals'},
      {name:'TicketCharges'},
      {name:'TicketChecklistItems'},
      {name:'TicketChecklistLibraries'},
      {name:'TicketHistory'},
      {name:'TicketNotes'},
      {name:'TicketRmaCredits'},
      {name:'TicketSecondaryResources'},
      {name:'TimeEntries'},
      {name:'UserDefinedFieldDefinitions'},
      {name:'UserDefinedFieldListItems'},
      {name:'WebhookEventErrorLog'},
      {name:'WorkTypeModifiers'},
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
        
        this.connector[entity.name] = {
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
            return await this._patch(`/${entity.name}`, toSave);
          },

          create : async (toSave)=>{
            return await this._post(`/${entity.name}`, toSave);
          },

          //missing properties set to null!
          replace : async (toSave)=>{
            return await this._put(`/${entity.name}`, toSave);
          },

          info : async ()=>{
            return await this._get(`/${entity.name}/entityInformation`);
          },

          fieldInfo: async ()=>{
            return await this._get(`/${entity.name}/entityInformation/fields`);
          },

          udfInfo: async ()=>{
            return await this._get(`/${entity.name}/entityInformation/userDefinedFields`);
          },
        };
      }
    }
  }

  /**
   * Access the Autotask REST API. 
   * 
   * @returns the connector instance, which has references to every
   * entity in the API. You can use each entity to perform API calls.
   * 
   * @example
   * let api = autotask.api();
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
      let querystring = query ? qs.stringify(query) : '';

      let full_url = `${this.zoneInfo ? this.zoneInfo.url : this.base_url}/V${this.version}${endpoint}?${querystring}`;
      debug(`${method}: ${full_url}`);

      let response = await fetch(`${full_url}`, fetchParms);
      
      let result = await response.json();
      if(response.ok){
        debug(`...ok. (HTTP ${response.status})`);
      
        verbose(`result: ${JSON.stringify(result)}`);
        return result;
      } else {
        debug(`...error. (HTTP ${response.status})`);

        verbose(`result: ${JSON.stringify(result)}`);
        return result;
      }
    }catch(ex){
      console.error(ex);
    }
  }


}

class AutotaskApiError extends Error {

}

exports.AutotaskRestApi = AutotaskRestApi;
exports.AutotaskApiError = AutotaskApiError;
