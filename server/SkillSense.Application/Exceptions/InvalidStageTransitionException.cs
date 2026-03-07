namespace SkillSense.Application.Exceptions;

public sealed class InvalidStageTransitionException : Exception
{
    public InvalidStageTransitionException(string action, string stage)
        : base($"Action '{action}' is not allowed from stage '{stage}'.")
    {
        Action = action;
        Stage = stage;
    }

    public string Action { get; }
    public string Stage { get; }
}

