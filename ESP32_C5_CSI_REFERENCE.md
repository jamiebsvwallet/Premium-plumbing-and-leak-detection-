# ESP32-C5 CSI Reference

## Overview

This document provides reference information about ESP32-C5 Channel State Information (CSI) for technical discussions and troubleshooting.

## What is ESP32-C5?

The ESP32-C5 is a Wi-Fi 6 and Bluetooth 5 (LE) RISC-V microcontroller from Espressif Systems, featuring:
- Wi-Fi 6 (802.11ax) support
- Bluetooth 5 (LE) connectivity
- RISC-V processor architecture
- Advanced wireless features including CSI

## What is CSI (Channel State Information)?

Channel State Information (CSI) is data describing the signal propagation characteristics between a transmitter and receiver. It includes:

- **Signal Strength**: Amplitude of received signals
- **Phase Information**: Phase shifts in the signal
- **Frequency Response**: How the channel affects different frequencies
- **Time Domain Data**: Signal characteristics over time

### CSI Use Cases

1. **Indoor Positioning**: Determine device location using Wi-Fi signals
2. **Gesture Recognition**: Detect human movements through signal distortion
3. **Presence Detection**: Identify when someone enters/leaves a space
4. **Security**: Detect intrusions or unauthorized access
5. **Health Monitoring**: Detect breathing patterns, heart rate (experimental)
6. **Smart Home Applications**: Automate based on occupancy/movement

## ESP32-C5 CSI Features

### Key Capabilities

- **Real-time CSI Data**: Access raw channel state information
- **Wi-Fi 6 Support**: Enhanced CSI accuracy with 802.11ax
- **High Sampling Rate**: Capture detailed signal variations
- **Multiple Antenna Support**: Better spatial resolution
- **Low Power**: Efficient for battery-powered applications

### CSI Data Format

ESP32-C5 CSI data typically includes:
- Number of subcarriers
- Complex values (amplitude + phase) for each subcarrier
- RSSI (Received Signal Strength Indicator)
- Timestamp
- MAC addresses of transmitter/receiver

## Common ESP32-C5 CSI Topics

### 1. CSI Data Collection
- Configuring CSI capture mode
- Setting up Wi-Fi sniffer mode
- Accessing CSI buffers
- Data rate and sampling considerations

### 2. CSI Data Processing
- Parsing CSI frames
- Amplitude and phase extraction
- Filtering and noise reduction
- Feature extraction for ML applications

### 3. Development Environment
- ESP-IDF setup for ESP32-C5
- CSI example code
- Required libraries and dependencies
- Debugging CSI applications

### 4. Common Issues and Solutions

#### Issue: No CSI Data Received
**Solutions:**
- Check Wi-Fi channel configuration
- Verify CSI callback is registered
- Ensure proper antenna connection
- Check ESP-IDF version compatibility

#### Issue: CSI Data Quality Poor
**Solutions:**
- Adjust Wi-Fi bandwidth settings
- Check for interference sources
- Optimize antenna placement
- Increase sampling rate if needed

#### Issue: High CPU Usage
**Solutions:**
- Reduce CSI sampling rate
- Optimize data processing code
- Use DMA for data transfer
- Consider using FreeRTOS tasks efficiently

### 5. Programming Examples

#### Basic CSI Callback Setup (Pseudocode)
```c
// Initialize Wi-Fi in CSI mode
wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
esp_wifi_init(&cfg);

// Register CSI callback
wifi_csi_config_t csi_config = {
    .lltf_en = true,
    .htltf_en = true,
    .stbc_htltf2_en = true,
    .ltf_merge_en = true,
    .channel_filter_en = true,
    .manu_scale = true,
};

esp_wifi_set_csi_config(&csi_config);
esp_wifi_set_csi_rx_cb(&csi_callback_handler, NULL);
esp_wifi_set_csi(true);
```

#### CSI Data Processing (Pseudocode)
```c
void csi_callback_handler(void *ctx, wifi_csi_info_t *data) {
    // Extract CSI data
    int8_t *csi_data = data->buf;
    int len = data->len;
    
    // Process amplitude and phase
    for (int i = 0; i < len; i += 2) {
        int8_t real = csi_data[i];
        int8_t imag = csi_data[i + 1];
        float amplitude = sqrt(real*real + imag*imag);
        float phase = atan2(imag, real);
        
        // Use amplitude and phase for your application
    }
}
```

## Resources for ESP32-C5 CSI Development

### Official Documentation
- ESP32-C5 Technical Reference Manual
- ESP-IDF Programming Guide
- Wi-Fi CSI API Documentation

### Community Resources
- Espressif ESP32 Forum
- GitHub ESP-IDF Examples
- Stack Overflow ESP32 tag

### Research Papers
- "Practical Human Sensing in the Light" (CSI-based sensing)
- "WiFi CSI Based Passive Human Activity Recognition" 
- Various IEEE papers on CSI applications

## Search Keywords for Finding Conversations

When searching for your ESP32-C5 CSI conversation, try these keywords:
- `ESP32-C5`
- `ESP32 C5`
- `CSI` or `Channel State Information`
- `Wi-Fi sensing`
- `802.11ax`
- `ESP-IDF`
- `Wi-Fi 6`
- Specific features like: `gesture recognition`, `indoor positioning`, `presence detection`
- Technical terms: `subcarrier`, `amplitude`, `phase`, `RSSI`

## Getting Help

If you discussed ESP32-C5 CSI and need to recover the conversation:
1. **Search your email/chat** for keywords: "ESP32-C5", "CSI", "Channel State"
2. **Check your code repositories** for commits or comments related to ESP32
3. **Review browser history** for ESP32-C5 documentation pages
4. **Check note-taking apps** (OneNote, Evernote, etc.) for CSI notes
5. **Contact support** with specific details about the CSI topic discussed

---

*Last Updated: February 2026*
