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
     var Services = services.Where(service => serviceRepository.GetPortSequenceDataByServiceIdAsync(service.service_id).Result
          .Any(ps => ps.port_code == portCode))
          .ToList();
      List<int> portcodesseqNos = new List<int>();

      foreach (var service in Services)
      {
        var seqNos = await serviceRepository.GetSeqNosFromPortCodeAsync(portCode, service.service_id);
        portcodesseqNos.AddRange(seqNos);
      }

      var portSequenceData = new Dictionary<int, ServiceDto>();

      // Iterate through each service and initialize the DTO
      foreach (var service in Services)
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
        var serviceId = Services[i].service_id;

        var servicePortSequenceData = await serviceRepository.GetPortSequenceDataByServiceIdAsync(serviceId);

        // Filter the data for the current service_id and seqNo
        var filteredData = servicePortSequenceData
            .Where(ps => ps.seq_no < seqNo)
            .Select(ps => new PortSequence
            {
              port_id = ps.port_id,
              port_name = ps.port_name,
              port_code = ps.port_code,
              seq_no = ps.seq_no,
              service_id = serviceId
            })
            .OrderByDescending(ps => ps.seq_no) // Sort by seq_no in descending order
            .ToList();

        // Add the filtered data to the DTO of the corresponding service
        portSequenceData[serviceId].PortSequences.AddRange(filteredData);
      }

      return portSequenceData;
    }
    public async Task<Dictionary<int, ServiceDto>> GetInternalServiceforSurplusPort(int companyId, string portCode)
    {
      var services = await serviceRepository.GetAllServicesByCompanyId(companyId);

      // Filter services to include only those with the matching portCode
      var Services = services.Where(service => serviceRepository.GetPortSequenceDataByServiceIdAsync(service.service_id).Result
          .Any(ps => ps.port_code == portCode))
          .ToList();
      List<int> portcodesseqNos = new List<int>();

      foreach (var service in Services)
      {
        var seqNos = await serviceRepository.GetSeqNosFromPortCodeAsync(portCode, service.service_id);
        portcodesseqNos.AddRange(seqNos);
      }

      var surplusSequenceData = new Dictionary<int, ServiceDto>();

      // Iterate through each service and initialize the DTO
      foreach (var service in Services)
      {
        var servicePortSequenceDTO = new ServiceDto
        {
          ServiceName = await serviceRepository.GetServiceNameByIdAsync(service.service_id),
          PortSequences = new List<PortSequence>()
        };

        surplusSequenceData[service.service_id] = servicePortSequenceDTO;
      }

      // Iterate through each portcodesseqNo and corresponding service_id
      for (int i = 0; i < portcodesseqNos.Count; i++)
      {
        var seqNo = portcodesseqNos[i];
        var serviceId = Services[i].service_id;

        var servicePortSequenceData = await serviceRepository.GetPortSequenceDataByServiceIdAsync(serviceId);

        // Filter the data for the current service_id and seqNo
        var filteredData = servicePortSequenceData
        .Where(ps => ps.seq_no > seqNo)
        .Select(ps => new PortSequence
        {
          port_id = ps.port_id,
          port_name = ps.port_name,
          port_code = ps.port_code,
          seq_no = ps.seq_no,
          service_id = serviceId
        })
        .ToList();


        // Add the filtered data to the DTO of the corresponding service
        surplusSequenceData[serviceId].PortSequences.AddRange(filteredData);
      }

      return surplusSequenceData;
    }
    public async Task<int?> GetSeqNoByPortCode(string portCode)
    {
      // You can add any additional business logic here if needed

      return await serviceRepository.GetSeqNoByPortCode(portCode);
    }






  }
}
