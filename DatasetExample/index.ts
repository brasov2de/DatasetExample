/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { DatasetExampleComponent, IDatasetExampleComponentProps } from "./DatasetExampleComponent";
import * as React from "react";
import { threadId } from "worker_threads";

export class DatasetExample implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private entityName : string  | null = null;
    private entityId : string |null = null;

    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        console.log(context.parameters.productsDataset.getTargetEntityType());
        this.entityName = (context.mode as any).contextInfo.entityTypeName;
        this.entityId = (context.mode as any).contextInfo.entityId;
        context.parameters.productsDataset.linking.addLinkedEntity({name: "diana_order", from: "diana_orderid", to: "diana_orderid", linkType: "inner", alias: "Opportunity"});           
        
        if(this.entityId!=null){
           context.parameters.productsDataset.filtering.setFilter({
           filterOperator: 0, 
           conditions: [
             {attributeName: "diana_accountid", 
             conditionOperator: 0, //equal
             value : this.entityId ,
             entityAliasName : "Opportunity"
           }
           ],
           filters: [          
           ]
         });
    }
        context.parameters.productsDataset.paging.setPageSize(500);     
        context.parameters.productsDataset.refresh();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.entityName = (context.mode as any).contextInfo.entityTypeName;
        this.entityId = (context.mode as any).contextInfo.entityId;
        const props: IDatasetExampleComponentProps = { 
            productsDataset:context.parameters.productsDataset , 
            tasksDataset: context.parameters.tasksDataset, 
            formEntityName : this.entityName,
            formEntityId : this.entityId 
        };
        return React.createElement(
            DatasetExampleComponent, props
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return { };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
