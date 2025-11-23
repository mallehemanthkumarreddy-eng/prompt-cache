BINARY_NAME=prompt-cache

.PHONY: all build run test clean

all: build

build:
	go build -o $(BINARY_NAME) ./cmd/api

run: build
	@if [ -z "$(OPENAI_API_KEY)" ]; then \
		echo "Error: OPENAI_API_KEY is not set"; \
		exit 1; \
	fi
	./$(BINARY_NAME)

test:
	go test ./...

clean:
	go clean
	rm -f $(BINARY_NAME)
	rm -rf badger_data
