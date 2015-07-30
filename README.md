# jsgameboy
A JavaScript GameBoy emulator

This JS program will run GameBoy ROMS in your web browser. It should run at full speed on a decent desktop PC. Currently the code isn't quite optimised enough to run at full speed on mobile devices.

See it in action [here](http://thunderholt.github.io/jsgameboy/).

## Features

The following hardware is currently emulated:
* CPU
* GPU (missing some minor behaviours).
* Joypad
* Cartridge, with Memory Bank Controller type 1 (possibly missing some behaviours).
* Timer

The following hardware is NOT currently emulated:
* Sound
* The various other types of memory bank controller.
* Battery-backed cartridge RAM.
* Serial port.

## References

* General GameBoy hardware specs: http://bgb.bircd.org/pandocs.htm
* Op code map: http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html
* Op codes summary: http://gameboy.mongenel.com/dmg/opcodes.html
