import{GALA_NUMBERS}from'./gala-data';import{INCOMING_MATERIALS}from'./incoming-data';import{WORKERS,WORK_PARTS,WORK_TASKS}from'./work-data';

export interface MasterDataSnapshot{workers:string[];parts:string[];tasks:string[];powderCompanies:string[];powderTypes:string[];powderGrades:string[];products:string[];incomingMaterials:Record<string,string[]>;wipUnits:string[];incomingUnits:string[];galas:string[]}

export const DEFAULT_MASTER_DATA:MasterDataSnapshot={
workers:[...WORKERS],parts:[...WORK_PARTS],tasks:[...WORK_TASKS],
powderCompanies:['Reliance','IOC','BL3','Basell','Luban','Marlex','Titen - Lotrene','Sabic','DOW','HALDIA'],
powderTypes:['HDPE Blow','PPCP','LLDPE','HDPE Molding','Film'],
powderGrades:['B56 H','54GB','B56 G','F46','52GB','012DB54','BL3','5831D','6200','SF 4760','5502','B56303','DMDH6400NT7','B6401','3530','B120','M26500','M180','JAF19010'],
products:['Storage Crate','Plastic Drum','Utility Bucket','Moulded Chair'],incomingMaterials:structuredClone(INCOMING_MATERIALS),wipUnits:['Bags','Counts'],incomingUnits:['Bags','Kilograms','Numbers'],galas:[...GALA_NUMBERS]
};
