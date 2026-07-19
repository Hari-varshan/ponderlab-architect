"""Small helpers for workflow debug notebooks (printing LLM exchanges)."""

from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel


def print_banner(title: str, char: str = "=") -> None:
    line = char * max(len(title) + 4, 60)
    print(f"\n{line}\n  {title}\n{line}")


def print_block(label: str, content: Any, *, max_chars: int | None = None) -> None:
    if isinstance(content, BaseModel):
        text = content.model_dump_json(indent=2)
    elif isinstance(content, (dict, list)):
        text = json.dumps(content, indent=2, ensure_ascii=False)
    else:
        text = str(content)

    if max_chars is not None and len(text) > max_chars:
        text = f"{text[:max_chars]}\n... [truncated, total {len(text)} chars]"

    print(f"\n--- {label} ---\n{text}\n")


def print_llm_exchange(
    *,
    stage: str,
    system_instruction: str,
    user_prompt: str,
    response_schema: type[BaseModel],
    parsed: BaseModel,
    raw_text: str,
    temperature: float,
    model_name: str,
) -> None:
    print_banner(f"LLM EXCHANGE · {stage}")
    print_block("Model", model_name)
    print_block("Temperature", temperature)
    print_block("Response schema (Pydantic JSON Schema)", response_schema.model_json_schema())
    print_block("System instruction (sent to Gemini)", system_instruction)
    print_block("User prompt (sent to Gemini)", user_prompt)
    print_block("Raw LLM JSON text", raw_text or "<empty>")
    print_block("Parsed structured output", parsed)
