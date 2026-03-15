using Volo.Abp.Application.Dtos;

namespace CoreApp.Forms;

public class GetFormListDto : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
}
