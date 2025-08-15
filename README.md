# Anomaly and Maintenance Tracker

This is a full-stack web application designed to track application anomalies and manage maintenance windows. It provides a user-friendly interface for viewing, uploading, and managing anomalies, as well as scheduling and viewing maintenance periods.

The application is containerized using Docker and comes with a complete monitoring stack powered by Prometheus and Grafana.

## Tech Stack

The project is built with a modern technology stack:

-   **Frontend**:
    -   React
    -   Vite
    -   TypeScript
    -   TailwindCSS
    -   React Router
    -   TanStack Query for data fetching
    -   Shadcn/UI and Radix UI for components
-   **Backend**:
    -   Django
    -   Django REST Framework
    -   PostgreSQL
    -   JWT for authentication
-   **Containerization**:
    -   Docker
    -   Docker Compose
-   **Monitoring**:
    -   Prometheus
    -   Grafana
    -   cAdvisor
    -   Node Exporter

## Getting Started

To get the project up and running locally, follow these steps.

### Prerequisites

-   Docker: [Install Docker](https://docs.docker.com/get-docker/)
-   Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
-   `make` utility (optional, for using the Makefile commands)

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Create the environment file

Create a `.env` file in the root of the project by copying the example below. This file is used to configure the application services.

```env
# PostgreSQL Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=taqathon

# Django Backend Configuration
DATABASE_USER=admin
DATABASE_PASSWORD=admin
DATABASE_NAME=taqathon
DATABASE_HOST=db
DATABASE_PORT=5432

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

### 3. Build and run the application

The easiest way to start the application is by using the provided `Makefile`.

```bash
make up
```

This command will build the Docker images and start all the services.

Alternatively, you can use `docker-compose` directly:

```bash
docker-compose up --build
```

### 4. Accessing the services

Once the containers are running, you can access the different parts of the application:

| Service         | URL                             | Description                                  |
| --------------- | ------------------------------- | -------------------------------------------- |
| **Frontend**    | `http://localhost:5173`         | The main web application interface.          |
| **Backend API** | `http://localhost:8000`         | The Django REST API endpoint.                |
| **Database UI** | `http://localhost:8080`         | Adminer for managing the PostgreSQL database.|
| **Grafana**     | `http://localhost:3000`         | Monitoring dashboard. (user/pass: admin/admin) |
| **Prometheus**  | `http://localhost:9090`         | Prometheus metrics endpoint.                 |
| **cAdvisor**    | `http://localhost:8098`         | Container monitoring interface.              |

## Project Structure

The repository is organized into the following main directories:

-   `front-end/`: Contains the source code for the React frontend application.
-   `back-end/`: Contains the source code for the Django backend application.
-   `monitoring/`: Contains configuration files for Prometheus and Grafana.
-   `docker-compose.yaml`: Defines all the services, networks, and volumes for the application.
-   `Makefile`: Provides convenient commands for managing the project lifecycle.

## Features

-   **User Authentication**: Secure user registration and login using JWT.
-   **Anomaly Tracking**: Upload, view, and manage application anomalies.
-   **Maintenance Windows**: Schedule and view maintenance periods.
-   **Dashboard**: A central dashboard to visualize key metrics and information.
-   **Monitoring**: Pre-configured Grafana dashboards to monitor application and system performance.

## Makefile Commands

The `Makefile` includes several commands to simplify development:

-   `make up`: Builds and starts all services.
-   `make down`: Stops and removes all containers and volumes.
-   `make clean`: Stops the services and prunes unused Docker resources.
-   `make fclean`: A more aggressive clean that removes all containers, images, and volumes associated with the project.
