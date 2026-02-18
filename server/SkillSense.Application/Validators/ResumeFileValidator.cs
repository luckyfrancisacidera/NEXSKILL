namespace SkillSense.Application.Validators
{
    public class ResumeFileValidator
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf",".doc",".docx",
        };
        private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        public static (bool isValid, string? Error) Validate(string fileName, string contentType, long length)
        {
            if (length == 0) return (false, "No file uploaded");

            var ext = Path.GetExtension(fileName);
            if (!AllowedExtensions.Contains(ext)) 
                return (false, $"Invalid file type '{ext}'. Only PDF and DOCX are accepted");

           if(!AllowedMimeTypes.Contains(contentType))
                return (false, $"Invalid content type '{contentType}'. Only PDF and DOCX are accepted");

            return (true, null);
        }
    }
}
