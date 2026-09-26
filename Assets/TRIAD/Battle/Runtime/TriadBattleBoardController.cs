using System;
using System.Collections.Generic;
using TRIAD.Core.Board;
using TRIAD.Core.Common;
using TRIAD.Core.Rules;
using TRIAD.Core.Skills;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace TRIAD.Battle
{
    [DisallowMultipleComponent]
    public sealed class TriadBattleBoardController : MonoBehaviour, IPointerClickHandler
    {
        private const float GridSpacing = .04f;
        private const float BoardSurfaceY = .0185f;

        [SerializeField] private Camera boardCamera;
        [SerializeField] private Mesh stoneMesh;
        [SerializeField] private Transform stoneRoot;
        [SerializeField] private Text turnLabel;
        [SerializeField] private Text energyLabel;
        [SerializeField] private Text statusLabel;
        [SerializeField] private Button backButton;
        [SerializeField] private Button resetButton;
        [SerializeField] private string homeSceneName = "HomePhase34";

        private readonly List<GameObject> spawnedStones = new();
        private readonly Material[] seatMaterials = new Material[4];
        private MatchState state;
        private string selectedSkillId;
        private BoardCoordinate? selectedSource;

        public MatchState State => state;
        public Camera BoardCamera => boardCamera;
        public Mesh StoneMesh => stoneMesh;
        public int SpawnedStoneCount => spawnedStones.Count;
        public string SelectedSkillId => selectedSkillId;
        public BoardCoordinate? SelectedSource => selectedSource;
        public event Action<MatchState> StateChanged;
        public event Action<string> SkillSelectionChanged;

        public void Configure(Camera camera, Mesh mesh, Transform stones,
            Text turn, Text energy, Text status, Button back, Button reset, string homeScene)
        {
            boardCamera = camera;
            stoneMesh = mesh;
            stoneRoot = stones;
            turnLabel = turn;
            energyLabel = energy;
            statusLabel = status;
            backButton = back;
            resetButton = reset;
            homeSceneName = homeScene;
        }

        public void SetHomeSceneName(string sceneName) => homeSceneName = sceneName;

        private void Awake()
        {
            CreateMaterials();
            if (backButton != null) backButton.onClick.AddListener(ReturnHome);
            if (resetButton != null) resetButton.onClick.AddListener(StartMatch);
            StartMatch();
        }

        private void OnDestroy()
        {
            if (backButton != null) backButton.onClick.RemoveListener(ReturnHome);
            if (resetButton != null) resetButton.onClick.RemoveListener(StartMatch);
            for (int seat = 1; seat <= 3; seat++)
                if (seatMaterials[seat] != null) Destroy(seatMaterials[seat]);
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            if (state == null || state.IsFinished || boardCamera == null) return;
            Ray ray = boardCamera.ScreenPointToRay(eventData.position);
            Plane boardPlane = new Plane(Vector3.up, new Vector3(0f, BoardSurfaceY, 0f));
            if (!boardPlane.Raycast(ray, out float enter)) return;
            Vector3 point = ray.GetPoint(enter);
            int column = Mathf.RoundToInt((point.x + .20f) / GridSpacing);
            int row = Mathf.RoundToInt((point.z + .32f) / GridSpacing);
            var coordinate = new BoardCoordinate(column, row);
            if (!coordinate.IsInside(BoardState.StandardWidth, BoardState.StandardHeight)) return;
            Vector3 snapped = PositionFor(coordinate);
            if (Vector2.Distance(new Vector2(point.x, point.z), new Vector2(snapped.x, snapped.z)) > GridSpacing * .48f)
                return;

            int actingSeat = state.TurnSeat;
            MatchAction action;
            if (string.IsNullOrEmpty(selectedSkillId))
            {
                action = MatchAction.Place(actingSeat, coordinate);
            }
            else if ((selectedSkillId == StableIds.Windwalk || selectedSkillId == StableIds.Pull) && !selectedSource.HasValue)
            {
                selectedSource = coordinate;
                if (statusLabel != null) statusLabel.text = "移動先の交点を選択";
                SkillSelectionChanged?.Invoke(selectedSkillId);
                return;
            }
            else
            {
                action = MatchAction.Skill(actingSeat, selectedSkillId, coordinate, selectedSource);
            }

            ActionResult result = RuleEngine.Apply(state, action);
            if (!result.Success)
            {
                if (statusLabel != null) statusLabel.text = ErrorLabel(result.Error);
                return;
            }

            state = result.State;
            if (action.Kind == MatchActionKind.Place) SpawnStone(coordinate, actingSeat);
            else RebuildStonesFromState();
            string completedSkill = selectedSkillId;
            ClearSkillSelection();
            RefreshHud();
            if (!state.IsFinished && !string.IsNullOrEmpty(completedSkill) && statusLabel != null)
                statusLabel.text = SkillLabel(completedSkill) + "を発動";
            StateChanged?.Invoke(state);
        }

        public void SelectSkill(string skillId)
        {
            if (state == null || state.IsFinished) return;
            if (selectedSkillId == skillId)
            {
                ClearSkillSelection();
                if (statusLabel != null) statusLabel.text = "交点をタップして碁石を置く";
                return;
            }
            SkillDefinition definition;
            try { definition = SkillCatalog.Get(state.Ruleset.Id, skillId); }
            catch (ArgumentException) { return; }
            if (state.Energy[state.TurnSeat] < definition.Cost)
            {
                if (statusLabel != null) statusLabel.text = "気力が不足しています";
                return;
            }
            if (state.GetSkillUseCount(state.TurnSeat, skillId) >= definition.Uses)
            {
                if (statusLabel != null) statusLabel.text = "このスキルは使用上限です";
                return;
            }
            selectedSkillId = skillId;
            selectedSource = null;
            if (statusLabel != null)
                statusLabel.text = skillId == StableIds.Windwalk || skillId == StableIds.Pull
                    ? SkillLabel(skillId) + "：移動元を選択"
                    : SkillLabel(skillId) + "：対象を選択";
            SkillSelectionChanged?.Invoke(selectedSkillId);
        }

        public void CancelSkillSelection()
        {
            ClearSkillSelection();
            if (statusLabel != null) statusLabel.text = "交点をタップして碁石を置く";
        }

        public void StartMatch()
        {
            for (int i = spawnedStones.Count - 1; i >= 0; i--)
                if (spawnedStones[i] != null) Destroy(spawnedStones[i]);
            spawnedStones.Clear();
            state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            ClearSkillSelection();
            if (statusLabel != null) statusLabel.text = "交点をタップして碁石を置く";
            RefreshHud();
            StateChanged?.Invoke(state);
        }

        private void SpawnStone(BoardCoordinate coordinate, int seat, bool animate = true)
        {
            GameObject stone = new GameObject(
                $"Stone_S{seat}_{coordinate.X}_{coordinate.Y}", typeof(MeshFilter), typeof(MeshRenderer));
            stone.transform.SetParent(stoneRoot, false);
            stone.transform.localPosition = PositionFor(coordinate);
            stone.transform.localRotation = Quaternion.identity;
            stone.transform.localScale = Vector3.one;
            stone.GetComponent<MeshFilter>().sharedMesh = stoneMesh;
            stone.GetComponent<MeshRenderer>().sharedMaterial = seatMaterials[seat];
            if (animate) stone.AddComponent<TriadPlacedStoneMotion>();
            spawnedStones.Add(stone);
        }

        private void RebuildStonesFromState()
        {
            for (int i = spawnedStones.Count - 1; i >= 0; i--)
                if (spawnedStones[i] != null) Destroy(spawnedStones[i]);
            spawnedStones.Clear();
            for (int row = 0; row < state.Board.Height; row++)
            for (int column = 0; column < state.Board.Width; column++)
            {
                var coordinate = new BoardCoordinate(column, row);
                int owner = state.Board.GetOwner(coordinate);
                if (owner != 0) SpawnStone(coordinate, owner, false);
            }
        }

        private void ClearSkillSelection()
        {
            selectedSkillId = null;
            selectedSource = null;
            SkillSelectionChanged?.Invoke(null);
        }

        private void RefreshHud()
        {
            if (state == null) return;
            if (turnLabel != null)
                turnLabel.text = state.IsFinished ? $"勝者  席{state.WinnerSeat}" : $"手番  席{state.TurnSeat}";
            if (energyLabel != null)
                energyLabel.text = $"気力  {state.Energy[1]}  /  {state.Energy[2]}  /  {state.Energy[3]}";
            if (state.IsFinished && statusLabel != null)
                statusLabel.text = $"席{state.WinnerSeat}の五連が完成";
        }

        private void ReturnHome() => SceneManager.LoadScene(homeSceneName, LoadSceneMode.Single);

        private void CreateMaterials()
        {
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            seatMaterials[1] = NewMaterial(shader, new Color(.025f, .028f, .035f, 1f), .78f);
            seatMaterials[2] = NewMaterial(shader, new Color(.94f, .90f, .78f, 1f), .62f);
            seatMaterials[3] = NewMaterial(shader, new Color(.62f, .035f, .028f, 1f), .70f);
        }

        private static Material NewMaterial(Shader shader, Color color, float smoothness)
        {
            var material = new Material(shader) { color = color };
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", smoothness);
            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", .08f);
            return material;
        }

        private static Vector3 PositionFor(BoardCoordinate coordinate) =>
            new Vector3(-.20f + coordinate.X * GridSpacing, BoardSurfaceY + .0065f, -.32f + coordinate.Y * GridSpacing);

        private static string ErrorLabel(string error)
        {
            return error switch
            {
                "occupied" => "その交点にはすでに碁石があります",
                "not_your_turn" => "現在の手番ではありません",
                "match_finished" => "対局は終了しています",
                "insufficient_energy" => "気力が不足しています",
                "uses_exceeded" => "このスキルは使用上限です",
                "not_own_stone" => "自分の碁石を選んでください",
                "not_enemy_stone" => "相手の碁石を選んでください",
                "not_adjacent" => "隣接する交点を選んでください",
                "guarded" => "守護された碁石です",
                "frozen" => "凍結中の交点です",
                _ => "その位置には置けません"
            };
        }

        private static string SkillLabel(string id)
        {
            return id switch
            {
                StableIds.Spark => "火花",
                StableIds.Ward => "守護",
                StableIds.Windwalk => "疾風",
                StableIds.Freeze => "凍結",
                StableIds.Pull => "引寄",
                StableIds.Transmute => "変換",
                _ => "スキル"
            };
        }
    }
}
