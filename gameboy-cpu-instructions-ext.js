function Gameboy_MixInCpuInstructions_Ext(system) {

	/*
		r = 8 bit register.
		rr = 16 bit register.
		n = 8 bit binary number.
		nn = 16 bit binary number.
	*/

	var ocf = system.cpu.opCodeFunctions; 
	var eocf = system.cpu.extOpCodeFunctions;
	var r = system.cpu.registers;
	var rb = function (address) { return system.memory.readByte(address); }
	var rw = function (address) { return system.memory.readWord(address); }
	var wb = function (address, value) { system.memory.writeByte(address, value); }
	var ww = function (address, value) { system.memory.writeWord(address, value); }

	

	//****** Misc ******
	// ext ops
	ocf[0xcb] = function () {

		var opCode = rb(r.pc);
		r.inc_pc();

		var opCodeFunction = eocf[opCode];

		if (opCodeFunction == null) {
			throw "Ext op-code function not found for 0x" + opCode.toString(16);
		}

		return opCodeFunction(r);
	},

	//****** sla r ******
	// sla a
	eocf[0x27] = function () { r.a = r.sla_8bit(r.a); return 8; }
	// sla b
	eocf[0x20] = function () { r.b = r.sla_8bit(r.b); return 8; }
	// sla c
	eocf[0x21] = function () { r.c = r.sla_8bit(r.c); return 8; }
	// sla d
	eocf[0x22] = function () { r.d = r.sla_8bit(r.d); return 8; }
	// sla e
	eocf[0x23] = function () { r.e = r.sla_8bit(r.e); return 8; }
	// sla h
	eocf[0x24] = function () { r.h = r.sla_8bit(r.h); return 8; }
	// sla l
	eocf[0x25] = function () { r.l = r.sla_8bit(r.l); return 8; }

	//****** sra ******
	// sra a
	eocf[0x2f] = function () { r.a = r.sra_8bit(r.a); return 8; }
	// sra b
	eocf[0x28] = function () { r.b = r.sra_8bit(r.b); return 8; }
	// sra c
	eocf[0x29] = function () { r.c = r.sra_8bit(r.c); return 8; }
	// sra d
	eocf[0x2a] = function () { r.d = r.sra_8bit(r.d); return 8; }
	// sra e
	eocf[0x2b] = function () { r.e = r.sra_8bit(r.e); return 8; }
	// sra h
	eocf[0x2c] = function () { r.h = r.sra_8bit(r.h); return 8; }
	// sra l
	eocf[0x2d] = function () { r.l = r.sra_8bit(r.l); return 8; }
	
	//****** srl ******
	// srl a
	eocf[0x3f] = function () { r.a = r.srl_8bit(r.a); return 8; }
	// srl b
	eocf[0x38] = function () { r.b = r.srl_8bit(r.b); return 8; }
	// srl c
	eocf[0x39] = function () { r.c = r.srl_8bit(r.c); return 8; }
	// srl d
	eocf[0x3a] = function () { r.d = r.srl_8bit(r.d); return 8; }
	// srl e
	eocf[0x3b] = function () { r.e = r.srl_8bit(r.e); return 8; }
	// srl h
	eocf[0x3c] = function () { r.h = r.srl_8bit(r.h); return 8; }
	// srl l
	eocf[0x3d] = function () { r.l = r.srl_8bit(r.l); return 8; }

	//****** rl r ******
	// rl a
	eocf[0x17] = function () { r.a = r.rl_8bit(r.a); return 8; }
	// rl b
	eocf[0x10] = function () { r.b = r.rl_8bit(r.b); return 8; }
	// rl c
	eocf[0x11] = function () { r.c = r.rl_8bit(r.c); return 8; }
	// rl d
	eocf[0x12] = function () { r.d = r.rl_8bit(r.d); return 8; }
	// rl e
	eocf[0x13] = function () { r.e = r.rl_8bit(r.e); return 8; }
	// rl h
	eocf[0x14] = function () { r.h = r.rl_8bit(r.h); return 8; }
	// rl l
	eocf[0x15] = function () { r.l = r.rl_8bit(r.l); return 8; }

	//****** rr r ******
	// rr a
	eocf[0x1f] = function () { r.a = r.rr_8bit(r.a); return 8; }
	// rr b
	eocf[0x18] = function () { r.b = r.rr_8bit(r.b); return 8; }
	// rr c
	eocf[0x19] = function () { r.c = r.rr_8bit(r.c); return 8; }
	// rr d
	eocf[0x1a] = function () { r.d = r.rr_8bit(r.d); return 8; }
	// rr e
	eocf[0x1b] = function () { r.e = r.rr_8bit(r.e); return 8; }
	// rr h
	eocf[0x1c] = function () { r.h = r.rr_8bit(r.h); return 8; }
	// rr l
	eocf[0x1d] = function () { r.l = r.rr_8bit(r.l); return 8; }	

	//****** rlc r ******
	// rlc a
	eocf[0x07] = function () { r.a = r.rlc_8bit(r.a); return 8; }
	// rlc b
	eocf[0x00] = function () { r.b = r.rlc_8bit(r.b); return 8; }
	// rlc c
	eocf[0x01] = function () { r.c = r.rlc_8bit(r.c); return 8; }
	// rlc d
	eocf[0x02] = function () { r.d = r.rlc_8bit(r.d); return 8; }
	// rlc e
	eocf[0x03] = function () { r.e = r.rlc_8bit(r.e); return 8; }
	// rlc h
	eocf[0x04] = function () { r.h = r.rlc_8bit(r.h); return 8; }
	// rlc l
	eocf[0x05] = function () { r.l = r.rlc_8bit(r.l); return 8; }

	//****** rrc r ******
	// rrc a
	eocf[0x0f] = function () { r.a = r.rrc_8bit(r.a); return 8; }
	// rrc b
	eocf[0x08] = function () { r.b = r.rrc_8bit(r.b); return 8; }
	// rrc c
	eocf[0x09] = function () { r.c = r.rrc_8bit(r.c); return 8; }
	// rrc d
	eocf[0x0a] = function () { r.d = r.rrc_8bit(r.d); return 8; }
	// rrc e
	eocf[0x0b] = function () { r.e = r.rrc_8bit(r.e); return 8; }
	// rrc h
	eocf[0x0c] = function () { r.h = r.rrc_8bit(r.h); return 8; }
	// rrc l
	eocf[0x0d] = function () { r.l = r.rrc_8bit(r.l); return 8; }

	//****** swap r ******
	// swap a
	eocf[0x37] = function () { r.a = r.swap_8bit(r.a); return 8; }
	// swap b
	eocf[0x30] = function () { r.b = r.swap_8bit(r.b); return 8; }
	// swap c
	eocf[0x31] = function () { r.c = r.swap_8bit(r.c); return 8; }
	// swap d
	eocf[0x32] = function () { r.d = r.swap_8bit(r.d); return 8; }
	// swap e
	eocf[0x33] = function () { r.e = r.swap_8bit(r.e); return 8; }
	// swap h
	eocf[0x34] = function () { r.h = r.swap_8bit(r.h); return 8; }
	// swap l
	eocf[0x35] = function () { r.l = r.swap_8bit(r.l); return 8; }

	//****** bit 0, r ******
	// bit 0, a
	eocf[0x47] = function () { r.checkBit_8bit(0, r.a); return 8; }
	// bit 0, b
	eocf[0x40] = function () { r.checkBit_8bit(0, r.b); return 8; }
	// bit 0, c
	eocf[0x41] = function () { r.checkBit_8bit(0, r.c); return 8; }
	// bit 0, d
	eocf[0x42] = function () { r.checkBit_8bit(0, r.d); return 8; }
	// bit 0, e
	eocf[0x43] = function () { r.checkBit_8bit(0, r.e); return 8; }
	// bit 0, h
	eocf[0x44] = function () { r.checkBit_8bit(0, r.h); return 8; }
	// bit 0, l
	eocf[0x45] = function () { r.checkBit_8bit(0, r.l); return 8; }

	//****** bit 1, r ******
	// bit 1, a
	eocf[0x4f] = function () { r.checkBit_8bit(1, r.a); return 8; }
	// bit 1, b
	eocf[0x48] = function () { r.checkBit_8bit(1, r.b); return 8; }
	// bit 1, c
	eocf[0x49] = function () { r.checkBit_8bit(1, r.c); return 8; }
	// bit 1, d
	eocf[0x4a] = function () { r.checkBit_8bit(1, r.d); return 8; }
	// bit 1, e
	eocf[0x4b] = function () { r.checkBit_8bit(1, r.e); return 8; }
	// bit 1, h
	eocf[0x4c] = function () { r.checkBit_8bit(1, r.h); return 8; }
	// bit 1, l
	eocf[0x4d] = function () { r.checkBit_8bit(1, r.l); return 8; }

	//****** bit 2, r ******
	// bit 2, a
	eocf[0x57] = function () { r.checkBit_8bit(2, r.a); return 8; }
	// bit 2, b
	eocf[0x50] = function () { r.checkBit_8bit(2, r.b); return 8; }
	// bit 2, c
	eocf[0x51] = function () { r.checkBit_8bit(2, r.c); return 8; }
	// bit 2, d
	eocf[0x52] = function () { r.checkBit_8bit(2, r.d); return 8; }
	// bit 2, e
	eocf[0x53] = function () { r.checkBit_8bit(2, r.e); return 8; }
	// bit 2, h
	eocf[0x54] = function () { r.checkBit_8bit(2, r.h); return 8; }
	// bit 2, l
	eocf[0x55] = function () { r.checkBit_8bit(2, r.l); return 8; }

	//****** bit 3, r ******
	// bit 3, a
	eocf[0x5f] = function () { r.checkBit_8bit(3, r.a); return 8; }
	// bit 3, b
	eocf[0x58] = function () { r.checkBit_8bit(3, r.b); return 8; }
	// bit 3, c
	eocf[0x59] = function () { r.checkBit_8bit(3, r.c); return 8; }
	// bit 3, d
	eocf[0x5a] = function () { r.checkBit_8bit(3, r.d); return 8; }
	// bit 3, e
	eocf[0x5b] = function () { r.checkBit_8bit(3, r.e); return 8; }
	// bit 3, h
	eocf[0x5c] = function () { r.checkBit_8bit(3, r.h); return 8; }
	// bit 3, l
	eocf[0x5d] = function () { r.checkBit_8bit(3, r.l); return 8; }

	//****** bit 4, r ******
	// bit 4, a
	eocf[0x67] = function () { r.checkBit_8bit(4, r.a); return 8; }
	// bit 4, b
	eocf[0x60] = function () { r.checkBit_8bit(4, r.b); return 8; }
	// bit 4, c
	eocf[0x61] = function () { r.checkBit_8bit(4, r.c); return 8; }
	// bit 4, d
	eocf[0x62] = function () { r.checkBit_8bit(4, r.d); return 8; }
	// bit 4, e
	eocf[0x63] = function () { r.checkBit_8bit(4, r.e); return 8; }
	// bit 4, h
	eocf[0x64] = function () { r.checkBit_8bit(4, r.h); return 8; }
	// bit 4, l
	eocf[0x65] = function () { r.checkBit_8bit(4, r.l); return 8; }

	//****** bit 5, r ******
	// bit 5, a
	eocf[0x6f] = function () { r.checkBit_8bit(5, r.a); return 8; }
	// bit 5, b
	eocf[0x68] = function () { r.checkBit_8bit(5, r.b); return 8; }
	// bit 5, c
	eocf[0x69] = function () { r.checkBit_8bit(5, r.c); return 8; }
	// bit 5, d
	eocf[0x6a] = function () { r.checkBit_8bit(5, r.d); return 8; }
	// bit 5, e
	eocf[0x6b] = function () { r.checkBit_8bit(5, r.e); return 8; }
	// bit 5, h
	eocf[0x6c] = function () { r.checkBit_8bit(5, r.h); return 8; }
	// bit 5, l
	eocf[0x6d] = function () { r.checkBit_8bit(5, r.l); return 8; }

	//****** bit 6, r ******
	// bit 6, a
	eocf[0x77] = function () { r.checkBit_8bit(6, r.a); return 8; }
	// bit 6, b
	eocf[0x70] = function () { r.checkBit_8bit(6, r.b); return 8; }
	// bit 6, c
	eocf[0x71] = function () { r.checkBit_8bit(6, r.c); return 8; }
	// bit 6, d
	eocf[0x72] = function () { r.checkBit_8bit(6, r.d); return 8; }
	// bit 6, e
	eocf[0x73] = function () { r.checkBit_8bit(6, r.e); return 8; }
	// bit 6, h
	eocf[0x74] = function () { r.checkBit_8bit(6, r.h); return 8; }
	// bit 6, l
	eocf[0x75] = function () { r.checkBit_8bit(6, r.l); return 8; }

	//****** bit 7, r ******
	// bit 7, a
	eocf[0x7f] = function () { r.checkBit_8bit(7, r.a); return 8; }
	// bit 7, b
	eocf[0x78] = function () { r.checkBit_8bit(7, r.b); return 8; }
	// bit 7, c
	eocf[0x79] = function () { r.checkBit_8bit(7, r.c); return 8; }
	// bit 7, d
	eocf[0x7a] = function () { r.checkBit_8bit(7, r.d); return 8; }
	// bit 7, e
	eocf[0x7b] = function () { r.checkBit_8bit(7, r.e); return 8; }
	// bit 7, h
	eocf[0x7c] = function () { r.checkBit_8bit(7, r.h); return 8; }
	// bit 7, l
	eocf[0x7d] = function () { r.checkBit_8bit(7, r.l); return 8; }

	//****** res 0, r ******
	// res 0, a
	eocf[0x87] = function () { r.a = r.resBit_8bit(0, r.a); return 8; }
	// res 0, b
	eocf[0x80] = function () { r.b = r.resBit_8bit(0, r.b); return 8; }
	// res 0, c
	eocf[0x81] = function () { r.c = r.resBit_8bit(0, r.c); return 8; }
	// res 0, d
	eocf[0x82] = function () { r.d = r.resBit_8bit(0, r.d); return 8; }
	// res 0, e
	eocf[0x83] = function () { r.e = r.resBit_8bit(0, r.e); return 8; }
	// res 0, h
	eocf[0x84] = function () { r.h = r.resBit_8bit(0, r.h); return 8; }
	// res 0, l
	eocf[0x85] = function () { r.l = r.resBit_8bit(0, r.l); return 8; }

	//****** res 1, r ******
	// res 1, a
	eocf[0x8f] = function () { r.a = r.resBit_8bit(1, r.a); return 8; }
	// res 1, b
	eocf[0x88] = function () { r.b = r.resBit_8bit(1, r.b); return 8; }
	// res 1, c
	eocf[0x89] = function () { r.c = r.resBit_8bit(1, r.c); return 8; }
	// res 1, d
	eocf[0x8a] = function () { r.d = r.resBit_8bit(1, r.d); return 8; }
	// res 1, e
	eocf[0x8b] = function () { r.e = r.resBit_8bit(1, r.e); return 8; }
	// res 1, h
	eocf[0x8c] = function () { r.h = r.resBit_8bit(1, r.h); return 8; }
	// res 1, l
	eocf[0x8d] = function () { r.l = r.resBit_8bit(1, r.l); return 8; }

	//****** res 2, r ******
	// res 2, a
	eocf[0x97] = function () { r.a = r.resBit_8bit(2, r.a); return 8; }
	// res 2, b
	eocf[0x90] = function () { r.b = r.resBit_8bit(2, r.b); return 8; }
	// res 2, c
	eocf[0x91] = function () { r.c = r.resBit_8bit(2, r.c); return 8; }
	// res 2, d
	eocf[0x92] = function () { r.d = r.resBit_8bit(2, r.d); return 8; }
	// res 2, e
	eocf[0x93] = function () { r.e = r.resBit_8bit(2, r.e); return 8; }
	// res 2, h
	eocf[0x94] = function () { r.h = r.resBit_8bit(2, r.h); return 8; }
	// res 2, l
	eocf[0x95] = function () { r.l = r.resBit_8bit(2, r.l); return 8; }

	//****** res 3, r ******
	// res 3, a
	eocf[0x9f] = function () { r.a = r.resBit_8bit(3, r.a); return 8; }
	// res 3, b
	eocf[0x98] = function () { r.b = r.resBit_8bit(3, r.b); return 8; }
	// res 3, c
	eocf[0x99] = function () { r.c = r.resBit_8bit(3, r.c); return 8; }
	// res 3, d
	eocf[0x9a] = function () { r.d = r.resBit_8bit(3, r.d); return 8; }
	// res 3, e
	eocf[0x9b] = function () { r.e = r.resBit_8bit(3, r.e); return 8; }
	// res 3, h
	eocf[0x9c] = function () { r.h = r.resBit_8bit(3, r.h); return 8; }
	// res 3, l
	eocf[0x9d] = function () { r.l = r.resBit_8bit(3, r.l); return 8; }

	//****** res 4, r ******
	// res 4, a
	eocf[0xa7] = function () { r.a = r.resBit_8bit(4, r.a); return 8; }
	// res 4, b
	eocf[0xa0] = function () { r.b = r.resBit_8bit(4, r.b); return 8; }
	// res 4, c
	eocf[0xa1] = function () { r.c = r.resBit_8bit(4, r.c); return 8; }
	// res 4, d
	eocf[0xa2] = function () { r.d = r.resBit_8bit(4, r.d); return 8; }
	// res 4, e
	eocf[0xa3] = function () { r.e = r.resBit_8bit(4, r.e); return 8; }
	// res 4, h
	eocf[0xa4] = function () { r.h = r.resBit_8bit(4, r.h); return 8; }
	// res 4, l
	eocf[0xa5] = function () { r.l = r.resBit_8bit(4, r.l); return 8; }

	//****** res 5, r ******
	// res 5, a
	eocf[0xaf] = function () { r.a = r.resBit_8bit(5, r.a); return 8; }
	// res 5, b
	eocf[0xa8] = function () { r.b = r.resBit_8bit(5, r.b); return 8; }
	// res 5, c
	eocf[0xa9] = function () { r.c = r.resBit_8bit(5, r.c); return 8; }
	// res 5, d
	eocf[0xaa] = function () { r.d = r.resBit_8bit(5, r.d); return 8; }
	// res 5, e
	eocf[0xab] = function () { r.e = r.resBit_8bit(5, r.e); return 8; }
	// res 5, h
	eocf[0xac] = function () { r.h = r.resBit_8bit(5, r.h); return 8; }
	// res 5, l
	eocf[0xad] = function () { r.l = r.resBit_8bit(5, r.l); return 8; }

	//****** res 6, r ******
	// res 6, a
	eocf[0xb7] = function () { r.a = r.resBit_8bit(6, r.a); return 8; }
	// res 6, b
	eocf[0xb0] = function () { r.b = r.resBit_8bit(6, r.b); return 8; }
	// res 6, c
	eocf[0xb1] = function () { r.c = r.resBit_8bit(6, r.c); return 8; }
	// res 6, d
	eocf[0xb2] = function () { r.d = r.resBit_8bit(6, r.d); return 8; }
	// res 6, e
	eocf[0xb3] = function () { r.e = r.resBit_8bit(6, r.e); return 8; }
	// res 6, h
	eocf[0xb4] = function () { r.h = r.resBit_8bit(6, r.h); return 8; }
	// res 6, l
	eocf[0xb5] = function () { r.l = r.resBit_8bit(6, r.l); return 8; }

	//****** res 7, r ******
	// res 7, a
	eocf[0xbf] = function () { r.a = r.resBit_8bit(7, r.a); return 8; }
	// res 7, b
	eocf[0xb8] = function () { r.b = r.resBit_8bit(7, r.b); return 8; }
	// res 7, c
	eocf[0xb9] = function () { r.c = r.resBit_8bit(7, r.c); return 8; }
	// res 7, d
	eocf[0xba] = function () { r.d = r.resBit_8bit(7, r.d); return 8; }
	// res 7, e
	eocf[0xbb] = function () { r.e = r.resBit_8bit(7, r.e); return 8; }
	// res 7, h
	eocf[0xbc] = function () { r.h = r.resBit_8bit(7, r.h); return 8; }
	// res 7, l
	eocf[0xbd] = function () { r.l = r.resBit_8bit(7, r.l); return 8; }

	//****** set 0, r ******
	// set 0, a
	eocf[0xc7] = function () { r.a = r.setBit_8bit(0, r.a); return 8; }
	// set 0, b
	eocf[0xc0] = function () { r.b = r.setBit_8bit(0, r.b); return 8; }
	// set 0, c
	eocf[0xc1] = function () { r.c = r.setBit_8bit(0, r.c); return 8; }
	// set 0, d
	eocf[0xc2] = function () { r.d = r.setBit_8bit(0, r.d); return 8; }
	// set 0, e
	eocf[0xc3] = function () { r.e = r.setBit_8bit(0, r.e); return 8; }
	// set 0, h
	eocf[0xc4] = function () { r.h = r.setBit_8bit(0, r.h); return 8; }
	// set 0, l
	eocf[0xc5] = function () { r.l = r.setBit_8bit(0, r.l); return 8; }

	//****** set 1, r ******
	// set 1, a
	eocf[0xcf] = function () { r.a = r.setBit_8bit(1, r.a); return 8; }
	// set 1, b
	eocf[0xc8] = function () { r.b = r.setBit_8bit(1, r.b); return 8; }
	// set 1, c
	eocf[0xc9] = function () { r.c = r.setBit_8bit(1, r.c); return 8; }
	// set 1, d
	eocf[0xca] = function () { r.d = r.setBit_8bit(1, r.d); return 8; }
	// set 1, e
	eocf[0xcb] = function () { r.e = r.setBit_8bit(1, r.e); return 8; }
	// set 1, h
	eocf[0xcc] = function () { r.h = r.setBit_8bit(1, r.h); return 8; }
	// set 1, l
	eocf[0xcd] = function () { r.l = r.setBit_8bit(1, r.l); return 8; }

	//****** set 2, r ******
	// set 2, a
	eocf[0xd7] = function () { r.a = r.setBit_8bit(2, r.a); return 8; }
	// set 2, b
	eocf[0xd0] = function () { r.b = r.setBit_8bit(2, r.b); return 8; }
	// set 2, c
	eocf[0xd1] = function () { r.c = r.setBit_8bit(2, r.c); return 8; }
	// set 2, d
	eocf[0xd2] = function () { r.d = r.setBit_8bit(2, r.d); return 8; }
	// set 2, e
	eocf[0xd3] = function () { r.e = r.setBit_8bit(2, r.e); return 8; }
	// set 2, h
	eocf[0xd4] = function () { r.h = r.setBit_8bit(2, r.h); return 8; }
	// set 2, l
	eocf[0xd5] = function () { r.l = r.setBit_8bit(2, r.l); return 8; }

	//****** set 3, r ******
	// set 3, a
	eocf[0xdf] = function () { r.a = r.setBit_8bit(3, r.a); return 8; }
	// set 3, b
	eocf[0xd8] = function () { r.b = r.setBit_8bit(3, r.b); return 8; }
	// set 3, c
	eocf[0xd9] = function () { r.c = r.setBit_8bit(3, r.c); return 8; }
	// set 3, d
	eocf[0xda] = function () { r.d = r.setBit_8bit(3, r.d); return 8; }
	// set 3, e
	eocf[0xdb] = function () { r.e = r.setBit_8bit(3, r.e); return 8; }
	// set 3, h
	eocf[0xdc] = function () { r.h = r.setBit_8bit(3, r.h); return 8; }
	// set 3, l
	eocf[0xdd] = function () { r.l = r.setBit_8bit(3, r.l); return 8; }

	//****** set 4, r ******
	// set 4, a
	eocf[0xe7] = function () { r.a = r.setBit_8bit(4, r.a); return 8; }
	// set 4, b
	eocf[0xe0] = function () { r.b = r.setBit_8bit(4, r.b); return 8; }
	// set 4, c
	eocf[0xe1] = function () { r.c = r.setBit_8bit(4, r.c); return 8; }
	// set 4, d
	eocf[0xe2] = function () { r.d = r.setBit_8bit(4, r.d); return 8; }
	// set 4, e
	eocf[0xe3] = function () { r.e = r.setBit_8bit(4, r.e); return 8; }
	// set 4, h
	eocf[0xe4] = function () { r.h = r.setBit_8bit(4, r.h); return 8; }
	// set 4, l
	eocf[0xe5] = function () { r.l = r.setBit_8bit(4, r.l); return 8; }

	//****** set 5, r ******
	// set 5, a
	eocf[0xef] = function () { r.a = r.setBit_8bit(5, r.a); return 8; }
	// set 5, b
	eocf[0xe8] = function () { r.b = r.setBit_8bit(5, r.b); return 8; }
	// set 5, c
	eocf[0xe9] = function () { r.c = r.setBit_8bit(5, r.c); return 8; }
	// set 5, d
	eocf[0xea] = function () { r.d = r.setBit_8bit(5, r.d); return 8; }
	// set 5, e
	eocf[0xeb] = function () { r.e = r.setBit_8bit(5, r.e); return 8; }
	// set 5, h
	eocf[0xec] = function () { r.h = r.setBit_8bit(5, r.h); return 8; }
	// set 5, l
	eocf[0xed] = function () { r.l = r.setBit_8bit(5, r.l); return 8; }

	//****** set 6, r ******
	// set 6, a
	eocf[0xf7] = function () { r.a = r.setBit_8bit(6, r.a); return 8; }
	// set 6, b
	eocf[0xf0] = function () { r.b = r.setBit_8bit(6, r.b); return 8; }
	// set 6, c
	eocf[0xf1] = function () { r.c = r.setBit_8bit(6, r.c); return 8; }
	// set 6, d
	eocf[0xf2] = function () { r.d = r.setBit_8bit(6, r.d); return 8; }
	// set 6, e
	eocf[0xf3] = function () { r.e = r.setBit_8bit(6, r.e); return 8; }
	// set 6, h
	eocf[0xf4] = function () { r.h = r.setBit_8bit(6, r.h); return 8; }
	// set 6, l
	eocf[0xf5] = function () { r.l = r.setBit_8bit(6, r.l); return 8; }

	//****** set 7, r ******
	// set 7, a
	eocf[0xff] = function () { r.a = r.setBit_8bit(7, r.a); return 8; }
	// set 7, b
	eocf[0xf8] = function () { r.b = r.setBit_8bit(7, r.b); return 8; }
	// set 7, c
	eocf[0xf9] = function () { r.c = r.setBit_8bit(7, r.c); return 8; }
	// set 7, d
	eocf[0xfa] = function () { r.d = r.setBit_8bit(7, r.d); return 8; }
	// set 7, e
	eocf[0xfb] = function () { r.e = r.setBit_8bit(7, r.e); return 8; }
	// set 7, h
	eocf[0xfc] = function () { r.h = r.setBit_8bit(7, r.h); return 8; }
	// set 7, l
	eocf[0xfd] = function () { r.l = r.setBit_8bit(7, r.l); return 8; }

	//****** [Bit shift op] (hl) ******
	// rlc (hl)
	eocf[0x06] = function () { var addr = r.get_hl(); wb(addr, r.rlc_8bit(rb(addr))); return 16; }
	// rl (hl)
	eocf[0x16] = function () { var addr = r.get_hl(); wb(addr, r.rl_8bit(rb(addr))); return 16; }
	// rrc (hl)
	eocf[0x0e] = function () { var addr = r.get_hl(); wb(addr, r.rrc_8bit(rb(addr))); return 16; }
	// rr (hl)
	eocf[0x1e] = function () { var addr = r.get_hl(); wb(addr, r.rr_8bit(rb(addr))); return 16; }
	// sla (hl)
	eocf[0x26] = function () { var addr = r.get_hl(); wb(addr, r.sla_8bit(rb(addr))); return 16; }
	// sra (hl)
	eocf[0x2e] = function () { var addr = r.get_hl(); wb(addr, r.sra_8bit(rb(addr))); return 16; }
	// srl (hl)
	eocf[0x3e] = function () { var addr = r.get_hl(); wb(addr, r.srl_8bit(rb(addr))); return 16; }
	// swap (hl)
	eocf[0x36] = function () { var addr = r.get_hl(); wb(addr, r.swap_8bit(rb(addr))); return 16; }

	//****** bit n, (hl) ******
	// bit 0, (hl)
	eocf[0x46] = function () { r.checkBit_8bit(0, rb(r.get_hl())); return 12; }
	// bit 1, (hl)
	eocf[0x4e] = function () { r.checkBit_8bit(1, rb(r.get_hl())); return 12; }
	// bit 2, (hl)
	eocf[0x56] = function () { r.checkBit_8bit(2, rb(r.get_hl())); return 12; }
	// bit 3, (hl)
	eocf[0x5e] = function () { r.checkBit_8bit(3, rb(r.get_hl())); return 12; }
	// bit 4, (hl)
	eocf[0x66] = function () { r.checkBit_8bit(4, rb(r.get_hl())); return 12; }
	// bit 5, (hl
	eocf[0x6e] = function () { r.checkBit_8bit(5, rb(r.get_hl())); return 12; }
	// bit 6, (hl)
	eocf[0x76] = function () { r.checkBit_8bit(6, rb(r.get_hl())); return 12; }
	// bit 7, (hl)
	eocf[0x7e] = function () { r.checkBit_8bit(7, rb(r.get_hl())); return 12; }

	//****** res n, (hl) ******
	// res 0, (hl)
	eocf[0x86] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(0, rb(addr))); return 16; }
	// res 1, (hl)
	eocf[0x8e] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(1, rb(addr))); return 16; }
	// res 2, (hl)
	eocf[0x96] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(2, rb(addr))); return 16; }
	// res 3, (hl)
	eocf[0x9e] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(3, rb(addr))); return 16; }
	// res 4, (hl)
	eocf[0xa6] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(4, rb(addr))); return 16; }
	// res 5, (hl)
	eocf[0xae] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(5, rb(addr))); return 16; }
	// res 6, (hl)
	eocf[0xb6] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(6, rb(addr))); return 16; }
	// res 7, (hl)
	eocf[0xbe] = function () { var addr = r.get_hl(); wb(addr, r.resBit_8bit(7, rb(addr))); return 16; }

	//****** set n, (hl) ******
	// set 0, (hl)
	eocf[0xc6] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(0, rb(addr))); return 16; }
	// set 1, (hl)
	eocf[0xce] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(1, rb(addr))); return 16; }
	// set 2, (hl)
	eocf[0xd6] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(2, rb(addr))); return 16; }
	// set 3, (hl)
	eocf[0xde] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(3, rb(addr))); return 16; }
	// set 4, (hl)
	eocf[0xe6] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(4, rb(addr))); return 16; }
	// set 5, (hl)
	eocf[0xee] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(5, rb(addr))); return 16; }
	// set 6, (hl)
	eocf[0xf6] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(6, rb(addr))); return 16; }
	// set 7, (hl)
	eocf[0xfe] = function () { var addr = r.get_hl(); wb(addr, r.setBit_8bit(7, rb(addr))); return 16; }
}