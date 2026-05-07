#include <SPI.h>
#include <MFRC522.h>

#define GREEN_LED 6
#define BUZZER 7

#define SS_PIN 10
#define RST_PIN 14

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  delay(3000);   // 🔥 important for ESP32-S3 USB

  Serial.println("STARTED");

  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  SPI.begin(12, 13, 11, 10); // your working pins
  rfid.PCD_Init();

  Serial.println("Scan your RFID card...");
}

void loop() {
  // Wait for card
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = "";

  // 🔥 FIXED UID FORMAT (IMPORTANT)
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";   // zero padding
    }
    uid += String(rfid.uid.uidByte[i], HEX);
  }

  uid.toUpperCase();

  // 🔥 SEND CLEAN UID
  Serial.println(uid);

  // ✅ SUCCESS FEEDBACK
  digitalWrite(GREEN_LED, HIGH);

  tone(BUZZER, 1200);
  delay(150);
  noTone(BUZZER);

  delay(100);

  digitalWrite(GREEN_LED, LOW);

  // Prevent multiple reads
  delay(1000);

  rfid.PICC_HaltA();
}