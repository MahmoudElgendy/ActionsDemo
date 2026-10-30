using System.ComponentModel.DataAnnotations;
using EmployeeApi;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<EmployeeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<EmployeeService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EmployeeDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapGet("/api/employees", async (EmployeeService employees, CancellationToken cancellationToken) =>
    Results.Ok(await employees.GetAllAsync(cancellationToken)));

app.MapGet("/api/employees/{id:int}", async (int id, EmployeeService employees, CancellationToken cancellationToken) =>
{
    var employee = await employees.GetByIdAsync(id, cancellationToken);
    return employee is null ? Results.NotFound() : Results.Ok(employee);
});

app.MapPost("/api/employees", async (Employee employee, EmployeeService employees, CancellationToken cancellationToken) =>
{
    var errors = EmployeeValidator.Validate(employee);
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    await employees.CreateAsync(employee, cancellationToken);
    return Results.Created($"/api/employees/{employee.Id}", employee);
});

app.MapPut("/api/employees/{id:int}", async (int id, Employee employee, EmployeeService employees, CancellationToken cancellationToken) =>
{
    var errors = EmployeeValidator.Validate(employee);
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var existingEmployee = await employees.UpdateAsync(id, employee, cancellationToken);
    if (existingEmployee is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(existingEmployee);
});

app.MapDelete("/api/employees/{id:int}", async (int id, EmployeeService employees, CancellationToken cancellationToken) =>
{
    if (!await employees.DeleteAsync(id, cancellationToken))
    {
        return Results.NotFound();
    }

    return Results.NoContent();
});

app.Run();
