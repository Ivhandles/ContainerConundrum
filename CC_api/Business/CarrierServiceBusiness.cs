using CC_api.Models;
using CC_api.Repository;
using Microsoft.EntityFrameworkCore;

namespace CC_api.Business
{
  public class CarrierServiceBusiness
  {
    private readonly CarrierServiceRepository serviceRepository;

    public CarrierServiceBusiness()
    {
      this.serviceRepository = new CarrierServiceRepository();

    }
    public async Task<List<CarrierService>> GetAllServices()
    {
      return await serviceRepository.GetAllServices();
    }
    public async Task<List<CarrierService>> GetAllServicesByCompanyId(int companyid)
    {
      var services = await serviceRepository.GetAllServicesByCompanyId(companyid);
      return services;
    }

    
    public async Task<List<PortSequence>> GetPortSequencesByServiceName(string serviceName)
    {
      var portSequences = await serviceRepository.GetPortSequencesByServiceName(serviceName);
      return portSequences;
    }


  
    public async Task<Dictionary<int, List<PortSequence>>> GetPortSequenceDataAsync(int companyId, string portCode)
    {
      var services = await serviceRepository.GetAllServicesByCompanyId(companyId);
      var portSequenceData = new Dictionary<int, List<PortSequence>>();

      foreach (var service in services)
      {
        var servicePortSequenceData = await serviceRepository.GetPortSequenceDataByServiceIdAsync(service.service_id);

        // Filter the port sequence data by portCode
        var filteredData = servicePortSequenceData.Where(ps => ps.port_code == portCode).ToList();

        if (filteredData.Any())
        {
          // Add all the data for this service_id to the new list
          if (!portSequenceData.ContainsKey(service.service_id))
          {
            portSequenceData[service.service_id] = new List<PortSequence>();
          }

          portSequenceData[service.service_id].AddRange(servicePortSequenceData);
        }
      }

      return portSequenceData;
    }



  }
}
