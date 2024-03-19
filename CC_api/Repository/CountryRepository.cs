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
  }
}
