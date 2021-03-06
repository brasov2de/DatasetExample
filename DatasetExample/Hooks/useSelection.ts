import * as React from 'react';
type DataSet = ComponentFramework.PropertyTypes.DataSet;
import {Selection} from '@fluentui/react/lib/DetailsList';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSelection = (dataset: DataSet) => {       
    const [selectedCount, setSelectedCount]  = React.useState<number>(0);
    const [selection, setSelection] = React.useState(new Selection({
        onSelectionChanged: () => {
            const sel = selection.getSelection();
            const ids = sel.map((item :any) => item.key);
            dataset.setSelectedRecordIds(ids);
            setSelectedCount(ids.length);         
        }
    }));

    const onItemInvoked = React.useCallback((item : any) : void => {      
        const record = dataset.records[item.key];
        dataset.openDatasetItem(record.getNamedReference());
    }, [dataset]); 

    return {
        selection, selectedCount, 
        onItemInvoked
    };

  
}