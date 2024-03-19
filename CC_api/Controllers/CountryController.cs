using CC_api.Business;
using CC_api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CC_api.Controllers
{
  
 
  public class CountryController : Controller
  {

    private readonly ILogger<CountryController> _logger;
    private readonly CountryBusiness countryBusiness;

    public CountryController(ILogger<CountryController> logger)
    {
      _logger = logger;
      countryBusiness = new CountryBusiness();
    }
    [HttpGet("GetAllCountries")]
    public async Task<List<Country>> GetAllCountries()
    {
      return await countryBusiness.GetAllCountriesAsync();
    }
  }
}
