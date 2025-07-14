DOCKER_COMPOSE_FILE = docker-compose.yaml

up:
	@echo "🚀 Starting Docker Compose services..."
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build 
	@echo "✅ Services are up and running!"

down:
	@echo "🛑 Stopping and removing Docker Compose services..."
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v --timeout 5
	@rm -rf back-end/*/migrations 
	@echo "✅ Services stopped and volumes removed!"

clean: down
	@echo "🧹 Cleaning up unused Docker resources..."
	docker system prune -a --volumes
	docker volume prune -f
	docker network prune -f
	@rm -rf back-end/*/migrations 
	@echo "✅ Cleanup complete!"

fclean:
	@echo "shut down and delete all containers and images..."
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v
	@echo "🗑️ Deleting specific Docker containers..."
	docker rm -f backend-app adminer postgres-db frontend-app
	docker rmi -f taqathon_back-end adminer:4.8.1 postgres:14 taqathon_front-end
	@echo "🗑️ Deleting specific Docker images..."
	docker system prune -a --volumes -f
	docker volume prune -f
	docker network prune -f
	@echo "✅ Containers and images deleted!"