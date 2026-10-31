export interface WipRow{id:string;date:string;galaNumber:string;worker:string;workerUid?:string;workType:'Part Work'|'Duty'|'Absent';part:string;task:string;duty:string;customDuty:string;quantity:number|null;unit:string}
export interface PowderRow{id:string;company:string;type:string;grade:string;galas:(number|null)[]}
export interface RawMaterialRecord{id:string;date:string;rows:PowderRow[]}
export interface OutputMachineAssignment{workers:string[];workerUids?:string[];part:string;grade:string;type:string;shift:string;shiftNumber:number|null;requiredQuantity:number|null;plannedLot:number|null;counted:number|null;actual:number|null}
export interface GalaOutputCycle{id:string;galaNumber:string;machines:OutputMachineAssignment[]}
export interface ProductionSection{id:string;product:string;galaProducts:string[];workers:string[];rawGrades:string[];rawTypes:string[];sessions:string[];sessionNumbers:(number|null)[];counted:(number|null)[];actual:(number|null)[];requiredQuantities:(number|null)[];plannedLots:(number|null)[]}
export interface ProductionRecord{id:string;date:string;sections:ProductionSection[]}
export interface IncomingRow{id:string;date:string;material:string;materialType:string;quantity:number;unit:string;source?:AppMode}
export type AppMode='head'|'controller'|'worker';
export interface UserProfile{uid:string;email:string;displayName:string;role:AppMode;active:boolean}
export interface DailySchedule{date:string;work:WipRow[];powder:PowderRow[];output:(ProductionSection|GalaOutputCycle)[];incoming:IncomingRow[];createdByHead:boolean;headSavedAt?:string;workerUpdatedAt?:string}
