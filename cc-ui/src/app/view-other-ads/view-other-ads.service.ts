import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
export interface Advertisement {
  ad_id: number;
  date_created: Date;
  from_date: Date;
  expiry_date: Date;
  type_of_ad: string;
  container_type_id: number;
  container_type:string;
  container_size:number;
  price: number;
  status: string;
  quantity: number;
  port_id: number;
  company_id: number;
  posted_by: number;
  contents: string;
  file: string;
  port_of_departure: string;
  port_of_arrival: string;
  free_days: number;
  per_diem: number;
  pickup_charges: number;
  ad_type:string;
  port_of_ad:any;
}

 

@Injectable({
  providedIn: 'root'
})
export class ViewOtherAdsService {

  private advUrl = 'GetAllAdvertisement';
  private  coUrl= 'GetOtherCompany';
  private  nUrl= 'GetAllNegotiation';
  private  startNUrl= 'StartNegotiation';
  private contUrl='GetAllContainers';
  private typeadvurl='GetAllAdontypeofad';
  constructor(private http:HttpClient,private apiService: ApiService) { }


  getallnegotiation(companyId: string): Observable<any> {
    const url = this.apiService.getFullUrl(`${this.nUrl}?companyID=${companyId}`);
    return this.http.get(url, { responseType: 'json' });
  }
  
  getAdvertisement(ad_type:string,companyId:number): Observable<Advertisement[]> {
    const url = this.apiService.getFullUrl(`${this.advUrl}?ad_type=${ad_type}&companyId=${companyId}`);
    return this.http.get<Advertisement[]>(url);
  }

  getAdvertisementbytypeofad(ad_type:string,type_of_ad:string,companyId:number): Observable<Advertisement[]> {
    const url = this.apiService.getFullUrl(`${this.typeadvurl}?ad_type=${ad_type}&type_of_ad=${type_of_ad}&companyId=${companyId}`);
    return this.http.get<Advertisement[]>(url);
  }

  getotherCompany(companyId: string): Observable<any> {
    const url = this.apiService.getFullUrl(`${this.coUrl}?companyID=${companyId}`);
    return this.http.get(url, { responseType: 'json' });
  }

  getAllContainers(): Observable<any> {

    const url = this.apiService.getFullUrl(`${this.contUrl}`);
    return this.http.get(url);

  }

  
  StartNegotiation(ad_id: number,company_id: number, user_id: number): Observable<any> {
    const url = this.apiService.getFullUrl(`${this.startNUrl}?ad_id=${ad_id}&company_id=${company_id}&user_id=${user_id}`);
    return this.http.post(url,null);
  }
}