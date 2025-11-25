package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/mandrigin/gin-spa/spa"
)

var (
	PORTAINER_URL      string
	PORTAINER_USERNAME string
	PORTAINER_PASSWORD string
	ENDPOINT_ID        string
)

type AuthRequest struct {
	Username string `json:"Username"`
	Password string `json:"Password"`
}

type AuthResponse struct {
	JWT string `json:"jwt"`
}

type ContainerInfo struct {
	ID     string                 `json:"Id"`
	Names  []string               `json:"Names"`
	Image  string                 `json:"Image"`
	State  string                 `json:"State"`
	Status string                 `json:"Status"`
	Labels map[string]interface{} `json:"Labels,omitempty"`
}

func init() {
	godotenv.Load("../.env")
	PORTAINER_URL = os.Getenv("PORTAINER_URL")
	PORTAINER_USERNAME = os.Getenv("PORTAINER_USERNAME")
	PORTAINER_PASSWORD = os.Getenv("PORTAINER_PASSWORD")
	ENDPOINT_ID = os.Getenv("ENDPOINT_ID")

	println("Portainer URL:", PORTAINER_URL)
	println("Portainer Username:", PORTAINER_USERNAME)
	println("Endpoint ID:", ENDPOINT_ID)
}

func getAuthToken() (string, error) {
	authURL := fmt.Sprintf("%s/api/auth", PORTAINER_URL)
	authReq := AuthRequest{
		Username: PORTAINER_USERNAME,
		Password: PORTAINER_PASSWORD,
	}

	body, _ := json.Marshal(authReq)
	req, err := http.NewRequest("POST", authURL, nil)
	if err != nil {
		return "", err
	}
	println("Authenticating to:", authURL)

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Post(authURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("authentication failed")
	}
	var authResp AuthResponse
	json.NewDecoder(resp.Body).Decode(&authResp)
	return authResp.JWT, nil
}

func main() {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	// Auth endpoint
	r.POST("/api/auth", func(c *gin.Context) {
		token, err := getAuthToken()
		if err != nil {
			c.JSON(500, gin.H{"error": "Authentication failed"})
			return
		}
		c.JSON(200, token)
	})

	// List containers
	r.GET("/api/containers", func(c *gin.Context) {
		token, err := getAuthToken()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		url := fmt.Sprintf("%s/api/endpoints/%s/docker/containers/json", PORTAINER_URL, ENDPOINT_ID)
		req, _ := http.NewRequest("GET", url, nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode == 200 {
			var containers []ContainerInfo
			json.NewDecoder(resp.Body).Decode(&containers)
			c.JSON(200, containers)
		} else {
			c.JSON(resp.StatusCode, gin.H{"error": "Failed to fetch containers"})
		}
	})

	// Start container
	r.POST("/api/start/:container_id", func(c *gin.Context) {
		containerID := c.Param("container_id")
		token, _ := getAuthToken()

		url := fmt.Sprintf("%s/api/endpoints/%s/docker/containers/%s/start", PORTAINER_URL, ENDPOINT_ID, containerID)
		req, _ := http.NewRequest("POST", url, nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode == 204 {
			c.JSON(200, gin.H{"status": "started", "container_id": containerID})
		} else {
			c.JSON(resp.StatusCode, gin.H{"error": "Failed to start container"})
		}
	})

	// Stop container
	r.POST("/api/stop/:container_id", func(c *gin.Context) {
		containerID := c.Param("container_id")
		token, _ := getAuthToken()

		url := fmt.Sprintf("%s/api/endpoints/%s/docker/containers/%s/stop", PORTAINER_URL, ENDPOINT_ID, containerID)
		req, _ := http.NewRequest("POST", url, nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode == 204 {
			c.JSON(200, gin.H{"status": "stopped", "container_id": containerID})
		} else {
			c.JSON(resp.StatusCode, gin.H{"error": "Failed to stop container"})
		}
	})

	// Pause container
	r.POST("/api/pause/:container_id", func(c *gin.Context) {
		containerID := c.Param("container_id")
		token, _ := getAuthToken()

		url := fmt.Sprintf("%s/api/endpoints/%s/docker/containers/%s/pause", PORTAINER_URL, ENDPOINT_ID, containerID)
		req, _ := http.NewRequest("POST", url, nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode == 204 {
			c.JSON(200, gin.H{"status": "paused", "container_id": containerID})
		} else {
			c.JSON(resp.StatusCode, gin.H{"error": "Failed to pause container"})
		}
	})

	// Resume container
	r.POST("/api/resume/:container_id", func(c *gin.Context) {
		containerID := c.Param("container_id")
		token, _ := getAuthToken()

		url := fmt.Sprintf("%s/api/endpoints/%s/docker/containers/%s/unpause", PORTAINER_URL, ENDPOINT_ID, containerID)
		req, _ := http.NewRequest("POST", url, nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode == 204 {
			c.JSON(200, gin.H{"status": "resumed", "container_id": containerID})
		} else {
			c.JSON(resp.StatusCode, gin.H{"error": "Failed to resume container"})
		}
	})

	// Restart container
	r.POST("/api/restart/:container_id", func(c *gin.Context) {
		containerID := c.Param("container_id")
		token, _ := getAuthToken()

		url := fmt.Sprintf("%s/api/endpoints/%s/docker/containers/%s/restart", PORTAINER_URL, ENDPOINT_ID, containerID)
		req, _ := http.NewRequest("POST", url, nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

		client := &http.Client{}
		resp, _ := client.Do(req)
		defer resp.Body.Close()

		if resp.StatusCode == 204 {
			c.JSON(200, gin.H{"status": "restarted", "container_id": containerID})
		} else {
			c.JSON(resp.StatusCode, gin.H{"error": "Failed to restart container"})
		}
	})

	// Serve static files
	//r.Static("/", "./static")
	r.Use(spa.Middleware("/", "../static"))

	log.Println("Server starting on 0.0.0.0:8000")
	r.Run("0.0.0.0:8000")
}
