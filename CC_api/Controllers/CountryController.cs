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
    private readonly PortsBusiness portsBusiness;

    public CountryController(ILogger<CountryController> logger)
    {
      _logger = logger;
      portsBusiness = new PortsBusiness();
      countryBusiness = new CountryBusiness();
    }
    [HttpGet("GetAllCountries")]
    public async Task<List<Country>> GetAllCountries()
    {
      return await countryBusiness.GetAllCountriesAsync();
    }

    [HttpGet("GetAllPortsbyCountryName")]
    public async Task<IActionResult> GetAllPortsbyCountryName(string countryname)
    {
      var countrynames = await countryBusiness.GetAllPortsbyCountryName(countryname);
      if (countrynames != null)
      {
        var result = new List<object>();
        foreach (var ps in countrynames)
        {
          if (portsBusiness != null)
          {
            var port = await portsBusiness.GetByPortId(ps.port_id);
            if (port != null)
            {
              result.Add(new
              {
                ps.port_id,
                ps.port_code,
                ps.port_name,
                port.latitude,
                port.longitude,
                port.country_id,
              });
            }
          }
        }
        return Ok(result);
      }
      return NotFound();
    }

  }
}
