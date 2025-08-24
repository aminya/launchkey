include_file("resource://com.presonus.musicdevices/sdk/midiprotocol.js");
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacedevice.js");
include_file("LaunchkeyProtocol.js");
class LaunchkeyDeviceModeHandler extends PreSonus.ControlHandler {
    constructor(name) {
        super();
        this.name = name;
    }
    receiveSysex(data, length) {
        if (LaunchkeyInControlMessage.isMessage(data, length)) {
            let mode = LaunchkeyInControlMessage.getValue(data);
            this.updateValue(mode);
            return true;
        }
        else
            return super.receiveSysex(data, length);
    }
}
class LaunchkeyButtonColorLEDHandler extends PreSonus.ControlHandler {
    constructor(name, address) {
        super();
        this.name = name;
        this.address = address;
    }
    sendValue(value, flags) {
        let launchkeyDevice = this.device;
        launchkeyDevice.sendButtonColor(this.address, value);
    }
}
class LaunchkeyPadHandler extends PreSonus.ControlHandler {
    constructor(controlName, padIndex) {
        super();
        this.name = controlName;
        this.padIndex = padIndex;
    }
}
class LaunchkeyPadStateLEDHandler extends LaunchkeyPadHandler {
    sendValue(value, flags) {
        let launchkeyDevice = this.device;
        let pad = launchkeyDevice.pads[this.padIndex];
        pad.setState(value);
        launchkeyDevice.sendPadState(pad);
    }
}
class LaunchkeyPadAnimationLEDHandler extends LaunchkeyPadHandler {
    sendValue(value, flags) {
        let launchkeyDevice = this.device;
        let pad = launchkeyDevice.pads[this.padIndex];
        pad.setAnimation(value);
        launchkeyDevice.sendPadState(pad);
    }
}
class LaunchkeyPadColorLEDHandler extends LaunchkeyPadHandler {
    sendValue(value, flags) {
        let launchkeyDevice = this.device;
        let pad = launchkeyDevice.pads[this.padIndex];
        pad.setColorIndex(value);
        launchkeyDevice.sendPadState(pad);
    }
}
class LaunchkeyPadState {
    constructor(noteNumber, state, colorIndex, animation) {
        this.noteNumber = noteNumber;
        this.state = state;
        this.colorIndex = colorIndex;
        this.animation = animation;
    }
    setState(state) {
        this.state = state;
    }
    setAnimation(animation) {
        this.animation = animation;
    }
    getAnimationStatus() {
        if (this.animation === PreSonus.PadSectionPadAnimation.kNone) {
            return LaunchkeyProtocol.kNoColorIndex;
        } else {
            return LaunchkeyProtocol.kAnimationStatic;
        }
    }
    getNoteNumber() {
        return this.noteNumber;
    }
    setColorIndex(index) {
        this.colorIndex = index;
    }
    getColorIndex() {
        if (!this.state)
            return 0;
        return this.colorIndex;
    }
}
class LaunchkeyMidiDevice extends PreSonus.ControlSurfaceDevice {
    constructor(deviceId, rows, columns) {
        super();
        this.deviceId = deviceId;
        this.rows = rows;
        this.columns = columns;
        this.pads = new Array();
    }
    onInit(hostDevice) {
        super.onInit(hostDevice);
        this.debugLog = false;
        this.initPadStates();
        for (let padIndex = 0; padIndex < this.pads.length; padIndex++) {
            this.addHandler(new LaunchkeyPadStateLEDHandler(`padLEDState[${padIndex}]`, padIndex));
            this.addHandler(new LaunchkeyPadColorLEDHandler(`padLEDColor[${padIndex}]`, padIndex));
        }

        this.addHandler(new LaunchkeyButtonColorLEDHandler(`soloLED`, 59));
    }
    onExit() {
        // Turn off InControl mode when exiting
        this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, LaunchkeyInControlMessage.kInControlNote, 0x00);
        super.onExit();
    }
    onMidiOutConnected(state) {
        super.onMidiOutConnected(state);
        if (state) {
            // Enable InControl mode when MIDI connects
            this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, LaunchkeyInControlMessage.kInControlNote, LaunchkeyInControlMessage.kInControlVelocity);
            this.hostDevice.invalidateAll();
        }
    }
    sendPadState(state) {
        // Launchkey uses simple note_on messages for pad LEDs
        this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, state.getNoteNumber(), state.getColorIndex());
    }
    sendButtonColor(address, colorIndex) {
        // Launchkey uses CC messages for button LEDs
        this.sendMidi(0xB0, address, colorIndex);
    }
    initPadStates() {
        // Launchkey MK1 has 16 pads (8 in 2 rows)
        // Note numbers: 36-43 (bottom row), 44-51 (top row)
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                let noteNumber = 36 + col + (row * 8);
                this.pads.push(new LaunchkeyPadState(noteNumber, false, 0, PreSonus.PadSectionPadAnimation.kNone));
            }
        }

        this.pads.push(new LaunchkeyPadState(104, false, 0, PreSonus.PadSectionPadAnimation.kNone));
        this.pads.push(new LaunchkeyPadState(120, false, 0, PreSonus.PadSectionPadAnimation.kNone));
    }
}
class LaunchkeyMK1MidiDevice extends LaunchkeyMidiDevice {
    constructor() {
        super(LaunchkeyProtocol.kLaunchkeyMK1DeviceID, 2, 8);
    }
    onInit(hostDevice) {
        super.onInit(hostDevice);
        // Add Launchkey MK1 specific handlers
        this.addReceiveHandler(new LaunchkeyDeviceModeHandler("inControlReceiver"));
    }
}
function createLaunchkeyMK1DeviceInstance() {
    return new LaunchkeyMK1MidiDevice();
}


