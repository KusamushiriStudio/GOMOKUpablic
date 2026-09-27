using System;
using System.Threading;
using System.Threading.Tasks;

namespace TRIAD.Battle
{
    public enum TriadBattleTransportState
    {
        Disabled,
        Disconnected,
        Connecting,
        Connected,
        Reconnecting,
        Unavailable
    }

    public interface ITriadBattleTransport
    {
        TriadBattleTransportState State { get; }
        Task ConnectAsync(string sessionId, CancellationToken cancellationToken);
        Task SendAsync(string payload, CancellationToken cancellationToken);
        Task DisconnectAsync(CancellationToken cancellationToken);
    }

    public sealed class TriadBattleUnavailableTransport : ITriadBattleTransport
    {
        public TriadBattleTransportState State => TriadBattleTransportState.Unavailable;

        public Task ConnectAsync(string sessionId, CancellationToken cancellationToken) =>
            Task.FromException(new InvalidOperationException("TRIAD online transport is not configured."));

        public Task SendAsync(string payload, CancellationToken cancellationToken) =>
            Task.FromException(new InvalidOperationException("TRIAD online transport is not configured."));

        public Task DisconnectAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
