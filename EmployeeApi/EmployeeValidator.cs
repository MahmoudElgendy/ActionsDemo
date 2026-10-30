using System.ComponentModel.DataAnnotations;

namespace EmployeeApi;

public static class EmployeeValidator
{
    public static Dictionary<string, string[]> Validate(Employee employee)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(employee, new ValidationContext(employee), results, validateAllProperties: true);

        return results
            .SelectMany(result => result.MemberNames.DefaultIfEmpty(string.Empty), (result, member) => new { member, result.ErrorMessage })
            .GroupBy(item => item.member)
            .ToDictionary(group => group.Key, group => group.Select(item => item.ErrorMessage ?? "Invalid value.").ToArray());
    }
}