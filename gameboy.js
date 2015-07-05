function GameBoy() {
	
	var system = this;

	var LCD_MODE_READING_OAM = 2;
	var LCD_MODE_READING_OAM_AND_VRAM = 3;
	var LCD_MODE_HBLANK = 0;
	var LCD_MODE_VBLANK = 1;

	var VRAM_NUM_TILES = 384;
	var VRAM_TILE_WIDTH_PIXELS = 8;
	var VRAM_TILE_HEIGHT_PIXELS = 8;
	var VRAM_TILE_WIDTH_BYTES = 2;
	var VRAM_TILE_SIZE_BYTES = 16;
	var VRAM_TILE_SIZE_PIXELS = 64;
	var VRAM_TILEMAP_NUM_TILES_X = 32;
	var VRAM_TILEMAP_NUM_TILES_Y = 32;
	var VRAM_TILEMAP_TOTAL_TILES = 1024;
	var VRAM_TILEMAP_WIDTH_PIXELS = VRAM_TILEMAP_NUM_TILES_X * VRAM_TILE_WIDTH_PIXELS;
	var VRAM_TILEMAP_HEIGHT_PIXELS = VRAM_TILEMAP_NUM_TILES_Y * VRAM_TILE_HEIGHT_PIXELS;
	var VRAM_MAX_SPRITES = 40;
	var VRAM_SPRITE_SIZE_BYTES = 4;

	var FRAMEBUFFER_WIDTH_PIXELS = 160;
	var FRAMEBUFFER_HEIGHT_PIXELS = 160;

	var MEMLOC_INTERRUPT_HANDLER_VBLANK = 0x0040;
	var MEMLOC_INTERRUPT_HANDLER_LCDSTAT = 0x0048;
	var MEMLOC_INTERRUPT_HANDLER_TIMER = 0x0050;
	var MEMLOC_INTERRUPT_HANDLER_SERIAL = 0x0058;
	var MEMLOC_INTERRUPT_HANDLER_JOYPAD = 0x0060;
	var MEMLOC_TILESET0 = 0x8000;
	var MEMLOC_TILESET1 = 0x8800;
	var MEMLOC_TILEMAP0 = 0x9800;
	var MEMLOC_TILEMAP1 = 0x9C00;
	var MEMLOC_TILEDATA = 0x8000;
	var MEMLOC_TILEDATA_END = 0x97FF;
	var MEMLOC_TILEMAPS = 0x9800;
	var MEMLOC_TILEMAPS_END = 0x9FFF;
	var MEMLOC_SPRITE_ATTRIBUTE_TABLE = 0xFE00;
	var MEMLOC_JOYPAD_REGISTER = 0xFF00;
	var MEMLOC_LCD_CONTROL_REGISTER = 0xFF40;
	var MEMLOC_LCD_STATUS_REGISTER = 0xFF41;
	var MEMLOC_BGTILEMAP_SCROLLY = 0xFF42;
	var MEMLOC_BGTILEMAP_SCROLLX = 0xFF43;
	var MEMLOC_DMA_TRANSFER = 0xFF46;
	var MEMLOC_SPRITE_PALETTE0 = 0xff48;
	var MEMLOC_SPRITE_PALETTE1 = 0xff49;
	var MEMLOC_WINDOWTILEMAP_SCROLLY = 0xFF4A;
	var MEMLOC_WINDOWTILEMAP_SCROLLX = 0xFF4B;
	var MEMLOC_SCANLINE_INDEX = 0xFF44;
	var MEMLOC_LYC_REGISTER = 0xFF45;
	var MEMLOC_TILEMAP_PALETTE = 0xFF47;
	var MEMLOC_DIVIDER_REGISTER = 0xff04;
	var MEMLOC_TIMER_COUNTER_REGISTER = 0xff05;
	var MEMLOC_TIMER_MODULO_REGISTER = 0xff06;
	var MEMLOC_TIMER_CONTROL_REGISTER = 0xff07;
	var MEMLOC_INTERRUPT_FLAG_REGISTER = 0xFF0F;
	var MEMLOC_INTERRUPT_ENABLE_REGISTER = 0xFFFF;

	var INTERRUPT_ENABLED_VBLANK = 0x01;
	var INTERRUPT_ENABLED_LCDSTAT = 0x02;
	var INTERRUPT_ENABLED_TIMER = 0x04;
	var INTERRUPT_ENABLED_SERIAL = 0x08;
	var INTERRUPT_ENABLED_JOYPAD = 0x10;

	var INTERRUPT_FLAG_VBLANK = 0x01;
	var INTERRUPT_FLAG_LCDSTAT = 0x02;
	var INTERRUPT_FLAG_TIMER = 0x04;
	var INTERRUPT_FLAG_SERIAL = 0x08;
	var INTERRUPT_FLAG_JOYPAD = 0x10;

	var SPRITESIZE_8X8 = 0;
	var SPRITESIZE_8X16 = 1;

	//this.frameIsRunning = false;
	this.lastFrameDuration = 0;
	this.terminate = false;
	this.terminated = true;

	this.cpu = {

		registers: { 
			a: 0, b: 0, c: 0, d: 0, e: 0, h: 0, l: 0, f: 0, 
			pc: 0, // Program counter.
			sp: 0, // Stack pointer.
			ime: 0, // Interupt master enabled flag.

			interruptEnabled: 0,
			interruptFlag: 0,

			zeroFlagIsSet: function () { return (this.f & 0x80) > 0; },
			carryFlagIsSet: function () { return (this.f & 0x10) > 0; },

			get_bc: function () { return (this.b << 8) + this.c; },
			get_de: function () { return (this.d << 8) + this.e; },
			get_hl: function () { return (this.h << 8) + this.l; },

			set_bc: function (v) { this.b = v >> 8; this.c = v & 0xff; },
			set_de: function (v) { this.d = v >> 8; this.e = v & 0xff; },
			set_hl: function (v) { this.h = v >> 8; this.l = v & 0xff; },

			inc_pc: function () {

				this.pc++;
				this.pc &= 0xffff;
			},

			inc2_pc: function () {

				this.pc += 2;
				this.pc &= 0xffff;
			},

			add_signed_pc: function (v) {

				v = system.util.toSigned(v);
				this.pc += v;
				this.pc &= 0xffff;
			},

			inc_sp: function () {

				this.sp++;
				this.sp &= 0xffff;
			},

			inc2_sp: function () {

				this.sp += 2;
				this.sp &= 0xffff;
			},

			dec_sp: function () {

				this.sp--;
				this.sp &= 0xffff;
			},

			dec2_sp: function () {

				this.sp -= 2;
				this.sp &= 0xffff;
			},

			inc_16bit: function (v) {
				v = (v + 1) & 0xffff;
				return v;
			},

			dec_16bit: function (v) {
				v = (v - 1) & 0xffff;
				return v;
			},

			/*inc_hl_noFlags: function () {
				this.l = (this.l + 1) & 0xff;
				if (this.l == 0) {  
					this.h = (this.h + 1) & 0xff;
				}
			},

			dec_hl_noFlags: function () {
				this.l--;
				if (this.l == -1) {  
					this.l = 0;
					this.h = (this.h - 1) & 0xff;
				}
			},*/

			// Adds two 8 bit values together, affects flags and returns the new value.
			add_8bit: function (v1, v2) {

				var newValue = v1 + v2;

				// Reset the flags.
				this.f = 0; 

				// Set the half-carry flag if required.
				if ((v1 & 0x0f) + (v2 & 0x0f) > 0x0f) {
					this.f |= 0x20;
				}

				// Set the carry flag if required.
				if (newValue > 0xff) {
					this.f |= 0x10;
				}

				// Mask back to 8 bits.
				newValue &= 0xff;

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Adds two 8 bit values and the carry flag together, affects flags and returns the new value.
			adc_8bit: function (v1, v2) {

				// If the carry flag is set then we need to add an extra 1.
				var carryAdd = (this.f & 0x10) > 0 ? 1 : 0;
			
				var newValue = v1 + v2 + carryAdd;

				// Reset the flags.
				this.f = 0; 

				// Set the half-carry flag if required.
				if ((v1 & 0x0f) + (v2 & 0x0f) + carryAdd > 0x0f) {
					this.f |= 0x20;
				}

				// Set the carry flag if required.
				if (newValue > 0xff) {
					this.f |= 0x10;
				}

				// Mask back to 8 bits.
				newValue &= 0xff;

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Subtracts two 8 bit values, affects flags and returns the new value.
			sub_8bit: function (v1, v2) {

				var newValue = v1 - v2;

				// Reset the flags.
				this.f = 0; 

				// Set the subtraction flag.
				this.f |= 0x40;

				// Set the half-carry flag if required.
				if ((v1 & 0x0f) - (v2 & 0x0f) < 0) {
					this.f |= 0x20;
				}

				// Set the carry flag if required.
				if (newValue < 0) {
					this.f |= 0x10;
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				// Mask back to 8 bits.
				newValue &= 0xff;

				return newValue;
			},

			// Subtracts two 8 bit values and the carry flag, affects flags and returns the new value.
			sbc_8bit: function (v1, v2) {

				// If the carry flag is set then we need to add an extra 1.
				var carrySub = (this.f & 0x10) > 0 ? 1 : 0;

				var newValue = v1 - v2 - carrySub;

				// Reset the flags.
				this.f = 0; 

				// Set the subtraction flag.
				this.f |= 0x40;

				// Set the half-carry flag if required.
				if (((v1 & 0x0f) - (v2 & 0x0f) - carrySub) < 0) {
					this.f |= 0x20;
				}

				// Set the carry flag if required.
				if (newValue < 0) {
					this.f |= 0x10;
				}

				// Mask back to 8 bits.
				newValue &= 0xff;

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Increments an 8 bit value, affects flags and returns the new value.
			inc_8bit: function (v) {

				// Increment and mask back to 8 bits.
				var newValue = (v + 1) & 0xff;

				// Reset the flags. For some reason, the carry flag is not set for these 
				// operations, so we need to keep the current value.
				this.f &= 0x10; 

				// Set the half-carry flag if required.
				if ((v & 0x0f) + 1 > 0x0f) {
					this.f |= 0x20;
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Decrements an 8 bit value, affects flags and returns the new value.
			dec_8bit: function (v) {

				// Decrement and mask back to 8 bits.
				var newValue = (v - 1) & 0xff;

				// Reset the flags. For some reason, the carry flag is not set for these 
				// operations, so we need to keep the current value.
				this.f &= 0x10; 

				// Set the subtraction flag.
				this.f |= 0x40;

				// Set the half-carry flag if required.
				if ((v & 0x0f) - 1 < 0) {
					this.f |= 0x20;
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Bitwise ANDs two 8 bit values, affects flags and returns the new value.
			and_8bit: function (v1, v2) {

				var newValue = v1 & v2;

				// Reset the flags.
				this.f = 0; 

				// For some reason, the half-carry flag is always set to 1 for these operations.
				this.f |= 0x20;

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Bitwise ORs two 8 bit values, affects flags and returns the new value.
			or_8bit: function (v1, v2) {

				var newValue = v1 | v2;

				// Reset the flags.
				this.f = 0; 

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Bitwise XORs two 8 bit values, affects flags and returns the new value.
			xor_8bit: function (v1, v2) {

				var newValue = v1 ^ v2;

				// Reset the flags.
				this.f = 0; 

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Adds two 16 bit values, affects flags and returns the new value.
			add_16bit: function (v1, v2) {

				var newValue = v1 + v2;

				// Reset the flags. For some reason, the zero flag isn't set for 
				// these operations, so we need to keep the current value.
				this.f &= 0x80; 

				// Set the half-carry flag if required.
				if ((v1 & 0x0fff) + (v2 & 0x0fff) > 0x0fff) {
					this.f |= 0x20;
				}

				// Set the carry flag if required.
				if (newValue > 0xffff) {
					this.f |= 0x10;
				}

				// Mask back to 16 bits.
				newValue &= 0xffff;

				return newValue;
			},

			// Adds a signed 8 bit value to a 16 bit value, affects flags and returns the new value.
			add_16bit_8bit_signed: function (v16, v8) {

				v8Signed = system.util.toSigned(v8);

				var newValue = v16 + v8Signed;

				this.f = 0; // Reset the flags.

				// There seems to be slightly odd behaviour with the carry flags here.
				// Half carry is transition from bit 3 -> 4.
				// Carry is transition from bit 7 -> 8.
				// I don't understand why this is. It's totally different to how 16 bit adding works.

				// Set the half-carry flag if required.
				var halfCarryCheck = (v16 & 0x0f) + (v8 & 0x0f);
				if (halfCarryCheck > 0x0f) {
					this.f |= 0x20;
				}

				// Set the carry flag if required.
				var carryCheck = (v16 & 0xff) + (v8 & 0xff);
				if (carryCheck > 0xff) {
					this.f |= 0x10;
				}

				// Mask back to 16 bits.
				newValue &= 0xffff;

				return newValue;
			},

			// Left-shifts and 8 bit value, affects flags and returns new value.
			sla_8bit: function (v) {

				var newValue = v << 1;

				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (newValue > 0xff) {
					this.f |= 0x10;
				}

				// Mask back to 8 bits.
				newValue &= 0xFF;

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Right shifts an 8-bit value, leaves bit 7 unchanged, pushes bit 0 into the carry flag,
			// affects flags and returns new value.
			sra_8bit: function (v) {

				var bit0 = v & 0x01;
				var newValue = (v & 0x80) | (v >> 1);

				// Mask back to 8 bits.
				newValue &= 0xFF;

				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (bit0 == 1) {
					this.f |= 0x10;
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}			

				return newValue;					
			},

			// Right shifts an 8-bit value, pushes 0 into bit 7, pushes current bit 0 into carry flag,
			// affects flags and returns new value.
			srl_8bit: function (v) {

				var bit0 = v & 0x01;
				var newValue = v >> 1;

				// Mask back to 8 bits.
				newValue &= 0xFF;

				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (bit0 == 1) {
					this.f |= 0x10;
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}			

				return newValue;
			},

			// Left rotates an 8 bit value, pushes current carry flag into bit 0, pushes current bit 7 
			// into the carry flag, affects flags and returns the new value.
			rl_8bit: function (v) {

				var bit7 = (v & 0x80) >> 7;
				var newValue = v << 1;

				// If the carry flag is set, set bit 0.
				if ((this.f & 0x10) > 0) {
					newValue |= 0x01;
				}

				// Mask back to 8 bits.
				newValue &= 0xFF;

				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (bit7 == 1) {
					this.f |= 0x10; 
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Right rotates an 8 bit value, pushes current carry flag into bit 7, pushes current bit 0 
			// into the carry flag, affects flags and returns the new value.
			rr_8bit: function (v) {

				var bit0 = v & 0x01;
				var newValue = v >> 1;

				// If the carry flag is set, set bit 7.
				if ((this.f & 0x10) > 0) {
					newValue |= 0x80;
				}				

				// Mask back to 8 bits.
				newValue &= 0xFF;

				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (bit0 == 1) {
					this.f |= 0x10; 
				}

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}

				return newValue;
			},

			// Left rotates an 8 bit value, pushes current bit 7 in the carry flag, affects flags 
			// and returns the new value.
			rlc_8bit: function (v) {
		
				var bit7 = (v & 0x80) >> 7;
				var newValue = (v << 1) | bit7; // Left shift and push bit 7 on at the start.

				// Mask back to 8 bits.
				newValue &= 0xFF;
				
				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (bit7 == 1) {
					this.f |= 0x10;
				} 

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}
				
				return newValue;
			},

			// Right rotates an 8 bit value, pushes current bit 0 into the carry flag, affects flags
			// and returns the new value.
			rrc_8bit: function (v) {

				var bit0 = v & 0x01;
				var newValue = (bit0 << 7) | (v >> 1);

				this.f = 0; // Reset the flags.

				// Set the carry flag if required.
				if (bit0 == 1) {
					this.f |= 0x10;
				} 

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}
				
				return newValue;				
			},

			// If the specified bit of an 8 bit value is not set, then sets the zero flag. Affects other flags.
			checkBit_8bit: function (bitNumber, v) {

				// Reset flags, appart from the carry flag, which is left unchanged.
				this.f &= 0x10;

				// Set the zero flag if the bit in question is zero.
				var bit = (v >> bitNumber) & 0x01;
				if (bit == 0) {
					this.f |= 0x80;
				}

				// The half-carry flag is always set to 1 for these operations.
				this.f |= 0x20;
			},

			// Resets the specified bit of an 8 bit value and returns the new value.
			resBit_8bit: function (bitNumber, v) {

				var newValue = v & ~(1 << bitNumber);

				return newValue;
			},

			// Sets the specified bit of an 8 bit value and returns the new value.
			setBit_8bit: function (bitNumber, v) {

				var newValue = v | (1 << bitNumber);

				return newValue;
			},

			// Swaps the nibbles of an 8 bit value, affects flags and returns the new value.
			swap_8bit: function (v) {

				var newValue = ((v & 0x0f) << 4) | ((v & 0xf0) >> 4);

				this.f = 0; // Reset the flags.

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}
				
				return newValue;
			},

			decimalAdjust: function (v) {

				var subtractionFlagSet = (this.f & 0x40) > 0;
				var halfCarryFlagSet = (this.f & 0x20) > 0;
				var carryFlagSet = (this.f & 0x10) > 0;

				var newValue = v;

				this.f &= 0x40; // Reset the flags. The subtraction flag is left unchanged.

				if (!subtractionFlagSet) {

					if (carryFlagSet || newValue > 0x99) {

						newValue += 0x60;

						this.f |= 0x10;
					}

					if (halfCarryFlagSet || (newValue & 0x0f) > 0x09) {

						newValue += 0x06;
					}

				} else {

					if (carryFlagSet && halfCarryFlagSet) {

						newValue += 0x9a;
						this.f |= 0x10;
					
					} else if (halfCarryFlagSet) {

						newValue += 0xfa;
					
					} else if (carryFlagSet) {

						newValue += 0xa0;
						this.f |= 0x10;
					
					}
				}

				newValue &= 0xff;

				// Set the zero flag if required.
				if (newValue == 0) {
					this.f |= 0x80;
				}
				
				return newValue;
			}
		},

		totalClocksExecuted: 0,
		isHalted: false,

		init: function () {

			var self = this;

			/*system.memory.bindIoPort(
				MEMLOC_INTERRUPT_ENABLE_REGISTER, 
				"Interrupt Enabled Register", 
				function () {
					return self.registers.interruptEnabled;
				},
				function (value) {
					self.registers.interruptEnabled = value;
				});*/

			system.memory.bindIoPort(
				MEMLOC_INTERRUPT_FLAG_REGISTER, 
				"Interrupt Flag Register", 
				function () {
					return self.registers.interruptFlag;
				},
				function (value) {
					self.registers.interruptFlag = value;
				});
		},

		reset: function () {

			for (var i = 0; i <= 0xff; i++) {
				this.opCodeFunctions[i] = null;
				this.extOpCodeFunctions[i] = null;
			}

			this.totalClocksExecuted = 0;
			this.isHalted = false;

			this.registers.a = 0x01;
			this.registers.b = 0x00;
			this.registers.c = 0x13;
			this.registers.d = 0x00;
			this.registers.e = 0xd8;
			this.registers.h = 0x01;
			this.registers.l = 0x4d;
			this.registers.f = 0xb0;
			this.registers.sp = 0xfffe;
			this.registers.pc = 0x0100;
			this.registers.ime = 0;

			this.registers.interruptEnabled = 0;
			this.registers.interruptFlag = 0;

			Gameboy_MixInCpuInstructions_8BitLoads(system);
			Gameboy_MixInCpuInstructions_16BitLoads(system);
			Gameboy_MixInCpuInstructions_8BitAlu(system);
			Gameboy_MixInCpuInstructions_16BitAlu(system);
			Gameboy_MixInCpuInstructions_Misc(system);
			Gameboy_MixInCpuInstructions_Jumps(system);
			Gameboy_MixInCpuInstructions_Ext(system);

			var numMissingOpcodes = 0;
			for (var i = 0; i <= 0xff; i++) {
				if (this.opCodeFunctions[i] == null) {
					numMissingOpcodes++
					console.log("Missing op code: 0x" + i.toString(16));
				}
			}

			var numMissingExtOpcodes = 0;
			for (var i = 0; i <= 0xff; i++) {
				if (this.extOpCodeFunctions[i] == null) {
					numMissingExtOpcodes++
					console.log("Missing ext op code: 0x" + i.toString(16));
				}
			}

			console.log("Num missing op codes:" + numMissingOpcodes);
			console.log("Num missing ext op codes:" + numMissingExtOpcodes);
		},

		heartbeat: function () {

			this.checkInterrupts();

			var clockExecuted = 0;

			if (!this.isHalted) {

				this.currentOpCode = system.memory.readByte(this.registers.pc);

				this.registers.pc++;

				var opCodeFunction = this.opCodeFunctions[this.currentOpCode ];

				if (opCodeFunction == null) {
					this.crash("Op-code function not found for 0x" + this.currentOpCode.toString(16));
				}

				clockExecuted = opCodeFunction(this.registers);

			} else {

				clockExecuted = 4;
			}

			this.totalClocksExecuted += clockExecuted;

			return clockExecuted;
		},

		crash: function (reason) {

			alert(reason);

			throw reason;
		},

		checkInterrupts: function () {

			var interruptEnabled = this.registers.interruptEnabled;
			var interruptFlag = this.registers.interruptFlag;

			if (interruptEnabled != 0 && 
				interruptFlag != 0) {

				this.isHalted = false;

				if (this.registers.ime != 0) {

					if ((interruptFlag & INTERRUPT_FLAG_VBLANK) > 0 && 
						(interruptEnabled & INTERRUPT_ENABLED_VBLANK) > 0) {

						this.executeInterrupt(
							INTERRUPT_FLAG_VBLANK, MEMLOC_INTERRUPT_HANDLER_VBLANK);

					} else if ((interruptFlag & INTERRUPT_FLAG_LCDSTAT) > 0 && 
						(interruptEnabled & INTERRUPT_ENABLED_LCDSTAT) > 0) {

						this.executeInterrupt(
							INTERRUPT_FLAG_LCDSTAT, MEMLOC_INTERRUPT_HANDLER_LCDSTAT);
					
					} else if ((interruptFlag & INTERRUPT_FLAG_TIMER) > 0 && 
						(interruptEnabled & INTERRUPT_ENABLED_TIMER) > 0) {

						this.executeInterrupt(
							INTERRUPT_FLAG_TIMER, MEMLOC_INTERRUPT_HANDLER_TIMER);
					
					} else if ((interruptFlag & INTERRUPT_FLAG_SERIAL) > 0 && 
						(interruptEnabled & INTERRUPT_ENABLED_SERIAL) > 0) {

						this.executeInterrupt(
							INTERRUPT_FLAG_SERIAL, MEMLOC_INTERRUPT_HANDLER_SERIAL);
					
					}  else if ((interruptFlag & INTERRUPT_FLAG_JOYPAD) > 0 && 
						(interruptEnabled & INTERRUPT_ENABLED_JOYPAD) > 0) {

						this.executeInterrupt(
							INTERRUPT_FLAG_JOYPAD, MEMLOC_INTERRUPT_HANDLER_JOYPAD);
					}
				}
			}
		},

		executeInterrupt: function (flag, jumpAddress) {

			this.isHalted = false;

			// Clear the flag.
			this.registers.interruptFlag &= ~flag;

			// Push pc onto the stack (so we can return to it afterwards) and jump to the 
			// interrupt handler.
			this.registers.sp -= 2;
			system.memory.writeWord(this.registers.sp, this.registers.pc);
			this.registers.pc = jumpAddress;

			// Prevent any other interrupts from occuring (the program can reactivate them during an
			// interrupt handler using the "ei" instruction if it wants to).
			this.registers.ime = 0;
		},

		raiseInterupt: function (interruptFlag) {

			this.registers.interruptFlag |= interruptFlag;
		},

		log: function (msg) {
			//console.log(msg);
		},

		opCodeFunctions: [],
		extOpCodeFunctions: []
	}

	this.gpu = {

		clocksToRun: 0,
		modeCounter: 0,
		frameBuffer: null,
		registers: null,
		tiles: [],
		tileMaps: [],
		sprites: [],
		scanLineSamplingData: null,
		pixelToRgbLookup: [
			{ r: 239, g: 255, b: 222 },
			{ r: 173, g: 215, b: 148 },
			{ r: 82, g: 146, b: 115 },
			{ r: 24, g: 52, b: 66 }
		],

		init: function () {

			var self = this;

			this.frameBuffer = system.canvasContext.createImageData(
				FRAMEBUFFER_WIDTH_PIXELS * 3, FRAMEBUFFER_HEIGHT_PIXELS * 3);

			system.memory.bindIoPort(
				MEMLOC_LCD_CONTROL_REGISTER, 
				"LCD Control Register", 
				function () {
					return self.registers.control.byteValue;
				},
				function (value) {
					var r = self.registers.control;

					r.byteValue = value;
					r.enabled = (value & 0x80) > 0;
					r.bgEnabled = (value & 0x01) > 0;
					r.windowEnabled = (value & 0x20) > 0;
					r.spritesEnabled = (value & 0x02) > 0;
					r.spriteSize = (value & 0x04) == 0 ? SPRITESIZE_8X8 : SPRITESIZE_8X16;
					r.bgAndWindowTileSetNumber = (value & 0x10) > 0 ? 0 : 1;
					r.bgTileMapNumber = (value & 0x08) == 0 ? 0 : 1;
					r.windowTileMapNumber = (value & 0x40) == 0 ? 0 : 1;
				});

			system.memory.bindIoPort(
				MEMLOC_LCD_STATUS_REGISTER, 
				"LCD Status Register", 
				function () {
					var r = self.registers.status;
					var value = r.byteValue;
					value = (value & 0xfc) | r.mode;
					value = (value & 0x7b) | (r.coincidenceFlag ? 1 : 0);
					return value;
				},
				function (value) {
					var r = self.registers.status;

					r.byteValue = value;
					r.coincidenceInterruptEnabled = (value & 0x40) != 0;
					r.mode0InterruptEnabled = (value & 0x08) != 0;
					r.mode1InterruptEnabled = (value & 0x10) != 0;
					r.mode2InterruptEnabled = (value & 0x20) != 0;
				});

			system.memory.bindIoPort(
				MEMLOC_BGTILEMAP_SCROLLX, 
				"BG Tile Map Scroll X Register", 
				function () {
					return self.registers.bgTileMapScrollX;
				},
				function (value) {
					self.registers.bgTileMapScrollX = value;
				});

			system.memory.bindIoPort(
				MEMLOC_BGTILEMAP_SCROLLY, 
				"BG Tile Map Scroll Y Register", 
				function () {
					return self.registers.bgTileMapScrollY;
				},
				function (value) {
					self.registers.bgTileMapScrollY = value;
				});

			system.memory.bindIoPort(
				MEMLOC_WINDOWTILEMAP_SCROLLX, 
				"Window Tile Map Scroll X Register", 
				function () {
					return self.registers.windowTileMapScrollX;
				},
				function (value) {
					self.registers.windowTileMapScrollX = value;
				});

			system.memory.bindIoPort(
				MEMLOC_WINDOWTILEMAP_SCROLLY, 
				"Window Tile Map Scroll Y Register", 
				function () {
					return self.registers.windowTileMapScrollY;
				},
				function (value) {
					self.registers.windowTileMapScrollY = value;
				});

			system.memory.bindIoPort(
				MEMLOC_SCANLINE_INDEX, 
				"Scanline Index Register", 
				function () {
					return self.registers.scanLineIndex;
				},
				function (value) {
					self.registers.scanLineIndex = value;
				});

			system.memory.bindIoPort(
				MEMLOC_TILEMAP_PALETTE, 
				"Tile Map Palette Register", 
				function () {
					return self.registers.tileMapPalette.byteValue;
				},
				function (value) {
					var r = self.registers.tileMapPalette;

					r.byteValue = value;
					r.colours[0] = value & 0x03;
					r.colours[1] = (value & 0x0C) >> 2;
					r.colours[2] = (value & 0x30) >> 4;
					r.colours[3] = (value & 0xC0) >> 6;
				});

			system.memory.bindIoPort(
				MEMLOC_DMA_TRANSFER, 
				"DMA Transfer Register", 
				function () {
					return 0;
				},
				function (value) {
					var source = value << 8;

					for (var i = 0; i < 0xa0; i++) {

						var byteValue = system.memory.readByte(source + i);
						system.memory.writeByte(0xfe00 + i, byteValue);
					}
				});

			system.memory.bindIoPort(
				MEMLOC_SPRITE_PALETTE0, 
				"Sprite Palette 0 Register", 
				function () {
					return self.registers.spritePalette0.byteValue;
				},
				function (value) {
					var r = self.registers.spritePalette0;

					r.byteValue = value;
					r.colours[0] = value & 0x03;
					r.colours[1] = (value & 0x0C) >> 2;
					r.colours[2] = (value & 0x30) >> 4;
					r.colours[3] = (value & 0xC0) >> 6;
				});

			system.memory.bindIoPort(
				MEMLOC_SPRITE_PALETTE1, 
				"Sprite Palette 1 Register", 
				function () {
					return self.registers.spritePalette1.byteValue;
				},
				function (value) {
					var r = self.registers.spritePalette1;

					r.byteValue = value;
					r.colours[0] = value & 0x03;
					r.colours[1] = (value & 0x0C) >> 2;
					r.colours[2] = (value & 0x30) >> 4;
					r.colours[3] = (value & 0xC0) >> 6;
				});

			system.memory.bindIoPort(
				MEMLOC_LYC_REGISTER, 
				"LCD Y Coordinate Register", 
				function () {
					return self.registers.lyc;
				},
				function (value) {
					self.registers.lyc = value;
				});
		},

		reset: function () {

			this.clocksToRun = 0;
			this.modeCounter = 0;

			this.registers = {
				control: {
					byteValue: 0,
					enabled: false,
					bgEnabled: false,
					windowEnabled: false,
					spritesEnabled: false,
					bgAndWindowTileSetNumber: 0,
					bgTileMapNumber: 0,
					windowTileMapNumber: 0
				},
				status: {
					byteValue: 0,
					coincidenceInterruptEnabled: false,
					mode0InterruptEnabled: false,
					mode1InterruptEnabled: false,
					mode2InterruptEnabled: false,
					coincidenceFlag: 0,
					mode: 0
				},
				bgTileMapScrollX: 0,
				bgTileMapScrollY: 0,
				windowTileMapScrollX: 0,
				windowTileMapScrollY: 0,
				scanLineIndex: 0,
				tileMapPalette: { 
					byteValue: 0,
					colours: [0, 0, 0, 0]
				},
				spritePalette0: {
					byteValue: 0,
					colours: [0, 1, 2, 3]
				},
				spritePalette1: {
					byteValue: 0,
					colours: [0, 1, 2, 3]
				},
				lyc: 0
			};

			this.scanLineSamplingData = {

				bgTileMap: {
					scrollX: 0,
					scrollY: 0,
					offsetX: 0,
					offsetY: 0,
					tileMapRowIndex: 0,
					tilePixelRowIndex: 0 
				},
							
				windowTileMap: {
					skipScanLine: false,
					offsetX: 0,
					offsetY: 0,
					tileMapRowIndex: 0,
					tilePixelRowIndex: 0
				},

				sprites: {
					spritesOnScanline: []
				}
			};

			// Init the tile data.
			this.tiles = [];
			for (var i = 0; i < 384; i++) {

				var tile = [];
				for (var j = 0; j < VRAM_TILE_SIZE_PIXELS; j++) {
					tile[j] = 0;
				}

				this.tiles.push(tile);
			}

			// Init the tile maps.
			this.tileMaps = [];
			for (var i = 0; i < 2; i++) {

				var tileMap = [];
				for (var j = 0; j < VRAM_TILEMAP_TOTAL_TILES; j++) {
					tileMap[j] = 0;
				}

				this.tileMaps.push(tileMap);
			}

			// Init the sprites.
			this.sprites = [];
			for (var i = 0; i < VRAM_MAX_SPRITES; i++) {

				var sprite = {
					x: -8,
					y: -16,
					tileIndex: 0,
					attributes: {
						xFlip: false,
						yFlip: false,
						paletteNumber: 0,
						spriteToBgPriority: 0
					}
				}

				this.sprites.push(sprite);
			}
		},

		log: function (message) {

			console.log("GPU: " + message);
		},

		pokeVram: function (address, value) {

			if (address >= MEMLOC_TILEDATA && address <= MEMLOC_TILEDATA_END) {

				this.pokeTileData(address, value);

			} else if (address >= MEMLOC_TILEMAPS && address <= MEMLOC_TILEMAPS_END) {

				this.pokeTileMap(address, value);
			}
		},

		pokeTileData: function (address, value) {

			address -= MEMLOC_TILEDATA;

			var tileIndex = Math.floor(address / VRAM_TILE_SIZE_BYTES);
			
			var byteNumber = address % VRAM_TILE_SIZE_BYTES;
			var isEvenByte = byteNumber % 2 == 0

			var pixelIndex = Math.floor(byteNumber / 2) * 8;
			var tile = this.tiles[tileIndex];

			for (var i = 0; i < 8; i++) {

				var pixel = tile[pixelIndex];

				var valueShift = isEvenByte ? 7 - i : 6 - i;
				var valueMask = Math.pow(2, 7 - i);
				var pixelMask = isEvenByte ? 0x02: 0x01;

				if (valueShift > 0) {
					pixel = (pixel & pixelMask) | ((value & valueMask) >> valueShift);
				} else if (valueShift < 0) {
					pixel = (pixel & pixelMask) | ((value & valueMask) << (valueShift * -1));
				} else {
					pixel = (pixel & pixelMask) | (value & valueMask);
				}

				if (pixel > 3) {
					debugger;
				}

				tile[pixelIndex] = pixel;

				pixelIndex++;
			}
		},

		pokeTileMap: function (address, value) {

			var tileMapIndex = address < MEMLOC_TILEMAP1 ? 0 : 1;

			var tileMap = this.tileMaps[tileMapIndex];

			var offset = address - (tileMapIndex == 0 ? MEMLOC_TILEMAP0 : MEMLOC_TILEMAP1);

			tileMap[offset] = value;

			//console.log("Poke tile map " + tileMapIndex + " at " + offset + ": " + value);
		},

		pokeSprites: function (address, value) {

			var spriteIndex = Math.floor((address - MEMLOC_SPRITE_ATTRIBUTE_TABLE) / VRAM_SPRITE_SIZE_BYTES);

			var propertyIndex = (address - MEMLOC_SPRITE_ATTRIBUTE_TABLE) % VRAM_SPRITE_SIZE_BYTES;

			var sprite = this.sprites[spriteIndex];

			if (propertyIndex == 0) {

				sprite.y = value - 16;

			} else if (propertyIndex == 1) {

				sprite.x = value - 8;

			} else if (propertyIndex == 2) {

				sprite.tileIndex = value;

			} else if (propertyIndex == 3) {

				sprite.attributes.xFlip = (value & 0x20) > 0;
				sprite.attributes.yFlip = (value & 0x40) > 0;
				sprite.attributes.paletteNumber = (value & 0x10) >> 4;
				sprite.attributes.spriteToBgPriority = (value & 0x80) >> 7;
			}
		},

		/*pokeIoPort: function (address, value) {

			if (this.disableIoPortPokes) {
				return;
			}

			if (address == MEMLOC_LCD_CONTROL_REGISTER) {

				var controlRegister = this.registers.control;

				controlRegister.enabled = (value & 0x80) > 0;
				controlRegister.bgEnabled = (value & 0x01) > 0;
				controlRegister.windowEnabled = (value & 0x20) > 0;
				controlRegister.spritesEnabled = (value & 0x02) > 0;
				controlRegister.spriteSize = (value & 0x04) == 0 ? SPRITESIZE_8X8 : SPRITESIZE_8X16;
				controlRegister.bgAndWindowTileSetNumber = (value & 0x10) > 0 ? 0 : 1;
				controlRegister.bgTileMapNumber = (value & 0x08) == 0 ? 0 : 1;
				controlRegister.windowTileMapNumber = (value & 0x40) == 0 ? 0 : 1;

				//this.log("Control register set: " + value);
			
			} else if (address == MEMLOC_LCD_STATUS_REGISTER) {

				var statusRegister = this.registers.status;

				statusRegister.coincidenceInterruptEnabled = (value & 0x40) != 0;
				statusRegister.mode0InterruptEnabled = (value & 0x08) != 0;
				statusRegister.mode1InterruptEnabled = (value & 0x10) != 0;
				statusRegister.mode2InterruptEnabled = (value & 0x20) != 0;

				//this.log("Status register set: " + value);

			} else if (address == MEMLOC_BGTILEMAP_SCROLLX) {

				this.registers.bgTileMapScrollX = value;

			} else if (address == MEMLOC_BGTILEMAP_SCROLLY) {

				this.registers.bgTileMapScrollY = value;

			} else if (address == MEMLOC_WINDOWTILEMAP_SCROLLX) {

				this.registers.windowTileMapScrollX = value;

			} else if (address == MEMLOC_WINDOWTILEMAP_SCROLLY) {

				this.registers.windowTileMapScrollY = value;

			} else if (address == MEMLOC_SCANLINE_INDEX) {

				this.registers.scanLineIndex = value;

			} else if (address == MEMLOC_TILEMAP_PALETTE) {

				var palette = this.registers.palette;

				palette[0] = value & 0x03;
				palette[1] = (value & 0x0C) >> 2;
				palette[2] = (value & 0x30) >> 4;
				palette[3] = (value & 0xC0) >> 6;

				//this.log("Palette register set: " + value);
			
			} else if (address == MEMLOC_DMA_TRANSFER) {

				//system.cpu.crash("DMA transfer!");
				//console.log("DMA transfer!");	

				var source = value << 8;

				for (var i = 0; i < 0xa0; i++) {

					var byteValue = system.memory.readByte(source + i);
					system.memory.writeByte(0xfe00 + i, byteValue);
				}
			
			} else if (address == MEMLOC_SPRITE_PALETTE0) {

				var palette = this.registers.spritePalette0;

				palette[0] = value & 0x03;
				palette[1] = (value & 0x0C) >> 2;
				palette[2] = (value & 0x30) >> 4;
				palette[3] = (value & 0xC0) >> 6;

			} else if (address == MEMLOC_SPRITE_PALETTE1) {

				var palette = this.registers.spritePalette1;

				palette[0] = value & 0x03;
				palette[1] = (value & 0x0C) >> 2;
				palette[2] = (value & 0x30) >> 4;
				palette[3] = (value & 0xC0) >> 6;
			
			} else if (address == MEMLOC_LYC_REGISTER) {

				this.registers.lyc = value;
			}
		},*/

		heartbeat: function (additionalClocksToRun) {

			var frameComplete = false;

			if (!this.registers.control.enabled) {
				this.clocksToRun = 0;
				return frameComplete;
			}

			this.clocksToRun += additionalClocksToRun;

			// Execute the available clocks 
			while (this.clocksToRun > 0 && !frameComplete) {


				if (this.registers.status.mode == LCD_MODE_READING_OAM) {

					if (this.modeCounter == 80) {

						this.registers.status.mode = LCD_MODE_READING_OAM_AND_VRAM;	
						this.modeCounter = -1;
					}

				} else if (this.registers.status.mode == LCD_MODE_READING_OAM_AND_VRAM) {

					if (this.modeCounter == 172) {

						this.registers.status.mode = LCD_MODE_HBLANK;	
						this.checkMode0Interrupt();
						this.modeCounter = -1;
					}

				} else if (this.registers.status.mode == LCD_MODE_HBLANK) {

					if (this.modeCounter == 204) {

						this.renderScanLineToFrameBuffer();

						this.registers.scanLineIndex++;

						if (this.registers.scanLineIndex == 144) {

							this.registers.status.mode = LCD_MODE_VBLANK;	
							this.modeCounter = -1;

							this.checkMode1Interrupt();

							system.cpu.raiseInterupt(INTERRUPT_FLAG_VBLANK);

						} else {

							this.registers.status.mode = LCD_MODE_READING_OAM;	
							this.checkMode2Interrupt();
							this.modeCounter = -1;
						}

						this.checkCoincidenceInterupt();
					}

				} else if (this.registers.status.mode == LCD_MODE_VBLANK) {

					if (this.modeCounter == 456) {

						this.registers.scanLineIndex++;

						this.modeCounter = -1;

						if (this.registers.scanLineIndex == 154) {

							system.canvasContext.putImageData(
								this.frameBuffer, 0, 0);

							this.registers.scanLineIndex = 0;
							this.registers.status.mode = LCD_MODE_READING_OAM;	
							this.checkMode2Interrupt();
							frameComplete = true;

							//break;
						}

						this.checkCoincidenceInterupt();
					}

				} else {

					throw "Unknown GPU mode: " + this.registers.status.mode;
				}

				this.modeCounter++;
				this.clocksToRun--;

				if (this.modeCounter > 1000) {
					system.cpu.crash("Wierd mode counter value: " + this.modeCounter);
				}
			}

			/*// Update the registers from the localised data.
			this.disableIoPortPokes = true;

			var statusRegisterByte = system.memory.readByte(MEMLOC_LCD_STATUS_REGISTER);
			statusRegisterByte = (statusRegisterByte & 0xfc) | this.registers.status.mode;
			statusRegisterByte = (statusRegisterByte & 0x7b) | (this.registers.status.coincidenceFlag ? 1 : 0);

			system.memory.writeByte(MEMLOC_LCD_STATUS_REGISTER, statusRegisterByte);

			system.memory.writeByte(MEMLOC_SCANLINE_INDEX, this.registers.scanLineIndex);

			this.disableIoPortPokes = false;*/

			return frameComplete;
		},

		checkCoincidenceInterupt: function () {

			this.registers.status.coincidenceFlag = this.registers.scanLineIndex == this.registers.lyc;

			if (this.registers.status.coincidenceFlag && this.registers.status.coincidenceInterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		checkMode0Interrupt: function () {

			if (this.registers.status.mode0InterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		checkMode1Interrupt: function () {

			if (this.registers.status.mode1InterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		checkMode2Interrupt: function () {

			if (this.registers.status.mode0InterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		renderScanLineToFrameBuffer: function () {

			var scanLineIndex = this.registers.scanLineIndex;

			var pixelIndex = 
				scanLineIndex * FRAMEBUFFER_WIDTH_PIXELS;
			//var frameBufferIndex = 
			//	scanLineIndex * FRAMEBUFFER_WIDTH_PIXELS * 4;

			this.buildBgTileMapScanLineSamplingData(scanLineIndex);

			this.buildWindowTileMapScanLineSamplingData(scanLineIndex);

			this.buildSpriteScanLineSamplingData(scanLineIndex);

			var fbData = this.frameBuffer.data;

			var frameBufferBaseOffset = scanLineIndex * FRAMEBUFFER_WIDTH_PIXELS * 4 * 3 * 3;
			var frameBufferSubPixelRowStride = FRAMEBUFFER_WIDTH_PIXELS * 4 * 3;

			for (var i = 0; i < FRAMEBUFFER_WIDTH_PIXELS; i++) {

				var pixel = 0;

				if (this.registers.control.bgEnabled) {
					pixel = this.sampleBgTileMap(i, scanLineIndex);				
				}

				if (this.registers.control.windowEnabled) {
					var overwritePixel = this.sampleWindowTileMap(i, scanLineIndex);
					if (overwritePixel != -1) {
						pixel = overwritePixel;
					}
				}

				if (this.registers.control.spritesEnabled) {
					var overwritePixel = this.sampleSprites(i, scanLineIndex, pixel);
					if (overwritePixel != -1) {
						pixel = overwritePixel;
					}
				}

				var pixelRgb = this.pixelToRgbLookup[pixel];

				var frameBufferColOffset = i * 4 * 3;

				var frameBufferIndex = 
					frameBufferBaseOffset +
					frameBufferColOffset;

				fbData[frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				frameBufferIndex = 
					frameBufferBaseOffset +
					frameBufferSubPixelRowStride + 
					frameBufferColOffset; 

				fbData[frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				frameBufferIndex = 
					frameBufferBaseOffset +
					(2 * frameBufferSubPixelRowStride) + 
					frameBufferColOffset; 

				fbData[frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;
			}
		},

		buildBgTileMapScanLineSamplingData: function (y) {

			var data = this.scanLineSamplingData.bgTileMap;

			data.scrollX = this.registers.bgTileMapScrollX;
			data.scrollY = this.registers.bgTileMapScrollY;

			data.offsetX = data.scrollX > 0 ? data.scrollX : VRAM_TILEMAP_WIDTH_PIXELS + data.scrollX;
			data.offsetY = data.scrollY > 0 ? data.scrollY : VRAM_TILEMAP_HEIGHT_PIXELS + data.scrollY;

			data.tileMapRowIndex = 
				Math.floor((data.offsetY + y) / VRAM_TILE_HEIGHT_PIXELS) % VRAM_TILEMAP_NUM_TILES_Y;

			data.tilePixelRowIndex = 
				(data.offsetY + y) % VRAM_TILE_HEIGHT_PIXELS;
		},

		buildWindowTileMapScanLineSamplingData: function (y) {

			var data = this.scanLineSamplingData.windowTileMap;

			data.skipScanLine = y < this.registers.windowTileMapScrollY;

			if (!data.skipScanLine) {

				data.offsetX = -(this.registers.windowTileMapScrollX - 8);
				data.offsetY = -this.registers.windowTileMapScrollY;

				data.tileMapRowIndex = 
					Math.floor((data.offsetY + y) / VRAM_TILE_HEIGHT_PIXELS) % VRAM_TILEMAP_NUM_TILES_Y;

				data.tilePixelRowIndex = 
					(data.offsetY + y) % VRAM_TILE_HEIGHT_PIXELS;
			}

			return data;
		},

		buildSpriteScanLineSamplingData: function (y) {

			var data = this.scanLineSamplingData.sprites;

			data.spritesOnScanline = []; // FIXME - potential slow-down here due to allocation.
			
			var spriteHeight = this.registers.control.spriteSize == SPRITESIZE_8X8 ? 8: 16;

			for (var i = 0; i < this.sprites.length; i++) {
				var sprite = this.sprites[i];

				// Check if the sprite is above the scan line.
				if (sprite.y + spriteHeight <= y) {
					continue;
				}

				// Check if the sprite is below the scan line.
				if (sprite.y > y) {
					continue;
				}

				data.spritesOnScanline.push(sprite);
			}
		},

		sampleBgTileMap: function (x, y) {

			var data = this.scanLineSamplingData.bgTileMap;

			var tileMapColIndex = 
				Math.floor((data.offsetX + x) / VRAM_TILE_WIDTH_PIXELS) % VRAM_TILEMAP_NUM_TILES_X;

			var tilePixelColIndex = 
				(data.offsetX + x) % VRAM_TILE_WIDTH_PIXELS;

			var tileMapIndex = data.tileMapRowIndex * VRAM_TILEMAP_NUM_TILES_X + tileMapColIndex;
	
			var tileIndex = this.readFixedUpTileIndexFromTileMap(
				this.registers.control.bgTileMapNumber, 
				tileMapIndex, 
				this.registers.control.bgAndWindowTileSetNumber);

			var tilePixelIndex = data.tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;

			var pixel = this.tiles[tileIndex][tilePixelIndex];
			
			pixel = this.registers.tileMapPalette.colours[pixel];

			return pixel;
		},

		sampleWindowTileMap: function (x, y) {

			var data = this.scanLineSamplingData.windowTileMap;

			if (data.skipScanLine) {
				return -1;
			}

			var tileMapColIndex = 
				Math.floor((data.offsetX + x) / VRAM_TILE_WIDTH_PIXELS);

			if (tileMapColIndex < 0) {
				return -1;
			}

			var tilePixelColIndex = 
				(data.offsetX + x) % VRAM_TILE_WIDTH_PIXELS;

			var tileMapIndex = data.tileMapRowIndex * VRAM_TILEMAP_NUM_TILES_X + tileMapColIndex;
			
			var tileIndex = this.readFixedUpTileIndexFromTileMap(
				this.registers.control.windowTileMapNumber, 
				tileMapIndex, 
				this.registers.control.bgAndWindowTileSetNumber);

			var tilePixelIndex = data.tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;

			var pixel = this.tiles[tileIndex][tilePixelIndex];
			
			pixel = this.registers.tileMapPalette.colours[pixel];

			return pixel;
		},

		sampleSprites: function (x, y, currentPixel) {

			var data = this.scanLineSamplingData.sprites;

			var spriteHeight = this.registers.control.spriteSize == SPRITESIZE_8X8 ? 8: 16;

			for (var i = 0; i < data.spritesOnScanline.length; i++) {

				var sprite = data.spritesOnScanline[i];

				if (sprite.attributes.spriteToBgPriority == 1 && currentPixel != 0) {
					continue;
				}

				var tilePixelColIndex = x - sprite.x;
				if (tilePixelColIndex < 0) {
					continue;
				} else if (tilePixelColIndex >= 8) {
					continue;
				}

				if (sprite.attributes.xFlip) {
					tilePixelColIndex = 7 - tilePixelColIndex;
				}

				var tilePixelRowIndex = y - sprite.y;

				if (sprite.attributes.yFlip) {
					tilePixelRowIndex = (spriteHeight - 1) - tilePixelRowIndex;
				}

				var tileIndex = 0;
				var tilePixelIndex = 0;

				if (this.registers.control.spriteSize == SPRITESIZE_8X8) {

					tileIndex = sprite.tileIndex;
					tilePixelIndex = tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;


				} else {

					if (tilePixelRowIndex < 8) {

						tileIndex = sprite.tileIndex & 0xfe;
						tilePixelIndex = tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;
					
					} else {

						tileIndex = sprite.tileIndex | 0x01;
						tilePixelIndex = (tilePixelRowIndex - 8) * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;
					}

				}

				var pixel = this.tiles[tileIndex][tilePixelIndex];
			
				if (pixel == 0) {
					continue;
				}

				var palette = sprite.attributes.paletteNumber == 0 ?
					this.registers.spritePalette0 : this.registers.spritePalette1;

				pixel = palette.colours[pixel];

				return pixel;
			}

			return -1;
		},

		readFixedUpTileIndexFromTileMap: function (tileMapNumber, tileMapIndex, tileSetNumber) {

			var tileIndex = this.tileMaps[tileMapNumber][tileMapIndex]; 

			// If we're using tile set 1 then the indexes are signed values between -128 and 127, which
			// means we need to fix up the index to make it zero based.
			if (tileSetNumber == 1) {

				// Convert to twos-compliment signed.
				if (tileIndex >= 128) {
					tileIndex = -128 + (tileIndex & 0x7F);
				}

				// Make zero based.
				tileIndex += 256;
			}

			return tileIndex;
		}
	},

	this.timer = {

		dividerClockCounter: 0,
		timerClockCounter: 0,
		registers: null,

		init: function () {

			var self = this;

			system.memory.bindIoPort(
				MEMLOC_DIVIDER_REGISTER, 
				"Divider Register", 
				function () {
					return self.registers.divider;
				},
				function (value) {
					self.registers.divider = value;
					console.log("Timer divider register poked: " + value);
				});

			system.memory.bindIoPort(
				MEMLOC_TIMER_COUNTER_REGISTER, 
				"Timer Counter Register", 
				function () {
					return self.registers.counter;
				},
				function (value) {
					self.registers.counter = value;
					console.log("Timer counter register poked: " + value);
				});

			system.memory.bindIoPort(
				MEMLOC_TIMER_MODULO_REGISTER, 
				"Timer Modulo Register", 
				function () {
					return self.registers.modulo;
				},
				function (value) {
					self.registers.modulo = value;
					console.log("Timer modulo register poked: " + value);
				});

			system.memory.bindIoPort(
				MEMLOC_TIMER_CONTROL_REGISTER, 
				"Timer Control Register", 
				function () {
					return self.registers.control.byteValue;
				},
				function (value) {
					var r = self.registers.control;

					r.enabled = (value & 0x04) > 0;

					var tickFrequencyId = value & 0x03;

					if (tickFrequencyId == 0) {
						r.tickFrequency = 1024;
					} else if (tickFrequencyId == 3) {
						r.tickFrequency = 256;
					} else if (tickFrequencyId == 2) {
						r.tickFrequency = 64;
					} else if (tickFrequencyId == 1) {
						r.tickFrequency = 16;
					}

					console.log(
						"Timer control register poked: " + value + ". " + 
						"Enabled: " + r.enabled + ". " + 
						"Tick Frequency: " + r.tickFrequency + ".");
				});
		},

		reset: function () {

			this.disableIoPortPokes = false;
			this.dividerClockCounter = 0;
			this.timerClockCounter = 0;
			this.registers = {
				divider: 0,
				counter: 0,
				modulo: 0,
				control: {
					byteValue: 0,
					enabled: false,
					tickFrequency: 4
				}
			};
		},

		heartbeat: function (clocksToRun) {

			this.dividerClockCounter += clocksToRun;

			if (this.dividerClockCounter >= 256) {
				this.dividerClockCounter -= 256;

				this.dividerTick();
			}

			if (!this.registers.control.enabled) {
				return;
			}

			this.timerClockCounter += clocksToRun;

			if (this.timerClockCounter >= this.registers.control.tickFrequency) {

				this.timerClockCounter -= this.registers.control.tickFrequency;

				this.timerTick();
			}
		},

		dividerTick: function () {

			this.registers.divider++;
			this.registers.divider &= 0xff;
		},

		timerTick: function () {

			this.registers.counter++;

			var raiseInterupt = false;

			if (this.registers.counter > 0xff) {
				this.registers.counter = this.registers.modulo;
				raiseInterupt = true;
			}

			if (raiseInterupt) {
				// Raise the timer interrupt.
				system.cpu.raiseInterupt(INTERRUPT_FLAG_TIMER);
			}
		}
	},

	this.joypad = {

		registers: null,

		init: function () {

			var self = this;

			system.memory.bindIoPort(
				MEMLOC_JOYPAD_REGISTER, 
				"Joypad Register", 
				function () {
					return self.registers.joypad.byteValue;
				},
				function (value) {
					var r = self.registers.joypad;

					r.buttonsSelected = (value & 0x20) == 0;
					r.directionPadSelected = (value & 0x10) == 0;
					self.updateJoypadRegister();
				});

			window.addEventListener('keydown', function (e) {
				self.handleKeyDownEvent(e);
				e.preventDefault();
			}, false);

			window.addEventListener('keyup', function (e) {
				self.handleKeyUpEvent(e);
				e.preventDefault();
			}, false);

			var buttonDownEvents = {
				"btn-left": function (e) {
					self.registers.joypad.directionPadState.leftPressed = true;
				},
				"btn-up": function (e) {
					self.registers.joypad.directionPadState.upPressed = true;
				},
				"btn-right": function (e) {
					self.registers.joypad.directionPadState.rightPressed = true;
				},
				"btn-down": function (e) {
					self.registers.joypad.directionPadState.downPressed = true;
				},
				"btn-start": function (e) {
					self.registers.joypad.buttonsState.startPressed = true;
				},
				"btn-select": function (e) {
					self.registers.joypad.buttonsState.selectPressed = true;
				},
				"btn-a": function (e) {
					self.registers.joypad.buttonsState.aPressed = true;
				},
				"btn-b": function (e) {
					self.registers.joypad.buttonsState.bPressed = true;
				}
			}

			var buttonUpEvents = {
				"btn-left": function (e) {
					self.registers.joypad.directionPadState.leftPressed = false;
				},
				"btn-up": function (e) {
					self.registers.joypad.directionPadState.upPressed = false;
				},
				"btn-right": function (e) {
					self.registers.joypad.directionPadState.rightPressed = false;
				},
				"btn-down": function (e) {
					self.registers.joypad.directionPadState.downPressed = false;
				},
				"btn-start": function (e) {
					self.registers.joypad.buttonsState.startPressed = false;
				},
				"btn-select": function (e) {
					self.registers.joypad.buttonsState.selectPressed = false;
				},
				"btn-a": function (e) {
					self.registers.joypad.buttonsState.aPressed = false;
				},
				"btn-b": function (e) {
					self.registers.joypad.buttonsState.bPressed = false;
				}
			}

			for (var buttonId in buttonDownEvents) {

				var evnt = buttonDownEvents[buttonId];
				document.getElementById(buttonId).addEventListener("mousedown", evnt);
				document.getElementById(buttonId).addEventListener("touchstart", evnt);
			}

			for (var buttonId in buttonUpEvents) {

				var evnt = buttonUpEvents[buttonId];
				document.getElementById(buttonId).addEventListener("mouseup", evnt);
				document.getElementById(buttonId).addEventListener("touchend", evnt);
			}

		},

		reset: function () {

			this.disableIoPortPokes = false;
			this.registers = {
				joypad: {
					byteValue: 0,
					buttonsSelected: false,
					directionPadSelected: false,
					directionPadState: {
						leftPressed: false,
						upPressed: false,
						rightPressed: false,
						downPressed: false
					},
					buttonsState: {
						aPressed: false,
						bPressed: false,
						startPressed: false,
						selectPressed: false
					}
				}
			};
		},

		handleKeyDownEvent: function (e) {

			var keyCode = e.which;
			if (keyCode == null) {
				keyCode = e.keyCode;
			}

			if (keyCode == 37) {
				this.registers.joypad.directionPadState.leftPressed = true;
			} else if (keyCode == 38) {
				this.registers.joypad.directionPadState.upPressed = true;
			} else if (keyCode == 39) {
				this.registers.joypad.directionPadState.rightPressed = true;
			} else if (keyCode == 40) {
				this.registers.joypad.directionPadState.downPressed = true;
			} else if (keyCode == 65) {
				this.registers.joypad.buttonsState.aPressed = true;
			} else if (keyCode == 66) {
				this.registers.joypad.buttonsState.bPressed = true;
			} else if (keyCode == 13) {
				this.registers.joypad.buttonsState.startPressed = true;
			} else if (keyCode == 32) {
				this.registers.joypad.buttonsState.selectPressed = true;
			}

			this.updateJoypadRegister();
			this.raiseInterupt();
		},

		handleKeyUpEvent: function (e) {

			var keyCode = e.which;
			if (keyCode == null) {
				keyCode = e.keyCode;
			}

			if (keyCode == 37) {
				this.registers.joypad.directionPadState.leftPressed = false;
			} else if (keyCode == 38) {
				this.registers.joypad.directionPadState.upPressed = false;
			} else if (keyCode == 39) {
				this.registers.joypad.directionPadState.rightPressed = false;
			} else if (keyCode == 40) {
				this.registers.joypad.directionPadState.downPressed = false;
			} else if (keyCode == 65) {
				this.registers.joypad.buttonsState.aPressed = false;
			} else if (keyCode == 66) {
				this.registers.joypad.buttonsState.bPressed = false;
			} else if (keyCode == 13) {
				this.registers.joypad.buttonsState.startPressed = false;
			} else if (keyCode == 32) {
				this.registers.joypad.buttonsState.selectPressed = false;
			}

			this.updateJoypadRegister();
			this.raiseInterupt();
		},

		updateJoypadRegister: function () {

			var r = this.registers.joypad;
			r.byteValue = 0xff;

			if (r.buttonsSelected) {
				r.byteValue &= 0xdf;//0x20;

				if (r.buttonsState.startPressed) {
					r.byteValue &= 0xf7;//0x08;
				}

				if (r.buttonsState.selectPressed) {
					r.byteValue &= 0xfb;//0x04;
				}

				if (r.buttonsState.bPressed) {
					r.byteValue &= 0xfd;//0x02;
				}

				if (r.buttonsState.aPressed) {
					r.byteValue &= 0xfe;//0x01;
				}
			}

			if (r.directionPadSelected) {
				r.byteValue &= 0xef;//0x10;

				if (r.directionPadState.downPressed) {
					r.byteValue &= 0xf7;//0x08;
				}

				if (r.directionPadState.upPressed) {
					r.byteValue &= 0xfb;//0x04;
				}

				if (r.directionPadState.leftPressed) {
					r.byteValue &= 0xfd;//0x02;
				}

				if (r.directionPadState.rightPressed) {
					r.byteValue &= 0xfe;//0x01;
				}
			}
		},

		raiseInterupt: function () {

			// Raise the joypad interrupt.
			system.cpu.raiseInterupt(INTERRUPT_FLAG_JOYPAD);
		}
	},

	this.memory = {

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
	},

	this.start = function (romName) {

		var self = this;

		var epilogue = function () {

			self.terminated = false;

			self.reset();
			self.loadRom(romName, function () {

			
				self.mainLoop();

			});
		}

		if (!this.terminated) {
			console.log("Terminating...");
			this.terminate = true;

			this.waitForTerminationInterval = setInterval(function () {

				

				if (self.terminated) {
					clearInterval(self.waitForTerminationInterval);
					console.log("... Done");
					epilogue();
				}
			}, 
			500);

		} else {
			epilogue();
		}
	},

	this.init = function () {

		var self = this;

		this.canvas = document.getElementById("gameboy-canvas");
		this.canvasContext = this.canvas.getContext("2d");

		this.canvasContext.fillStyle = "#EFFFDE";
		this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.canvasContext.fillStyle = "#183442";
		this.canvasContext.font = "15px Courier";
		this.canvasContext.fillText("Choose a ROM from the top right menu...", 6, 14);

		this.memory.init();
		this.cpu.init();
		this.gpu.init();
		this.timer.init();
		this.joypad.init();

		setInterval(function () { self.updateStats(); }, 1000);
	}

	this.reset = function () {

		this.lastFrameDuration = 0;

		this.cpu.reset();
		this.gpu.reset();
		this.timer.reset();
		this.joypad.reset();
		this.memory.reset();

		//this.memory.writeByte(0xFF40, 0x11); // rLCDC
		this.memory.writeByte(0xFF41, 0x80); // rSTAT maybe?
		this.memory.writeByte(0xFF00, 0xFF); // JOYPAD maybe?

		this.memory.writeByte(0xFF05, 0x00); // TIMA
		this.memory.writeByte(0xFF06, 0x00); // TMA
		this.memory.writeByte(0xFF07, 0x00); // TAC
		this.memory.writeByte(0xFF10, 0x80); // NR10
		this.memory.writeByte(0xFF11, 0xBF); // NR11
		this.memory.writeByte(0xFF12, 0xF3); // NR12
		this.memory.writeByte(0xFF14, 0xBF); // NR14
		this.memory.writeByte(0xFF16, 0x3F); // NR21
		this.memory.writeByte(0xFF17, 0x00); // NR22
		this.memory.writeByte(0xFF19, 0xBF); // NR24
		this.memory.writeByte(0xFF1A, 0x7F); // NR30
		this.memory.writeByte(0xFF1B, 0xFF); // NR31
		this.memory.writeByte(0xFF1C, 0x9F); // NR32
		this.memory.writeByte(0xFF1E, 0xBF); // NR33
		this.memory.writeByte(0xFF20, 0xFF); // NR41
		this.memory.writeByte(0xFF21, 0x00); // NR42
		this.memory.writeByte(0xFF22, 0x00); // NR43
		this.memory.writeByte(0xFF23, 0xBF); // NR30
		this.memory.writeByte(0xFF24, 0x77); // NR50
		this.memory.writeByte(0xFF25, 0xF3); // NR51
		this.memory.writeByte(0xFF26, 0xF1); // NR52
		this.memory.writeByte(0xFF40, 0x91); // LCDC
		this.memory.writeByte(0xFF42, 0x00); // SCY
		this.memory.writeByte(0xFF43, 0x00); // SCX
		this.memory.writeByte(0xFF45, 0x00); // LYC
		this.memory.writeByte(0xFF47, 0xFC); // BGP
		this.memory.writeByte(0xFF48, 0xFF); // OBP0
		this.memory.writeByte(0xFF49, 0xFF); // OBP1
		this.memory.writeByte(0xFF4A, 0x00); // WY
		this.memory.writeByte(0xFF4B, 0x00); // WX
		this.memory.writeByte(0xFFFF, 0x00); // IE
	}

	this.loadRom = function (romName, callback) {

		var self = this;

		var request = new XMLHttpRequest();

		request.open("GET", "roms/" + romName, true);

		request.responseType = "arraybuffer";

		request.onload = function (e) {
	  		var arrayBuffer = request.response;
	  		if (arrayBuffer) {
	    		var byteArray = new Uint8Array(arrayBuffer);
		    
		    	var bankNumber = 0;
		    	var bankCounter = 0;
		    	for (var i = 0; i < byteArray.byteLength; i++) {
		      		self.memory.romBanks[bankNumber][bankCounter] = byteArray[i];
		      		bankCounter++;
		      		if (bankCounter == 0x4000) {
		      			bankNumber++;
		      			bankCounter = 0;
		      			console.log("Loading bank " + bankNumber);
		      		}
			    }

			    callback();
	  		}
		};

		request.send(null);
	}

	this.mainLoop = function () {

		var self = this;

		var frameFunction = null;
		frameFunction = function () { 
			self.runFrame(); 

			if (self.terminate) {
				self.terminate = false;
				self.terminated = true;
			} else {
				requestAnimationFrame(frameFunction);
			}
		}

		self.startTime = new Date();
		frameFunction();
	}

	this.runFrame = function () {

		/*if (this.frameIsRunning) {
			console.log("Frame didn't complete in time");
			return;
		}

		this.frameIsRunning = true;*/

		var startTime = performance.now();

		var numberOfAdditionalClocksAvailableForGpu = 0;

		var clocksThisFrame = 0;

		while (clocksThisFrame < 1000000) {

			var frameComplete = this.gpu.heartbeat(numberOfAdditionalClocksAvailableForGpu);

			if (frameComplete) {
				this.clocksLastFrame = clocksThisFrame;
				break;
			}

			var cpuClockExecuted = this.cpu.heartbeat();

			this.timer.heartbeat(cpuClockExecuted);

			numberOfAdditionalClocksAvailableForGpu = cpuClockExecuted;

			clocksThisFrame += numberOfAdditionalClocksAvailableForGpu;

			if (!this.gpu.registers.control.enabled && clocksThisFrame >= 70224) {
				this.clocksLastFrame = clocksThisFrame;
				break;
			}

		}

		var endTime = performance.now();

		this.lastFrameDuration = endTime - startTime;

		//this.frameIsRunning = false;

		/*// TEST CODE //
		var scrollX = system.memory.readByte(MEMLOC_BGTILEMAP_SCROLLX);
		var scrollY = system.memory.readByte(MEMLOC_BGTILEMAP_SCROLLY);

		system.memory.writeByte(MEMLOC_BGTILEMAP_SCROLLX, scrollX + 1);
		system.memory.writeByte(MEMLOC_BGTILEMAP_SCROLLY, scrollY + 1);
		///////////////*/
	},

	this.updateStats = function () {

		if (this.startTime == null) {
			return;
		}

		var totalRunTimeSeconds = ((new Date()).getTime() - this.startTime.getTime()) / 1000;

		document.getElementById("statsTotalClocksExecuted").innerHTML = 
			this.cpu.totalClocksExecuted;

		var averageClocksPerSecond = (this.cpu.totalClocksExecuted / totalRunTimeSeconds);

		document.getElementById("statsAverageClocksPerSecond").innerHTML = 
			averageClocksPerSecond.toFixed(0) + " (" + ((averageClocksPerSecond / 4194304) * 100).toFixed(2) + "%)";

		document.getElementById("statsClocksLastFrame").innerHTML = 
			this.clocksLastFrame + " (" + ((this.clocksLastFrame / 70224) * 100).toFixed(2) + "%)";

		document.getElementById("statsLastFrameDuration").innerHTML = 
			this.lastFrameDuration.toFixed(2) + "ms";
	}

	this.util = {
		toSigned: function (v) {
			if (v >= 128) {
				v = -128 + (v & 0x7F);
			}

			return v;
		}
	}
}