import{inject}from'@angular/core';import{CanActivateFn,Router}from'@angular/router';import{AuthService}from'../services/auth.service';
export const headGuard:CanActivateFn=async()=>{const auth=inject(AuthService);if(!auth.enabled)return true;await auth.whenReady();return auth.profile()?.active&&auth.profile()?.role==='head'?true:inject(Router).createUrlTree(['/dashboard'])};
