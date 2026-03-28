FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . ./
RUN dotnet restore server.slnx
RUN dotnet publish SkillSense.Api/SkillSense.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true

COPY --from=build /app/publish ./
COPY SkillSense.Api/models ./models
COPY SkillSense.Api/skill_aliases.json ./skill_aliases.json

RUN mkdir -p /app/storage

EXPOSE 8080

ENTRYPOINT ["dotnet", "SkillSense.Api.dll"]
