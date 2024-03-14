using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CC_api.Models
{
  public class CarrierService
  {
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public int service_id { get; set; }
    public int company_id { get; set; }
    public string service_name { get; set; }


  }

}
