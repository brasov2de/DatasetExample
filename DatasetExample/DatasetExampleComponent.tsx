/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { DetailsList, IDetailsGroupDividerProps, IDetailsGroupRenderProps } from "@fluentui/react/lib/DetailsList";
import { getgroups } from 'process';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDatasetExampleComponentProps {
  dataset: DataSet;    
  datasetName: string;
  childDataset : DataSet;
  childDatasetParentIdName : string;
  associatedDataset : DataSet;
  associatedDatasetName: string;  
  associatedDatasetRelationName: string;
}


export const DatasetExampleComponent = React.memo(({dataset, datasetName, childDataset, childDatasetParentIdName, associatedDataset, associatedDatasetName, associatedDatasetRelationName }:IDatasetExampleComponentProps ) : JSX.Element => {
      
  const [columns, setColumns] = React.useState<any[]>([]);   
  const [items, setItems] = React.useState<any[]>([]);  
  const [groups, setGroups] = React.useState<any[]>([]);  

  React.useEffect(() => {
    if(dataset.loading===true){
      return;
    }
   // const entityId = (context.mode as any).contextInfo.entityId;
   // const entityName = (context.mode as any).contextInfo.entityTypeName;    
    // childDataset.columns.find((col)=> col.alias==="lookupId");        
    if(childDatasetParentIdName!=null){           
        childDataset.filtering.setFilter({
            filterOperator: 0, 
            conditions: [
              {attributeName: childDatasetParentIdName, 
              conditionOperator: 8, //in
              value : dataset.sortedRecordIds             
            }
            ],
            filters: [          
            ]
          });                      
     childDataset.refresh();       
    } 
   
    associatedDataset.linking.addLinkedEntity({
       // name: "diana_diana_order_systemuser",
      name: associatedDatasetRelationName,
      from: associatedDataset.getTargetEntityType() +"id",
      to: associatedDataset.getTargetEntityType()+"id",
      alias: "associatedRelationship", 
      linkType: "inner"
    });

   
   (associatedDataset as any).addColumn("diana_orderid", "associatedRelationship");
   
    associatedDataset.filtering.setFilter({
      filterOperator: 0,
      conditions: [
        {
          attributeName: dataset.getTargetEntityType()+"id",
          conditionOperator: 8, //in
          value: dataset.sortedRecordIds, 
          entityAliasName: "associatedRelationship"
        }
      ],
      filters: []
    });
    associatedDataset.refresh();     
  },[dataset]);

  React.useEffect(() => {
    if(childDataset.filtering.getFilter() == null || childDataset.loading===true){
      return;
    }
    const columns = childDataset.columns.sort((column1, column2) => column1.order - column2.order).map((column) => {
      return {
         name : column.displayName,
         fieldName : column.name,
         minWidth : column.visualSizeFactor, 
         key: column.name     
      }
    } );
    setColumns(columns);
    const myItems = childDataset.sortedRecordIds.map((id) => {                
          const entityIn = childDataset.records[id];
          const attributes = childDataset.columns.map((column) => {                     
                  return  { 
                    [column.name] :  entityIn.getFormattedValue(column.name)
                  }
                      
          });
                    
          const thisParentReference = entityIn.getValue(childDatasetParentIdName) as ComponentFramework.EntityReference | undefined;
          const parentRecord = thisParentReference ? dataset.records[thisParentReference?.id.guid] : undefined
          return Object.assign({
                  key: entityIn.getRecordId(),               
                  raw : entityIn,
                  parentRecord : parentRecord, 
                  parentId : parentRecord?.getRecordId()
              },
              ...attributes);
          }).sort((a, b) => a.parentId < b.parentId ? -1 : a.parentId < b.parentId ? 1 : 0 );    
      setItems(myItems);
          
  }, [childDataset]);  
 const isAssociatedId = (record : ComponentFramework.PropertyHelper.DataSetApi.EntityRecord, parentEntityType: string,  parentId: string ) => {
    return (record.getValue(`associatedRelationship.${parentEntityType}id`) as any)?.id?.guid === parentId ||
    (record.getValue(`associatedRelationship.${parentEntityType}id`) as any)?.guid === parentId
 }

  React.useEffect(() => {
    if(childDataset.loading){
      return;
    }
    const datasetTargetEntityType = dataset.getTargetEntityType();
    const myGroups = items.reduce((prev, current, currentIndex)=>{
      if(prev.length===0 || prev[prev.length-1].parentId!==current.parentId){
        prev.push({
          key: current.parentId,   
          raw : current.parentRecord, 
          startIndex: currentIndex,
          count: 1,
          name: current.parentRecord.getFormattedValue(datasetName),
          parentId: current.parentId,
          associatedRecordIds : associatedDataset.sortedRecordIds.filter((id)=> isAssociatedId(associatedDataset.records[id], datasetTargetEntityType, current.parentId)),
          level: 0
        })
      }
      else {
        prev[prev.length-1].count = prev[prev.length-1].count+1
      }
      return prev;
    }, []);  
    setGroups(myGroups);
  }, [items]);

  React.useEffect(() => {
    const datasetTargetEntityType = dataset.getTargetEntityType();
    setGroups( groups.map((group)=> {
      return {                
        ...group,
        associatedRecordIds : associatedDataset.sortedRecordIds.filter((id)=>isAssociatedId(associatedDataset.records[id], datasetTargetEntityType, group.parentId))
      };
    }));
  }, [associatedDataset])
  
  
    const onItemInvoked = React.useCallback((item : any) : void => {      
      const record = childDataset.records[item.key];
      dataset.openDatasetItem(record.getNamedReference());
  }, [dataset]); 


  const onRenderGroupFooter =  (item : any) :  any=> {    
    return (
    <div style={{textAlign:"right", backgroundColor: "#cecece", height: "30px" }}>    
      <div>{item?.group?.associatedRecordIds.length}</div>      
    </div>
    )
       
} 

  return (   
    <DetailsList                    
        columns={columns}
        items={items}      
        groups={groups}
        setKey="set"
        groupProps={{
          showEmptyGroups: true,   
          onRenderFooter: onRenderGroupFooter 
        }}
        onItemInvoked={onItemInvoked}            
      >
    </DetailsList>
    
);
})


