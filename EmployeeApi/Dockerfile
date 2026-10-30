FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY EmployeeApi/EmployeeApi.csproj EmployeeApi/
RUN dotnet restore EmployeeApi/EmployeeApi.csproj

COPY EmployeeApi/ EmployeeApi/
WORKDIR /src/EmployeeApi
RUN dotnet publish EmployeeApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENTRYPOINT ["dotnet", "EmployeeApi.dll"]