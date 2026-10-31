import{Injectable,signal}from'@angular/core';
import{firebaseConfigured}from'../../environments/environment';
import{AppStateService}from'./app-state.service';
import{IncomingRecordService}from'./incoming-record.service';
import{OutputRecordService}from'./output-record.service';
import{RawRecordService}from'./raw-record.service';
import{WorkRecordService}from'./work-record.service';

export type ReportKind='schedule'|'result';
interface PdfLine{text:string;bold?:boolean;gap?:boolean}

@Injectable({providedIn:'root'})
export class PdfReportService{
  readonly loading=signal(false);readonly message=signal('');
  constructor(private state:AppStateService,private work:WorkRecordService,private raw:RawRecordService,private output:OutputRecordService,private incoming:IncomingRecordService){}

  async download(kind:ReportKind):Promise<void>{
    if(this.loading())return;this.loading.set(true);this.message.set('');
    try{const date=this.state.selectedDate();const lines=firebaseConfigured?await this.cloudLines(date,kind):this.localLines(date,kind);const pdf=this.createPdf(`${kind==='schedule'?'Schedule':'Result'} - ${date}`,lines);const url=URL.createObjectURL(pdf);const anchor=document.createElement('a');anchor.href=url;anchor.download=`fashy-${kind}-${date}.pdf`;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);this.message.set(`${kind==='schedule'?'Schedule':'Result'} PDF downloaded.`)}catch(error){this.message.set(error instanceof Error?error.message:'Unable to create the PDF.')}finally{this.loading.set(false);setTimeout(()=>this.message.set(''),3500)}
  }

  private async cloudLines(date:string,kind:ReportKind):Promise<PdfLine[]>{
    const[work,raw,output,incoming]=await Promise.all([this.work.load(date),this.raw.load(date),this.output.load(date),this.incoming.load(date)]);const schedule=kind==='schedule';const workRows=schedule?work.filter(row=>row.source==='head'):work;const rawRows=schedule?raw.filter(row=>row.source==='head'):raw;const outputRows=schedule?output.filter(row=>row.source==='head'):output;const incomingRows=schedule?incoming.filter(row=>row.source==='head'):incoming;return this.reportLines(kind,workRows,rawRows,outputRows,incomingRows)
  }

  private localLines(date:string,kind:ReportKind):PdfLine[]{const saved=this.state.schedule(date);if(!saved)return[{text:'No saved records were found for this date.'}];return this.reportLines(kind,saved.work,saved.powder,saved.output,saved.incoming)}

  private reportLines(kind:ReportKind,work:any[],raw:any[],output:any[],incoming:any[]):PdfLine[]{
    const result=kind==='result';const lines:PdfLine[]=[];
    this.section(lines,'WORK');lines.push({text:result?'No | Gala | Worker | Part / Duty | Task | Quantity | Unit':'No | Gala | Worker | Part / Duty | Task',bold:true});work.forEach((row,index)=>lines.push({text:result?`${index+1} | ${this.v(row.galaNumber)} | ${this.v(row.worker)} | ${this.v(row.part)} | ${this.v(row.task==='Other'?row.customDuty:row.task)} | ${this.v(row.quantity)} | ${this.v(row.unit)}`:`${index+1} | ${this.v(row.galaNumber)} | ${this.v(row.worker)} | ${this.v(row.part)} | ${this.v(row.task==='Other'?row.customDuty:row.task)}`}));if(!work.length)lines.push({text:'No saved Work rows.'});
    this.section(lines,'RAW MATERIAL');lines.push({text:result?'No | Company | Type | Grade | G1 | G2 | G3 | G4 | G5 | G6':'No | Company | Type | Grade',bold:true});raw.forEach((row,index)=>lines.push({text:result?`${index+1} | ${this.v(row.company)} | ${this.v(row.type)} | ${this.v(row.grade)} | ${(row.galas??[]).map((value:unknown)=>this.v(value)).join(' | ')}`:`${index+1} | ${this.v(row.company)} | ${this.v(row.type)} | ${this.v(row.grade)}`}));if(!raw.length)lines.push({text:'No saved Raw Material rows.'});
    this.section(lines,'OUTPUT');output.forEach((cycle,cycleIndex)=>{if(Array.isArray(cycle.machines)){lines.push({text:`Gala ${cycle.galaNumber} - Cycle ${cycleIndex+1}`,bold:true});lines.push({text:result?'Machine | Part | Workers | Grade / Type | Shift / no. | Required | Lot | Count | Actual':'Machine | Part | Workers | Grade / Type | Shift / no. | Required | Planned lot',bold:true});cycle.machines.forEach((machine:any,machineIndex:number)=>{const base=`${machineIndex+1} | ${this.v(machine.part)} | ${this.v(machine.workers?.join(', '))} | ${this.v(machine.grade)} / ${this.v(machine.type)} | ${this.v(machine.shift)} / ${this.v(machine.shiftNumber)} | ${this.v(machine.requiredQuantity)} | ${this.v(machine.plannedLot)}`;lines.push({text:result?`${base} | ${this.v(machine.counted)} | ${this.v(machine.actual)}`:base})});return}lines.push({text:`Legacy cycle ${cycleIndex+1}`,bold:true});for(let index=0;index<6;index++){const values=[cycle.galaProducts?.[index],cycle.workers?.[index],cycle.rawGrades?.[index],cycle.rawTypes?.[index],cycle.sessions?.[index],cycle.sessionNumbers?.[index],cycle.requiredQuantities?.[index],cycle.plannedLots?.[index],cycle.counted?.[index],cycle.actual?.[index]];if(values.every(value=>value===null||value===undefined||value===''))continue;const base=`G${index+1} | ${this.v(values[0])} | ${this.v(values[1])} | ${this.v(values[2])} / ${this.v(values[3])} | ${this.v(values[4])} / ${this.v(values[5])} | ${this.v(values[6])} | ${this.v(values[7])}`;lines.push({text:result?`${base} | ${this.v(values[8])} | ${this.v(values[9])}`:base})}});if(!output.length)lines.push({text:'No saved Output cycles.'});
    this.section(lines,'INCOMING MATERIAL');lines.push({text:result?'No | Material type | Material name | Quantity | Unit':'No | Material type | Material name',bold:true});incoming.forEach((row,index)=>lines.push({text:result?`${index+1} | ${this.v(row.materialType)} | ${this.v(row.material)} | ${this.v(row.quantity)} | ${this.v(row.unit)}`:`${index+1} | ${this.v(row.materialType)} | ${this.v(row.material)}`}));if(!incoming.length)lines.push({text:'No saved Incoming Material rows.'});return lines
  }

  private section(lines:PdfLine[],title:string):void{lines.push({text:title,bold:true,gap:true})}
  private v(value:unknown):string{return value===null||value===undefined||value===''?'-':String(value)}

  private createPdf(title:string,source:PdfLine[]):Blob{
    const wrapped:PdfLine[]=[];for(const line of source){if(line.gap)wrapped.push({text:'',gap:true});const chunks=this.wrap(this.ascii(line.text),104);chunks.forEach(text=>wrapped.push({text,bold:line.bold}))}const perPage=48;const pages:PdfLine[][]=[];for(let index=0;index<wrapped.length;index+=perPage)pages.push(wrapped.slice(index,index+perPage));if(!pages.length)pages.push([]);const objects:string[]=[];const regular=3+pages.length*2,bold=regular+1;objects[0]='<< /Type /Catalog /Pages 2 0 R >>';const kids=pages.map((_,index)=>`${3+index*2} 0 R`).join(' ');objects[1]=`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;pages.forEach((page,index)=>{const pageObject=3+index*2,streamObject=pageObject+1;objects[pageObject-1]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${streamObject} 0 R >>`;let y=750;const commands=[`BT /F2 16 Tf 42 ${y} Td (${this.escape(this.ascii(title))}) Tj ET`,`BT /F1 8 Tf 470 ${y} Td (Page ${index+1} of ${pages.length}) Tj ET`];y-=26;for(const line of page){commands.push(`BT /${line.bold?'F2':'F1'} ${line.bold?'9':'8'} Tf 42 ${y} Td (${this.escape(line.text)}) Tj ET`);y-=14}const stream=commands.join('\n');objects[streamObject-1]=`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`});objects[regular-1]='<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';objects[bold-1]='<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((object,index)=>{offsets[index+1]=pdf.length;pdf+=`${index+1} 0 obj\n${object}\nendobj\n`});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let index=1;index<=objects.length;index++)pdf+=`${String(offsets[index]).padStart(10,'0')} 00000 n \n`;pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return new Blob([pdf],{type:'application/pdf'})
  }

  private wrap(text:string,width:number):string[]{if(text.length<=width)return[text];const result:string[]=[];let remaining=text;while(remaining.length>width){let split=remaining.lastIndexOf(' ',width);if(split<width/2)split=width;result.push(remaining.slice(0,split));remaining=remaining.slice(split).trimStart()}result.push(remaining);return result}
  private ascii(value:string):string{return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'-')}
  private escape(value:string):string{return value.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
}
