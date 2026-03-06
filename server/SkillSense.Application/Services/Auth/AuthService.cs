using Microsoft.AspNetCore.Identity;
using SkillSense.Application.Contracts.Auth;
using SkillSense.Application.Interfaces.Auth;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Services.Auth;

public sealed class AuthService(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    ITokenService tokenService,
    IInputSanitizer sanitizer) : IAuthService
{
    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager = roleManager;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IInputSanitizer _sanitizer = sanitizer;

    public async Task<AuthResult> RegisterJobSeekerAsync(RegisterJobSeekerRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            return AuthResult.Failure("Registration failed.", "Unable to create user with provided credentials.");
        }

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            NormalizedUserName = email.ToUpperInvariant(),
            EmailConfirmed = true,
        };

        var passwordValidation = await ValidatePasswordAsync(user, password);
        if (passwordValidation.Count > 0)
        {
            return AuthResult.Failure("Validation failed.", passwordValidation.ToArray());
        }

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            return AuthResult.Failure("Registration failed.", result.Errors.Select(e => e.Description).ToArray());
        }

        await EnsureRoleExistsAsync("JobSeeker");
        await _userManager.AddToRoleAsync(user, "JobSeeker");

        user.JobSeekerProfile = new JobSeekerProfileEntity { UserId = user.Id };
        await _userManager.UpdateAsync(user);

        var token = await _tokenService.CreateTokenAsync(user, cancellationToken);
        var refreshToken = await _tokenService.CreateRefreshTokenAsync(user, cancellationToken);
        return AuthResult.Success("Registration successful.", token, refreshToken, user.Email, user.Id.ToString(), ["JobSeeker"]);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return AuthResult.Failure("Authentication failed.", "Invalid email or password.");
        }

        var valid = await _userManager.CheckPasswordAsync(user, password);
        if (!valid)
        {
            return AuthResult.Failure("Authentication failed.", "Invalid email or password.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.CreateTokenAsync(user, cancellationToken);
        var refreshToken = await _tokenService.CreateRefreshTokenAsync(user, cancellationToken);
        return AuthResult.Success("Login successful.", token, refreshToken, user.Email, user.Id.ToString(), roles.ToArray());
    }

    public async Task<AuthResult> CreatePrivilegedUserAsync(CreatePrivilegedUserRequest request, CancellationToken cancellationToken)
    {
        var email = _sanitizer.SanitizeEmail(request.Email);
        var password = _sanitizer.Sanitize(request.Password);
        var role = _sanitizer.Sanitize(request.Role);

        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            return AuthResult.Failure("Create user failed.", "Unable to create user with provided credentials.");
        }

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            NormalizedUserName = email.ToUpperInvariant(),
            EmailConfirmed = true,
        };

        var passwordValidation = await ValidatePasswordAsync(user, password);
        if (passwordValidation.Count > 0)
        {
            return AuthResult.Failure("Validation failed.", passwordValidation.ToArray());
        }

        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            return AuthResult.Failure("Create user failed.", createResult.Errors.Select(e => e.Description).ToArray());
        }

        await EnsureRoleExistsAsync(role);
        await _userManager.AddToRoleAsync(user, role);

        if (role.Equals("Recruiter", StringComparison.OrdinalIgnoreCase))
        {
            user.RecruiterProfile = new RecruiterProfileEntity { UserId = user.Id };
        }
        else
        {
            user.AdminProfile = new AdminProfileEntity { UserId = user.Id };
        }

        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        return AuthResult.Success("User created successfully.", token: null, refreshToken: null, email: user.Email, userId: user.Id.ToString(), roles: roles.ToArray());
    }

    private async Task<IReadOnlyList<string>> ValidatePasswordAsync(AppUser user, string password)
    {
        var errors = new List<string>();
        foreach (var validator in _userManager.PasswordValidators)
        {
            var result = await validator.ValidateAsync(_userManager, user, password);
            if (!result.Succeeded)
            {
                errors.AddRange(result.Errors.Select(e => e.Description));
            }
        }

        return errors.Distinct().ToList();
    }

    private async Task EnsureRoleExistsAsync(string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }
}
