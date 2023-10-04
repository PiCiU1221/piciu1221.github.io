FROM maven:3.9.4-openjdk-20.0.2 AS build
COPY . .
RUN mvn clean package -DskipTests


FROM openjdk:20
COPY --from=build /target/firesignal-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
