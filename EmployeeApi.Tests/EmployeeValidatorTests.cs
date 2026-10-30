using EmployeeApi;

namespace EmployeeApi.Tests;

public sealed class EmployeeValidatorTests
{
    [Fact]
    public void Validate_returns_no_errors_for_valid_employee()
    {
        var errors = EmployeeValidator.Validate(new Employee
        {
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane.doe@example.com",
            Department = "Engineering",
            JobTitle = "Developer",
            HireDate = new DateOnly(2024, 1, 15)
        });

        Assert.Empty(errors);
    }

    [Fact]
    public void Validate_reports_required_fields_and_invalid_email()
    {
        var errors = EmployeeValidator.Validate(new Employee
        {
            FirstName = string.Empty,
            LastName = string.Empty,
            Email = "not-an-email",
            Department = string.Empty,
            JobTitle = string.Empty
        });

        Assert.Contains(nameof(Employee.FirstName), errors.Keys);
        Assert.Contains(nameof(Employee.LastName), errors.Keys);
        Assert.Contains(nameof(Employee.Email), errors.Keys);
        Assert.Contains(nameof(Employee.Department), errors.Keys);
        Assert.Contains(nameof(Employee.JobTitle), errors.Keys);
    }
}