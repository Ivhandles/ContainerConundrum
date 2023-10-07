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


    public async Task<Dictionary<int, ServiceDto>> GetPortSequenceDataAsync(int companyId, string portCode)
    {
      var services = await serviceRepository.GetAllServicesByCompanyId(companyId);

      // Filter services to include only those with the matching portCode
      services = services.Where(service => serviceRepository.GetPortSequenceDataByServiceIdAsync(service.service_id).Result
          .Any(ps => ps.port_code == portCode))
          .ToList();

      List<int> portcodesseqNos = await serviceRepository.GetSeqNosFromPortCodeAsync(portCode);
      Console.WriteLine("Seq Nos: " + string.Join(", ", portcodesseqNos));

      var portSequenceData = new Dictionary<int, ServiceDto>();

      // Iterate through each service and initialize the DTO
      foreach (var service in services)
      {
        var servicePortSequenceDTO = new ServiceDto
        {
          ServiceName = await serviceRepository.GetServiceNameByIdAsync(service.service_id),
          PortSequences = new List<PortSequence>()
        };

        portSequenceData[service.service_id] = servicePortSequenceDTO;
      }

      // Iterate through each portcodesseqNo and corresponding service_id
      for (int i = 0; i < portcodesseqNos.Count; i++)
      {
        var seqNo = portcodesseqNos[i];
        var serviceId = services[i].service_id;

        var servicePortSequenceData = await serviceRepository.GetPortSequenceDataByServiceIdAsync(serviceId);

        // Filter the data for the current service_id and seqNo
        var filteredData = servicePortSequenceData
            .Where(ps => ps.seq_no == seqNo - 1)
            .Select(ps => new PortSequence
            {
              port_id = ps.port_id,
              port_code = ps.port_code,
              seq_no = ps.seq_no
            })
            .ToList();

        // Add the filtered data to the DTO of the corresponding service
        portSequenceData[serviceId].PortSequences.AddRange(filteredData);
      }

      return portSequenceData;
    }








  }
}
