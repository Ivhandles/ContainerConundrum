import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../session.service';
import { ForecastingTableService } from '../forecasting/forecasting-table-view/forecasting-table-view.service';
import * as XLSX from 'xlsx';
import { SharedServiceService } from '../shared-service.service';
import { distinctUntilChanged, filter, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, combineLatest, forkJoin, of } from 'rxjs';
import { CarrierServiceService } from '../carrier-service/carrier-service.service';

@Component({
  selector: 'app-optimized-view',
  templateUrl: './optimized-view.component.html',
  styleUrls: ['./optimized-view.component.css']
})
export class OptimizedViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement', { static: true }) mapElement: ElementRef | undefined;
  map: google.maps.Map | undefined;
  port_list: any[] = [];
  companyId!: number;
  Einv: Inventory[] = [];
  receivedportCode: any;
  receivedcontainerType: any;
  receivedcontainerSize: any;
  inventory_list_by_companyId: Inventory[] = [];
  filteredInventoryList: Inventory[] = [];
  portCodeReceived = false;
  containerTypeReceived = false;
  containerSizeReceived = false;
  service_name?: any;
  public company_id?: number;
  service_id?:number;
  services: any[] = [];
  router: any;
  public carrierServices: any[] = [];
  matchingData: any[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private forecastingtableService: ForecastingTableService,
    private sharedService: SharedServiceService,
    private carrierservice:CarrierServiceService
  ) {}

 

  ngOnInit(): void {
    
   
    this.loadInitialData();
   
   
    combineLatest([
      this.sharedService.selected_port,
      this.sharedService.selectedContainerType$,
      this.sharedService.selectedContainerSize$,
    ])
    .pipe(
      filter(([portCode, containerType, containerSize]) => 
        portCode !== undefined && containerType !== undefined && containerSize !== undefined
      )
    )
    .subscribe(([portCode, containerType, containerSize]) => {
      // Assign the values
      debugger
      this.receivedportCode = portCode;
      this.receivedcontainerType = containerType;
      this.receivedcontainerSize = containerSize;
    
      this.portCodeReceived = true;
      this.containerTypeReceived = true;
      this.containerSizeReceived = true;
    
      // Check if all values are received before calling filterData
      if (
        this.portCodeReceived &&
        this.containerTypeReceived &&
        this.containerSizeReceived
      ) {
        this.filterData(this.receivedportCode, this.receivedcontainerType, this.receivedcontainerSize);
      }
    });

    
   
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadInitialData(): void {
    this.sessionService.getCompanyId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (companyId: number) => {
          this.companyId = companyId;
          this.loadPortList(); // Load port list after getting company ID
        },
        (error: any) => {
          console.error('Error retrieving company ID:', error);
        }
      );
  }

  private loadPortList(): void {
    this.forecastingtableService.getAllPorts().subscribe(
      (data: any) => {
        this.port_list = data;
        console.log("PortData", this.port_list);
        this.loadInventoryData(); // Load inventory data after getting port list
      },
      (error: any) => {
        console.error('Error retrieving port list:', error);
      }
    );
  }

  private loadInventoryData(): void {
    this.forecastingtableService.getInventoryByIdCID(this.companyId).subscribe(
      (data: Inventory[]) => {
        this.inventory_list_by_companyId = data;
        console.log('Inventory list by company id is fetched:', this.inventory_list_by_companyId);
        this.filteredInventoryList = this.inventory_list_by_companyId;

        // Call filterData here after loading all data
        this.filterData(this.receivedportCode, this.receivedcontainerType, this.receivedcontainerSize);
      },
      (error: any) => {
        console.log('Inventory loading error:', error);
      }
    );
  }
  
  filterData(receivedportCode: string, receivedcontainerType: string, receivedcontainerSize: string): void {
    
    console.log('Searching for Port Code:', receivedportCode);
    
    this.forecastingtableService.getAllPorts().subscribe(
      (data: any) => {
        this.port_list = data;
        console.log("PortData",this.port_list)
      },
      (error: any) => {
        console.error('Error retrieving company ID:', error);
      }
    );
    // Use Array.find() to find the matching port_id
    const matchedPort = this.port_list.find((port: any) => port.port_code === receivedportCode);
  
    if (matchedPort) {
        const matchedPortId = matchedPort.port_id;
        console.log('Matched Port ID:', matchedPortId);
        // Filter the inventory data based on the matchedPortId
        this.forecastingtableService.getInventoryByIdCID(this.companyId).subscribe(
          (data: Inventory[]) => {
            this.inventory_list_by_companyId = data;
            console.log('inv list by company id is fetched:', this.inventory_list_by_companyId);
            
            this.filteredInventoryList = this.inventory_list_by_companyId;
          },
          (error: any) => {
            console.log('inv loading error:', error);
          }
        );
        const filteredport = this.inventory_list_by_companyId.filter((inventory: Inventory) => {
            return inventory.port_id != matchedPortId;
        });

        console.log('Filtered Inventory:', filteredport);
        const filteredInventoryByContainerType = filteredport.filter((inventory: Inventory) => {
            return inventory.container_type === receivedcontainerType;
        });

        console.log('Filtered Inventory by Container Type:', filteredInventoryByContainerType);
        const containerSizeInt = parseInt(receivedcontainerSize, 10);
        const filteredInventoryByContainerSize = filteredInventoryByContainerType.filter((inventory: Inventory) => {
            return parseInt(inventory.container_size, 10) === containerSizeInt;
        });

        console.log('Filtered Inventory by Container Size:', filteredInventoryByContainerSize);

        // Filter inventory data where surplus is greater than deficit
        const filteredInventoryWithSurplus = filteredInventoryByContainerSize.filter((inventory: Inventory) => {
            const surplus = inventory.surplus;
            const deficit = inventory.deficit;
            return surplus > deficit; 
        });

        console.log('Filtered Inventory with Surplus > Deficit:', filteredInventoryWithSurplus);

    } else {
        console.log('No matching port found.');
    }
    // this.filterservices(receivedportCode);
}

// filterservices(portCode: string) {
//   console.log("Port code received inside filterservices", portCode);
//   const allData: any[] = [];
//   const matchingGroupedData: { serviceId: string, group: any[] }[] = [];

//   // Fetch the initial service names
//   this.carrierservice.getCarrierServicesbyCId(this.companyId).pipe(
//       mergeMap((data: any[]) => {
//           // Create an array of observables for each service name
//           const observables = data.map(service => {
//               const serviceId = service.service_id;
//               const serviceName = service.service_name;
//               console.log("get service by cid", serviceName);
//               // Fetch data for each service name and return the observable
//               return this.carrierservice.getCarrierServicesbySName(serviceName).pipe(
//                   map((serviceData: any[]) => {
//                       // Combine the service ID, service name, and its data into an object
//                       return { serviceId, serviceName, serviceData };
//                   })
//               );
//           });

//           // Use forkJoin to combine the results of all observables into a single observable
//           return forkJoin(observables);
//       })
//   ).subscribe(
//       (results: { serviceId: string, serviceName: string, serviceData: any[] }[]) => {
//           results.forEach(result => {

//               allData.push(...result.serviceData);
//           });

//           // Group data by service_id
//           const groupedData = allData.reduce((acc, item) => {
//               const serviceId = item.service_id;
//               if (!acc[serviceId]) {
//                   acc[serviceId] = [];
//               }
//               acc[serviceId].push(item);
//               return acc;
//           }, {});

//           // The 'groupedData' object now contains arrays of data grouped by service_id
//           console.log("Grouped Data:", groupedData);

//           // Check if the 'portCode' matches in any of the grouped data and store matching groups
//           for (const serviceId in groupedData) {
//               if (groupedData.hasOwnProperty(serviceId)) {
//                   const group = groupedData[serviceId];
//                   if (group.some((item: { port_code: string; }) => item.port_code === portCode)) {
//                       // Find the corresponding service name based on serviceId
//                       const serviceName = results.find(result => result.serviceId === serviceId)?.serviceName || '';
//                       // Include service ID, service name, and group data in the matchingGroupedData
//                       matchingGroupedData.push({ serviceId, group });
//                   }
//               }
//           }

//           if (matchingGroupedData.length > 0) {
//               // Send the serviceId values to the backend
//             // Convert serviceId values to numbers
//             const serviceIdsToSend: string[] = matchingGroupedData.map(item => item.serviceId);
//         debugger
//             // Call the backend API to fetch service names
//             this.carrierservice.getServicesbySId(serviceIdsToSend).subscribe(
//               (serviceNames: string[]) => {
//                 // Handle the response data here (serviceNames)
//                 console.log("Service Names:", serviceNames);
                
//                 // Now you have the service names from the backend.
//               },
//               (error: any) => {
//                 console.error("Error while fetching service names", error);
//                 // Handle the error as needed.
//               }
//             );
              
//               this.matchingData = matchingGroupedData;
//               console.log("assign values", this.matchingData);
//               // The 'matchingGroupedData' variable contains the grouped data with a matching 'portCode'
//               console.log("Matching Grouped Data:", matchingGroupedData);
//           } else {
//               console.log("No matching grouped data found for the port code.");
//           }

//           const portGroups: { [key: string]: string[] }[] = [];

//           // Iterate through each group in matchingGroupedData
//           matchingGroupedData.forEach(group => {
//               const portCodes = group.group.map((item: any) => item.port_code);
//               const groupPorts: { [key: string]: string[] } = {};
//               // Iterate through each port_code in the group
//               portCodes.forEach(portCode => {
//                   // Find the corresponding port in the port_list array
//                   const port = this.port_list.find((item: any) => item.port_code === portCode);
//                   if (port) {
//                       const latitude = port.latitude;
//                       const longitude = port.longitude;
//                       // Group the ports by their latitude and longitude for this group
//                       const key = `${latitude.toFixed(2)}°,${longitude.toFixed(2)}°`;
//                       if (!groupPorts[key]) {
//                           groupPorts[key] = [];
//                       }
//                       groupPorts[key].push(port.port_name);
//                   }
//               });
//               portGroups.push(groupPorts);
//           });

//           console.log(portGroups);

//       },
//       error => {
//           console.warn("Error while fetching carrier services by service names", error);
//       }
//   );
// }






  ngAfterViewInit() {
    this.initMap();
  }
  

 
  

  initMap() {
    if (this.mapElement) {
      const mapElement = this.mapElement.nativeElement;
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 10,
        mapId: '2b03aff8b2fb72a3'
      };

      this.map = new google.maps.Map(mapElement, mapOptions);
    }
  }

  onPortSelected(selectedPortName: string) {
    if (selectedPortName === 'Select Port') {
      window.location.reload();

      if (this.map) {
        this.map.setCenter({ lat: 0, lng: 0 });
        this.map.setZoom(3);
      }
    } else {
      const selectedPort = this.port_list.find((port: { port_name: string; }) => port.port_name === selectedPortName);

      if (selectedPort && this.map) {
        const latitude = +selectedPort.latitude;
        const longitude = +selectedPort.longitude;

        this.map.setCenter({ lat: latitude, lng: longitude });
        this.map.setZoom(10);
      }
    }
  }

  onExport() {
    const worksheetName = 'Inventory';
    const excelFileName = 'Inventory.xlsx';
    const header = ['Port Name', 'Container Type', 'Container Size', 'Available', 'Surplus', 'Deficit'];
    const data = this.Einv.map((iv) => [iv.port_name, iv.container_type, iv.container_size, iv.available, iv.surplus, iv.deficit]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const columnWidths = [
      { wch: 15 },
      { wch: 15 },
    ];

    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    XLSX.writeFile(workbook, excelFileName);
  }

  getPortName(portId: number): string {
    const port = this.port_list.find((p: { port_id: number, port_name: string }) => p.port_id === portId);
    return port ? port.port_name : '';
  }

  onExportClick(): void {
    this.forecastingtableService.getInventoryByIdCID(this.companyId).subscribe(
      (data: Inventory[]) => {
        this.Einv = data.map((item: Inventory) => {
          const portName = this.getPortName(item.port_id);
          return { ...item, port_name: portName };
        });
        this.onExport();
      },
      (error: any) => console.error(error)
    );
  }
}

interface Inventory {
  port_name: string;
  port_id: number;
  container_type: string;
  container_size: any;
  available: number;
  surplus: number;
  deficit: number;
}