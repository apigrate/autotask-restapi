# Autotask REST API NodeJS Connector

This connector simplifies interaction with the [Autotask PSA REST API](https://ww3.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/REST_API_Home.htm) for developers using NodeJS.

> Please insure you are using a LTS version of NodeJS, or at least a version that supports ES6 promises.

## Connecting to Autotask

```javascript
const {AutotaskRestApi} = require('@apigrate/autotask-rest');

const autotask = new AutotaskRestApi(
  process.env.AUTOTASK_USER, // make sure it's an API User
  process.env.AUTOTASK_SECRET, 
  process.env.AUTOTASK_INTEGRATION_CODE 
);
```

The `.api()` method returns a convenience object that has all available entities as well as API methods you can use on each entity. This provides a simple and readable syntax for interacting with the API. 

> The Autotask REST API has endpoints ("zones") distributed around the world. The connector automatically determines the correct endpoint when you invoke the `.api()` method, remembering the zone url for subsequent API calls. 

```javascript
let api = await autotask.api();
let company = await api.Companies.get(0);//Get the root company
```

## Methods Available on Each Entity
The following sections list the methods on each available entity on the connector. 

> Not all methods may be applicable for an entity. For example, most entities do not support **delete**; therefore, expect an error if you attempt to use a method in an inappropriate context.

### count

Counts entities. Use Autotask **query filter syntax** to provide criteria for the count.

```javascript
// Count companies with a CompanyName beginning with "B"
result = await api.Companies.count({
  filter:[
    {
        "op": "beginsWith",
        "field": "CompanyName",
        "value": "B"
    }
  ]
});
// result = {queryCount: 7}

// Count all the contacts in Autotask
result = await api.Contacts.count({
  filter:[
    {
        "op": "gte",
        "field": "Id",
        "value": 0
    }
  ]
});
// result = {queryCount: 1209}
```
[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Basic_Query_Calls.htm)

### get
Get a single entity by id.
```javascript
let product = await api.Products.get(232486923);
// product = { item: { id: 232486923, ...product object properties... } }
```

> Note, filter expressions using the `get` method are not supported. Use the `query` method instead.

[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Basic_Query_Calls.htm)

> Special case: To retrieve attachment base64-encoded data, you must use an attachment-specific parent-child GET request. For: 'ConfigurationItemAttachments', 'ConfigurationItemNoteAttachments', 'OpportunityAttachments', 'TaskAttachments', 'TaskNoteAttachments', 'TicketAttachments', 'TicketNoteAttachments', 'TimeEntryAttachments', you must use the following `get` syntax:

Get a entity attachment data by id
```javascript
// TicketID 129873
// AttachmentID 232486923
let ticketAttachment = await api.TicketAttachments.get(129873, 232486923);

// ticketAttachment = { items: { id: 232486923, ..., data: "iVBORw0KGgoAAAANSUhEUgAAAV8AAAC (...the rest of the base64 ecoded data)..." } }
```


### query
Query for entities matching a filter expression.
```javascript
//Find a company by name
let result = await api.Companies.query({
  filter:[
    {
        "op": "eq",
        "field": "CompanyName",
        "value": "Sirius Cybernetics Corporation "
    }
  ]
});
```

Query results take the following form (example shows the Company returned from the above query)
```json
{
  "items": [
    {
      "id": 29683616,
      "additionalAddressInformation": "",
      "address1": null,
      "address2": null,
      "alternatePhone1": "",
      "alternatePhone2": "",
      "apiVendorID": null,
      "assetValue": null,
      "billToCompanyLocationID": null,
      "billToAdditionalAddressInformation": "",
      "billingAddress1": "",
      "billingAddress2": "",
      "billToAddressToUse": 1,
      "billToAttention": "",
      "billToCity": "",
      "billToCountryID": null,
      "billToState": "",
      "billToZipCode": "",
      "city": "",
      "classification": null,
      "companyName": "Sirius Cybernetics Corporation",
      "companyNumber": "",
      "companyType": 1,
      "competitorID": null,
      "countryID": null,
      "createDate": "2016-03-30T13:10:35.563",
      "createdByResourceID": 29682885,
      "currencyID": 1,
      "fax": "",
      "impersonatorCreatorResourceID": null,
      "invoiceEmailMessageID": 1,
      "invoiceMethod": null,
      "invoiceNonContractItemsToParentCompany": null,
      "invoiceTemplateID": 102,
      "isActive": true,
      "isClientPortalActive": true,
      "isEnabledForComanaged": false,
      "isTaskFireActive": false,
      "isTaxExempt": false,
      "lastActivityDate": "2018-11-13T17:32:34",
      "lastTrackedModifiedDateTime": "2016-03-30T13:10:35.563",
      "marketSegmentID": null,
      "ownerResourceID": 29682885,
      "parentCompanyID": null,
      "phone": "555-111-1111",
      "postalCode": "",
      "quoteEmailMessageID": 1,
      "quoteTemplateID": 1,
      "sicCode": "",
      "state": "",
      "stockMarket": "",
      "stockSymbol": "",
      "surveyCompanyRating": null,
      "taxID": "",
      "taxRegionID": null,
      "territoryID": null,
      "webAddress": null,
      "userDefinedFields": []
    }
  ],
  "pageDetails": {
    "count": 1,
    "requestCount": 500,
    "prevPageUrl": null,
    "nextPageUrl": null
  }
}
```

#### Limiting fields returned on a query.

```javascript
//Find a company by name
let result = await api.Companies.query({
  filter:[
    {
        "op": "eq",
        "field": "CompanyName",
        "value": "Sirius Cybernetics Corporation "
    }
  ],
  includeFields:[
    "Id",
    "companyName",
    "city",
    "state"
  ]
});
```

Running the above query yields a response:
```json
{
  "items": [
    {
      "id": 29683616,
      "city": "",
      "companyName": "Sirius Cybernetics Corporation",
      "state": "",
      "userDefinedFields": []
    }
  ],
  "pageDetails": {
    "count": 1,
    "requestCount": 500,
    "prevPageUrl": null,
    "nextPageUrl": null
  }
}
```

> Note: when using creating filters and specifying field include conditions, field names are not case sensitive.

#### Querying User Defined Fields

It is possible to query user-defined fields by including a `"udf": true` to UDF field expressions in filter conditions. In the example below, a Company-level UDF named "Number of Employees" exists. We can query to see which companies have more than 0 employees like this:

```javascript
result = await api.Companies.query({
  filter:[
    {
        "op": "gt",
        "field": "Number of Employees",
        "value": 0,
        "udf": true
    }
  ]
});
```

[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Basic_Query_Calls.htm)

### create
Creates an entity.

The following creates **Company** using the **Companies** api.
```javascript
 let myCompany = {
      CompanyName: "Sirius Cybernetics Corporation",
      CompanyType: 3,
      Phone: '8005551212',
      OwnerResourceID: 29683995
    };;
result = await api.Companies.create(myCompany);
```
..which yields the `result`:
```json
{
  "itemId": 29683664
}
```

> Note some entities in the Autotask REST API are child entities of other entities. This doesn't affect how you query or retrieve them, but it does require you to provide the parent entity id when using the `create()`, `update()`, `replace()`, or `delete()` methods.

To illustrate the **child record** relationship, the following example will create a **ToDo** for a **Company** using the **CompanyToDos** api.
```javascript
 let myToDo = {
  ActionType: 3,
  AssignedToResourceID: 29683995,
  CompanyID: 0, 
  ActivityDescription: "Learn more about the Autotask REST API",
  StartDateTime: '2020-06-15',
  EndDateTime: '2020-06-16',
};
result = await api.CompanyToDos.create(0, myToDo);
```
Note the use of the parent id (company id = 0) as the first argument of the `create` method. The parent id is required as the first parameter of the method.
It yields the `result`:
```json
{
  "itemId": 29684378
}
```

[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Creating_Resources.htm)

### update
Updates an entity. This updates **ONLY the fields you specify**, leaving other fields on it unchanged.

> Note some entities in the Autotask REST API are child entities of other entities. This doesn't affect how you query or retrieve them, but it does require you to provide the parent entity id when using the `create()`, `update()`, `replace()`, or `delete()` methods.

[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Updating_Data_PATCH.htm)

### replace
Replaces an entity. This replaces **the entire entity**, obliterating its prior contents (except for readonly fields) and replacing it with the data you provide.

> Note some entities in the Autotask REST API are child entities of other entities. This doesn't affect how you query or retrieve them, but it does require you to provide the parent entity id when using the `create()`, `update()`, `replace()`, or `delete()` methods.

[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Updating_Data_PUT.htm)

### delete
Deletes an entity by id.

> Note some entities in the Autotask REST API are child entities of other entities. This doesn't affect how you query or retrieve them, but it does require you to provide the parent entity id when using the `create()`, `update()`, `replace()`, or `delete()` methods.

[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Delete_Operation.htm)

### info
[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Resource_Child_Access_URLs.htm#Entity)

### fieldInfo
Get metadata about a given entity's fields. This includes information about the data type; whether the field is required, read-only etc; and any valid-values that should be used.

```javascript
result = await api.AccountToDo.fieldInfo();
```

This will yield a `result`:

```json
{
  "fields": [
    {
      "name": "ActionType",
      "dataType": "integer",
      "length": 0,
      "isRequired": true,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": true,
      "picklistValues": [
        {
          "value": "0",
          "label": "Opportunity Update",
          "isDefaultValue": false,
          "sortOrder": 0,
          "parentValue": "",
          "isActive": true,
          "isSystem": true
        },
        {
          "value": "1",
          "label": "Phone Call",
          "isDefaultValue": false,
          "sortOrder": 0,
          "parentValue": "",
          "isActive": true,
          "isSystem": true
        },
        {
          "value": "2",
          "label": "Meeting",
          "isDefaultValue": false,
          "sortOrder": 0,
          "parentValue": "",
          "isActive": true,
          "isSystem": true
        },
        {
          "value": "3",
          "label": "General",
          "isDefaultValue": false,
          "sortOrder": 0,
          "parentValue": "",
          "isActive": true,
          "isSystem": true
        },
        {
          "value": "5",
          "label": "Quick Note",
          "isDefaultValue": false,
          "sortOrder": 0,
          "parentValue": "",
          "isActive": true,
          "isSystem": true
        },
        {
          "value": "29682776",
          "label": "Email",
          "isDefaultValue": false,
          "sortOrder": 0,
          "parentValue": "",
          "isActive": true,
          "isSystem": false
        }
      ],
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "ActivityDescription",
      "dataType": "string",
      "length": 32000,
      "isRequired": false,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "AssignedToResourceID",
      "dataType": "long",
      "length": 0,
      "isRequired": true,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Resource",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "CompanyID",
      "dataType": "long",
      "length": 0,
      "isRequired": true,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Company",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "CompletedDate",
      "dataType": "datetime",
      "length": 0,
      "isRequired": false,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "ContactID",
      "dataType": "long",
      "length": 0,
      "isRequired": false,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Contact",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "ContractID",
      "dataType": "long",
      "length": 0,
      "isRequired": false,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Contract",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "CreateDateTime",
      "dataType": "datetime",
      "length": 0,
      "isRequired": false,
      "isReadOnly": true,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "CreatorResourceID",
      "dataType": "long",
      "length": 0,
      "isRequired": false,
      "isReadOnly": true,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Resource",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "EndDateTime",
      "dataType": "datetime",
      "length": 0,
      "isRequired": true,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "Id",
      "dataType": "long",
      "length": 0,
      "isRequired": true,
      "isReadOnly": true,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "ImpersonatorCreatorResourceID",
      "dataType": "integer",
      "length": 0,
      "isRequired": false,
      "isReadOnly": true,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Resource",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "LastModifiedDate",
      "dataType": "datetime",
      "length": 0,
      "isRequired": false,
      "isReadOnly": true,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "OpportunityID",
      "dataType": "long",
      "length": 0,
      "isRequired": false,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Opportunity",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "StartDateTime",
      "dataType": "datetime",
      "length": 0,
      "isRequired": true,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": false,
      "referenceEntityType": "",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    },
    {
      "name": "TicketID",
      "dataType": "long",
      "length": 0,
      "isRequired": false,
      "isReadOnly": false,
      "isQueryable": true,
      "isReference": true,
      "referenceEntityType": "Ticket",
      "isPickList": false,
      "picklistValues": null,
      "picklistParentValueField": "",
      "isSupportedWebhookField": false
    }
  ]
}
```
[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Resource_Child_Access_URLs.htm#Entity)

### udfInfo
[related Autotask documentation](https://ww2.autotask.net/help/DeveloperHelp/Content/AdminSetup/2ExtensionsIntegrations/APIs/REST/API_Calls/REST_Resource_Child_Access_URLs.htm#Entity)

## Available Entities

The following is a list of all Autotask entities supported by the connector.

* zoneInformation
* ActionTypes
* AdditionalInvoiceFieldValues
* Appointments
* AttachmentInfo
* ProjectCharges
* BillingItems
* BillingItemApprovalLevels
* ChangeOrderCharges
* ChangeRequestLinks
* ChecklistLibraries
* ChecklistLibraryChecklistItems
* ClassificationIcons
* ClientPortalUsers
* ComanagedAssociations
* Companies
* CompanyAlerts
* CompanyAttachments
* CompanyLocations
* CompanyNotes
* CompanySiteConfigurations
* CompanyTeams
* CompanyToDos
* CompanyWebhook
* CompanyWebhookExcludedResource
* CompanyWebhookField
* CompanyWebhookUdfField
* ConfigurationItems
* ConfigurationItemBillingProductAssociations
* ConfigurationItemCategories
* ConfigurationItemCategoryUdfAssociations
* ConfigurationItemNotes
* ConfigurationItemTypes
* Contacts
* ContractBillingProductAssociations
* ContactGroups
* ContactGroupContacts
* ContactWebhook
* ContactWebhookExcludedResource
* ContactWebhookField
* ContactWebhookUdfField
* Contracts
* ContractBillingRules
* ContractBlocks
* ContractBlockHourFactors
* ContractCharges
* ContactExclusionBillingCodes
* ContractExclusionRoles
* ContractExclusionSets
* ContractExclusionSetExcludedRoles
* ContractExclusionSetExcludedWorkTypes
* ContractMilestones
* ContractNotes
* ContractRates
* ContractRetainers
* ContractRoleCosts
* ContractServices
* ContractServiceAdjustments
* ContractServiceBundles
* ContractServiceBundleAdjustments
* ContractServiceBundleUnits
* ContractServiceUnits
* ContractTicketPurchases
* Countries
* Currencies
* Departments
* ExpenseItems
* ExpenseReports
* Holidays
* HolidaySets
* InternalLocations
* InternalLocationWithBusinessHours
* InventoryItems
* InventoryItemSerialNumbers
* InventoryLocations
* InventoryTransfers
* Invoices
* InvoiceTemplates
* NotificationHistory
* Opportunities
* OpportunityAttachments
* OrganizationalLevel1
* OrganizationalLevel2
* OrganizationalLevelAssociations
* OrganizatonalResources
* PaymentTerms
* Phases
* PriceListMaterialCodes
* PriceListProducts
* PriceListProductTiers
* PriceListRoles
* PriceListServices
* PriceListServiceBundles
* PriceListWorkTypeModifiers
* Products
* ProductNotes
* ProductTiers
* ProductVendors
* Projects
* ProjectAttachments
* ProjectNotes
* PurchaseApprovals
* PurchaseOrders
* PurchaseOrderItems
* PurchaseOrderItemReceiving
* Quotes
* QuoteItems
* QuoteLocations
* QuoteTemplates
* Resources
* ResourceRoles
* ResourceRoleDepartments
* ResourceRoleQueues
* ResourceServiceDeskRoles
* ResourceSkills
* Roles
* SalesOrders
* Services
* ServiceBundles
* ServiceBundleServices
* ServiceCalls
* ServiceCallTasks
* ServiceCallTaskResource
* ServiceCallTickets
* ServiceCallTicketResource
* ServiceLevelAgreementResults
* ShippingTypes
* Skills
* Subscriptions
* SubscriptionPeriods
* Surveys
* SurveyResults
* Tasks
* TaskAttachments
* TaskNotes
* TaskPredecessors
* TaskSecondaryResources
* Taxes
* TaxCategories
* TaxRegions
* Tickets
* TicketAdditionalConfigurationItems
* TicketAdditionalContacts
* TicketAttachments
* TicketCategories
* TicketCategoryFieldDefaults
* TicketChangeRequestApprovals
* TicketCharges
* TicketChecklistItems
* TicketChecklistLibraries
* TicketHistory
* TicketNotes
* TicketRmaCredits
* TicketSecondaryResources
* TimeEntries
* UserDefinedFieldDefinitions
* UserDefinedFieldListItems
* WebhookEventErrorLog
* WorkTypeModifiers

## Debugging

Support for debugging is provided via the [debug]() library. Two levels of debugging are supported:

* **debug** include `autotask:restapi` in your `DEBUG` environment variable
* **verbose** include `autotask:restapi:verbose` or simply `autotask:restapi*` in your DEBUG environment variable.

