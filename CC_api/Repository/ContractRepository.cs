using CC_api.Models;

namespace CC_api.Repository
{
  public class ContractRepository
  {
    private readonly DatabaseContext dbContext;
    public ContractRepository()
    {
      this.dbContext = new DatabaseContext();
    }

    public async Task UploadC(Contract contract)
    {
      dbContext.contracts.Add(contract);
      await dbContext.SaveChangesAsync();
    }
    /* public async Task<List<User>> GetAllUserAsync()
     {
       return dbContext.ccusersdb.ToList();
     }
     public async Task<User> Login(string userEmail, string password)
     {
       var user = dbContext.ccusersdb.FirstOrDefault(x => x.Email == userEmail && x.Password == password);
       if (user != null)
       {
         return user;
       }
       else
       {
         return user;
       }
     }*/
  }
}
