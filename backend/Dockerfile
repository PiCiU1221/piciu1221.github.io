FROM ubuntu:latest AS build
RUN apt-get update
RUN apt-get install openjdk-20-jdk -y
COPY . .

FROM openjdk:20

WORKDIR /app

COPY target/firesignal-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
