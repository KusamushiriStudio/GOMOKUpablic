namespace TRIAD.Core.Skills
{
    public sealed class SkillDefinition
    {
        public string Id { get; }
        public int Cost { get; }
        public int Uses { get; }

        public SkillDefinition(string id, int cost, int uses)
        {
            Id = id;
            Cost = cost;
            Uses = uses;
        }
    }
}
