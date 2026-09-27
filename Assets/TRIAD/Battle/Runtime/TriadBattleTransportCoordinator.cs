using UnityEngine;

namespace TRIAD.Battle
{
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
