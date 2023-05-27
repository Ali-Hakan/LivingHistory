FROM maven:3.8.4-openjdk-17-slim
COPY . /LivingHistoryApi
WORKDIR /LivingHistoryApi
RUN mvn clean install -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/LivingHistory-0.0.1-SNAPSHOT.jar"]