using NUnit.Framework;
using TRIAD.Core.Board;
using TRIAD.Core.Common;
using TRIAD.Core.Gacha;
using TRIAD.Core.Rules;
using TRIAD.Core.Save;
using TRIAD.Core.Skills;
using TRIAD.Core.Story;

namespace TRIAD.Core.Tests
{
    public sealed class CoreSpecificationTests
    {
        [Test]
        public void Board_StandardGeometry_Is11By17With187PointsAndF9Center()
        {
            var board = new BoardState();
            Assert.AreEqual(11, board.Width);
            Assert.AreEqual(17, board.Height);
            Assert.AreEqual(187, board.Size);
            Assert.AreEqual(93, BoardState.StandardCenter.ToIndex(board.Width, board.Height));
        }

        [TestCase(0, 0, 1, 0)]
        [TestCase(0, 0, 0, 1)]
        [TestCase(0, 0, 1, 1)]
        [TestCase(4, 5, 1, -1)]
        public void WinDetector_FindsFiveOrMore_InAllFourAxes(int x, int y, int dx, int dy)
        {
            var board = new BoardState();
            BoardCoordinate origin = default;
            for (var i = 0; i < 6; i++)
            {
                var c = new BoardCoordinate(x + dx * i, y + dy * i);
                board.Place(c, 1);
                if (i == 3) origin = c;
            }
            var line = WinDetector.FindWinningLine(board, origin);
            Assert.NotNull(line);
            Assert.GreaterOrEqual(line.Coordinates.Count, 5);
            Assert.AreEqual(1, line.Seat);
        }

        [Test]
        public void Place_RejectsOutOfBoundsAndOccupied()
        {
            var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            Assert.IsFalse(RuleEngine.Apply(state, MatchAction.Place(1, new BoardCoordinate(-1, 0))).Success);
            state.Board.Place(new BoardCoordinate(0, 0), 2);
            Assert.IsFalse(RuleEngine.Apply(state, MatchAction.Place(1, new BoardCoordinate(0, 0))).Success);
        }

        [Test]
        public void PvpBalanceV2_PreservesLegacyDeclarationButDisablesSkillPlusPlace()
        {
            var ruleset = RulesetCatalog.PvpBalanceV2;
            Assert.IsTrue(ruleset.DeclaredSkillPlusPlace);
            Assert.IsFalse(ruleset.SkillPlusPlaceEnabled);
            Assert.AreEqual("none", ruleset.RewardsRoute);
            Assert.AreEqual("verify", ruleset.StatsRoute);
            Assert.IsFalse(ruleset.UsesV99Tuning);
        }

        [Test]
        public void PvpV99_RemainsLegacyDefinition()
        {
            var ruleset = RulesetCatalog.PvpV99;
            Assert.IsTrue(ruleset.RandomStartSeat);
            Assert.IsTrue(ruleset.UsesV99Tuning);
            var state = MatchState.Create(RulesetCatalog.PvpV99Id, 2);
            Assert.AreEqual(2, state.TurnSeat);
            Assert.AreEqual(1, state.Energy[2]);
        }

        [TestCase(StableIds.Spark, 4, 2)]
        [TestCase(StableIds.Ward, 2, 2)]
        [TestCase(StableIds.Windwalk, 3, 2)]
        [TestCase(StableIds.Freeze, 2, 2)]
        [TestCase(StableIds.Pull, 4, 2)]
        [TestCase(StableIds.Transmute, 6, 1)]
        public void BalanceV2_SixSkills_HaveFixedBaseContracts(string id, int cost, int uses)
        {
            var skill = SkillCatalog.Get(RulesetCatalog.PvpBalanceV2Id, id);
            Assert.AreEqual(cost, skill.Cost);
            Assert.AreEqual(uses, skill.Uses);
        }

        [Test]
        public void SuccessfulSkill_ConsumesWholeTurn_NoSkillPlusPlace()
        {
            var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            state.Board.Place(new BoardCoordinate(0, 0), 1);
            state.Energy[1] = 6;
            var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Ward, new BoardCoordinate(0, 0)));
            Assert.IsTrue(result.Success);
            Assert.AreEqual(2, result.State.TurnSeat);
            Assert.AreEqual(1, result.State.Ply);
        }

        [Test]
        public void SixSkillEffects_ExecuteBasicContracts()
        {
            var spark = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            spark.Board.Place(new BoardCoordinate(1, 1), 2);
            spark.Energy[1] = 6;
            Assert.IsTrue(RuleEngine.Apply(spark, MatchAction.Skill(1, StableIds.Spark, new BoardCoordinate(1, 1))).Success);

            var ward = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            ward.Board.Place(new BoardCoordinate(1, 1), 1);
            ward.Energy[1] = 6;
            Assert.IsTrue(RuleEngine.Apply(ward, MatchAction.Skill(1, StableIds.Ward, new BoardCoordinate(1, 1))).Success);

            var wind = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            wind.Board.Place(new BoardCoordinate(1, 1), 1);
            wind.Energy[1] = 6;
            Assert.IsTrue(RuleEngine.Apply(wind, MatchAction.Skill(1, StableIds.Windwalk, new BoardCoordinate(2, 1), new BoardCoordinate(1, 1))).Success);

            var freeze = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            freeze.Energy[1] = 6;
            Assert.IsTrue(RuleEngine.Apply(freeze, MatchAction.Skill(1, StableIds.Freeze, new BoardCoordinate(2, 2))).Success);

            var pull = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            pull.Board.Place(new BoardCoordinate(2, 2), 2);
            pull.Energy[1] = 6;
            Assert.IsTrue(RuleEngine.Apply(pull, MatchAction.Skill(1, StableIds.Pull, new BoardCoordinate(3, 2), new BoardCoordinate(2, 2))).Success);

            var transmute = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            transmute.Board.Place(new BoardCoordinate(2, 2), 2);
            transmute.Energy[1] = 6;
            Assert.IsTrue(RuleEngine.Apply(transmute, MatchAction.Skill(1, StableIds.Transmute, new BoardCoordinate(2, 2))).Success);
        }

        [Test]
        public void MinStoneJudgement_ReturnsAllTiedMinimumSeats()
        {
            var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            state.Board.Place(new BoardCoordinate(0, 0), 1);
            state.Board.Place(new BoardCoordinate(1, 0), 1);
            state.Board.Place(new BoardCoordinate(2, 0), 2);
            state.Board.Place(new BoardCoordinate(3, 0), 3);
            CollectionAssert.AreEquivalent(new[] { 2, 3 }, MatchOutcomeResolver.ResolveMinStoneWinners(state));
        }

        [Test]
        public void V99_LegacyTuningDefinition_IsPreserved()
        {
            Assert.AreEqual(44, V99Tuning.Legacy.LongTurn);
            CollectionAssert.AreEqual(new[] { 1, 1, 0 }, V99Tuning.Legacy.OrderPenalty);
            Assert.IsTrue(V99Tuning.Legacy.SparkCanRefill);
            Assert.IsTrue(V99Tuning.Legacy.SparkBreaksWard);
            Assert.AreEqual(2, V99Tuning.Legacy.WardBreakEnergy);
        }

        [TestCase(StableIds.Spark, 2)]
        [TestCase(StableIds.Ward, 3)]
        [TestCase(StableIds.Windwalk, 2)]
        [TestCase(StableIds.Freeze, 3)]
        [TestCase(StableIds.Pull, 2)]
        [TestCase(StableIds.Transmute, 2)]
        public void V99_UsesFloorAndExtraPlacements_AreIndependent(string skillId, int extraPlacements)
        {
            var skill = SkillCatalog.Get(RulesetCatalog.PvpV99Id, skillId);
            var enhancement = V99Tuning.Legacy.GetEnhancement(skillId);
            Assert.AreEqual(1, skill.Cost);
            Assert.AreEqual(12, skill.Uses);
            Assert.AreEqual(12, enhancement.UsesFloor);
            Assert.AreEqual(extraPlacements, enhancement.ExtraPlacements);
        }

        [Test]
        public void V99_SparkKeepsTurnUntilLegacyExtraPlacementCompletes()
        {
            var state = MatchState.Create(RulesetCatalog.PvpV99Id, 1);
            state.Board.Place(new BoardCoordinate(1, 1), 2);
            state.Energy[1] = 6;

            var skill = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Spark, new BoardCoordinate(1, 1)));
            Assert.IsTrue(skill.Success);
            Assert.AreEqual(1, skill.State.TurnSeat);
            Assert.AreEqual(1, skill.State.PendingExtraPlacements);
            Assert.AreEqual(0, skill.State.Ply);

            var extra = RuleEngine.Apply(skill.State, MatchAction.Extra(1, new BoardCoordinate(1, 1)));
            Assert.IsTrue(extra.Success);
            Assert.AreEqual(1, extra.State.Board.GetOwner(new BoardCoordinate(1, 1)));
            Assert.AreEqual(0, extra.State.PendingExtraPlacements);
            Assert.AreEqual(2, extra.State.TurnSeat);
            Assert.AreEqual(1, extra.State.Ply);
        }

        [Test]
        public void V99_OrderPenalty_ReducesButDoesNotMergeExtraPlacementsIntoUses()
        {
            var state = MatchState.Create(RulesetCatalog.PvpV99Id, 1);
            state.Board.Place(new BoardCoordinate(2, 2), 1);
            state.Energy[1] = 6;

            var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Ward, new BoardCoordinate(2, 2)));
            Assert.IsTrue(result.Success);
            Assert.AreEqual(2, result.State.PendingExtraPlacements);
            Assert.AreEqual(1, result.State.GetSkillUseCount(1, StableIds.Ward));
        }

        [Test]
        public void Ward_RejectsDuplicateGuardWithoutMutatingTheTurn()
        {
            var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            var target = new BoardCoordinate(2, 2);
            state.Board.Place(target, 1);
            state.WardedIndices.Add(target.ToIndex(state.Board.Width, state.Board.Height));
            state.Energy[1] = 6;

            var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Ward, target));
            Assert.IsFalse(result.Success);
            Assert.AreEqual("bad_target", result.Error);
            Assert.AreSame(state, result.State);
        }

        [Test]
        public void PullAndTransmute_ResolveTheWinnerCreatedByTheSkillEffect()
        {
            var pull = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            pull.Energy[1] = 6;
            for (var x = 0; x < 4; x++) pull.Board.Place(new BoardCoordinate(x, 0), 2);
            pull.Board.Place(new BoardCoordinate(5, 0), 2);
            var pullResult = RuleEngine.Apply(pull,
                MatchAction.Skill(1, StableIds.Pull, new BoardCoordinate(4, 0), new BoardCoordinate(5, 0)));
            Assert.IsTrue(pullResult.Success);
            Assert.AreEqual(2, pullResult.State.WinnerSeat);

            var transmute = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            transmute.Energy[1] = 6;
            for (var x = 0; x < 4; x++) transmute.Board.Place(new BoardCoordinate(x, 0), 1);
            transmute.Board.Place(new BoardCoordinate(4, 0), 2);
            var transmuteResult = RuleEngine.Apply(transmute,
                MatchAction.Skill(1, StableIds.Transmute, new BoardCoordinate(4, 0)));
            Assert.IsTrue(transmuteResult.Success);
            Assert.AreEqual(1, transmuteResult.State.WinnerSeat);
        }

        [Test]
        public void V99_WardBreakRecovery_HappensAfterCostAndCapsAtMaxEnergy()
        {
            var state = MatchState.Create(RulesetCatalog.PvpV99Id, 1);
            var target = new BoardCoordinate(2, 2);
            state.Board.Place(target, 2);
            state.WardedIndices.Add(target.ToIndex(state.Board.Width, state.Board.Height));
            state.Energy[1] = MatchState.MaxEnergy;

            var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Spark, target));
            Assert.IsTrue(result.Success);
            Assert.AreEqual(MatchState.MaxEnergy, result.State.Energy[1]);
        }

        [Test]
        public void StoryGachaAndLegacyContracts_AreLocked()
        {
            Assert.AreEqual(30, StoryCoreConstants.StageCount);
            CollectionAssert.AreEqual(new[] { 1, 2, 3, 6, 11, 16, 21, 26 }, StoryCoreConstants.TrainingStages);
            Assert.AreEqual(28, GachaConstants.CosmeticPoolCount);
            Assert.AreEqual(6, GachaConstants.InitiallyAvailableCharacterCount);
            Assert.IsFalse(GachaConstants.CharacterUnlockGachaEnabled);
            Assert.IsTrue(LegacySaveMigrator.IsMigratableVersion(3));
            Assert.IsTrue(LegacySaveMigrator.IsMigratableVersion(4));
            Assert.IsTrue(LegacySaveMigrator.IsMigratableVersion(5));
            Assert.AreEqual(225, LegacySaveMigrator.CreateBoardPreservingLegacyGeometry(15, 15).Size);
        }
    }
}
