# RFID Hardware Setup Guide

## Supported RFID Readers

### 1. Arduino-based RFID Reader (Recommended)
- **Hardware**: Arduino Uno/Nano + RC522 RFID Module
- **Connection**: USB Serial
- **Cost**: ~$15-25

### 2. USB RFID Readers
- **Models**: Neuftech USB RFID Reader, HID ProxPoint Plus
- **Connection**: Direct USB (appears as keyboard input)
- **Cost**: ~$30-60

### 3. Serial RFID Readers
- **Models**: Parallax RFID Reader, ID Innovations
- **Connection**: USB-to-Serial adapter
- **Cost**: ~$25-40

## Arduino RFID Setup (Recommended)

### Required Components
- Arduino Uno or Nano
- RC522 RFID Module
- RFID Cards/Tags
- USB Cable
- Jumper Wires

### Wiring Diagram
```
RC522 Module    Arduino Uno
VCC       -->   3.3V
RST       -->   Pin 9
GND       -->   GND
MISO      -->   Pin 12
MOSI      -->   Pin 11
SCK       -->   Pin 13
SDA       -->   Pin 10
```

### Arduino Code
```cpp
#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN         9
#define SS_PIN          10

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
    Serial.begin(9600);
    SPI.begin();
    mfrc522.PCD_Init();
    Serial.println("RFID Reader Ready");
}

void loop() {
    if (!mfrc522.PICC_IsNewCardPresent()) {
        return;
    }
    
    if (!mfrc522.PICC_ReadCardSerial()) {
        return;
    }
    
    // Convert card UID to string
    String cardID = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        cardID += String(mfrc522.uid.uidByte[i], HEX);
    }
    cardID.toUpperCase();
    
    // Send card ID to computer
    Serial.print("RFID:");
    Serial.println(cardID);
    
    // Halt PICC
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    
    delay(1000); // Prevent multiple reads
}
```

### Setup Steps
1. **Install Arduino IDE**
   - Download from [arduino.cc](https://www.arduino.cc/en/software)

2. **Install MFRC522 Library**
   - Open Arduino IDE
   - Go to Tools > Manage Libraries
   - Search for "MFRC522"
   - Install the library by GithubCommunity

3. **Upload Code**
   - Connect Arduino to computer
   - Select correct board and port
   - Upload the provided code

4. **Test RFID Reader**
   - Open Serial Monitor (115200 baud)
   - Place RFID card near reader
   - Should see output like: "RFID:A1B2C3D4"

## USB RFID Reader Setup

### Compatible Models
- **Neuftech USB RFID Reader** (125kHz)
- **HID ProxPoint Plus**
- **RFID Innovations USB Readers**

### Configuration
1. Connect USB RFID reader to computer
2. Most readers appear as HID keyboard devices
3. Configure reader to append newline after card data
4. Update software configuration:

```javascript
// In rfidReader.js, modify for USB readers
const hidReaders = require('node-hid');

class USBRFIDReader extends EventEmitter {
    constructor() {
        super();
        this.device = null;
    }
    
    connect() {
        // Find RFID reader device
        const devices = hidReaders.devices();
        const rfidDevice = devices.find(d => 
            d.product && d.product.toLowerCase().includes('rfid')
        );
        
        if (rfidDevice) {
            this.device = new hidReaders.HID(rfidDevice.path);
            this.device.on('data', (data) => {
                this.handleRFIDData(data.toString());
            });
        }
    }
}
```

## Serial RFID Reader Setup

### Configuration
1. Connect reader via USB-to-Serial adapter
2. Install serial port drivers if needed
3. Configure baud rate (usually 9600 or 2400)
4. Test with serial terminal software

### Common Settings
- **Baud Rate**: 9600
- **Data Bits**: 8
- **Parity**: None
- **Stop Bits**: 1
- **Flow Control**: None

## Port Configuration

### Windows
- Ports typically appear as `COM3`, `COM4`, etc.
- Check Device Manager > Ports (COM & LPT)
- Update `.env` file: `RFID_PORT=COM3`

### macOS
- Ports appear as `/dev/tty.usbserial-*` or `/dev/tty.usbmodem*`
- Check with: `ls /dev/tty.*`
- Update `.env` file: `RFID_PORT=/dev/tty.usbserial-1410`

### Linux
- Ports appear as `/dev/ttyUSB0`, `/dev/ttyACM0`, etc.
- Check with: `ls /dev/tty*`
- May need to add user to dialout group: `sudo usermod -a -G dialout $USER`
- Update `.env` file: `RFID_PORT=/dev/ttyUSB0`

## Testing RFID Integration

### 1. Hardware Test
```bash
# Install screen (macOS/Linux) or use PuTTY (Windows)
screen /dev/tty.usbserial-1410 9600

# Or use Node.js serial monitor
node -e "
const { SerialPort } = require('serialport');
const port = new SerialPort({ path: '/dev/tty.usbserial-1410', baudRate: 9600 });
port.on('data', data => console.log('RFID:', data.toString()));
"
```

### 2. Software Test
1. Start the attendance system
2. Go to RFID Scanner page
3. Check connection status
4. Test with physical RFID card
5. Verify attendance is recorded

### 3. Manual Testing
If no RFID reader available:
- Use the manual RFID input feature
- Enter test card IDs like "RFID001", "RFID002"
- System includes simulation mode for development

## Troubleshooting

### Common Issues

**Issue**: Port not found
- **Solution**: Check cable connections, verify port name

**Issue**: Permission denied (Linux/macOS)
- **Solution**: Add user to dialout group, restart terminal

**Issue**: No data received
- **Solution**: Check baud rate, wiring connections

**Issue**: Multiple card reads
- **Solution**: Add delay in Arduino code, debounce in software

**Issue**: Garbled data
- **Solution**: Check baud rate, serial settings

### Card Management

1. **Card Registration**
   - Each card needs unique ID
   - Register cards in Users table
   - Associate with student/staff

2. **Card Formats**
   - Support various formats (HEX, DEC)
   - Automatic format conversion
   - Case-insensitive matching

3. **Security**
   - Use encrypted cards for production
   - Implement card blacklist feature
   - Log all access attempts

## Production Deployment

### Recommendations
1. **Use dedicated RFID reader** (not development board)
2. **Secure physical installation** (tamper-proof enclosure)
3. **Backup power supply** (UPS for critical systems)
4. **Regular maintenance** (clean reader, check connections)
5. **Monitor system logs** (failed reads, errors)

### Scaling
- **Multiple readers**: Modify software for multiple serial ports
- **Network readers**: Use TCP/IP enabled RFID readers
- **Database optimization**: Use indexed queries for large datasets