---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started

This guide will help you get PromptCache up and running in minutes.

## Prerequisites

- Go 1.20 or higher
- Docker (optional, for containerized deployment)
- API keys for your chosen provider(s)

## Installation Methods

### Method 1: Docker (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/messkan/prompt-cache.git
cd prompt-cache

# Set your environment variables
export EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=your-openai-api-key

# Run with Docker Compose
docker-compose up -d
```

### Method 2: From Source

Build and run directly:

```bash
# Clone the repository
git clone https://github.com/messkan/prompt-cache.git
cd prompt-cache

# Set environment variables
export EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=your-openai-api-key

# Run using the provided script
./scripts/run.sh

# Or use Make
make run
```

### Method 3: Manual Build

For more control:

```bash
# Build the binary
go build -o prompt-cache cmd/api/main.go

# Run the server
./prompt-cache
```

## Verify Installation

Check that the server is running:

```bash
# Get current provider
curl http://localhost:8080/v1/config/provider

# Expected response:
# {
#   "provider": "openai",
#   "available_providers": ["openai", "mistral", "claude"]
# }
```

## First Request

Use PromptCache with the OpenAI SDK:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="your-openai-api-key"
)

# First request - goes to OpenAI
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What is quantum computing?"}]
)
print(response.choices[0].message.content)

# Second request - similar prompt, served from cache
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Explain quantum computing"}]
)
print(response.choices[0].message.content)
```

## Monitoring

Watch the server logs to see cache hits and misses:

```bash
# Docker
docker-compose logs -f

# Direct run
# Logs appear in the terminal
```

Look for these indicators:
- `🔥 Cache HIT!` - Request served from cache
- `💨 Cache MISS` - Request forwarded to provider

## Next Steps

- [Configure providers](providers.md)
- [Tune cache settings](configuration.md)
- [Read API documentation](api-reference.md)

## Troubleshooting

### Server won't start

Check that:
1. The required API key is set for your provider
2. Port 8080 is not already in use
3. BadgerDB data directory is writable

### Cache not working

Verify:
1. Prompts are semantically similar
2. Similarity thresholds are properly configured
3. Gray zone verifier is enabled (if needed)

### Provider errors

Ensure:
1. API keys are valid and have sufficient credits
2. Network connectivity to provider APIs
3. Provider name is correct (openai, mistral, or claude)
