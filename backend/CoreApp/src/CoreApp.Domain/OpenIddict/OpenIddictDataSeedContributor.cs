using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using OpenIddict.Abstractions;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.OpenIddict.Applications;
using Volo.Abp.OpenIddict.Scopes;
using Volo.Abp.PermissionManagement;
using Volo.Abp.Uow;

namespace CoreApp.OpenIddict;

/* Creates initial data that is needed to property run the application
 * and make client-to-server communication possible.
 */
public class OpenIddictDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IConfiguration _configuration;
    private readonly IOpenIddictApplicationRepository _openIddictApplicationRepository;
    private readonly IAbpApplicationManager _applicationManager;
    private readonly IOpenIddictScopeRepository _openIddictScopeRepository;
    private readonly IOpenIddictScopeManager _scopeManager;

    public OpenIddictDataSeedContributor(
        IConfiguration configuration,
        IOpenIddictApplicationRepository openIddictApplicationRepository,
        IAbpApplicationManager applicationManager,
        IOpenIddictScopeRepository openIddictScopeRepository,
        IOpenIddictScopeManager scopeManager)
    {
        _configuration = configuration;
        _openIddictApplicationRepository = openIddictApplicationRepository;
        _applicationManager = applicationManager;
        _openIddictScopeRepository = openIddictScopeRepository;
        _scopeManager = scopeManager;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        await CreateScopesAsync();
        await CreateApplicationsAsync();
    }

    private async Task CreateScopesAsync()
    {
        if (await _openIddictScopeRepository.FindByNameAsync("CoreApp") == null)
        {
            await _scopeManager.CreateAsync(new OpenIddictScopeDescriptor
            {
                Name = "CoreApp",
                DisplayName = "CoreApp API",
                Resources = { "CoreApp" }
            });
        }
    }

    private async Task CreateApplicationsAsync()
    {
        var commonScopes = new List<string> {
            "address",
            "email",
            "phone",
            "profile",
            "roles",
            "CoreApp"
        };

        var configurationSection = _configuration.GetSection("OpenIddict:Applications");

        // React SPA Client
        var reactClientId = configurationSection["CoreApp_App:ClientId"];
        if (!reactClientId.IsNullOrWhiteSpace())
        {
            var reactClientRootUrl = configurationSection["CoreApp_App:RootUrl"]?.TrimEnd('/');
            await CreateOrUpdateApplicationAsync(
                name: reactClientId!,
                type: OpenIddictConstants.ClientTypes.Public,
                consentType: OpenIddictConstants.ConsentTypes.Implicit,
                displayName: "CoreApp React Application",
                secret: null,
                grantTypes: new List<string> {
                    OpenIddictConstants.GrantTypes.AuthorizationCode,
                    OpenIddictConstants.GrantTypes.RefreshToken,
                    "LinkLogin",
                    "Impersonation"
                },
                scopes: commonScopes,
                redirectUris: new List<string> { $"{reactClientRootUrl}/callback" },
                postLogoutRedirectUris: new List<string> { $"{reactClientRootUrl}" },
                clientUri: reactClientRootUrl
            );
        }

        // Swagger Client
        var swaggerClientId = configurationSection["CoreApp_Swagger:ClientId"];
        if (!swaggerClientId.IsNullOrWhiteSpace())
        {
            var swaggerRootUrl = configurationSection["CoreApp_Swagger:RootUrl"]?.TrimEnd('/');

            await CreateOrUpdateApplicationAsync(
                name: swaggerClientId!,
                type: OpenIddictConstants.ClientTypes.Public,
                consentType: OpenIddictConstants.ConsentTypes.Implicit,
                displayName: "Swagger Application",
                secret: null,
                grantTypes: new List<string> { OpenIddictConstants.GrantTypes.AuthorizationCode },
                scopes: commonScopes,
                redirectUris: new List<string> { $"{swaggerRootUrl}/swagger/oauth2-redirect.html" },
                clientUri: swaggerRootUrl
            );
        }
    }

    private async Task CreateOrUpdateApplicationAsync(
        string name,
        string type,
        string consentType,
        string displayName,
        string? secret,
        List<string> grantTypes,
        List<string> scopes,
        List<string>? redirectUris = null,
        List<string>? postLogoutRedirectUris = null,
        string? clientUri = null)
    {
        var application = await _openIddictApplicationRepository.FindByClientIdAsync(name);

        var buildPermissions = new List<string> {
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.Token,
            OpenIddictConstants.Permissions.Endpoints.Logout,
            OpenIddictConstants.Permissions.Endpoints.Device,
        };

        foreach (var grantType in grantTypes)
        {
            if (grantType == OpenIddictConstants.GrantTypes.AuthorizationCode)
                buildPermissions.Add(OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode);
            else if (grantType == OpenIddictConstants.GrantTypes.ClientCredentials)
                buildPermissions.Add(OpenIddictConstants.Permissions.GrantTypes.ClientCredentials);
            else if (grantType == OpenIddictConstants.GrantTypes.RefreshToken)
                buildPermissions.Add(OpenIddictConstants.Permissions.GrantTypes.RefreshToken);
            else if (grantType == OpenIddictConstants.GrantTypes.DeviceCode)
                buildPermissions.Add(OpenIddictConstants.Permissions.GrantTypes.DeviceCode);
            else if (grantType == OpenIddictConstants.GrantTypes.Password)
                buildPermissions.Add(OpenIddictConstants.Permissions.GrantTypes.Password);
            else if (grantType == "LinkLogin" || grantType == "Impersonation")
                buildPermissions.Add(OpenIddictConstants.Permissions.Prefixes.GrantType + grantType);
        }

        buildPermissions.Add(OpenIddictConstants.Permissions.ResponseTypes.Code);

        foreach (var scope in scopes)
        {
            buildPermissions.Add(OpenIddictConstants.Permissions.Prefixes.Scope + scope);
        }

        if (application == null)
        {
            var descriptor = new AbpApplicationDescriptor
            {
                ClientId = name,
                ClientType = type,
                ClientSecret = secret,
                ConsentType = consentType,
                DisplayName = displayName,
                ClientUri = clientUri
            };

            foreach (var permission in buildPermissions)
            {
                descriptor.Permissions.Add(permission);
            }

            if (redirectUris != null)
            {
                foreach (var uri in redirectUris)
                {
                    if (!uri.IsNullOrWhiteSpace())
                        descriptor.RedirectUris.Add(new Uri(uri));
                }
            }

            if (postLogoutRedirectUris != null)
            {
                foreach (var uri in postLogoutRedirectUris)
                {
                    if (!uri.IsNullOrWhiteSpace())
                        descriptor.PostLogoutRedirectUris.Add(new Uri(uri));
                }
            }

            await _applicationManager.CreateAsync(descriptor);
        }
        else
        {
            // Application already exists, no update needed
        }
    }
}
