/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { DetailsList, IDetailsGroupDividerProps, IDetailsGroupRenderProps } from "@fluentui/react/lib/DetailsList";

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDatasetExampleComponentProps {
  dataset: DataSet;    
  datasetName: string;
  childDataset : DataSet;
  childDatasetParentIdName : string;
}


export const DatasetExampleComponent = React.memo(({dataset, datasetName, childDataset, childDatasetParentIdName }:IDatasetExampleComponentProps ) : JSX.Element => {
      
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

  React.useEffect(() => {
    if(childDataset.loading){
      return;
    }
    const myGroups = items.reduce((prev, current, currentIndex)=>{
      if(prev.length===0 || prev[prev.length-1].parentId!==current.parentId){
        prev.push({
          key: current.parentId,   
          raw : current.parentRecord, 
          startIndex: currentIndex,
          count: 1,
          name: current.parentRecord.getFormattedValue(datasetName),
          parentId: current.parentId,
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
  
    const onItemInvoked = React.useCallback((item : any) : void => {      
      const record = childDataset.records[item.key];
      dataset.openDatasetItem(record.getNamedReference());
  }, [dataset]); 

  return (   
    <DetailsList                    
        columns={columns}
        items={items}      
        groups={groups}
        setKey="set"
        groupProps={{
          showEmptyGroups: true,    
        }}
        onItemInvoked={onItemInvoked}            
      >
    </DetailsList>
    
);
})


