// @ts-check
/// <reference path="./LaunchkeyProtocol.js" />

// @ts-ignore
include_file("resource://com.presonus.musicdevices/sdk/midiprotocol.js");
// @ts-ignore
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacedevice.js");
// @ts-ignore
include_file("LaunchkeyProtocol.js");

/**
 * @type {typeof import("presonus_studioone_5_sdk/src/controlsurfacedevice.ts").PreSonus["ControlHandler"]}
 */
// @ts-ignore
const ControlHandler = PreSonus.ControlHandler;
/**
 * @type {typeof import("presonus_studioone_5_sdk/src/controlsurfacedevice.ts").PreSonus["ControlSurfaceDevice"]}
 */
// @ts-ignore
const ControlSurfaceDevice = PreSonus.ControlSurfaceDevice;
/**
 * @type {{ kNone: number }}
 */
// @ts-ignore
const PadSectionPadAnimation = PreSonus.PadSectionPadAnimation;

class LaunchkeyDeviceModeHandler extends ControlHandler {
    /**
     * @param {string} name
     */
    constructor(name) {
        super();
        /**
         * @type {string}
         */
        this.name = name;
    }
    /**
     * @param {Uint8Array<ArrayBufferLike>} data
     * @param {number} length
     */
    receiveSysex(data, length) {
        if (LaunchkeyInControlMessage.isMessage(data, length)) {
            const mode = LaunchkeyInControlMessage.getValue(data);
            this.updateValue(mode);
            return true;
        }
        else
            return super.receiveSysex(data, length);
    }
}
class LaunchkeyButtonColorLEDHandler extends ControlHandler {
    /**
     * @param {string} name
     * @param {number} address
     */
    constructor(name, address) {
        super();
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {number}
         */
        this.address = address;
    }
    /**
     * @param {number} value
     * @param {number} flags
     */
    sendValue(value, flags) {
        /**
         * @type {LaunchkeyMidiDevice | null}
         */
        // @ts-ignore
        const launchkeyDevice = this.device;
        if (!launchkeyDevice) {
            return;
        }
        launchkeyDevice.sendButtonColor(this.address, value);
    }
}
class LaunchkeyPadHandler extends ControlHandler {
    /**
     * @param {string} controlName
     * @param {number} padIndex
     */
    constructor(controlName, padIndex) {
        super();
        this.name = controlName;
        this.padIndex = padIndex;
    }
}
class LaunchkeyPadStateLEDHandler extends LaunchkeyPadHandler {
    /**
     * @param {boolean} value
     * @param {number} flags
     */
    sendValue(value, flags) {
        /**
         * @type {LaunchkeyMidiDevice | null}
         */
        // @ts-ignore
        const launchkeyDevice = this.device;
        if (!launchkeyDevice) {
            return;
        }
        const pad = launchkeyDevice.pads[this.padIndex];
        pad.setState(value);
        launchkeyDevice.sendPadState(pad);
    }
}
class LaunchkeyPadAnimationLEDHandler extends LaunchkeyPadHandler {
    /**
     * @param {number} value
     * @param {number} flags
     */
    sendValue(value, flags) {
        /**
         * @type {LaunchkeyMidiDevice | null}
         */
        // @ts-ignore
        const launchkeyDevice = this.device;
        if (!launchkeyDevice) {
            return;
        }
        const pad = launchkeyDevice.pads[this.padIndex];
        pad.setAnimation(value);
        launchkeyDevice.sendPadState(pad);
    }
}
class LaunchkeyPadColorLEDHandler extends LaunchkeyPadHandler {
    /**
     * @param {number} value
     * @param {number} flags
     */
    sendValue(value, flags) {
        /**
         * @type {LaunchkeyMidiDevice | null}
         */
        // @ts-ignore
        const launchkeyDevice = this.device;
        if (!launchkeyDevice) {
            return;
        }
        const pad = launchkeyDevice.pads[this.padIndex];
        pad.setColorIndex(value);
        launchkeyDevice.sendPadState(pad);
    }
}
class LaunchkeyPadState {
    /**
     * @param {number} noteNumber
     * @param {boolean} state
     * @param {number} colorIndex
     * @param {number} animation
     */
    constructor(noteNumber, state, colorIndex, animation) {
        this.noteNumber = noteNumber;
        this.state = state;
        this.colorIndex = colorIndex;
        this.animation = animation;
    }
    /**
     * @param {boolean} state
     */
    setState(state) {
        this.state = state;
    }
    /**
     * @param {number} animation
     */
    setAnimation(animation) {
        this.animation = animation;
    }
    /**
     * @returns {number}
     */
    getAnimationStatus() {
        return this.animation === PadSectionPadAnimation.kNone ? LaunchkeyProtocol.kNoColorIndex : LaunchkeyProtocol.kAnimationStatic;
    }
    getNoteNumber() {
        return this.noteNumber;
    }
    /**
     * @param {number} index
     */
    setColorIndex(index) {
        this.colorIndex = index;
    }
    getColorIndex() {
        if (!this.state)
            return 0;
        return this.colorIndex;
    }
}
class LaunchkeyMidiDevice extends ControlSurfaceDevice {
    /**
     * @param {number} deviceId
     * @param {number} rows
     * @param {number} columns
     */
    constructor(deviceId, rows, columns) {
        super();
        /**
         * @type {number}
         */
        this.deviceId = deviceId;
        /**
         * @type {number}
         */
        this.rows = rows;
        /**
         * @type {number}
         */
        this.columns = columns;
        /**
         * @type {LaunchkeyPadState[]}
         */
        this.pads = new Array();
    }
    /**
     * @param {import("presonus_studioone_5_sdk/src/controlsurfacedevice.ts").HostDevice} hostDevice
     */
    onInit(hostDevice) {
        super.onInit(hostDevice);
        this.debugLog = false;
        this.initPadStates();
        for (let padIndex = 0; padIndex < this.pads.length; padIndex++) {
            this.addHandler(new LaunchkeyPadStateLEDHandler(`padLEDState[${padIndex}]`, padIndex));
            this.addHandler(new LaunchkeyPadColorLEDHandler(`padLEDColor[${padIndex}]`, padIndex));
        }

        this.addHandler(new LaunchkeyButtonColorLEDHandler("soloLED", 59));
    }
    onExit() {
        // Turn off InControl mode when exiting
        this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, LaunchkeyInControlMessage.kInControlNote, 0x00);
        super.onExit();
    }
    /**
     * @param {boolean} state
     */
    onMidiOutConnected(state) {
        super.onMidiOutConnected(state);
        if (state) {
            // Enable InControl mode when MIDI connects
            this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, LaunchkeyInControlMessage.kInControlNote, LaunchkeyInControlMessage.kInControlVelocity);
            if (this.hostDevice) {
                this.hostDevice.invalidateAll();
            }
        }
    }
    /**
     * @param {LaunchkeyPadState} state
     */
    sendPadState(state) {
        // Launchkey uses simple note_on messages for pad LEDs
        this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, state.getNoteNumber(), state.getColorIndex());
    }
    /**
     * @param {number} address
     * @param {number} colorIndex
     */
    sendButtonColor(address, colorIndex) {
        // Launchkey uses CC messages for button LEDs
        this.sendMidi(LaunchkeyInControlMessage.kNoteOnChannel0, address, colorIndex);
    }
    initPadStates() {
        // Launchkey MK1 has 16 pads (8 in 2 rows)
        // Note numbers: 36-43 (bottom row), 44-51 (top row)
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                const noteNumber = 36 + col + (row * 8);
                this.pads.push(new LaunchkeyPadState(noteNumber, false, 0, PadSectionPadAnimation.kNone));
            }
        }

        this.pads.push(new LaunchkeyPadState(104, false, 0, PadSectionPadAnimation.kNone));
        this.pads.push(new LaunchkeyPadState(120, false, 0, PadSectionPadAnimation.kNone));
    }
}
class LaunchkeyMK1MidiDevice extends LaunchkeyMidiDevice {
    constructor() {
        super(LaunchkeyProtocol.kLaunchkeyMK1DeviceID, 2, 8);
    }
    /**
     * @param {import("presonus_studioone_5_sdk/src/controlsurfacedevice.ts").HostDevice} hostDevice
     */
    onInit(hostDevice) {
        super.onInit(hostDevice);
        // Add Launchkey MK1 specific handlers
        this.addReceiveHandler(new LaunchkeyDeviceModeHandler("inControlReceiver"));
    }
}
function createLaunchkeyMK1DeviceInstance() {
    return new LaunchkeyMK1MidiDevice();
}


