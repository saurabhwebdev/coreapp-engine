using System;
using System.ComponentModel.DataAnnotations;

namespace CoreApp.Forms;

public class CreateFormSubmissionDto
{
    [Required]
    public Guid FormId { get; set; }

    [Required]
    public string DataJson { get; set; } = "{}";
}
