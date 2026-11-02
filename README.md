# Employee Directory

React employee directory backed by an ASP.NET Core 10 API and SQL Server, runnable with Docker Compose.

## Run

```powershell
docker compose up --build
```

The frontend is available at `http://localhost:3000`, the API at `http://localhost:8080`, and SQL Server on port `1433`. The development OpenAPI document is at `http://localhost:8080/openapi/v1.json`. The database schema is created automatically when the API starts.

The Compose file includes a development-only SQL Server password. Set `MSSQL_SA_PASSWORD` in the environment or copy `.env.example` to `.env` and change it before using the setup beyond local development.

## Tests

Run the unit tests with:

```powershell
dotnet test EmployeeApi.Tests/EmployeeApi.Tests.csproj
```

Build the frontend with:

```powershell
npm ci --prefix EmployeeWeb
npm run build --prefix EmployeeWeb
```

## Endpoints

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/employees` | List employees |
| `GET` | `/api/employees/{id}` | Get one employee |
| `POST` | `/api/employees` | Create an employee |
| `PUT` | `/api/employees/{id}` | Replace an employee |
| `DELETE` | `/api/employees/{id}` | Delete an employee |

Create and update requests accept `firstName`, `lastName`, `email`, `department`, `jobTitle`, and `hireDate` (ISO date, `YYYY-MM-DD`).

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "department": "Engineering",
  "jobTitle": "Software Engineer",
  "hireDate": "2024-01-15"
}
```