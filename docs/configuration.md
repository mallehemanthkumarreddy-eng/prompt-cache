---
layout: default
title: Configuration
nav_order: 4
---

# Configuration Guide

Configure PromptCache behavior through environment variables.

## Provider Selection

Choose your embedding provider:

```bash
export EMBEDDING_PROVIDER=openai  # Options: openai, mistral, claude
```

**Default**: `openai`

**Supported Providers**:
- `openai` - OpenAI embeddings and verification
- `mistral` - Mistral AI embeddings and verification
- `claude` - Voyage AI embeddings + Anthropic verification

---

## Similarity Thresholds

Control when prompts are considered similar enough to return cached results.

### High Threshold

Minimum similarity score for direct cache hits.

```bash
export CACHE_HIGH_THRESHOLD=0.70  # Range: 0.0 to 1.0
```

**Default**: `0.70` (70% similarity)

**Recommendations**:
- **0.85-0.95**: Very strict matching, fewer cache hits but higher accuracy
- **0.70-0.85**: Balanced approach (recommended)
- **0.50-0.70**: Aggressive caching, more hits but potential for false positives

### Low Threshold

Maximum similarity score for clear misses (skip cache entirely).

```bash
export CACHE_LOW_THRESHOLD=0.30  # Range: 0.0 to 1.0
```

**Default**: `0.30` (30% similarity)

**Recommendations**:
- **0.40-0.60**: Narrow gray zone, more verification calls
- **0.25-0.40**: Balanced approach (recommended)
- **0.10-0.25**: Wide gray zone, fewer clear misses

{: .note }
> Always ensure `CACHE_HIGH_THRESHOLD` > `CACHE_LOW_THRESHOLD`

---

## Gray Zone Verification

Enable or disable LLM-based verification for prompts in the gray zone (between low and high thresholds).

```bash
export ENABLE_GRAY_ZONE_VERIFIER=true  # Options: true, false, 1, 0, yes, no
```

**Default**: `true` (enabled)

### When to Enable

- Production environments requiring high accuracy
- Varied prompt patterns
- Critical applications where wrong answers are costly
- When you can afford the extra verification API calls

### When to Disable

- Cost optimization (skip verification API calls)
- Speed priority (accept slightly lower accuracy)
- Highly standardized prompts
- Development/testing environments

**Cost Impact**:
- **Enabled**: Extra API call for each gray zone match (~$0.0001 per call with gpt-4o-mini)
- **Disabled**: No verification cost, but potential for incorrect cache hits

---

## Provider API Keys

### OpenAI

```bash
export OPENAI_API_KEY=your-openai-api-key
```

Required when `EMBEDDING_PROVIDER=openai` (default).

### Mistral AI

```bash
export MISTRAL_API_KEY=your-mistral-api-key
```

Required when `EMBEDDING_PROVIDER=mistral`.

### Claude (Anthropic)

```bash
export ANTHROPIC_API_KEY=your-anthropic-api-key
export VOYAGE_API_KEY=your-voyage-api-key
```

Both keys required when `EMBEDDING_PROVIDER=claude`.

{: .warning }
> Claude uses Voyage AI for embeddings. You need both API keys.

---

## Example Configurations

### Strict Accuracy (Production)

```bash
export EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=your-key
export CACHE_HIGH_THRESHOLD=0.90
export CACHE_LOW_THRESHOLD=0.35
export ENABLE_GRAY_ZONE_VERIFIER=true
```

**Profile**: High accuracy, moderate cache hit rate

### Balanced (Recommended)

```bash
export EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=your-key
export CACHE_HIGH_THRESHOLD=0.70
export CACHE_LOW_THRESHOLD=0.30
export ENABLE_GRAY_ZONE_VERIFIER=true
```

**Profile**: Good balance of accuracy and performance

### Aggressive Caching (Cost Optimization)

```bash
export EMBEDDING_PROVIDER=mistral
export MISTRAL_API_KEY=your-key
export CACHE_HIGH_THRESHOLD=0.60
export CACHE_LOW_THRESHOLD=0.25
export ENABLE_GRAY_ZONE_VERIFIER=false
```

**Profile**: Maximum cache hits, lower accuracy, minimum cost

### Development

```bash
export EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=your-key
export CACHE_HIGH_THRESHOLD=0.70
export CACHE_LOW_THRESHOLD=0.30
export ENABLE_GRAY_ZONE_VERIFIER=false
```

**Profile**: Fast responses, no verification overhead

---

## Docker Compose Configuration

Edit `docker-compose.yml`:

```yaml
services:
  prompt-cache:
    environment:
      - EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER:-openai}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MISTRAL_API_KEY=${MISTRAL_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - VOYAGE_API_KEY=${VOYAGE_API_KEY}
      - CACHE_HIGH_THRESHOLD=${CACHE_HIGH_THRESHOLD:-0.70}
      - CACHE_LOW_THRESHOLD=${CACHE_LOW_THRESHOLD:-0.30}
      - ENABLE_GRAY_ZONE_VERIFIER=${ENABLE_GRAY_ZONE_VERIFIER:-true}
```

---

## Configuration Validation

PromptCache validates configuration on startup:

```
Cache Configuration: HighThreshold=0.70, LowThreshold=0.30, GrayZoneVerifier=true
```

**Invalid configurations** are automatically corrected:
- If `HIGH_THRESHOLD <= LOW_THRESHOLD`, both reset to defaults (0.70/0.30)
- Invalid threshold values (< 0 or > 1) are ignored
- Invalid provider names return an error

---

## Dynamic Configuration

Some settings can be changed at runtime:

### Provider Switching

```bash
curl -X POST http://localhost:8080/v1/config/provider \
  -H "Content-Type: application/json" \
  -d '{"provider": "mistral"}'
```

### Threshold Updates

{: .note }
> Threshold updates require a service restart. Dynamic threshold updates via API are planned for v0.3.0.

---

## Performance Tuning

### For Maximum Cache Hits

```bash
CACHE_HIGH_THRESHOLD=0.60
CACHE_LOW_THRESHOLD=0.20
ENABLE_GRAY_ZONE_VERIFIER=true
```

### For Minimum Latency

```bash
CACHE_HIGH_THRESHOLD=0.70
CACHE_LOW_THRESHOLD=0.30
ENABLE_GRAY_ZONE_VERIFIER=false
```

### For Maximum Accuracy

```bash
CACHE_HIGH_THRESHOLD=0.95
CACHE_LOW_THRESHOLD=0.40
ENABLE_GRAY_ZONE_VERIFIER=true
```

---

## Troubleshooting

### Cache hit rate too low

- Lower `CACHE_HIGH_THRESHOLD` (e.g., 0.60)
- Widen gray zone by adjusting thresholds
- Enable gray zone verifier

### Too many false positives

- Raise `CACHE_HIGH_THRESHOLD` (e.g., 0.85)
- Enable gray zone verifier
- Narrow gray zone

### High API costs

- Disable gray zone verifier
- Use cheaper provider (Mistral)
- Raise `CACHE_LOW_THRESHOLD` to reduce gray zone

### Slow responses

- Disable gray zone verifier
- Use faster provider
- Ensure adequate hardware resources
