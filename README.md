# lunchkey

Control Novation Launchkey MIDI keyboard with LED animations and MIDI functionality.

![Animation](https://github.com/user-attachments/assets/7bc74796-42e6-432a-b0c4-b2bb83b66e5e)

## Description

`lunchkey` is a Python library and command-line tool for controlling Novation Launchkey MIDI keyboards. It provides functionality to:

- Connect to Launchkey devices via MIDI
- Control LED lights on the keyboard
- Run animated LED patterns
- Switch between Basic and InControl modes
- Automatically detect Launchkey models (MK1, MK2, MK3)

## Features

- **MIDI Integration**: Uses `mido` and `python-rtmidi` for robust MIDI communication
- **LED Control**: Full control over all 18 LED lights (9 per row)
- **Animation System**: Built-in LED sweep animation with customizable colors
- **Model Detection**: Automatic detection of Launchkey model for proper MIDI channel usage
- **Port Management**: Smart MIDI port connection with fallback strategies
- **Command Line Interface**: Easy-to-use CLI for quick testing and control

## Requirements

- Python 3.10 or higher
- Novation Launchkey MIDI keyboard (MK1, MK2, or MK3)
- MIDI drivers installed on your system

## Installation

### Using uv (Recommended)

[uv](https://github.com/astral-sh/uv) is a fast Python package installer and resolver.

1. **Install uv** (if not already installed):
   ```bash
   # On Windows (PowerShell)
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

   # On macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Clone and install the project**:
   ```bash
   git clone https://github.com/aminya/lunchkey.git
   cd lunchkey
   uv sync
   ```

3. **Run Python scripts directly with uv**:
   ```bash
   # Run the main script
   uv run python -m lunchkey.main

   # Or activate the virtual environment for interactive use
   uv shell
   ```
## Usage

### Command Line Interface

The main script provides several command-line options:

```bash
# List available MIDI ports
uv run python -m lunchkey.main --list-ports

# Connect to a specific MIDI port
uv run python -m lunchkey.main --port "MIDIOUT2"

# Connect without running animation (useful for testing)
uv run python -m lunchkey.main --port "MIDIOUT2" --no-animation

# Use default port (MIDIOUT2)
uv run python -m lunchkey.main
```

### Python API

```python
from mido.backends.backend import Backend
from lunchkey.main import Launchkey

# Initialize and connect
backend = Backend(name="mido.backends.rtmidi", load=True)
launchkey = Launchkey(backend)

# Connect to MIDI port
launchkey.connect_midi_output("MIDIOUT2")

# Detect model and enable InControl mode
launchkey.detect_launchkey_model()
launchkey.set_incontrol_mode(True)

# Control individual LEDs
launchkey.write_led(96, 127)  # Turn on first LED with full brightness

# Turn off all LEDs
launchkey.turn_off_all_leds()

# Clean up
launchkey.close()
```

## MIDI Port Configuration

The tool automatically tries to connect to MIDI ports in this order:

1. **Direct connection**: Uses the specified port name/index
2. **Pattern matching**: Searches for ports containing the specified name
3. **Fallback**: Attempts to connect to port index 0

Common MIDI port names for Launchkey devices:
- `MIDIOUT2` (Windows)
- `Launchkey MK3` (macOS/Linux)
- `Launchkey MK2` (macOS/Linux)

## Launchkey Models

The tool automatically detects your Launchkey model:

- **MK1**: Uses MIDI channel 0 for InControl mode
- **MK2/MK3**: Uses MIDI channel 15 for InControl mode

## LED Layout

The Launchkey has 18 LEDs arranged in two rows:

- **Row 1**: Notes 96-104 (9 LEDs)
- **Row 2**: Notes 112-120 (9 LEDs)

LED colors are controlled via velocity values (0-127), with specific ranges for different colors.

## Development

### Project Structure

```
lunchkey/
├── lunchkey/
│   └── main.py          # Main implementation
├── pyproject.toml       # Project configuration
├── uv.lock             # Dependency lock file
└── README.md           # This file
```

### Dependencies

- `mido>=1.3.3`: MIDI library for Python
- `python-rtmidi>=1.5.8`: Real-time MIDI backend

### Running Tests

```bash
# Run tests directly with uv (recommended)
uv run pytest

# Or activate virtual environment first
uv shell
pytest
```

## Troubleshooting

### Common Issues

1. **"No MIDI ports found"**
   - Ensure MIDI drivers are installed
   - Check that your Launchkey is connected and powered on
   - Try running `--list-ports` to see available ports

2. **"Failed to open port"**
   - Verify the port name with `--list-ports`
   - Ensure no other applications are using the MIDI port
   - Try using port index instead of name

3. **LEDs not responding**
   - Check that InControl mode is enabled
   - Verify MIDI channel settings for your Launchkey model
   - Ensure the device is in the correct mode

### MIDI Setup

- **Windows**: Install Novation USB MIDI drivers
- **macOS**: Use built-in Core MIDI support
- **Linux**: Install `timidity` or similar MIDI utilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.

## Acknowledgments

- Novation for the Launchkey hardware and the [programmer's guide](https://www.novationmusic.com/en/support/downloads/launchkey-mk2-mk3-programmers-guide)
- The `mido` and `python-rtmidi` projects for MIDI functionality
