using Microsoft.EntityFrameworkCore;

namespace EmployeeApi;

public sealed class EmployeeService(EmployeeDbContext db)
{
    public async Task<IReadOnlyList<Employee>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.Employees.AsNoTracking().OrderBy(employee => employee.Id).ToListAsync(cancellationToken);

    public Task<Employee?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        db.Employees.AsNoTracking().FirstOrDefaultAsync(employee => employee.Id == id, cancellationToken);

    public async Task<Employee> CreateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        employee.Id = 0;
        db.Employees.Add(employee);
        await db.SaveChangesAsync(cancellationToken);
        return employee;
    }

    public async Task<Employee?> UpdateAsync(int id, Employee employee, CancellationToken cancellationToken = default)
    {
        var existingEmployee = await db.Employees.FindAsync([id], cancellationToken);
        if (existingEmployee is null)
        {
            return null;
        }

        existingEmployee.FirstName = employee.FirstName;
        existingEmployee.LastName = employee.LastName;
        existingEmployee.Email = employee.Email;
        existingEmployee.Department = employee.Department;
        existingEmployee.JobTitle = employee.JobTitle;
        existingEmployee.HireDate = employee.HireDate;

        await db.SaveChangesAsync(cancellationToken);
        return existingEmployee;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var employee = await db.Employees.FindAsync([id], cancellationToken);
        if (employee is null)
        {
            return false;
        }

        db.Employees.Remove(employee);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}