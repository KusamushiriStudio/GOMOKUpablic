using System.Threading;
using System.Threading.Tasks;

namespace TRIAD.Core.Application
{
    public interface IMatchResultSink
    {
        Task PersistAsync(MatchResultDto result, CancellationToken cancellationToken);
    }
}
