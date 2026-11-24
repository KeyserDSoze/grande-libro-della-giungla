---
name: research-report
user-invocable: true
description: Summarize deep research results from deepresearches/ into a markdown report.
allowed-tools: Read, Write, Glob, Bash, AskUserQuestion
---

# Research Report - Summary Report

## Trigger
`/research-report`

## Workflow

### Step 1: Locate Results Directory
Find `deepresearches/*/outline.yaml` in current working directory, read topic and output_dir config.

### Step 2: Scan Optional Summary Fields
Read all JSON results, extract fields suitable for TOC display (numeric, short metrics, e.g. dates, ratings, key facts).

Use AskUserQuestion to ask user:
- Which fields to display in TOC besides item name?
- Provide dynamic options list (based on actual fields in JSON)

### Step 3: Generate Report
Read all JSON from output_dir and fields.yaml to get field structure.
Generate a markdown report that:
- Covers all field values from each JSON
- Skips fields with values containing [uncertain]
- Skips fields listed in uncertain array
- Includes table of contents (with anchor links + user-selected summary fields)
- Organizes content by field category

**TOC Format**:
- Must include every item
- Each item displays: number, name (anchor link), user-selected summary fields
- Example: `1. [Subject Name](#subject-name) - Date: 1453 | Source: Primary`

### Step 4: Save Report
Save to `deepresearches/{topic}/report.md`

## Output
- `deepresearches/{topic}/report.md` - Summary report
