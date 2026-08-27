import{Injectable}from'@angular/core';import{IncomingRow,ProductionRecord,RawMaterialRecord,WipRow}from'../models';
@Injectable({providedIn:'root'})export class StorageService{
private readonly keys={wip:'fashy_wip_records',raw:'fashy_raw_records',production:'fashy_production_records',incoming:'fashy_incoming_records',balances:'fashy_powder_balances'};
getWipRecords():WipRow[]{return this.read(this.keys.wip,[])}saveWipRecords(v:WipRow[]):void{this.write(this.keys.wip,v)}
getRawRecords():RawMaterialRecord[]{return this.read(this.keys.raw,[])}saveRawRecords(v:RawMaterialRecord[]):void{this.write(this.keys.raw,v)}
getProductionRecords():ProductionRecord[]{return this.read(this.keys.production,[])}saveProductionRecords(v:ProductionRecord[]):void{this.write(this.keys.production,v)}
getIncomingRecords():IncomingRow[]{return this.read(this.keys.incoming,[])}saveIncomingRecords(v:IncomingRow[]):void{this.write(this.keys.incoming,v)}
getPowderBalances():Record<string,number>{return this.read(this.keys.balances,{'Powder A':20,'Powder B':12,'Powder C':0,'Powder D':5})}savePowderBalances(v:Record<string,number>):void{this.write(this.keys.balances,v)}
private read<T>(k:string,f:T):T{try{const v=localStorage.getItem(k);return v?JSON.parse(v)as T:f}catch{return f}}private write<T>(k:string,v:T):void{localStorage.setItem(k,JSON.stringify(v))}
}
