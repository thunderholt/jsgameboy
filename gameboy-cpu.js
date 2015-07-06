function Gameboy_MixInCpu(system) {

	system.cpu = {

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

			for (var i = 0; i <= 0xff; i++) {
				this.opCodeFunctions[i] = null;
				this.extOpCodeFunctions[i] = null;
			}
			
			Gameboy_MixInCpuInstructions_8BitLoads(system);
			Gameboy_MixInCpuInstructions_16BitLoads(system);
			Gameboy_MixInCpuInstructions_8BitAlu(system);
			Gameboy_MixInCpuInstructions_16BitAlu(system);
			Gameboy_MixInCpuInstructions_Misc(system);
			Gameboy_MixInCpuInstructions_Jumps(system);
			Gameboy_MixInCpuInstructions_Ext(system);

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

}