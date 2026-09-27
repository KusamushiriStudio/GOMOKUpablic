using System;
using System.Collections.Generic;
using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [Serializable]
    public sealed class TriadBattleActionEnvelope
    {
        public string sessionId;
        public int sequence;
        public int seat;
        public string kind;
        public string skillId;
        public int sourceX = -1;
        public int sourceY = -1;
        public int targetX;
        public int targetY;
    }

    [Serializable]
    internal sealed class TriadBattleJournalPayload
    {
        public string sessionId;
        public int lastSequence;
        public List<TriadBattleActionEnvelope> actions = new();
    }

    [DisallowMultipleComponent]
    public sealed class TriadBattleSessionJournal : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private TriadBattleSessionContext sessionContext;
        [SerializeField] private Text sequenceLabel;
        private readonly List<TriadBattleActionEnvelope> entries = new();

        public TriadBattleBoardController Controller => controller;
        public int LastSequence => entries.Count;
        public IReadOnlyList<TriadBattleActionEnvelope> Entries => entries;

        public void Configure(TriadBattleBoardController battleController,
            TriadBattleSessionContext session, Text label)
        {
            controller = battleController;
            sessionContext = session;
            sequenceLabel = label;
        }

        private void Awake()
        {
            if (controller != null) controller.ActionCommitted += OnActionCommitted;
            if (sessionContext != null) sessionContext.Changed += OnSessionChanged;
            RefreshLabel();
        }

        private void OnDestroy()
        {
            if (controller != null) controller.ActionCommitted -= OnActionCommitted;
            if (sessionContext != null) sessionContext.Changed -= OnSessionChanged;
        }

        public string ExportJson()
        {
            var payload = new TriadBattleJournalPayload
            {
                sessionId = sessionContext != null ? sessionContext.SessionId : string.Empty,
                lastSequence = LastSequence,
                actions = new List<TriadBattleActionEnvelope>(entries)
            };
            return JsonUtility.ToJson(payload);
        }

        private void OnSessionChanged(TriadBattleSessionContext session)
        {
            entries.Clear();
            RefreshLabel();
        }

        private void OnActionCommitted(MatchAction action)
        {
            if (action == null)
            {
                entries.Clear();
                RefreshLabel();
                return;
            }

            var envelope = new TriadBattleActionEnvelope
            {
                sessionId = sessionContext != null ? sessionContext.SessionId : string.Empty,
                sequence = entries.Count + 1,
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
            entries.Add(envelope);
            RefreshLabel();
        }

        private void RefreshLabel()
        {
            if (sequenceLabel != null) sequenceLabel.text = $"SYNC  #{LastSequence}";
        }
    }
}
