using System.ComponentModel.DataAnnotations;

namespace EmployeeApi;

public sealed class Employee
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    public DateOnly HireDate { get; set; }
}