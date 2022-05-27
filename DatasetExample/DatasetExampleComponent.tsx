/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { DetailsList, IDetailsGroupDividerProps, IDetailsGroupRenderProps } from "@fluentui/react/lib/DetailsList";
import { useSelection } from './Hooks/useSelection';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { ActionButton } from './ActionButton';
import { IRenderFunction } from '@fluentui/utilities/lib/IRenderFunction';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDatasetExampleComponentProps {
  productsDataset: DataSet;  
  tasksDataset: DataSet;
  formEntityName : string | null;
  formEntityId : string | null;
}


export const DatasetExampleComponent = React.memo(({productsDataset, tasksDataset, formEntityName, formEntityId }:IDatasetExampleComponentProps ) : JSX.Element => {
      

  const [columns, setColumns] = React.useState([]);   
  const [items, setItems] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);

  React.useEffect(() => {
    if(productsDataset.loading){
      return;
    }
    const columns = productsDataset.columns.sort((column1, column2) => column1.order - column2.order).map((column) => {
      return {
         name : column.displayName,
         fieldName : column.name,
         minWidth : column.visualSizeFactor, 
         key: column.name     
      }
    } );
    const myItems = productsDataset.sortedRecordIds.map((id) => {                
          const entityIn = productsDataset.records[id];
          const attributes = productsDataset.columns.map((column) => {                     
                  return  { 
                    [column.name] :  entityIn.getFormattedValue(column.name)
                  }
                      
          });
          return Object.assign({
                  key: entityIn.getRecordId(),
                  parentId: (entityIn.getValue("diana_orderid") as ComponentFramework.EntityReference | undefined)?.id.guid,
                  raw : entityIn,                  
              },
              ...attributes);
          }).sort((a, b) => a.parentId < b.parentId ? -1 : a.parentId < b.parentId ? 1 : 0 );    
      setItems(myItems);
     
      
  }, [productsDataset]);  

  React.useEffect(() => {
    if(productsDataset.loading){
      return;
    }
    const myGroups = items.reduce((prev, current, currentIndex)=>{
      if(prev.length===0 || prev[prev.length-1].parentId!==current.parentId){
        prev.push({
          key: current.parentId,   
          raw : current, 
          startIndex: currentIndex,
          count: 1,
          name: current.raw.getFormattedValue("diana_orderid"),
          parentId: current.parentId,
          tasks: tasksDataset.sortedRecordIds.filter((taskId)=>(tasksDataset.records[taskId].getValue("diana_orderid") as ComponentFramework.EntityReference | undefined)?.id.guid === current.parentId),
         // children :  groupItems,
          level: 0
        })
      }
      else {
        prev[prev.length-1].count = prev[prev.length-1].count+1
      }
      return prev;
    }, []);  
    setGroups(myGroups);
  }, [items]) 

  const {selection, selectedCount, onItemInvoked} = useSelection(productsDataset);


  const onRenderGroupFooter =  (item : any) :  any=> {
    
      return (
      <div style={{textAlign:"right", backgroundColor: "#cecece", height: "30px" }}>
      <span>{item?.group?.tasks?.length > 0 ? `Actions for ${item.group.name}: ` : "---"}</span>
        {item?.group?.tasks.length>0 ? item.group.tasks.map((task : any) => {
          return (            
            <ActionButton key={`task${task}`}  datasetTasks={tasksDataset} taskid={task}></ActionButton>
            )
        }) : <ActionButton key={`taskNew`}  datasetTasks={tasksDataset} taskid={undefined}></ActionButton>
      }
      </div>)
         
  } 
  


  return (
    <MarqueeSelection selection={selection}>
    <DetailsList                    
        columns={columns}
        items={items}
        groups={groups}
        setKey="set"
        groupProps={{
          showEmptyGroups: true,
          onRenderFooter: onRenderGroupFooter
        }}        
        selection={selection}
        onItemInvoked={onItemInvoked}        
      >
    </DetailsList>
    </MarqueeSelection>
);
})


