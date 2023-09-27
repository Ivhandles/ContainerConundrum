using CC_api.Models;
using Microsoft.EntityFrameworkCore;

namespace CC_api.Repository
{
  public class CarrierServiceRepository
  {
    private readonly DatabaseContext dbContext;
    public CarrierServiceRepository()
    {
      this.dbContext = new DatabaseContext();
    }
    public async Task<List<CarrierService>> GetAllServices()
    {
      return dbContext.carrier_service.ToList();
    }
    public async Task<CarrierService> GetAllServicesByCompanyId(int companyid)
    {
      var service = dbContext.carrier_service.FirstOrDefault(e => e.company_id == companyid);
      return service;
    }

    //public async Task<CarrierService> GetByServiceName(string servicename)
    //{
    //  var service = await dbContext.carrier_service
    //      .Include(c => c.PortSequences) 
    //      .FirstOrDefaultAsync(e => e.service_name == servicename);

    //  return service;
    //}

    public async Task<List<PortSequence>> GetPortSequencesByServiceName(string serviceName)
    {
      var service = dbContext.carrier_service.FirstOrDefault(e => e.service_name == serviceName);
      if (service != null)
      {
        var portSequences = dbContext.port_sequence.Where(p => p.service_id == service.service_id).ToList();
        return portSequences;
      }
      return null;
    }



  }
}
