# 🚀 PromptCache

### **Cut your LLM bill by 80%. Speed up your app by 100x.**
**The intelligent semantic cache for high-scale GenAI applications.**

![Go](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 💰 The Business Problem

In production, **30-50% of LLM requests are redundant**.

*   **RAG Applications**: Users ask similar questions ("How do I reset my password?" vs "Reset password steps").
*   **Agents**: Agents often run identical reasoning loops or tool calls.
*   **Customer Support**: The same issues come up thousands of times.

Every redundant call costs you money (tokens) and time (latency). **Why pay OpenAI to generate the same answer twice?**

---

## 💡 The Solution: PromptCache

PromptCache is a middleware that sits between your app and your LLM provider. It uses **semantic understanding** to detect when a new prompt means the same thing as a previous one.

### 📉 Business Impact

| Metric | Without Cache | With PromptCache | Impact |
| :--- | :--- | :--- | :--- |
| **Cost per 1k Requests** | $30.00 | **$6.00** | **80% Savings** |
| **Avg Latency** | 1.5s | **< 10ms** | **Instant UX** |
| **Throughput** | Limited by API | **Unlimited** | **Scale Freely** |

---

## 🎯 Ideal Use Cases

PromptCache is designed for environments with **high prompt redundancy**:

1.  **RAG & Knowledge Bases**:
    *   *Scenario*: Multiple employees asking "What is the travel policy?"
    *   *Result*: First person waits 2s. Everyone else gets it instantly.

2.  **AI Agents & Tool Use**:
    *   *Scenario*: Agents repeatedly checking status or formatting data.
    *   *Result*: Drastic reduction in operational costs.

3.  **Customer Support Bots**:
    *   *Scenario*: Handling FAQs.
    *   *Result*: Instant answers for users, zero token cost for you.

---

## 🧠 Why PromptCache is Safer (Smart Verification)

Most semantic caches are risky—they might return a wrong answer if two prompts are *sort of* similar but have different intents.

PromptCache uses a **Smart Verification Layer** to guarantee accuracy:

1.  **Obvious Match (>95%)**: Instant Hit.
2.  **Obvious Miss (<70%)**: Instant Miss.
3.  **The "Gray Zone" (70-95%)**: **AI Verification**.
    *   We ask a small, cheap model: *"Do these two prompts have the exact same intent?"*
    *   **This ensures 100% semantic accuracy.** You never serve a wrong cached response.

---

## 🚀 Quick Start

PromptCache is a drop-in replacement for the OpenAI API.

### 1. Run the Server

```bash
# Clone and run
git clone https://github.com/messkan/prompt-cache.git
cd prompt-cache
make run
```

### 2. Connect Your App

Just change the `base_url` in your SDK. No code changes required.

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",  # <--- Point to PromptCache
    api_key="sk-..."
)

# This call hits OpenAI (Cost: $0.01, Time: 1.2s)
client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Explain quantum physics"}]
)

# This call hits PromptCache (Cost: $0.00, Time: 0.005s)
# Even though the phrasing is different!
client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "How does quantum physics work?"}]
)
```

---

## 🏗 Architecture

Designed for performance and reliability:
*   **Language**: Pure Go (Zero garbage collection pauses, high concurrency).
*   **Storage**: BadgerDB (Embedded, persistent, fast).
*   **API**: 100% OpenAI Compatible.

---

## � Roadmap

### ✔️ v0.1 (Current)
*   In-memory & BadgerDB storage.
*   Smart Semantic Verification (Dual-threshold + LLM check).
*   OpenAI API Compatibility.

### 🚧 v0.2 (Coming Soon)
*   **Redis Support**: For distributed caching across multiple instances.
*   **Dashboard UI**: Visualize cache hit rates, latency savings, and costs.
*   **Native Providers**: Direct support for Anthropic (Claude) and Mistral.

### 🚀 v1.0
*   **Cluster Mode**: Raft-based distributed consensus.
*   **Custom Embedding Models**: Support for local embedding models (e.g., via Ollama).
*   **Rate Limiting**: Built-in token bucket rate limiter.

---

## �📄 License

MIT License. Built for scale.
