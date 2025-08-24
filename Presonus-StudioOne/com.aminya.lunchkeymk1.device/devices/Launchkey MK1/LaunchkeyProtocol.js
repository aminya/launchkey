class LaunchkeyProtocol {
}
LaunchkeyProtocol.kLaunchkeyMK1DeviceID = 0x02;
LaunchkeyProtocol.kLaunchkeyMK2DeviceID = 0x03;
LaunchkeyProtocol.kLaunchkeyMK3DeviceID = 0x04;

// LED colors for Launchkey pads
LaunchkeyProtocol.kNoColorIndex = 0;
LaunchkeyProtocol.kAnimationStatic = 0x90;
LaunchkeyProtocol.kPadColors = [
    "#000000", // OFF
    "#FF0000", // RED
    "#00FF00", // GREEN
    "#FF8000", // AMBER
    "#FFFF00", // YELLOW
    "#0000FF", // BLUE
    "#FF00FF", // MAGENTA
    "#FFFFFF"  // WHITE
];

// InControl mode message
class LaunchkeyInControlMessage {
    static isMessage(data, length) {
        if (length < LaunchkeyInControlMessage.kLength)
            return false;
        if (LaunchkeyInControlMessage.isHeader(data) == false)
            return false;
        return data[5] == LaunchkeyProtocol.kLaunchkeyMK1DeviceID &&
            data[6] == LaunchkeyInControlMessage.kMessageID;
    }

    static getValue(data) {
        return data[7];
    }

    static build(sysexBuffer, deviceId, value) {
        sysexBuffer.begin(LaunchkeyInControlMessage.kHeader);
        sysexBuffer.push(deviceId);
        sysexBuffer.push(LaunchkeyInControlMessage.kMessageID);
        sysexBuffer.push(value);
        sysexBuffer.end();
        return sysexBuffer;
    }
}

LaunchkeyInControlMessage.kInControlOff = 0x00;
LaunchkeyInControlMessage.kInControlOn = 0x01;
LaunchkeyInControlMessage.kMessageID = 0x0A;
LaunchkeyInControlMessage.kLength = 9;

// MIDI note message constants for InControl mode
LaunchkeyInControlMessage.kNoteOnChannel0 = 0x90;
LaunchkeyInControlMessage.kInControlNote = 0x0C; // Note 12 (C-1)
LaunchkeyInControlMessage.kInControlVelocity = 0x7F; // Velocity 127

// Header for SysEx messages
LaunchkeyInControlMessage.kHeader = [0x00, 0x20, 0x29, 0x02];
