using System;
using System.Collections.Generic;
using TRIAD.Core.Board;
using TRIAD.Core.Rules;
using UnityEngine;
using UnityEngine.UI;

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
        [SerializeField] private TriadBattleModeSelector modeSelector;
        [SerializeField] private Button resumeButton;
        [SerializeField] private Text resumeLabel;
        private readonly List<TriadBattleActionEnvelope> actions = new();
        private bool restoring;

        public TriadBattleBoardController Controller => controller;
        public bool HasCheckpoint => TryRead(out _);

        public void Configure(TriadBattleBoardController battleController, TriadBattleSessionContext session)
        {
            controller = battleController;
            sessionContext = session;
        }

        public void ConfigureRestore(TriadBattleModeSelector selector, Button button, Text label)
        {
            modeSelector = selector;
            resumeButton = button;
            resumeLabel = label;
        }

        private void Awake()
        {
            if (controller != null) controller.ActionCommitted += OnActionCommitted;
            if (sessionContext != null) sessionContext.Changed += OnSessionChanged;
            if (resumeButton != null) resumeButton.onClick.AddListener(ResumeCheckpoint);
            RefreshRestoreUi();
        }

        private void OnDestroy()
        {
            if (controller != null) controller.ActionCommitted -= OnActionCommitted;
            if (sessionContext != null) sessionContext.Changed -= OnSessionChanged;
            if (resumeButton != null) resumeButton.onClick.RemoveListener(ResumeCheckpoint);
        }

        private void OnSessionChanged(TriadBattleSessionContext session)
        {
            if (restoring) return;
            actions.Clear();
            SaveCurrent();
            RefreshRestoreUi();
        }

        private void OnActionCommitted(MatchAction action)
        {
            if (restoring) return;
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
            RefreshRestoreUi();
        }

        private void ResumeCheckpoint()
        {
            if (!TryRead(out TriadBattleCheckpointPayload payload) ||
                !Enum.TryParse(payload.mode, out TriadBattleSessionMode mode) || modeSelector == null)
            {
                ClearCheckpoint();
                RefreshRestoreUi();
                return;
            }

            restoring = true;
            bool succeeded = true;
            try
            {
                modeSelector.ResumeOffline(mode, payload.sessionId);
                controller?.SetInputLocked(true);
                foreach (TriadBattleActionEnvelope envelope in payload.actions)
                {
                    MatchAction action = ToAction(envelope);
                    if (action == null || controller == null || !controller.TryApplyAction(action))
                    {
                        succeeded = false;
                        break;
                    }
                }
                actions.Clear();
                if (succeeded) actions.AddRange(payload.actions);
            }
            finally
            {
                restoring = false;
                controller?.SetInputLocked(false);
            }

            if (succeeded) SaveCurrent();
            else
            {
                ClearCheckpoint();
                controller?.StartMatch();
            }
            RefreshRestoreUi();
        }

        private static MatchAction ToAction(TriadBattleActionEnvelope envelope)
        {
            if (envelope == null || !Enum.TryParse(envelope.kind, out MatchActionKind kind)) return null;
            var target = new BoardCoordinate(envelope.targetX, envelope.targetY);
            BoardCoordinate? source = envelope.sourceX >= 0 && envelope.sourceY >= 0
                ? new BoardCoordinate(envelope.sourceX, envelope.sourceY)
                : null;
            return kind switch
            {
                MatchActionKind.Place => MatchAction.Place(envelope.seat, target),
                MatchActionKind.Skill => MatchAction.Skill(envelope.seat, envelope.skillId, target, source),
                MatchActionKind.Extra => MatchAction.Extra(envelope.seat, target),
                _ => null
            };
        }

        private void RefreshRestoreUi()
        {
            bool available = TryRead(out TriadBattleCheckpointPayload payload);
            if (resumeButton != null) resumeButton.interactable = available;
            if (resumeLabel == null) return;
            if (!available)
            {
                resumeLabel.text = "中断対局なし";
                return;
            }
            string mode = payload.mode == TriadBattleSessionMode.Solo.ToString() ? "一人用" : "三人ローカル";
            resumeLabel.text = $"中断対局を再開  ・  {mode}  {payload.actions.Count}手";
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
            RefreshRestoreUi();
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
