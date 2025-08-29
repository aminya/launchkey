# lunchkey

Control Novation Launchkey MIDI keyboard with LED animations and MIDI functionality in Studio One or via Python.

![Animation](https://github.com/user-attachments/assets/7bc74796-42e6-432a-b0c4-b2bb83b66e5e)

## StudioOne Support

This project includes a StudioOne extension that provides native support for Launchkey MK1 devices in Presonus Studio One.

It provides two devices that will be added automatically once the extension is installed. InControl buttons allow to switch between the two modes for the shared controls.

- DAW Device:
  - Transport controls
  - Previous/Next track
  - 9 Faders: volume of the tracks and master
  - 8 Encoders: pan
  - 9 Buttons: solo tracks and master
  - 2 circular buttons: move the mixer's page 8 tracks left/right
  - 16 pads: user asssignable in User mode, and works with launcher in Launcher mode (selectable from Studio One GUI)

- Instrument Device: allows to use the keyboard as an instrument and use the faders and encoders for controlling any parameter.
  - Keys of the keyboard
  - 16 pads: note on/off
  - 9 Faders: user assignable
  - 9 Solo Buttons: user assignable
  - 8 Encoders: user assignable
  - 2 Circular Buttons: user assignable

### Installing the StudioOne Extension

1. Download the extension from [this link](https://github.com/aminya/lunchkey/releases/download/v0.1.0/io.github.aminya.lunchkeymk1.device.zip)
2. Extract it and copy the extension folder to your Studio One under `C:\Users\<username>\AppData\Roaming\PreSonus\Studio One 7\Extensions`
3. Restart Studio One
4. The Launchkey MK1 will appear in your MIDI device list

The extension provides a complete surface mapping that transforms your Launchkey MK1 into a fully functional Studio One control surface.

## Python Support

If not using StudioOne or you want to learn how Launchkey works, you can use the Python library:

- **MIDI Integration**: Uses `mido` and `python-rtmidi` for robust MIDI communication
- **LED Control**: Full control over all 18 LED lights (9 per row)
- **Animation System**: Built-in LED sweep animation with customizable colors
- **Model Detection**: Automatic detection of Launchkey model for proper MIDI channel usage
- **Port Management**: Smart MIDI port connection with fallback strategies
- **Command Line Interface**: Easy-to-use CLI for quick testing and control

## Installation

### Using pip (Recommended)

Install directly from PyPI:

```bash
pip install lunchkey
```

After installation, you can use the command-line tool:

```bash
# List available MIDI ports
lunchkey --list-ports

# Connect to a specific MIDI port
lunchkey --port "MIDIOUT2"

# Connect without running animation
lunchkey --port "MIDIOUT2" --no-animation
```

## Contributing

For detailed contributing guidelines, development setup, and project information, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under MIT as specified in the LICENSE file.


The [Novation programmer's guide](https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/novation/downloads/10535/launchkey-mk2-programmers-reference-guide.pdf) was used to understand the MIDI protocol of the Launchkey.
