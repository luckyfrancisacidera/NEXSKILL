using System;
using System.Collections.Generic;
using System.Text;

namespace SkillSense.Application.Contracts.Scoring.Response
{
    public readonly record struct EducationResult(float Score, bool MeetsMinimum);

}
