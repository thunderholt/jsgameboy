function Gameboy_MixInCpuInstructions_Misc(system) {

	/*
		r = 8 bit register.
		rr = 16 bit register.
		n = 8 bit binary number.
		nn = 16 bit binary number.
	*/

	var ocf = system.cpu.opCodeFunctions; 
	var r = system.cpu.registers;
	var rb = function (address) { return system.memory.readByte(address); }
	var rw = function (address) { return system.memory.readWord(address); }
	var wb = function (address, value) { system.memory.writeByte(address, value); }
	var ww = function (address, value) { system.memory.writeWord(address, value); }

	var conditionalCall = function (conditionIsTrue) {

		var returnAddress = (r.pc + 2) & 0xffff;
		var jumpAddress = rw(r.pc);

		if (conditionIsTrue) {

			r.dec2_sp();
			ww(r.sp, returnAddress);

			r.pc = jumpAddress;

			return 24;
		} else {
			r.inc2_pc();
			return 12;
		}
	}

	var conditionalReturn = function (conditionIsTrue) {

		if (conditionIsTrue) {

			var jumpAddress = rw(r.sp);
			r.inc2_sp();
			r.pc = jumpAddress;
			return 20;
		} else {
			//r.inc2_pc();
			return 8;
		}
	}

	var restart = function (address) {

		r.dec2_sp();
		ww(r.sp, r.pc);

		r.pc = address;
		return 16;
	}

	//****** Misc ******
	// nop
	ocf[0x00] = function () { return 4; }
	// di
	ocf[0xf3] = function () { r.ime = 0; return 4; };
	// ei
	ocf[0xfb] = function () { r.ime = 1; return 4; };
	// rlc a
	ocf[0x07] = function () { r.a = r.rlc_8bit(r.a); r.f &= 0x7f; return 4; };
	// rrc a
	ocf[0x0f] = function () { r.a = r.rrc_8bit(r.a); r.f &= 0x7f; return 4; };
	// rl a
	ocf[0x17] = function () { r.a = r.rl_8bit(r.a); r.f &= 0x7f; return 4; };
	// rr a
	ocf[0x1f] = function () { r.a = r.rr_8bit(r.a); r.f &= 0x7f; return 4; };
	// cpl
	ocf[0x2f] = function () { r.a = r.a ^ 0xff; r.f |= 0x60; return 4; };
	// scf
	ocf[0x37] = function () { r.f = (r.f & 0x80) | 0x10; return 4; };
	// ccf
	ocf[0x3f] = function () { var carryFlagSet = (r.f & 0x10) > 0; r.f &= 0x80; if (!carryFlagSet) { r.f |= 0x10; } return 4; };
	// daa
	ocf[0x27] = function () { r.a = r.decimalAdjust(r.a); return 4; }
	// halt
	ocf[0x76] = function () { system.cpu.isHalted = true; return 4; }
	// stop
	ocf[0x10] = function () { system.cpu.isHalted = true; return 4; }

	//****** Calls ******
	// call nn
	ocf[0xcd] = function () { return conditionalCall(true); };
	// call z,nn
	ocf[0xcc] = function () { return conditionalCall(r.zeroFlagIsSet()); };
	// call nz,nn
	ocf[0xc4] = function () { return conditionalCall(!r.zeroFlagIsSet()); };
	// call c,nn
	ocf[0xdc] = function () { return conditionalCall(r.carryFlagIsSet()); };
	// call nc,nn
	ocf[0xd4] = function () { return conditionalCall(!r.carryFlagIsSet()); };

	//****** Returns ******
	// ret
	ocf[0xc9] = function () { r.pc = rw(r.sp); r.inc2_sp(); return 16; },
	// reti
	ocf[0xd9] = function () { r.pc = rw(r.sp); r.inc2_sp(); r.ime = 1; return 16; };
	// ret z
	ocf[0xc8] = function () { return conditionalReturn(r.zeroFlagIsSet()); };
	// ret nz
	ocf[0xc0] = function () { return conditionalReturn(!r.zeroFlagIsSet()); };
	// ret c
	ocf[0xd8] = function () { return conditionalReturn(r.carryFlagIsSet()); };
	// ret nc
	ocf[0xd0] = function () { return conditionalReturn(!r.carryFlagIsSet()); };

	//****** rst n *******
	// rst 0
	ocf[0xc7] = function () { return restart(0x0); }
	// rst 8
	ocf[0xcf] = function () { return restart(0x08); }
	// rst 10
	ocf[0xd7] = function () { return restart(0x10); }
	// rst 18
	ocf[0xdf] = function () { return restart(0x18); }
	// rst 20
	ocf[0xe7] = function () { return restart(0x20); }
	// rst 28
	ocf[0xef] = function () { return restart(0x28); }
	// rst 30
	ocf[0xf7] = function () { return restart(0x30); }
	// rst 38
	ocf[0xff] = function () { return restart(0x38); }

	//****** Removed instructions ******
	ocf[0xd3] = function () { throw "Op code 0xd3 is not implemented on this CPU."; }
	ocf[0xdd] = function () { throw "Op code 0xdd is not implemented on this CPU."; }
	ocf[0xe3] = function () { throw "Op code 0xe3 is not implemented on this CPU."; }
	ocf[0xe4] = function () { throw "Op code 0xe4 is not implemented on this CPU."; }
	ocf[0xeb] = function () { throw "Op code 0xeb is not implemented on this CPU."; }
	ocf[0xec] = function () { throw "Op code 0xec is not implemented on this CPU."; }
	ocf[0xed] = function () { throw "Op code 0xed is not implemented on this CPU."; }
	ocf[0xf4] = function () { throw "Op code 0xf4 is not implemented on this CPU."; }
	ocf[0xfc] = function () { throw "Op code 0xfc is not implemented on this CPU."; }
	ocf[0xfd] = function () { throw "Op code 0xfd is not implemented on this CPU."; }
}