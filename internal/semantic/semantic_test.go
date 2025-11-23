package semantic

import (
	"context"
	"testing"
)

// MockProvider implements EmbeddingProvider
type MockProvider struct {
	embedding []float32
}

func (m *MockProvider) Embed(ctx context.Context, text string) ([]float32, error) {
	return m.embedding, nil
}

// MockStorage implements Storage
type MockStorage struct {
	embeddings map[string][]byte
}

func (m *MockStorage) GetAllEmbeddings(ctx context.Context) (map[string][]byte, error) {
	return m.embeddings, nil
}

func TestFindSimilar(t *testing.T) {
	// Setup
	queryVec := []float32{1, 0, 0}
	matchVec := []float32{0.99, 0.01, 0} // Very similar
	diffVec := []float32{0, 1, 0}        // Orthogonal

	provider := &MockProvider{embedding: queryVec}

	store := &MockStorage{
		embeddings: map[string][]byte{
			"match": Float32ToBytes(matchVec),
			"diff":  Float32ToBytes(diffVec),
		},
	}

	engine := NewSemanticEngine(provider, store, 0.9) // High threshold

	// Test Match
	key, score, err := engine.FindSimilar(context.Background(), "query")
	if err != nil {
		t.Fatalf("FindSimilar failed: %v", err)
	}

	if key != "match" {
		t.Errorf("Expected key 'match', got '%s'", key)
	}
	if score < 0.9 {
		t.Errorf("Expected high score, got %f", score)
	}
}

func TestFindSimilar_NoMatch(t *testing.T) {
	// Setup
	queryVec := []float32{1, 0, 0}
	diffVec := []float32{0, 1, 0} // Orthogonal

	provider := &MockProvider{embedding: queryVec}

	store := &MockStorage{
		embeddings: map[string][]byte{
			"diff": Float32ToBytes(diffVec),
		},
	}

	engine := NewSemanticEngine(provider, store, 0.9)

	// Test No Match
	key, _, err := engine.FindSimilar(context.Background(), "query")
	if err != nil {
		t.Fatalf("FindSimilar failed: %v", err)
	}

	if key != "" {
		t.Errorf("Expected empty key (no match), got '%s'", key)
	}
}
