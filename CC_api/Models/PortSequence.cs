using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CC_api.Models
{
  public class PortSequence
  {
    [Key]
    public int port_seq_id { get; set; }
    public int port_id { get; set; }
    public string port_name { get; set; }
    public string port_code { get; set; }
    public int seq_no { get; set; }

    public int service_id { get; set; }

  }


}
