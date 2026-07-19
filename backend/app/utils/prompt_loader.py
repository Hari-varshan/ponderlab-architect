from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

_PROMPTS_DIR = Path(__file__).resolve().parents[1] / "prompts"


def _read_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    with path.open(encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"Prompt file must contain a YAML mapping: {path}")
    return data


@lru_cache
def load_shared_system_prompt() -> str:
    data = _read_yaml(_PROMPTS_DIR / "shared.yaml")
    system = data.get("system")
    if not isinstance(system, str) or not system.strip():
        raise ValueError("shared.yaml must define a non-empty 'system' string")
    return system.strip()


def load_stage_prompt(stage: str) -> str:
    """Compose shared context + stage task + rules into one system instruction."""
    stage_path = _PROMPTS_DIR / f"{stage}.yaml"
    stage_data = _read_yaml(stage_path)

    task = stage_data.get("task")
    if not isinstance(task, str) or not task.strip():
        raise ValueError(f"{stage}.yaml must define a non-empty 'task' string")

    rules = stage_data.get("rules", [])
    if rules is not None and not isinstance(rules, list):
        raise ValueError(f"{stage}.yaml 'rules' must be a list when provided")

    parts = [load_shared_system_prompt(), task.strip()]
    if rules:
        formatted_rules = "\n".join(f"- {rule}" for rule in rules if str(rule).strip())
        if formatted_rules:
            parts.append(f"Rules:\n{formatted_rules}")

    return "\n\n".join(parts)


def clear_prompt_cache() -> None:
    load_shared_system_prompt.cache_clear()
