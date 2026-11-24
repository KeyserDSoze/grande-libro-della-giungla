---
name: research-deep
user-invocable: true
description: Read research outline from deepresearches/, launch independent agent for each item for deep research.
allowed-tools: Bash, Read, Write, Glob, WebSearch, Task
---

# Research Deep - Deep Research

## Trigger
`/research-deep`

## Workflow

### Step 1: Auto-locate Outline
Find `deepresearches/*/outline.yaml` file in current working directory, read items list and execution config.

### Step 2: Resume Check
- Check completed JSON files in output_dir
- Skip completed items

### Step 3: Batch Execution
- Batch by batch_size (need user approval before next batch)
- Each agent handles items_per_agent items
- Launch web-search-agent (background parallel)

**Parameter Retrieval**:
- `{topic}`: topic field from outline.yaml
- `{item_name}`: item's name field
- `{item_related_info}`: item's complete yaml content
- `{output_dir}`: execution.output_dir from outline.yaml (default: deepresearches/{topic}/results)
- `{fields_path}`: absolute path to deepresearches/{topic}/fields.yaml
- `{output_path}`: absolute path to {output_dir}/{item_name_slug}.json

**Prompt Template**:
```python
prompt = f"""## Task
Research {item_related_info}, output structured JSON to {output_path}

## Field Definitions
Read {fields_path} to get all field definitions

## Output Requirements
1. Output JSON according to fields defined in fields.yaml
2. Mark uncertain field values with [uncertain]
3. Add uncertain array at the end of JSON, listing all uncertain field names
4. All field values must be in the language of the research topic

## Output Path
{output_path}
"""
```

### Step 4: Wait and Monitor
- Wait for current batch to complete
- Launch next batch
- Display progress

### Step 5: Summary Report
After all complete, output:
- Completion count
- Failed/uncertain marked items
- Output directory path

## Agent Config
- Background execution: Yes
- Resume support: Yes
