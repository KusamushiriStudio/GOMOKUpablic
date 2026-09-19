# Web Golden parity tools

The Golden source is the embedded module registry in `index.html` from Web main commit
`1bf36894967a13358a09eda1d5b518064db5e488`.

## Reproduce

1. Verify the checked-in Web files still match the pinned commit:

   ```powershell
   git diff --exit-code 1bf36894967a13358a09eda1d5b518064db5e488 -- index.html tests package.json
   ```

2. Run the Web regression suite:

   ```powershell
   npm test
   ```

3. Materialize the selected embedded modules outside the repository:

   ```powershell
   python tools/web-core/extract_web_core.py --output <output-directory>
   ```

4. Regenerate the Unity-consumable Golden fixture:

   ```powershell
   node tools/web-core/generate_golden.mjs
   ```

5. Run Unity EditMode tests. `WebGoldenParityTests` compares every `EXACT` fixture with
   the Pure C# Core. `NOT_RUN` entries remain explicit in the JSON and are counted by the
   manifest test; they are never silently treated as passes.

The generator does not modify the Web bundle. The current pinned `index.html` SHA-256 is
`70a879aeae9e5ef9e6790a069d609c0beee8f9d1ec2a6e577c276d3f1b97d216`.
