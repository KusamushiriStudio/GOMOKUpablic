using System;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

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

    [DisallowMultipleComponent]
    public sealed class TriadBattleTransportCoordinator : MonoBehaviour
    {
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private TriadBattleSessionJournal journal;
        private ITriadBattleTransport transport;

        public TriadBattleTransportState State => transport?.State ?? TriadBattleTransportState.Disabled;
        public TriadBattleSessionContext SessionContext => sessionContext;
        public bool HasConfiguredEndpoint => false;

        public void Configure(TriadBattleSessionContext session, TriadBattleSessionJournal sessionJournal)
        {
            sessionContext = session;
            journal = sessionJournal;
            transport = new TriadBattleUnavailableTransport();
        }

        private void Awake()
        {
            transport ??= new TriadBattleUnavailableTransport();
            if (sessionContext != null) sessionContext.Changed += OnSessionChanged;
        }

        private void OnDestroy()
        {
            if (sessionContext != null) sessionContext.Changed -= OnSessionChanged;
        }

        public string CreateOutboundSnapshot() => journal != null ? journal.ExportJson() : "{}";

        private void OnSessionChanged(TriadBattleSessionContext session)
        {
            if (session == null || session.Mode != TriadBattleSessionMode.Online ||
                session.ConnectionState == TriadBattleConnectionState.Unavailable) return;
            session.SetConnectionState(TriadBattleConnectionState.Unavailable);
        }
    }
}
