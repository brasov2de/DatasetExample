/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { DetailsList, IDetailsGroupDividerProps, IDetailsGroupRenderProps } from "@fluentui/react/lib/DetailsList";

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDatasetExampleComponentProps {
  dataset: DataSet;  
}


export const DatasetExampleComponent = React.memo(({dataset }:IDatasetExampleComponentProps ) : JSX.Element => {
      
  const [columns, setColumns] = React.useState<any[]>([]);   
  const [items, setItems] = React.useState<any[]>([]);  

  React.useEffect(() => {
    const columns = dataset.columns.sort((column1, column2) => column1.order - column2.order).map((column) => {
      return {
         name : column.displayName,
         fieldName : column.name,
         minWidth : column.visualSizeFactor, 
         key: column.name     
      }
    } );
    setColumns(columns);
    const myItems = dataset.sortedRecordIds.map((id) => {                
          const entityIn = dataset.records[id];
          const attributes = dataset.columns.map((column) => {                     
                  return  { 
                    [column.name] :  entityIn.getFormattedValue(column.name)
                  }
                      
          });
          return Object.assign({
                  key: entityIn.getRecordId(),               
                  raw : entityIn,                  
              },
              ...attributes);
          }).sort((a, b) => a.parentId < b.parentId ? -1 : a.parentId < b.parentId ? 1 : 0 );    
      setItems(myItems);
          
  }, [dataset]);  


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


