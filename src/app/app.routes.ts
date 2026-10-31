import{Routes}from'@angular/router';import{DashboardComponent}from'./pages/dashboard/dashboard.component';import{DailyProductionComponent}from'./pages/daily-production/daily-production.component';import{IncomingMaterialComponent}from'./pages/incoming-material/incoming-material.component';import{RawMaterialComponent}from'./pages/raw-material/raw-material.component';import{WorkInProgressComponent}from'./pages/work-in-progress/work-in-progress.component';import{authGuard}from'./guards/auth.guard';import{loginGuard}from'./guards/login.guard';import{headGuard}from'./guards/head.guard';
export const routes:Routes=[
{path:'login',loadComponent:()=>import('./pages/login/login.component').then(module=>module.LoginComponent),canActivate:[loginGuard],title:'Sign In | Fashy Plastics'},
{path:'dashboard',component:DashboardComponent,canActivate:[authGuard],title:'Dashboard | Fashy Plastics'},
{path:'work-in-progress',component:WorkInProgressComponent,canActivate:[authGuard],title:'Work in Progress | Fashy Plastics'},
{path:'raw-material',component:RawMaterialComponent,canActivate:[authGuard],title:'Raw Material | Fashy Plastics'},
{path:'daily-production',component:DailyProductionComponent,canActivate:[authGuard],title:'Daily Production | Fashy Plastics'},
{path:'incoming-material',component:IncomingMaterialComponent,canActivate:[authGuard],title:'Incoming Material | Fashy Plastics'},
{path:'backend-status',loadComponent:()=>import('./pages/backend-status/backend-status.component').then(module=>module.BackendStatusComponent),title:'Backend Status | Fashy Plastics'},
{path:'manage-employees',loadComponent:()=>import('./pages/manage-employees/manage-employees.component').then(module=>module.ManageEmployeesComponent),canActivate:[authGuard,headGuard],title:'Manage Employees | Fashy Plastics'},
{path:'change-pin',loadComponent:()=>import('./pages/change-pin/change-pin.component').then(module=>module.ChangePinComponent),canActivate:[authGuard],title:'Change My PIN | Fashy Plastics'},
{path:'activity-log',loadComponent:()=>import('./pages/activity-log/activity-log.component').then(module=>module.ActivityLogComponent),canActivate:[authGuard,headGuard],title:'Activity Log | Fashy Plastics'},
{path:'',pathMatch:'full',redirectTo:'login'},{path:'**',redirectTo:'login'}];
