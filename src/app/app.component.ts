import{Component,effect,untracked}from'@angular/core';
import{DatePipe}from'@angular/common';
import{Router,RouterLink,RouterLinkActive,RouterOutlet}from'@angular/router';
import{MatToolbarModule}from'@angular/material/toolbar';
import{MatButtonModule}from'@angular/material/button';
import{MatIconModule}from'@angular/material/icon';
import{MatMenuModule}from'@angular/material/menu';
import{AppMode}from'./models';
import{AppStateService}from'./services/app-state.service';
import{AuthService}from'./services/auth.service';
import{DailyRecordService}from'./services/daily-record.service';
import{PdfReportService,ReportKind}from'./services/pdf-report.service';
@Component({selector:'app-root',standalone:true,imports:[DatePipe,RouterLink,RouterLinkActive,RouterOutlet,MatToolbarModule,MatButtonModule,MatIconModule,MatMenuModule],templateUrl:'./app.component.html',styleUrl:'./app.component.scss'})
export class AppComponent{
  readonly baseNav=[{label:'Home',icon:'⌂',route:'/dashboard'},{label:'Work',icon:'⚙',route:'/work-in-progress'},{label:'Raw',icon:'◈',route:'/raw-material'},{label:'Output',icon:'▦',route:'/daily-production'},{label:'Incoming',icon:'↓',route:'/incoming-material'}];
  get navItems(){return this.state.mode()==='head'?[...this.baseNav,{label:'Log',icon:'☷',route:'/activity-log'}]:this.baseNav}
  constructor(public state:AppStateService,public auth:AuthService,public daily:DailyRecordService,public reports:PdfReportService,private router:Router){effect(()=>{const profile=auth.profile();const date=state.selectedDate();untracked(()=>profile?daily.load(date):daily.clear())})}
  setMode(mode:AppMode):void{this.state.setMode(mode);this.router.navigateByUrl('/dashboard')}
  download(kind:ReportKind):void{void this.reports.download(kind)}
  async logout():Promise<void>{await this.auth.signOut();this.router.navigateByUrl('/login')}
}
