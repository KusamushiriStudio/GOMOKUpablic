using System.Collections.Generic;
using TRIAD.Core.Board;
using TRIAD.Core.Rules;
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

        public MatchState State => state;
        public Camera BoardCamera => boardCamera;
        public Mesh StoneMesh => stoneMesh;
        public int SpawnedStoneCount => spawnedStones.Count;

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
            ActionResult result = RuleEngine.Apply(state, MatchAction.Place(actingSeat, coordinate));
            if (!result.Success)
            {
                if (statusLabel != null) statusLabel.text = ErrorLabel(result.Error);
                return;
            }

            state = result.State;
            SpawnStone(coordinate, actingSeat);
            RefreshHud();
        }

        public void StartMatch()
        {
            for (int i = spawnedStones.Count - 1; i >= 0; i--)
                if (spawnedStones[i] != null) Destroy(spawnedStones[i]);
            spawnedStones.Clear();
            state = MatchState.Create(RulesetCatalog.PvpBalanceV2Id);
            if (statusLabel != null) statusLabel.text = "交点をタップして碁石を置く";
            RefreshHud();
        }

        private void SpawnStone(BoardCoordinate coordinate, int seat)
        {
            GameObject stone = new GameObject(
                $"Stone_S{seat}_{coordinate.X}_{coordinate.Y}", typeof(MeshFilter), typeof(MeshRenderer));
            stone.transform.SetParent(stoneRoot, false);
            stone.transform.localPosition = PositionFor(coordinate);
            stone.transform.localRotation = Quaternion.identity;
            stone.transform.localScale = Vector3.one;
            stone.GetComponent<MeshFilter>().sharedMesh = stoneMesh;
            stone.GetComponent<MeshRenderer>().sharedMaterial = seatMaterials[seat];
            spawnedStones.Add(stone);
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
                _ => "その位置には置けません"
            };
        }
    }
}
