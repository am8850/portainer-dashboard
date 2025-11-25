# Build stage
FROM golang:1.24-alpine AS builder

# Install ca-certificates for HTTPS support
RUN apk add --no-cache ca-certificates

# Set working directory
WORKDIR /app

# Copy source code
COPY goserver/ goserver/

COPY static/ static/

WORKDIR /app/goserver
# Build the application
# CGO_ENABLED=0 for static binary
# -ldflags="-s -w" to strip debug info and reduce size
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w" \
    -o goserver .

# Final stage - scratch container
FROM scratch

# Copy ca-certificates from builder for HTTPS support
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary from builder
COPY --from=builder /app/goserver/goserver /goserver

# Copy static files
COPY --from=builder /app/static/ /static/

# Expose port (adjust as needed)
EXPOSE 8080

ENV GIN_MODE=release
# Run the binary
ENTRYPOINT ["/goserver"]