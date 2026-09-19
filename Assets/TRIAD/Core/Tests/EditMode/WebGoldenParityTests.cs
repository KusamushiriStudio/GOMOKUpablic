using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NUnit.Framework;
using TRIAD.Core.Board;
using TRIAD.Core.Common;
using TRIAD.Core.Gacha;
using TRIAD.Core.Rules;
using TRIAD.Core.Save;
using TRIAD.Core.Skills;
using TRIAD.Core.Story;
using UnityEngine;

namespace TRIAD.Core.Tests
{
    public sealed class WebGoldenParityTests
    {
        private const string FixtureName = "web-golden-main-1bf3689.json";

        [Serializable]
        public sealed class GoldenFile
        {
            public int schemaVersion;
            public string webSourceCommit;
            public int fixtureCount;
            public GoldenFixture[] fixtures;
        }

        [Serializable]
        public sealed class GoldenFixture
        {
            public string id;
            public string category;
            public string comparison;
            public string kind;
            public int expectedInt;
            public bool expectedBool;
            public string expectedString;
            public int[] expectedIntArray;
            public string[] expectedStringArray;
            public string reason;
        }

        public static IEnumerable ExactFixtures()
        {
            var file = LoadFixtureFile();
            foreach (var fixture in file.fixtures.Where(item => item.comparison == "EXACT"))
            {
                yield return new TestCaseData(fixture)
                    .SetName("WebGolden_" + fixture.id.Replace('.', '_'));
            }
        }

        [Test]
        public void WebGoldenFixtureManifest_IsPinnedAndAccountsForEveryFixture()
        {
            var file = LoadFixtureFile();
            Assert.AreEqual(1, file.schemaVersion);
            Assert.AreEqual("1bf36894967a13358a09eda1d5b518064db5e488", file.webSourceCommit);
            Assert.AreEqual(file.fixtureCount, file.fixtures.Length);
            Assert.AreEqual(106, file.fixtureCount);
            Assert.AreEqual(4, file.fixtures.Count(item => item.comparison == "NOT_RUN"));
        }

        [TestCaseSource(nameof(ExactFixtures))]
        public void WebGoldenFixture_MatchesPureCore(GoldenFixture fixture)
        {
            var actual = ResolveActual(fixture.id);
            switch (fixture.kind)
            {
                case "int":
                    Assert.AreEqual(fixture.expectedInt, actual, fixture.id);
                    break;
                case "bool":
                    Assert.AreEqual(fixture.expectedBool, actual, fixture.id);
                    break;
                case "string":
                    Assert.AreEqual(fixture.expectedString, actual, fixture.id);
                    break;
                case "intArray":
                    CollectionAssert.AreEqual(fixture.expectedIntArray, (IEnumerable<int>)actual, fixture.id);
                    break;
                case "stringArray":
                    CollectionAssert.AreEqual(fixture.expectedStringArray, (IEnumerable<string>)actual, fixture.id);
                    break;
                default:
                    Assert.Fail($"Unsupported Golden fixture kind: {fixture.kind}");
                    break;
            }
        }

        private static GoldenFile LoadFixtureFile()
        {
            var path = Path.Combine(UnityEngine.Application.dataPath, "TRIAD", "Core", "Tests", "Fixtures", FixtureName);
            Assert.IsTrue(File.Exists(path), $"Golden fixture file is missing: {path}");
            var file = JsonUtility.FromJson<GoldenFile>(File.ReadAllText(path));
            Assert.NotNull(file);
            Assert.NotNull(file.fixtures);
            return file;
        }

        private static object ResolveActual(string id)
        {
            switch (id)
            {
                case "board.width": return BoardState.StandardWidth;
                case "board.height": return BoardState.StandardHeight;
                case "board.size": return BoardState.StandardSize;
                case "board.centerIndex": return BoardState.StandardCenter.ToIndex(BoardState.StandardWidth, BoardState.StandardHeight);
                case "board.winLength": return 5;
                case "board.legacyWidth": return LegacySaveMigrator.LegacyBoardWidth;
                case "board.legacyHeight": return LegacySaveMigrator.LegacyBoardHeight;
                case "ruleset.pvp_balance_v2.seats": return RulesetCatalog.PvpBalanceV2.Seats;
                case "ruleset.pvp_balance_v2.iceOffset": return RulesetCatalog.PvpBalanceV2.IceOffset;
                case "ruleset.pvp_balance_v2.declaredSkillPlusPlace": return RulesetCatalog.PvpBalanceV2.DeclaredSkillPlusPlace;
                case "ruleset.pvp_balance_v2.telegraph": return RulesetCatalog.PvpBalanceV2.Telegraph;
                case "ruleset.pvp_balance_v2.minStoneJudgement": return RulesetCatalog.PvpBalanceV2.MinStoneJudgement;
                case "ruleset.pvp_balance_v2.rewards": return RulesetCatalog.PvpBalanceV2.RewardsRoute;
                case "ruleset.pvp_balance_v2.stats": return RulesetCatalog.PvpBalanceV2.StatsRoute;
                case "ruleset.pvp_v99.seats": return RulesetCatalog.PvpV99.Seats;
                case "ruleset.pvp_v99.iceOffset": return RulesetCatalog.PvpV99.IceOffset;
                case "ruleset.pvp_v99.skillPlusPlace": return RulesetCatalog.PvpV99.DeclaredSkillPlusPlace;
                case "ruleset.pvp_v99.telegraph": return RulesetCatalog.PvpV99.Telegraph;
                case "ruleset.pvp_v99.minStoneJudgement": return RulesetCatalog.PvpV99.MinStoneJudgement;
                case "ruleset.pvp_v99.randomStartSeat": return RulesetCatalog.PvpV99.RandomStartSeat;
                case "ruleset.pvp_v99.rewards": return RulesetCatalog.PvpV99.RewardsRoute;
                case "ruleset.pvp_v99.stats": return RulesetCatalog.PvpV99.StatsRoute;
                case "ruleset.pvp_v99.unlockTurn": return V99Tuning.Legacy.UnlockTurn;
                case "ruleset.pvp_v99.longTurn": return V99Tuning.Legacy.LongTurn;
                case "ruleset.pvp_v99.sparkCanRefill": return V99Tuning.Legacy.SparkCanRefill;
                case "ruleset.pvp_v99.sparkBreaksWard": return V99Tuning.Legacy.SparkBreaksWard;
                case "ruleset.pvp_v99.wardBreakEnergy": return V99Tuning.Legacy.WardBreakEnergy;
                case "ruleset.pvp_v99.unlockOffsetByOrder": return V99Tuning.Legacy.UnlockOffsetByOrder;
                case "ruleset.pvp_v99.orderPenalty": return V99Tuning.Legacy.OrderPenalty;
                case "ruleset.pvp_v99.longRecover": return V99Tuning.Legacy.LongRecover;
                case "story.stageCount": return StoryCoreConstants.StageCount;
                case "story.trainingStages": return StoryCoreConstants.TrainingStages;
                case "story.skillUnlocks": return StoryCoreConstants.SkillUnlocks.Select(item => $"{item.Stage}:{item.SkillId}").ToArray();
                case "gacha.singleCost": return GachaConstants.SingleCost;
                case "gacha.multiCost": return GachaConstants.MultiCost;
                case "gacha.multiPullCount": return GachaConstants.MultiPullCount;
                case "gacha.cosmeticPoolCount": return GachaConstants.CosmeticPoolCount;
                case "gacha.initialCharacterCount": return GachaConstants.InitiallyAvailableCharacterCount;
                case "gacha.rarityWeights": return new[] { GachaConstants.WeightSSR, GachaConstants.WeightSR, GachaConstants.WeightR, GachaConstants.WeightN };
                case "gacha.totalWeight": return GachaConstants.TotalWeight;
                case "save.currentVersion": return LegacySaveMigrator.CurrentSaveVersion;
                case "save.migratableVersions": return new[] { 3, 4, 5 }.Where(LegacySaveMigrator.IsMigratableVersion).ToArray();
                case "save.legacyBoardSize": return LegacySaveMigrator.CreateBoardPreservingLegacyGeometry(15, 15).Size;
            }

            if (id.StartsWith("win.", StringComparison.Ordinal)) return ResolveWin(id);
            if (id.StartsWith("skill.", StringComparison.Ordinal) && id.Contains(".effect.")) return ResolveSkillEffect(id);
            if (id.StartsWith("skill.", StringComparison.Ordinal)) return ResolveBaseSkill(id);
            if (id.StartsWith("ruleset.pvp_v99.enhance.", StringComparison.Ordinal)) return ResolveV99Enhancement(id);
            if (id.StartsWith("ruleset.pvp_v99.behavior.", StringComparison.Ordinal)) return ResolveV99Behavior(id);
            throw new KeyNotFoundException($"No C# Golden resolver for {id}");
        }

        private static object ResolveWin(string id)
        {
            var parts = id.Split('.');
            var board = new BoardState();
            var name = parts[1];
            var owner = 1;
            var x = 0;
            var y = 0;
            var dx = 1;
            var dy = 0;
            var length = 5;

            switch (name)
            {
                case "horizontal5": owner = 1; x = 2; y = 4; break;
                case "vertical5": owner = 2; x = 5; y = 2; dx = 0; dy = 1; break;
                case "diagonalDown5": owner = 3; x = 1; y = 3; dx = 1; dy = 1; break;
                case "diagonalUp5": owner = 1; x = 7; y = 3; dx = -1; dy = 1; break;
                case "horizontal6": owner = 2; x = 2; y = 8; length = 6; break;
                default: throw new KeyNotFoundException(name);
            }

            BoardCoordinate origin = default;
            for (var index = 0; index < length; index++)
            {
                origin = new BoardCoordinate(x + dx * index, y + dy * index);
                board.Place(origin, owner);
            }
            var win = WinDetector.FindWinningLine(board, origin);
            return parts[2] == "owner" ? win.Seat : win.Coordinates.Count;
        }

        private static object ResolveBaseSkill(string id)
        {
            var parts = id.Split('.');
            var skill = SkillCatalog.Get(RulesetCatalog.PvpBalanceV2Id, parts[1]);
            return parts[2] == "cost" ? skill.Cost : skill.Uses;
        }

        private static object ResolveSkillEffect(string id)
        {
            if (id.StartsWith("skill.spark.", StringComparison.Ordinal))
            {
                var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
                state.Energy[1] = MatchState.MaxEnergy;
                var target = CoordinateAt(20);
                state.Board.Place(target, 2);
                var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Spark, target));
                return id.EndsWith("targetOwner", StringComparison.Ordinal)
                    ? result.State.Board.GetOwner(target)
                    : result.State.Energy[1];
            }

            if (id.StartsWith("skill.ward.", StringComparison.Ordinal))
            {
                var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
                state.Energy[1] = MatchState.MaxEnergy;
                var target = CoordinateAt(30);
                state.Board.Place(target, 1);
                if (id.EndsWith("duplicateCode", StringComparison.Ordinal))
                {
                    state.WardedIndices.Add(30);
                    return RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Ward, target)).Error;
                }
                var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Ward, target));
                return result.State.WardedIndices.Contains(30) ? 1 : 0;
            }

            if (id.StartsWith("skill.windwalk.", StringComparison.Ordinal))
            {
                var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
                state.Energy[1] = MatchState.MaxEnergy;
                var source = CoordinateAt(30);
                var target = CoordinateAt(31);
                state.Board.Place(source, 1);
                state.WardedIndices.Add(30);
                var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Windwalk, target, source));
                if (id.EndsWith("sourceOwner", StringComparison.Ordinal)) return result.State.Board.GetOwner(source);
                if (id.EndsWith("targetOwner", StringComparison.Ordinal)) return result.State.Board.GetOwner(target);
                return result.State.WardedIndices.Contains(31) ? 1 : 0;
            }

            if (id.StartsWith("skill.freeze.", StringComparison.Ordinal))
            {
                var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
                state.Energy[1] = MatchState.MaxEnergy;
                var target = CoordinateAt(40);
                var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Freeze, target));
                return result.State.FrozenUntilPly[40];
            }

            if (id.StartsWith("skill.pull.", StringComparison.Ordinal))
            {
                var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
                state.Energy[1] = MatchState.MaxEnergy;
                for (var index = 0; index < 4; index++) state.Board.Place(CoordinateAt(index), 2);
                state.Board.Place(CoordinateAt(5), 2);
                var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Pull, CoordinateAt(4), CoordinateAt(5)));
                return result.State.WinnerSeat;
            }

            if (id.StartsWith("skill.transmute.", StringComparison.Ordinal))
            {
                var state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
                state.Energy[1] = MatchState.MaxEnergy;
                for (var index = 0; index < 4; index++) state.Board.Place(CoordinateAt(index), 1);
                state.Board.Place(CoordinateAt(4), 2);
                var result = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Transmute, CoordinateAt(4)));
                return result.State.WinnerSeat;
            }

            throw new KeyNotFoundException(id);
        }

        private static object ResolveV99Enhancement(string id)
        {
            var parts = id.Split('.');
            var characterId = parts[3];
            var field = parts[4];
            var enhancement = V99Tuning.Legacy.GetEnhancement(SkillIdForCharacter(characterId));
            if (field == "cost") return enhancement.Cost;
            if (field == "usesFloor") return enhancement.UsesFloor;
            if (field == "extra") return enhancement.ExtraPlacements;
            throw new MissingMemberException(field);
        }

        private static object ResolveV99Behavior(string id)
        {
            var state = MatchState.Create(RulesetCatalog.PvpV99Id, 1);
            var target = new BoardCoordinate(1, 1);
            state.Board.Place(target, 2);
            state.Energy[1] = MatchState.MaxEnergy;
            var skill = RuleEngine.Apply(state, MatchAction.Skill(1, StableIds.Spark, target));
            Assert.IsTrue(skill.Success, id);

            switch (id)
            {
                case "ruleset.pvp_v99.behavior.usesCap":
                    return SkillCatalog.Get(RulesetCatalog.PvpV99Id, StableIds.Spark).Uses;
                case "ruleset.pvp_v99.behavior.useCountAfterSkill":
                    return skill.State.GetSkillUseCount(1, StableIds.Spark);
                case "ruleset.pvp_v99.behavior.pendingAfterSkill":
                    return skill.State.PendingExtraPlacements;
                case "ruleset.pvp_v99.behavior.turnAfterSkill":
                    return skill.State.TurnSeat;
                case "ruleset.pvp_v99.behavior.plyAfterSkill":
                    return skill.State.Ply;
                case "ruleset.pvp_v99.behavior.energyAfterWardBreak":
                {
                    var wardState = MatchState.Create(RulesetCatalog.PvpV99Id, 1);
                    var wardTarget = CoordinateAt(20);
                    wardState.Board.Place(wardTarget, 2);
                    wardState.WardedIndices.Add(20);
                    wardState.Energy[1] = MatchState.MaxEnergy;
                    var wardBreak = RuleEngine.Apply(wardState, MatchAction.Skill(1, StableIds.Spark, wardTarget));
                    return wardBreak.State.Energy[1];
                }
            }

            var extra = RuleEngine.Apply(skill.State, MatchAction.Extra(1, target));
            Assert.IsTrue(extra.Success, id);
            switch (id)
            {
                case "ruleset.pvp_v99.behavior.ownerAfterExtra": return extra.State.Board.GetOwner(target);
                case "ruleset.pvp_v99.behavior.turnAfterExtra": return extra.State.TurnSeat;
                case "ruleset.pvp_v99.behavior.plyAfterExtra": return extra.State.Ply;
                default: throw new KeyNotFoundException(id);
            }
        }

        private static string SkillIdForCharacter(string characterId)
        {
            switch (characterId)
            {
                case StableIds.Hibana: return StableIds.Spark;
                case StableIds.Mamori: return StableIds.Ward;
                case StableIds.Hayate: return StableIds.Windwalk;
                case StableIds.Yukine: return StableIds.Freeze;
                case StableIds.Kuon: return StableIds.Pull;
                case StableIds.Akari: return StableIds.Transmute;
                default: throw new ArgumentException("Unknown character id.", nameof(characterId));
            }
        }

        private static BoardCoordinate CoordinateAt(int index) =>
            BoardCoordinate.FromIndex(index, BoardState.StandardWidth, BoardState.StandardHeight);
    }
}
