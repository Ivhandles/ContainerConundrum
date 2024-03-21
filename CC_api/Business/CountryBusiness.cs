using CC_api.Models;
using CC_api.Repository;

namespace CC_api.Business
{
  public class CountryBusiness
  {

    private readonly CountryRepository countryRepository;


    public CountryBusiness()
    {
      countryRepository = new CountryRepository();
    }
    public async Task<List<Country>> GetAllCountriesAsync()
    {
      return await countryRepository.GetAllCountriesAsync();
    }
    public async Task<List<Ports>> GetAllPortsbyCountryName(string countryName)
    {
      var countryname = await countryRepository.GetAllPortsbyCountryName(countryName);
      return countryname;
    }
  }
}
