const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class RFIDReader extends EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.parser = null;
        this.connected = false;
        this.lastScan = null;
        this.portPath = process.env.RFID_PORT || 'COM3'; // Default for Windows, change for other OS
    }

    async initialize() {
        try {
            console.log(`🔍 Initializing RFID Reader on port: ${this.portPath}`);
            
            // Try to connect to RFID reader
            await this.connect();
            
        } catch (error) {
            console.log('⚠️  RFID Reader not connected. Running without RFID functionality.');
            console.log('💡 To connect a real RFID reader, check your port configuration in .env file');
            
            // Simulation disabled - RFID functionality will be inactive
            this.connected = false;
        }
    }

    async connect() {
        return new Promise((resolve, reject) => {
            // List available ports first
            SerialPort.list().then(ports => {
                console.log('Available serial ports:');
                ports.forEach(port => {
                    console.log(`  - ${port.path}: ${port.manufacturer || 'Unknown'}`);
                });

                // Try to open the specified port
                this.port = new SerialPort({
                    path: this.portPath,
                    baudRate: 9600, // Common baud rate for RFID readers
                }, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    console.log(`✅ RFID Reader connected on ${this.portPath}`);
                    this.connected = true;

                    // Setup parser to read line-by-line
                    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
                    
                    // Listen for RFID card data
                    this.parser.on('data', (data) => {
                        this.handleRFIDData(data.toString().trim());
                    });

                    // Handle connection errors
                    this.port.on('error', (err) => {
                        console.error('RFID Reader error:', err);
                        this.connected = false;
                    });

                    this.port.on('close', () => {
                        console.log('RFID Reader disconnected');
                        this.connected = false;
                    });

                    resolve();
                });
            }).catch(reject);
        });
    }

    handleRFIDData(data) {
        // Clean and validate RFID data
        const rfidCard = this.cleanRFIDData(data);
        
        if (this.isValidRFID(rfidCard)) {
            this.lastScan = {
                rfid: rfidCard,
                timestamp: new Date().toISOString()
            };

            console.log(`📷 RFID Card detected: ${rfidCard}`);
            this.emit('cardScanned', rfidCard);
        }
    }

    cleanRFIDData(data) {
        // Remove common prefixes/suffixes and clean the data
        return data
            .replace(/[\r\n\t]/g, '') // Remove line breaks and tabs
            .replace(/^(RFID:|Card:|ID:)/i, '') // Remove common prefixes
            .replace(/[^A-Za-z0-9]/g, '') // Keep only alphanumeric
            .trim()
            .toUpperCase();
    }

    isValidRFID(rfid) {
        // Basic RFID validation
        return rfid && 
               rfid.length >= 4 && 
               rfid.length <= 20 && 
               /^[A-Z0-9]+$/.test(rfid);
    }

    // Simulation mode disabled
    startSimulationMode() {
        console.log('💡 RFID simulation mode is disabled');
        console.log('💡 The system will work without RFID scanning functionality');
        
        this.connected = false; // Mark as disconnected since no real RFID
        
        // Simulation disabled - no automatic scans
        // Manual scanning can still be enabled if needed
    }

    setupManualScanInput() {
        // Allow manual RFID input via console for testing
        process.stdin.setEncoding('utf8');
        
        console.log('💡 Manual RFID input available:');
        console.log('   Type "scan:CARDID" to simulate an RFID scan');
        console.log('   Example: scan:RFID001');
        
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null) {
                const input = chunk.toString().trim();
                if (input.startsWith('scan:')) {
                    const rfidCard = input.substring(5);
                    console.log(`🎮 Manual RFID scan: ${rfidCard}`);
                    this.handleRFIDData(rfidCard);
                }
            }
        });
    }

    // Public methods
    isConnected() {
        return this.connected;
    }

    getLastScan() {
        return this.lastScan;
    }

    disconnect() {
        if (this.port && this.port.isOpen) {
            this.port.close();
        }
        this.connected = false;
    }

    // Method to manually trigger a scan (for testing)
    simulateScan(rfidCard) {
        if (this.isValidRFID(rfidCard)) {
            this.handleRFIDData(rfidCard);
            return true;
        }
        return false;
    }
}

module.exports = RFIDReader;