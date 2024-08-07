using CC_api.Business;
using CC_api.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.ComponentModel.Design;

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
    [HttpGet("GetInternalServiceforDeficitPort")]
    public async Task<ActionResult<Dictionary<int, List<PortSequence>>>> GetPortSequenceDataByServiceIdAndPortCode(int companyId, string portCode)
    {
      var portSequenceData = await servicesBusiness.GetPortSequenceDataAsync(companyId, portCode);
      return Ok(portSequenceData);

     

    }
    [HttpGet("GetInternalServiceforSurplusPort")]
    public async Task<ActionResult<Dictionary<int, List<PortSequence>>>> GetInternalServiceforSurplusPort(int companyId, string portCode)
    {
      var surplusSequenceData = await servicesBusiness.GetInternalServiceforSurplusPort(companyId, portCode);
      return Ok(surplusSequenceData);



    }

    [HttpGet("GetSeqNo")]
    public async Task<IActionResult> GetSeqNo(string portCode)
    {
      if (string.IsNullOrEmpty(portCode))
      {
        return BadRequest("Port code cannot be empty.");
      }

      try
      {
        var seqNo = await servicesBusiness.GetSeqNoByPortCode(portCode);

        if (seqNo != null)
        {
          return Ok(seqNo);
        }
        else
        {
          return NotFound("Port code not found.");
        }
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }
  }
}
