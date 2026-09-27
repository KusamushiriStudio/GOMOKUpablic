using System;
using System.Collections.Generic;
using TRIAD.Core.Rules;
using UnityEngine;

namespace TRIAD.Battle
{
    [Serializable]
    public sealed class TriadBattleCheckpointPayload
    {
        public string sessionId;
        public string mode;
        public long savedUtcTicks;
        public List<TriadBattleActionEnvelope> actions = new();
    }

    [DisallowMultipleComponent]
    public sealed class TriadBattleCheckpointStore : MonoBehaviour
    {
        private const string CheckpointKey = "TRIAD.Battle.Checkpoint.v1";

        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattleSessionContext sessionContext;
        private readonly List<TriadBattleActionEnvelope> actions = new();

        public TriadBattleBoardController Controller => controller;
        public bool HasCheckpoint => TryRead(out _);

        public void Configure(TriadBattleBoardController battleController, TriadBattleSessionContext session)
        {
            controller = battleController;
            sessionContext = session;
        }

        private void Awake()
        {
            if (controller != null) controller.ActionCommitted += OnActionCommitted;
            if (sessionContext != null) sessionContext.Changed += OnSessionChanged;
        }

        private void OnDestroy()
        {
            if (controller != null) controller.ActionCommitted -= OnActionCommitted;
            if (sessionContext != null) sessionContext.Changed -= OnSessionChanged;
        }

        private void OnSessionChanged(TriadBattleSessionContext session)
        {
            actions.Clear();
            SaveCurrent();
        }

        private void OnActionCommitted(MatchAction action)
        {
            if (action == null)
            {
                actions.Clear();
                SaveCurrent();
                return;
            }
            if (controller != null && controller.State != null && controller.State.IsFinished)
            {
                ClearCheckpoint();
                return;
            }

            var envelope = new TriadBattleActionEnvelope
            {
                sessionId = sessionContext != null ? sessionContext.SessionId : string.Empty,
                sequence = actions.Count + 1,
                seat = action.Seat,
                kind = action.Kind.ToString(),
                skillId = action.SkillId ?? string.Empty,
                targetX = action.Target.X,
                targetY = action.Target.Y
            };
            if (action.Source.HasValue)
            {
                envelope.sourceX = action.Source.Value.X;
                envelope.sourceY = action.Source.Value.Y;
            }
            actions.Add(envelope);
            SaveCurrent();
        }

        private void SaveCurrent()
        {
            if (sessionContext == null ||
                (sessionContext.Mode != TriadBattleSessionMode.Solo &&
                 sessionContext.Mode != TriadBattleSessionMode.Local) || actions.Count == 0)
            {
                ClearCheckpoint();
                return;
            }
            var payload = new TriadBattleCheckpointPayload
            {
                sessionId = sessionContext.SessionId,
                mode = sessionContext.Mode.ToString(),
                savedUtcTicks = DateTime.UtcNow.Ticks,
                actions = new List<TriadBattleActionEnvelope>(actions)
            };
            PlayerPrefs.SetString(CheckpointKey, JsonUtility.ToJson(payload));
            PlayerPrefs.Save();
        }

        public static bool TryRead(out TriadBattleCheckpointPayload payload)
        {
            payload = null;
            string json = PlayerPrefs.GetString(CheckpointKey, string.Empty);
            if (string.IsNullOrWhiteSpace(json)) return false;
            try
            {
                payload = JsonUtility.FromJson<TriadBattleCheckpointPayload>(json);
                return payload != null && !string.IsNullOrWhiteSpace(payload.sessionId) &&
                       payload.actions != null && payload.actions.Count > 0 &&
                       Enum.TryParse(payload.mode, out TriadBattleSessionMode mode) &&
                       (mode == TriadBattleSessionMode.Solo || mode == TriadBattleSessionMode.Local);
            }
            catch (ArgumentException)
            {
                payload = null;
                return false;
            }
        }

        public static void ClearCheckpoint()
        {
            PlayerPrefs.DeleteKey(CheckpointKey);
            PlayerPrefs.Save();
        }
    }
}
