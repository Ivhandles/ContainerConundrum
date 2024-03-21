using CC_api.Models;
using Microsoft.EntityFrameworkCore;

namespace CC_api.Repository
{
  public class CountryRepository
  {
    private readonly DatabaseContext dbContext;
    public CountryRepository()
    {
      this.dbContext = new DatabaseContext();
    }
    public async Task<List<Country>> GetAllCountriesAsync()
    {
      return dbContext.country.ToList();
    }
    public async Task<List<Ports>> GetAllPortsbyCountryName(string couuntryName)
    {
      var country = dbContext.country.FirstOrDefault(e => e.country_name == couuntryName);
      if (country != null)
      {
        var port = dbContext.ports.Where(p => p.country_id == country.country_id).ToList();
        return port;
      }
      return null;
    }
  }
}
