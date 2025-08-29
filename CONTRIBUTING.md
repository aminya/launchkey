# Contributing to lunchkey

Thank you for your interest in contributing to lunchkey! This document provides information for developers who want to contribute to the project.

## Development Setup

### Using uv (Recommended)

[uv](https://github.com/astral-sh/uv) is a fast Python package installer and resolver, useful for development.

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

### Development Usage

#### With uv development setup:

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

## Project Structure

```
lunchkey/
├── lunchkey/
│   └── main.py          # Main implementation
├── pyproject.toml       # Project configuration
├── uv.lock             # Dependency lock file
└── README.md           # Project documentation
```

## Dependencies

- `mido>=1.3.3`: MIDI library for Python
- `python-rtmidi>=1.5.8`: Real-time MIDI backend

## Running Tests

```bash
# Run tests directly with uv (recommended)
uv run pytest

# Or activate virtual environment first
uv shell
pytest
```

## Development Guidelines

### Code Style

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write clear, descriptive commit messages

### Testing

- Add tests for new functionality
- Ensure all tests pass before submitting a pull request
- Test on multiple platforms if possible

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Building and Distribution

### Local Development Build

```bash
# Build the package
uv run python -m build

# Install in development mode
uv run pip install -e .
```

### Testing the Build

```bash
# Test the built package
uv run python -m lunchkey.main --help
```

## Troubleshooting Development Issues

### Common Development Problems

1. **Import errors in development**
   - Ensure you're using `uv run` or have activated the virtual environment
   - Check that dependencies are properly installed with `uv sync`

2. **MIDI port access issues**
   - Ensure no other applications are using the MIDI port
   - Check system MIDI permissions
   - Try running with elevated privileges if needed

3. **Test failures**
   - Verify all dependencies are installed: `uv sync`
   - Check Python version compatibility
   - Ensure MIDI hardware is available for integration tests

## Getting Help

If you encounter issues during development:

1. Check the existing issues on GitHub
2. Review the troubleshooting section in the README
3. Open a new issue with detailed information about your problem
4. Include your operating system, Python version, and any error messages

## License

By contributing to lunchkey, you agree that your contributions will be licensed under the same license as the project.
