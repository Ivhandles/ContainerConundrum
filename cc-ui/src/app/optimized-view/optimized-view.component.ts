import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../session.service';
import { ForecastingTableService } from '../forecasting/forecasting-table-view/forecasting-table-view.service';
import * as XLSX from 'xlsx';
import { SharedServiceService } from '../shared-service.service';
import { distinctUntilChanged, filter, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, Subscription, combineLatest, forkJoin, of } from 'rxjs';
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
  loading = true;
  router: any;
  public carrierServices: any[] = [];
  latlong:any[]=[];
  private unsubscribe$: Subject<void> = new Subject<void>();
  portCode: any;
  deficit_services: any[] | undefined;
  private latitudeSubscription: Subscription | undefined;
  private longitudeSubscription: Subscription | undefined;
  private latitude: any;
  private longitude: any;
  matchedService:any[] = [];
  filteredInventoryData: Inventory[] = [];
  constructor(
    private sessionService: SessionService,
    private forecastingtableService: ForecastingTableService,
    private sharedService: SharedServiceService,
    private carrierservice:CarrierServiceService
  ) {}

 

  ngOnInit(): void {
  

   
   
   
  
    this.loadInitialData();
    let latitudeReceived = false;
    let longitudeReceived = false;
    this.latitudeSubscription = this.sharedService.PortLatitude$.subscribe((latitude: number) => {
      // Handle latitude updates here
      this.latitude = latitude;
      latitudeReceived = true;
    
      // Check if both latitude and longitude values have been received
      if (latitudeReceived && longitudeReceived) {
        this.initMap();
      }
    });
    
    this.longitudeSubscription = this.sharedService.PortLongitude$.subscribe((longitude: number) => {
      // Handle longitude updates here
      this.longitude = longitude;
      longitudeReceived = true;
    
      // Check if both latitude and longitude values have been received
      if (latitudeReceived && longitudeReceived) {
        this.initMap();
      }
    });
   
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
    if (this.latitudeSubscription) {
      this.latitudeSubscription.unsubscribe();
    }

    if (this.longitudeSubscription) {
      this.longitudeSubscription.unsubscribe();
    }
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

  public loadPortList(): void {
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

        
        this.filterData(this.receivedportCode, this.receivedcontainerType, this.receivedcontainerSize);
      },
      (error: any) => {
        console.log('Inventory loading error:', error);
      }
    );
  }
  
  async filterData(receivedportCode: string, receivedcontainerType: string, receivedcontainerSize: string): Promise<void> {
    console.log("inside filter data",this.companyId);
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
this.filteredInventoryData = filteredInventoryWithSurplus;
        console.log('Filtered Inventory with Surplus > Deficit:', filteredInventoryWithSurplus);

    } else {
        console.log('No matching port found.');
    }
  await this.getDeficitServices(receivedportCode);
}


async getDeficitServices(portCode: string) {
  this.loading = true;
  let dataReceived = false; // Flag to track data reception

  console.log(this.companyId);
  this.carrierservice.getServicesforDeficit(this.companyId, portCode).subscribe(
    async (response: any) => {
      // Handle the response here as an object
      console.log('Received response as an object:', response);

      // Convert the object to an array format
      const responseArray: any[] = Object.values(response);

      // Now you have the response as an array and can work with it as needed
      console.log('Converted response to an array:', responseArray);
      this.deficit_services = responseArray;
      console.log("to check deficit_services", this.deficit_services);

      // Initialize an array to store the matched deficit services
      const matchedData: any[] = [];

      // Iterate through each element in filteredInventoryData
      for (const surplusInventory of this.filteredInventoryData) {
        // Iterate through the entire deficit_services array
        for (const deficitService of this.deficit_services) {
          // Iterate through portSequences in the deficitService
          for (const portSequence of deficitService.portSequences) {
            // Check if there is a match based on port_id
            if (surplusInventory.port_id === portSequence.port_id) {
              // If a match is found, push the deficitService element to the matchedData array
              matchedData.push(deficitService);
            }
          }
        }
      }
      this.matchedService = matchedData;

      // Set the dataReceived flag to true when data is received
      dataReceived = true;

      // Now you have the matched deficit services in the matchedData array
      console.log("Matched deficit services:", matchedData);
      console.log("Matched deficit services:", this.matchedService);
      const latLongData: any[] = [];

      // Iterate through each item in the matchedService array
      for (const matchedServiceItem of this.matchedService) {
        // Extract serviceName from the matchedServiceItem
        const { serviceName } = matchedServiceItem;

        // Iterate through portSequences within the matchedServiceItem
        for (const portSequence of matchedServiceItem.portSequences) {
          // Retrieve port_id and port_name from portSequence
          const { port_id, port_name } = portSequence;

          // Find the port data in this.port_list using port_id
          const portData = this.port_list.find((portItem) => portItem.port_id === port_id);

          if (portData) {
            // Extract the latitude and longitude
            const { latitude, longitude } = portData;

            // Push the data to the latLongData array
            latLongData.push({ serviceName, port_id, port_name, latitude, longitude });
          }
        }
      }
      this.latlong = latLongData;

      this.initMap();
      
      // Move the loading flag setting here, inside the subscribe block
      this.loading = false;
      console.log("to check", this.latlong);
      // Now you have the latitude, longitude, serviceName, port_id, and port_name data in latLongData
      console.log("Latitude, Longitude, ServiceName, Port ID, and Port Name Data:", latLongData);

      // You can do further processing or store this data as needed.
    }
  );

  // Remove this block as it's not needed
  // Check the dataReceived flag before setting loading to false
  // if (!dataReceived) {
  //   this.loading = false;
  // }
}








ngAfterViewInit() {
    this.initMap();
}
initMap() {
  console.log("to inside initmap check", this.latlong);

  // Check if the mapElement exists and if both latitude and longitude are defined
  if (this.mapElement && this.latitude !== undefined && this.longitude !== undefined) {
    const mapElement = this.mapElement.nativeElement;
    const mapOptions: google.maps.MapOptions = {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: 3,
      mapId: '2b03aff8b2fb72a3'
    };

    this.map = new google.maps.Map(mapElement, mapOptions);

    // Add a red marker at the specified latitude and longitude
    const redMarker = new google.maps.Marker({
      position: { lat: this.latitude, lng: this.longitude },
      map: this.map,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(30, 30)
      },
      title: this.receivedportCode
    });

   
const lineColors = ['green', 'rgba(0, 0, 139, 1)', 'orange', 'purple', 'yellow', 'cyan'];

    // Loop through the latLongData array and create markers and lines
    for (let i = 0; i < this.latlong.length; i++) {
      const dataPoint = this.latlong[i];
      const { latitude, longitude, port_id, port_name } = dataPoint;

      // Create a marker for the current data point's port
      const markerColor = 'green';
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: this.map,
        icon: {
          url: `http://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
          scaledSize: new google.maps.Size(30, 30)
        },
        title: `Port ID: ${port_id}, Port Name: ${port_name}`
      });

      // Generate a random line color for each data point
      const randomColor = lineColors[Math.floor(Math.random() * lineColors.length)];

      // Create a polyline from the data point to the red marker with the random line color
      const line = new google.maps.Polyline({
        path: [
          { lat: latitude, lng: longitude },
          { lat: this.latitude, lng: this.longitude }
        ],
        geodesic: true,
        strokeColor: randomColor,
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      line.setMap(this.map);
    }
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