using CC_api.Business;
using CC_api.Models;
using Microsoft.AspNetCore.Mvc;

namespace CC_api.Controllers
{
  public class CarrierServiceController : Controller
  {
    private readonly ILogger<CarrierServiceController> _logger;
    private readonly CarrierServiceBusiness servicesBusiness;
    private readonly IWebHostEnvironment _environment;
    private readonly PortsBusiness portsBusiness;
    public CarrierServiceController(ILogger<CarrierServiceController> logger)
    {
      _logger = logger;
      portsBusiness = new PortsBusiness();
      servicesBusiness = new CarrierServiceBusiness();
    }



    [HttpGet("GetAllServices")]
    public async Task<List<CarrierService>> GetAllServices()
    {
      return await servicesBusiness.GetAllServices();
    }

    [HttpGet("GetAllServicesByCompanyId")]
    public async Task<IActionResult> GetAllServicesByCompanyId(int companyid)
    {
      var services = await servicesBusiness.GetAllServicesByCompanyId(companyid);
      return Ok(services);
    }


    [HttpGet("GetPortSequencesByServiceName")]
    public async Task<IActionResult> GetPortSequencesByServiceName(string serviceName)
    {
      var portSequences = await servicesBusiness.GetPortSequencesByServiceName(serviceName);
      if (portSequences != null)
      {
        var result = new List<object>();
        foreach (var ps in portSequences)
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
                ps.port_seq_id,
                ps.seq_no,
                ps.service_id,
                port.latitude,
                port.longitude,
                port.country

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
