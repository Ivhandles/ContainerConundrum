using CC_api.Models;
using CC_api.Repository;

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
    public async Task<CarrierService> GetAllServicesByCompanyId(int companyid)
    {
      var alumnus = await serviceRepository.GetAllServicesByCompanyId(companyid);
      return alumnus;
    }
    public async Task<List<PortSequence>> GetPortSequencesByServiceName(string serviceName)
    {
      var portSequences = await serviceRepository.GetPortSequencesByServiceName(serviceName);
      return portSequences;
    }

  }
}
