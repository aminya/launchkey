from mido.backends.backend import Backend
from mido.ports import BaseOutput
from mido.messages import Message
import random
import argparse
from time import sleep
from dataclasses import dataclass


class Launchkey:
    """
    A class to represent a Launchkey MIDI keyboard.
    """

    backend: Backend
    outport: BaseOutput | None = None
    mk: int | None = None

    row1: tuple[int, ...] = (96, 97, 98, 99, 100, 101, 102, 103, 104)
    row2: tuple[int, ...] = (112, 113, 114, 115, 116, 117, 118, 119, 120)
    leds: tuple[int, ...] = row1 + row2

    def __init__(self, backend: Backend):
        self.backend = backend

    def close(self):
        self.turn_off_all_leds()
        if self.mk:
            self.set_incontrol_mode(False)
        if self.outport:
            self.outport.close()

    def get_port_name(self) -> str:
        if not self.outport:
            raise RuntimeError("No output port connected")
        if type(self.outport.name) != str:
            raise RuntimeError("Could not get port name")
        return self.outport.name

    def connect_midi_output(self, port_name: str):
        """
        Attempt to connect to a MIDI output port with fallback strategies.

        Args:
            port_name (str): The name or index of the MIDI port to connect to

        Returns:
            mido.ports.BaseOutput: Connected MIDI output port or None if failed
        """
        print(f"Connecting to MIDI port: {port_name}")

        # Try to open the specified port directly
        try:
            self.outport = self.backend.open_output(port_name)
            print(f"Successfully connected to: {port_name}")
            return
        except Exception as e:
            print(f"Failed to open port '{port_name}': {e}")

        # Try to find a matching port by name
        print(f"Trying to find matching MIDI port containing '{port_name}'...")
        try:
            ports: list[str] = self.backend.get_output_names()
            for port in ports:
                if port_name.lower() in port.lower():
                    print(f"Found matching MIDI port: {port}")
                    try:
                        self.outport = self.backend.open_output(port)
                        print(f"Successfully connected to: {port}")
                        return
                    except Exception as port_error:
                        print(f"Failed to open port '{port}': {port_error}")
                        continue
        except Exception as e:
            print(f"Could not list available ports: {e}")

        # Try port index 0 as final fallback
        print("\nTrying to open port index 0 as fallback...")
        try:
            self.outport = self.backend.open_output(0)
            print("Successfully connected to port index 0")
            return
        except Exception as index_error:
            raise Exception(f"Failed to open port index 0") from index_error

    def list_available_ports(self):
        """
        List all available MIDI output ports.
        """
        print("Available MIDI output ports:")
        try:
            ports: list[str] = self.backend.get_output_names()
            for i, port in enumerate(ports):
                print(f"  {i}: {port}")
        except Exception as e:
            print(f"  Note: Could not list ports in this mido version: {e}")

    def detect_launchkey_model(self):
        """
        Detect the model of the Launchkey based on the name
        """
        port_name = self.get_port_name()
        if "MK2" in port_name:
            self.mk = 2
        elif "MK3" in port_name:
            self.mk = 3
        else:
            self.mk = 1

    def set_incontrol_mode(self, mode: bool):
        """
        Set InControl mode on the Launchkey.

        Args:
            outport: MIDI output port
            mode (bool): True to enable, False to disable


        When you connect your Launchkey it will default to Basic mode. To enter extended
        mode send the following MIDI message to the Launchkey.
        Extended Mode Online Message:  MIDI Channel 16, Note C-1, Velocity 127
        9Fh, 0Ch, 7Fh (159, 12, 127)
        When the keyboard enters Extended mode the InControl buttons should light up.
        To switch back to basic mode send the following message.
        Extended Mode Offline Message: MIDI Channel 16, Note C-1, Velocity 0
        9Fh, 0Ch, 00h (159, 12, 0)
        InControl LEDs should switch off now.
        """
        if self.mk == 1:
            channel = 0
        else:
            channel = 15

        if not self.outport:
            raise RuntimeError("No output port connected")

        self.outport.send(
            Message("note_on", channel=channel, note=12, velocity=127 if mode else 0)
        )

    def write_led(self, led_id: int, color_vel: int):
        """
        Send a MIDI note message to control an LED.

        Args:
            outport: MIDI output port
            led_id (int): LED note number
            color_vel (int): Color/velocity value (0-127)
        """
        if not self.outport:
            raise RuntimeError("No output port connected")

        self.outport.send(
            Message("note_on", channel=0, note=led_id, velocity=color_vel)
        )

    def turn_off_all_leds(self):
        """
        Turn off all LEDs on the Launchkey.

        Args:
            outport: MIDI output port
        """
        for led in self.leds:
            self.write_led(led, 0)

    def random_color(self):
        red_or_green = bool(
            random.randint(0, 1)
        )  # Making sure the number is always >0 for one component
        return (
            random.randint(int(red_or_green), 3)
            + random.randint(int(not red_or_green), 3) * 16
        )

    def run_animation(self):
        """
        Run the LED sweep animation on the Launchkey.

        Args:
            outport: MIDI output port
        """
        try:
            while True:
                color = self.random_color()

                for index, _led in enumerate(self.row1):
                    # Set current LED color
                    self.write_led(self.row1[index], color)
                    self.write_led(self.row2[index], color)

                    # Turn off last set LEDs
                    if index > 0:
                        self.write_led(self.row1[index - 1], 0)
                        self.write_led(self.row2[index - 1], 0)
                    sleep(0.1)

        except KeyboardInterrupt:
            print("\nAnimation stopped by user")
            raise


@dataclass
class Args:
    port: str = ""
    list_ports: bool = False
    no_animation: bool = False


def parse_arguments() -> Args:
    """
    Parse command line arguments for the Launchkey LED animation.

    Returns:
        argparse.Namespace: Parsed arguments
    """
    parser = argparse.ArgumentParser(description="Launchkey LED Sweep Animation")
    parser.add_argument(
        "--port",
        "-p",
        help="MIDI output port name or index (use --list-ports to see available ports)",
    )
    parser.add_argument(
        "--list-ports",
        "-l",
        action="store_true",
        help="List available MIDI output ports and exit",
    )
    parser.add_argument(
        "--no-animation",
        "-n",
        action="store_true",
        help="Connect to Launchkey but don't run the animation (useful for testing)",
    )

    return Args(**vars(parser.parse_args()))


def main():
    # Parse command line arguments
    args = parse_arguments()

    backend = Backend(name="mido.backends.rtmidi", load=True)
    launchkey = Launchkey(backend)

    # List available ports if requested
    if args.list_ports:
        launchkey.list_available_ports()
        return

    # Get port name from arguments or use default
    port_name = args.port if args.port else "MIDIOUT2"

    try:
        # Connect to MIDI output using the connection function
        launchkey.connect_midi_output(port_name)

        # Detect the model of the Launchkey
        launchkey.detect_launchkey_model()
        print(f"Launchkey model: {launchkey.mk}")

        # Set the Launchkey to InControl mode
        launchkey.set_incontrol_mode(True)

        # Run the LED animation unless --no-animation is specified
        if not args.no_animation:
            print("Starting LED animation... (Press Ctrl+C to stop)")
            launchkey.run_animation()
        else:
            print(
                "Connected successfully! Animation skipped due to --no-animation flag."
            )
            print("Press Ctrl+C to exit.")
            try:
                while True:
                    sleep(1)  # Keep connection alive
            except KeyboardInterrupt:
                pass

    except KeyboardInterrupt:
        # Animation was stopped by user (handled in run_animation)
        pass
    except Exception as e:
        raise e
    finally:
        launchkey.close()


if __name__ == "__main__":
    main()
