using CC_api.Models;
using CC_api.Repository;
using Microsoft.AspNetCore.Mvc;



namespace CC_api.Business
{
  public class PortsBusiness
  {
    private readonly PortsRepository portsRepository;



    public PortsBusiness()
    {
      this.portsRepository = new PortsRepository();



    }
    public async Task<List<Ports>> GetAllPortsAsync()
    {
      return await portsRepository.GetAllPortsAsync();
    }

    public async Task<List<ContainerType>> GetAllCTypesAsync()
    {
      return await portsRepository.GetAllCTypesAsync();
    }

    public async Task<int> GetPortidbyCode(string portcode)
    {
      return await portsRepository.GetPortidbyCode(portcode);
    }

    public async Task<List<Ports>> GetPortsBycountryId(int countryId)
    {
      return await portsRepository.GetPortsBycountryId(countryId);

    }
    public async Task<Ports> GetByPortId(int portId)
    {
      var port = await portsRepository.GetByPortId(portId);
      return port;
    }
  }
}
