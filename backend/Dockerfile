# Multi-stage Dockerfile for Spring Boot Backend

# 1. Build Stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Runtime Stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/expense-tracker-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=mysql", "-jar", "app.jar"]
