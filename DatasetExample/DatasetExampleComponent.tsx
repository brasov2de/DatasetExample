/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { DetailsList, IDetailsGroupDividerProps, IDetailsGroupRenderProps } from "@fluentui/react/lib/DetailsList";

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDatasetExampleComponentProps {
  dataset: DataSet;    
  childDataset : DataSet;
}


export const DatasetExampleComponent = React.memo(({dataset, childDataset }:IDatasetExampleComponentProps ) : JSX.Element => {
      
  const [columns, setColumns] = React.useState<any[]>([]);   
  const [items, setItems] = React.useState<any[]>([]);  

  React.useEffect(() => {
    if(dataset.loading===true){
      return;
    }
   // const entityId = (context.mode as any).contextInfo.entityId;
   // const entityName = (context.mode as any).contextInfo.entityTypeName;    
    const parentId = childDataset.columns.find((col)=> col.alias==="lookupId");        
    if(parentId!=null){           
        childDataset.filtering.setFilter({
            filterOperator: 0, 
            conditions: [
              {attributeName: parentId?.name, 
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
          return Object.assign({
                  key: entityIn.getRecordId(),               
                  raw : entityIn,                  
              },
              ...attributes);
          })
      setItems(myItems);
          
  }, [childDataset]);  


  return (   
    <DetailsList                    
        columns={columns}
        items={items}      
        setKey="set"
        groupProps={{
          showEmptyGroups: true,    
        }}            
      >
    </DetailsList>
    
);
})


