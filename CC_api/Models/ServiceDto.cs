namespace CC_api.Models
{
  public class ServiceDto
  {
    public int ServiceId { get; set; }
    public string ServiceName { get; set; }
    public List<PortSequence> PortSequences { get; set; }

  }
}
