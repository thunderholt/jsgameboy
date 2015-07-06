function Gameboy_MixInMemory(system) {		

	system.memory = {

		romBanks: [],
		videoRam: [],
		externalRam: [],
		internalRam: [],
		spriteAttributeTable: [], 
		ioPorts: [],
		hiRam: [],
		interruptEnableRegister: 0,
		currentBankNumber: 1,
		currentBankNumberOffset: 0,
		bankingMode: 0,

		init: function () {

			for (var i = 0; i <= (0xFF7F - 0xFF00); i++) {
				this.ioPorts[i] = {
					name: "Unbound",
					read: function () { return 0; },
					write: function (value) { }
				};
			}
		},

		reset: function () {

			this.romBanks = [];
			this.videoRam = [];
			this.externalRam = [];
			this.internalRam = [];
			this.spriteAttributeTable = [];
			this.hiRam = [];
			this.currentBankNumber = 1;
			this.currentBankNumberOffset = 0;
			this.bankingMode = 0;

			for (var bankNumber = 0; bankNumber < 255; bankNumber++) {
				var romBank = [];
				this.romBanks.push(romBank);
				for (var i = 0; i <= 0x3FFF; i++) {
					romBank[i] = 0;
				}
			}

			for (var i = 0; i <= (0x9FFF - 0x8000); i++) {
				this.videoRam[i] = 0;
			}

			for (var i = 0; i <= (0xBFFF - 0xA000); i++) {
				this.externalRam[i] = 0;
			}

			for (var i = 0; i <= (0xDFFF - 0xC000); i++) {
				this.internalRam[i] = 0;
			}

			for (var i = 0; i <= (0xFE9F - 0xFE00); i++) {
				this.spriteAttributeTable[i] = 0;
			}

			for (var i = 0; i <= (0xFFFE - 0xFF80); i++) {
				this.hiRam[i] = 0;
			}
		},

		bindIoPort: function (address, name, read, write) {

			var ioPort = this.ioPorts[address - 0xFF00];

			ioPort.name = name;
			ioPort.read = read;
			ioPort.write = write;

			console.log("Bound '" + name + "' IO port at 0x" + address.toString(16) + ".");
		},

		readByte: function (address) {

			if (address >= 0 && address <= 0x3FFF) {

				return this.romBanks[0][address];
			
			} else if (address >= 0x4000 && address <= 0x7FFF) {

				//console.log("Read from ROM bank 1");

				return this.romBanks[this.currentBankNumber][address - 0x4000];

			} else if (address >= 0x8000 && address <= 0x9FFF) {

				return this.videoRam[address - 0x8000];
			
			}  else if (address >= 0xA000 && address <= 0xBFFF) {

				return this.externalRam[address - 0xA000];
			
			} else if (address >= 0xC000 && address <= 0xDFFF) {

				return this.internalRam[address - 0xC000];
			
			} /*else if (address >= 0xE000 && address <= 0xFDFF) {

				return this.internalRam[address - 0xE000];
			
			} */else if (address >= 0xFE00 && address <= 0xFE9F) {

				return this.spriteAttributeTable[address - 0xFE00];
			
			} else if (address >= 0xFF00 && address <= 0xFF7F) {

				//console.log("IO port peek: " + address);

				return this.ioPorts[address - 0xFF00].read();
			
			} else if (address >= 0xFF80 && address <= 0xFFFE) {

				return this.hiRam[address - 0xFF80];
			
			} else if (address == 0xFFFF) {

				return system.cpu.registers.interruptEnabled;
			
			} else {

				return 0;
				//throw "Invalid memory location: 0x" + address.toString(16);
			}
		},

		readWord: function (address) {

			var byte1 = this.readByte(address);
			var byte2 = this.readByte(address + 1);

			return byte1 | byte2 << 8;
		},

		writeByte: function (address, value) {
			
			if (value == null) {
				throw "Invalid value";
			}

			value &= 0xFF;

			if (address >= 0 && address <= 0x3FFF) {

				//console.log("Write to rom bank: 0x" + address.toString(16) + ", value: " + value.toString(16));

				// See if we need to enable or disable external RAM.
				if (address >= 0 && address <= 0x1FFF) {

					if ((value & 0x0f) == 0x0a) {
						//console.log("Enable external RAM");
					} else {
						//console.log("Disable external RAM");
					}
				} 
				// See if we need to set the bank number.
				else if (address >= 2000 && address <= 0x3FFF) {

					var bankNumber = (value & 0x01f);
					if (bankNumber == 0) {
						bankNumber = 1;
					}

					this.currentBankNumber = this.currentBankNumberOffset + bankNumber;

					//console.log("Switched to bank " + this.currentBankNumber);
				}

				
			
			} else if (address >= 0x4000 && address <= 0x7FFF) {

				//console.log("Write to rom bank: 1x" + address.toString(16) + ", value: " + value.toString(16));

				// See if we need to set the bank number offset or swtich RAM bank.
				if (address >= 0x4000 && address <= 0x5fff) {

					if (this.bankingMode == 0) {

						var bankNumberOffset = (value & 0xc0) >> 6;

						this.currentBankNumberOffset = bankNumberOffset * 32;

						//console.log("Current bank number offset set to " + this.currentBankNumberOffset);

					} else if (this.bankingMode == 1) {

						var ramBankNumber = (value & 0xc0) >> 6;

						console.log("Switch RAM bank number to " + ramBankNumber);

					} else {
						console.log("Invalid banking mode: " + this.bankingMode);
					}
				
				}

				// See if we need to change the banking mode.
				else if (address >= 0x6000 && address <= 0x7fff) {

					this.bankingMode = value;

					console.log("Banking mode set to: " + this.bankingMode);
				}

			} else if (address >= 0x8000 && address <= 0x9FFF) {

				this.videoRam[address - 0x8000] = value;

				system.gpu.pokeVram(address, value);
			
			}  else if (address >= 0xA000 && address <= 0xBFFF) { 

				this.externalRam[address - 0xA000] = value;

			} else if (address >= 0xC000 && address <= 0xDFFF) {

				this.internalRam[address - 0xC000] = value;
			
			} else if (address >= 0xFE00 && address <= 0xFE9F) {

				this.spriteAttributeTable[address - 0xFE00] = value;

				system.gpu.pokeSprites(address, value);
			
			} else if (address >= 0xFF00 && address <= 0xFF7F) {

				//console.log("IO port poke: " + address + " = " + value);

				/*this.ioPorts[address - 0xFF00] = value;

				system.gpu.pokeIoPort(address, value);
				system.timer.pokeIoPorts(address, value);
				system.joypad.pokeIoPorts(address, value);*/
				this.ioPorts[address - 0xFF00].write(value);
			
			} else if (address >= 0xFF80 && address <= 0xFFFE) {

				this.hiRam[address - 0xFF80] = value;
			
			} else if (address == 0xFFFF) {

				/*if (value & 0x02) {
					console.log("LCD stat interupt enabled");
				}*/

				system.cpu.registers.interruptEnabled = value;
			
			} else {

				//throw "Tried to write invalid memory location: 0x" + address.toString(16) + ", value: " + value;
			}
		},

		writeWord: function (address, value) {

			var byte1 = value & 0xFF;
			var byte2 = value >> 8;

			this.writeByte(address, byte1);
			this.writeByte(address + 1, byte2);
		}
	}
}