using CC_api.Models;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<List<CarrierService>> GetAllServicesByCompanyId(int companyid)
    {
      var services = dbContext.carrier_service.Where(e => e.company_id == companyid).ToList();
      return services;
    }
    public async Task<List<PortSequence>> GetPortSequenceDataByServiceIdAsync(int serviceId)
    {
      // Implement the logic to fetch port sequence data by serviceId from the database.
      return await dbContext.port_sequence.Where(ps => ps.service_id == serviceId).ToListAsync();
    }
 
    public async Task<List<int>> GetSeqNosFromPortCodeAsync(string portCode)
    {
      // Query your database to fetch all seq_no values based on the portCode
      // Replace this with the actual database query using your data access technology (e.g., Entity Framework, Dapper, etc.)
      var queryResults = await dbContext.port_sequence
          .Where(ps => ps.port_code == portCode)
          .Select(ps => ps.seq_no)
          .ToListAsync();

      // Check if any results were found
      if (queryResults != null && queryResults.Any())
      {
        return queryResults;
      }
      return new List<int>();
    }
    public async Task<string> GetServiceNameByIdAsync(int serviceId)
    {
      var serviceName = await dbContext.carrier_service
          .Where(s => s.service_id == serviceId)
          .Select(s => s.service_name) // Select only the service name
          .FirstOrDefaultAsync();

      return serviceName;
    }

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
