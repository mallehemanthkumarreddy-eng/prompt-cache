package semantic

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type OpenAIProvider struct {
	apiKey string
	client *http.Client
}

func NewOpenAIProvider() *OpenAIProvider {
	return &OpenAIProvider{
		apiKey: os.Getenv("OPENAI_API_KEY"),
		client: &http.Client{},
	}
}

type EmbeddingRequest struct {
	Input string `json:"input"`
	Model string `json:"model"`
}

type EmbeddingResponse struct {
	Data []struct {
		Embedding []float64 `json:"embedding"`
	} `json:"data"`
}

func (p *OpenAIProvider) Embed(ctx context.Context, text string) ([]float32, error) {
	reqBody := EmbeddingRequest{
		Input: text,
		Model: "text-embedding-3-small",
	}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/embeddings", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("OpenAI API error: %s", string(body))
	}

	var embeddingResp EmbeddingResponse
	if err := json.NewDecoder(resp.Body).Decode(&embeddingResp); err != nil {
		return nil, err
	}

	if len(embeddingResp.Data) == 0 {
		return nil, fmt.Errorf("no embedding data returned")
	}

	// Convert float64 to float32
	res := make([]float32, len(embeddingResp.Data[0].Embedding))
	for i, v := range embeddingResp.Data[0].Embedding {
		res[i] = float32(v)
	}

	return res, nil
}
