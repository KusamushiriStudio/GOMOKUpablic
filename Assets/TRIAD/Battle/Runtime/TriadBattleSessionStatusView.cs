using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleSessionStatusView : MonoBehaviour
    {
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private Text statusLabel;

        public TriadBattleSessionContext SessionContext => sessionContext;

        public void Configure(TriadBattleSessionContext session, Text label)
        {
            sessionContext = session;
            statusLabel = label;
        }

        private void Awake()
        {
            if (sessionContext != null) sessionContext.Changed += Refresh;
            Refresh(sessionContext);
        }

        private void OnDestroy()
        {
            if (sessionContext != null) sessionContext.Changed -= Refresh;
        }

        private void Refresh(TriadBattleSessionContext session)
        {
            if (statusLabel == null) return;
            if (session == null || session.Mode == TriadBattleSessionMode.None)
            {
                statusLabel.text = "SESSION  未選択";
                return;
            }
            string mode = session.Mode switch
            {
                TriadBattleSessionMode.Solo => "SOLO",
                TriadBattleSessionMode.Local => "LOCAL",
                TriadBattleSessionMode.Online => "ONLINE",
                _ => "SESSION"
            };
            string state = session.ConnectionState switch
            {
                TriadBattleConnectionState.Offline => "オフライン",
                TriadBattleConnectionState.Connecting => "接続中",
                TriadBattleConnectionState.Connected => "接続済",
                TriadBattleConnectionState.Reconnecting => "再接続中",
                TriadBattleConnectionState.Unavailable => "未接続",
                _ => "不明"
            };
            statusLabel.text = $"{mode}  /  {state}";
        }
    }
}
