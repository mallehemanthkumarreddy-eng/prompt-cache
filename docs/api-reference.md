---
layout: default
title: API Reference
nav_order: 3
---

# API Reference

Complete reference for PromptCache REST API endpoints.

## Base URL

```
http://localhost:8080
```

---

## Chat Completions

OpenAI-compatible endpoint for chat completions with semantic caching.

### POST /v1/chat/completions

Create a chat completion with automatic caching.

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "What is quantum computing?"
    }
  ]
}
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Model name (passed to provider) |
| messages | array | Yes | Array of message objects |
| messages[].role | string | Yes | Message role (system, user, assistant) |
| messages[].content | string | Yes | Message content |

**Response (200 OK)**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1703721600,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing is..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

**Cache Behavior**

1. **Cache Hit**: Returns cached response immediately (~300ms)
2. **Cache Miss**: Forwards to provider, caches response, returns result (~1.5s)
3. **Semantic Match**: Uses embeddings to detect similar prompts

**Example - Python**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Explain AI"}]
)
```

**Example - cURL**
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Explain AI"}]
  }'
```

**Example - JavaScript**
```javascript
const response = await fetch('http://localhost:8080/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Explain AI' }]
  })
});
```

---

## Provider Management

Endpoints for managing embedding providers at runtime.

### GET /v1/config/provider

Get the current provider and available options.

**Response (200 OK)**
```json
{
  "provider": "openai",
  "available_providers": ["openai", "mistral", "claude"]
}
```

**Example - cURL**
```bash
curl http://localhost:8080/v1/config/provider
```

**Example - Python**
```python
import requests

response = requests.get('http://localhost:8080/v1/config/provider')
print(response.json())
```

---

### POST /v1/config/provider

Switch the embedding provider at runtime.

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "provider": "mistral"
}
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| provider | string | Yes | Provider name (openai, mistral, claude) |

**Response (200 OK)**
```json
{
  "message": "Provider updated successfully",
  "provider": "mistral"
}
```

**Response (400 Bad Request)**
```json
{
  "error": "unsupported provider: invalid (supported: openai, mistral, claude)"
}
```

**Example - cURL**
```bash
curl -X POST http://localhost:8080/v1/config/provider \
  -H "Content-Type: application/json" \
  -d '{"provider": "mistral"}'
```

**Example - Python**
```python
import requests

response = requests.post(
    'http://localhost:8080/v1/config/provider',
    json={'provider': 'mistral'}
)
print(response.json())
```

**Example - JavaScript**
```javascript
const response = await fetch('http://localhost:8080/v1/config/provider', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'mistral' })
});
```

**Use Cases**
- A/B testing different providers
- Failover during provider outages
- Cost optimization based on load
- Performance testing

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Invalid JSON"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to call OpenAI: connection timeout"
}
```

---

## Rate Limiting

PromptCache does not implement rate limiting. Rate limits are inherited from your provider's API.

---

## Authentication

PromptCache uses your provider's API key. Configure it via environment variables:

```bash
export OPENAI_API_KEY=your-key      # For OpenAI
export MISTRAL_API_KEY=your-key     # For Mistral
export ANTHROPIC_API_KEY=your-key   # For Claude
export VOYAGE_API_KEY=your-key      # For Claude embeddings
```

---

## SDK Support

PromptCache is compatible with any OpenAI SDK:

- **Python**: `openai` package
- **Node.js**: `openai` package
- **Go**: `go-openai` package
- **Ruby**: `ruby-openai` gem
- **Java**: OpenAI Java client

Just change the `base_url` to point to PromptCache.
