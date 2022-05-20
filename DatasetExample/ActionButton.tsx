/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IActionButtonProps{       
    datasetTasks : DataSet;
    taskid ?: string;
}

export const ActionButton = ({ datasetTasks, taskid}:IActionButtonProps ) : JSX.Element => {

    const [command, setCommand] = React.useState<any>();
  

    React.useEffect(()=>{      
        (datasetTasks as any).retrieveRecordCommand(taskid ? [taskid] : []).then((commands:any)=>{       
            const c = commands.find((c:any) => (c.commandId as string).startsWith( "AddNote!"));
            if(c){
                setCommand(c);
            
            }
            })
       
    }, [taskid]);

    const title = taskid!=null ? (datasetTasks.records[taskid]?.getValue("diana_name") as string) : "";
 
    return  (
    <Icon title={title}  iconName="Page" onClick={command?.execute} style={{color: taskid==null ? "red": "black", cursor: "pointer"}}>        
    </Icon>
    );
}