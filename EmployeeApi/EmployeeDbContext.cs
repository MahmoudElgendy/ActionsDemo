using Microsoft.EntityFrameworkCore;

namespace EmployeeApi;

public sealed class EmployeeDbContext(DbContextOptions<EmployeeDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
}