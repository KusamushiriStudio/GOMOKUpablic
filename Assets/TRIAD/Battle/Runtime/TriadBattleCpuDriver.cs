using System.Collections;
using TRIAD.Core.Board;
using TRIAD.Core.Rules;
using UnityEngine;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleCpuDriver : MonoBehaviour
    {
        [SerializeField] private TriadBattleBoardController controller;
        [SerializeField] private int automatedSeatMask = (1 << 2) | (1 << 3);
        [SerializeField] private float thinkDelay = .42f;
        private Coroutine pendingTurn;
        private int generation;

        public TriadBattleBoardController Controller => controller;
        public int AutomatedSeatMask => automatedSeatMask;

        public void Configure(TriadBattleBoardController battleController, int seatMask, float delay = .42f)
        {
            controller = battleController;
            automatedSeatMask = seatMask;
            thinkDelay = Mathf.Max(.05f, delay);
            controller?.SetAutomatedSeats(automatedSeatMask);
        }

        public void SetMode(int seatMask)
        {
            automatedSeatMask = seatMask;
            controller?.SetAutomatedSeats(automatedSeatMask);
            generation++;
            if (pendingTurn != null) StopCoroutine(pendingTurn);
            pendingTurn = null;
            Evaluate(controller?.State);
        }

        private void Awake()
        {
            if (controller == null) controller = FindFirstObjectByType<TriadBattleBoardController>();
            controller?.SetAutomatedSeats(automatedSeatMask);
            if (controller != null) controller.StateChanged += Evaluate;
        }

        private void Start() => Evaluate(controller?.State);

        private void OnDestroy()
        {
            if (controller != null) controller.StateChanged -= Evaluate;
        }

        private void Evaluate(MatchState state)
        {
            generation++;
            if (pendingTurn != null) StopCoroutine(pendingTurn);
            pendingTurn = null;
            if (state == null || state.IsFinished || !IsAutomated(state.TurnSeat)) return;
            pendingTurn = StartCoroutine(PlayTurnAfterDelay(state.TurnSeat, generation));
        }

        private IEnumerator PlayTurnAfterDelay(int seat, int token)
        {
            yield return new WaitForSecondsRealtime(thinkDelay);
            while (controller != null && controller.IsInputLocked)
            {
                if (token != generation) yield break;
                yield return null;
            }
            if (token != generation || controller == null || controller.State == null ||
                controller.State.IsFinished || controller.State.TurnSeat != seat || !IsAutomated(seat)) yield break;
            BoardCoordinate target = ChooseTarget(controller.State, seat);
            pendingTurn = null;
            controller.TryApplyAction(MatchAction.Place(seat, target));
        }

        private bool IsAutomated(int seat) => (automatedSeatMask & (1 << seat)) != 0;

        public static BoardCoordinate ChooseTarget(MatchState state, int seat)
        {
            BoardState board = state.Board;
            BoardCoordinate best = BoardState.StandardCenter;
            float bestScore = float.MinValue;
            for (int row = 0; row < board.Height; row++)
            for (int column = 0; column < board.Width; column++)
            {
                var candidate = new BoardCoordinate(column, row);
                if (!board.IsEmpty(candidate)) continue;
                float score = Score(board, candidate, seat);
                if (score > bestScore)
                {
                    bestScore = score;
                    best = candidate;
                }
            }
            return best;
        }

        private static float Score(BoardState board, BoardCoordinate target, int seat)
        {
            if (WouldWin(board, target, seat)) return 100000f;
            for (int opponent = 1; opponent <= 3; opponent++)
                if (opponent != seat && WouldWin(board, target, opponent)) return 50000f;

            float centerDistance = Mathf.Abs(target.X - (board.Width - 1) * .5f) +
                                   Mathf.Abs(target.Y - (board.Height - 1) * .5f);
            float score = 100f - centerDistance * 2.2f;
            for (int y = -1; y <= 1; y++)
            for (int x = -1; x <= 1; x++)
            {
                if (x == 0 && y == 0) continue;
                var nearby = new BoardCoordinate(target.X + x, target.Y + y);
                if (!nearby.IsInside(board.Width, board.Height)) continue;
                int owner = board.GetOwner(nearby);
                if (owner == seat) score += 8f;
                else if (owner != 0) score += 3f;
            }
            return score;
        }

        private static bool WouldWin(BoardState board, BoardCoordinate target, int seat)
        {
            BoardState clone = board.Clone();
            clone.SetOwner(target, seat);
            return WinDetector.HasFiveOrMore(clone, target);
        }
    }
}
