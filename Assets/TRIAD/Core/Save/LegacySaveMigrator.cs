using System;
using TRIAD.Core.Board;

namespace TRIAD.Core.Save
{
    public static class LegacySaveMigrator
    {
        public const int CurrentSaveVersion = 5;
        public const int LegacyBoardWidth = 15;
        public const int LegacyBoardHeight = 15;

        public static bool IsMigratableVersion(int version) => version == 3 || version == 4 || version == 5;

        public static BoardState CreateBoardPreservingLegacyGeometry(int savedWidth, int savedHeight)
        {
            if (savedWidth == LegacyBoardWidth && savedHeight == LegacyBoardHeight)
                return new BoardState(LegacyBoardWidth, LegacyBoardHeight);
            if (savedWidth == BoardState.StandardWidth && savedHeight == BoardState.StandardHeight)
                return new BoardState();
            throw new NotSupportedException("Unsupported saved board geometry.");
        }
    }
}
