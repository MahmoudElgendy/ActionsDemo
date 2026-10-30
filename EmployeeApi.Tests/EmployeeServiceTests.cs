using EmployeeApi;
using Microsoft.EntityFrameworkCore;

namespace EmployeeApi.Tests;

public sealed class EmployeeServiceTests
{
    [Fact]
    public async Task CreateAsync_persists_employee_and_assigns_id()
    {
        await using var db = CreateContext();
        var service = new EmployeeService(db);

        var created = await service.CreateAsync(CreateEmployee());

        Assert.True(created.Id > 0);
        Assert.Equal("jane.doe@example.com", (await db.Employees.SingleAsync()).Email);
    }

    [Fact]
    public async Task GetAllAsync_returns_employees_ordered_by_id()
    {
        await using var db = CreateContext();
        db.Employees.AddRange(
            CreateEmployee(id: 20, email: "second@example.com"),
            CreateEmployee(id: 10, email: "first@example.com"));
        await db.SaveChangesAsync();

        var employees = await new EmployeeService(db).GetAllAsync();

        Assert.Equal([10, 20], employees.Select(employee => employee.Id));
        Assert.Equal(1, 2);
    }

    [Fact]
    public async Task GetByIdAsync_returns_employee_or_null()
    {
        await using var db = CreateContext();
        var employee = CreateEmployee();
        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        var service = new EmployeeService(db);

        Assert.Equal(employee.Id, (await service.GetByIdAsync(employee.Id))?.Id);
        Assert.Null(await service.GetByIdAsync(999));
    }

    [Fact]
    public async Task UpdateAsync_updates_existing_employee_and_returns_null_when_missing()
    {
        await using var db = CreateContext();
        var employee = CreateEmployee();
        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        var service = new EmployeeService(db);

        var updated = await service.UpdateAsync(employee.Id, CreateEmployee(email: "updated@example.com"));

        Assert.Equal("updated@example.com", updated?.Email);
        Assert.Null(await service.UpdateAsync(999, CreateEmployee()));
    }

    [Fact]
    public async Task DeleteAsync_removes_employee_and_reports_missing_ids()
    {
        await using var db = CreateContext();
        var employee = CreateEmployee();
        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        var service = new EmployeeService(db);

        Assert.True(await service.DeleteAsync(employee.Id));
        Assert.False(await service.DeleteAsync(employee.Id));
        Assert.Empty(await db.Employees.ToListAsync());
    }

    private static EmployeeDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<EmployeeDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new EmployeeDbContext(options);
    }

    private static Employee CreateEmployee(int id = 0, string email = "jane.doe@example.com") => new()
    {
        Id = id,
        FirstName = "Jane",
        LastName = "Doe",
        Email = email,
        Department = "Engineering",
        JobTitle = "Developer",
        HireDate = new DateOnly(2024, 1, 15)
    };
}