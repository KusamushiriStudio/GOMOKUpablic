using TRIAD.Core.Board;

namespace TRIAD.Core.Rules
{
    public enum MatchActionKind
    {
        Place,
        Skill
    }

    public sealed class MatchAction
    {
        public MatchActionKind Kind { get; }
        public int Seat { get; }
        public string SkillId { get; }
        public BoardCoordinate? Source { get; }
        public BoardCoordinate Target { get; }

        private MatchAction(MatchActionKind kind, int seat, BoardCoordinate target, string skillId, BoardCoordinate? source)
        {
            Kind = kind;
            Seat = seat;
            Target = target;
            SkillId = skillId;
            Source = source;
        }

        public static MatchAction Place(int seat, BoardCoordinate target) =>
            new MatchAction(MatchActionKind.Place, seat, target, null, null);

        public static MatchAction Skill(int seat, string skillId, BoardCoordinate target, BoardCoordinate? source = null) =>
            new MatchAction(MatchActionKind.Skill, seat, target, skillId, source);
    }
}
