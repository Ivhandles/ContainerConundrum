using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CC_api.Models
{
  public class Country
  {
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public int country_id { get; set; }

    public string country_name { get; set; }

    public string country_code { get; set; }
  }
}
