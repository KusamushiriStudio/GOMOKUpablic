#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
unity_editor="${UNITY_EDITOR:-/Applications/Unity/Hub/Editor/6000.3.24f1/Unity.app/Contents/MacOS/Unity}"
method="TRIAD.Editor.TriadIosBuild.BuildFromCommandLine"

if [[ "${1:-}" == "--validate-only" ]]; then
  method="TRIAD.Editor.TriadIosBuild.ValidateFromCommandLine"
fi

required_variables=(
  TRIAD_IOS_BUNDLE_ID
  TRIAD_IOS_PRODUCT_NAME
  TRIAD_IOS_COMPANY_NAME
)

for variable_name in "${required_variables[@]}"; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "Missing required environment variable: ${variable_name}" >&2
    exit 2
  fi
done

if [[ ! -x "${unity_editor}" ]]; then
  echo "Unity Editor not found or not executable: ${unity_editor}" >&2
  echo "Set UNITY_EDITOR to the Unity 6000.3.24f1 executable path." >&2
  exit 2
fi

"${unity_editor}" \
  -batchmode \
  -quit \
  -projectPath "${project_root}" \
  -executeMethod "${method}" \
  -logFile -
