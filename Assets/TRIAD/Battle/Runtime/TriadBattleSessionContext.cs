using System;
using UnityEngine;

namespace TRIAD.Battle
{
    public enum TriadBattleSessionMode
    {
        None,
        Solo,
        Local,
        Online
    }

    public enum TriadBattleConnectionState
    {
        Offline,
        Connecting,
        Connected,
        Reconnecting,
        Unavailable
    }

    [DisallowMultipleComponent]
    public sealed class TriadBattleSessionContext : MonoBehaviour
    {
        [SerializeField] private TriadBattleSessionMode mode;
        [SerializeField] private TriadBattleConnectionState connectionState = TriadBattleConnectionState.Offline;
        [SerializeField] private string sessionId = string.Empty;
        [SerializeField] private int localSeat = 1;

        public TriadBattleSessionMode Mode => mode;
        public TriadBattleConnectionState ConnectionState => connectionState;
        public string SessionId => sessionId;
        public int LocalSeat => localSeat;
        public event Action<TriadBattleSessionContext> Changed;

        public void BeginOffline(TriadBattleSessionMode selectedMode)
        {
            if (selectedMode != TriadBattleSessionMode.Solo && selectedMode != TriadBattleSessionMode.Local)
                throw new ArgumentOutOfRangeException(nameof(selectedMode));
            mode = selectedMode;
            connectionState = TriadBattleConnectionState.Offline;
            localSeat = 1;
            sessionId = $"offline-{Guid.NewGuid():N}";
            Changed?.Invoke(this);
        }

        public void RestoreOffline(TriadBattleSessionMode restoredMode, string restoredSessionId)
        {
            if (restoredMode != TriadBattleSessionMode.Solo && restoredMode != TriadBattleSessionMode.Local)
                throw new ArgumentOutOfRangeException(nameof(restoredMode));
            if (string.IsNullOrWhiteSpace(restoredSessionId))
                throw new ArgumentException("A restored session requires an id.", nameof(restoredSessionId));
            mode = restoredMode;
            connectionState = TriadBattleConnectionState.Offline;
            localSeat = 1;
            sessionId = restoredSessionId;
            Changed?.Invoke(this);
        }

        public void PrepareOnline()
        {
            mode = TriadBattleSessionMode.Online;
            connectionState = TriadBattleConnectionState.Unavailable;
            localSeat = 0;
            sessionId = string.Empty;
            Changed?.Invoke(this);
        }

        public void SetConnectionState(TriadBattleConnectionState state, string id = null, int seat = 0)
        {
            connectionState = state;
            if (id != null) sessionId = id;
            if (seat >= 1 && seat <= 3) localSeat = seat;
            Changed?.Invoke(this);
        }
    }
}
