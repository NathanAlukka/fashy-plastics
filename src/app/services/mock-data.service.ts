import{Injectable}from'@angular/core';import{MasterDataService}from'./master-data.service';
@Injectable({providedIn:'root'})export class MockDataService{
constructor(private master:MasterDataService){}
get workers():string[]{return this.master.data().workers}get parts():string[]{return this.master.data().parts}get workTasks():string[]{return this.master.data().tasks}get duties():string[]{return this.master.data().tasks}
get tasksByPart():Record<string,string[]>{return Object.fromEntries(this.parts.map(part=>[part,this.workTasks]))}
get powderCompanies():string[]{return this.master.data().powderCompanies}get powderTypes():string[]{return this.master.data().powderTypes}get powderGrades():string[]{return this.master.data().powderGrades}
get products():string[]{return this.master.data().products}get incomingMaterials():Record<string,string[]>{return this.master.data().incomingMaterials}get materials():string[]{return Object.values(this.incomingMaterials).flat()}get powders():string[]{return this.incomingMaterials['Powder']??[]}
get wipUnits():string[]{return this.master.data().wipUnits}get incomingUnits():string[]{return this.master.data().incomingUnits}get materialTypes():string[]{return Object.keys(this.incomingMaterials)}get galas():string[]{return this.master.data().galas}
}
