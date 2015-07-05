function Gameboy_MixInCpuInstructions_16BitAlu(system) {

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

	//****** add hl,rr ******
	// add hl,bc
	ocf[0x09] = function () { r.set_hl(r.add_16bit(r.get_hl(), r.get_bc())); return 8; };
	// add hl,de
	ocf[0x19] = function () { r.set_hl(r.add_16bit(r.get_hl(), r.get_de())); return 8; };
	// add hl,hl
	ocf[0x29] = function () { r.set_hl(r.add_16bit(r.get_hl(), r.get_hl())); return 8; };
	// add hl,sp
	ocf[0x39] = function () { r.set_hl(r.add_16bit(r.get_hl(), r.sp)); return 8; };

	//****** inc rr ******
	// inc bc
	ocf[0x03] = function () { r.set_bc(r.inc_16bit(r.get_bc())); return 8; }
	// inc de
	ocf[0x13] = function () { r.set_de(r.inc_16bit(r.get_de())); return 8; }
	// inc hl
	ocf[0x23] = function () { r.set_hl(r.inc_16bit(r.get_hl())); return 8; }
	// inc sp
	ocf[0x33] = function () { r.sp = r.inc_16bit(r.sp); return 8; }

	//****** dec rr ******
	// dec bc
	ocf[0x0b] = function () { r.set_bc(r.dec_16bit(r.get_bc())); return 8; }
	// dec de
	ocf[0x1b] = function () { r.set_de(r.dec_16bit(r.get_de())); return 8; }
	// dec hl
	ocf[0x2b] = function () { r.set_hl(r.dec_16bit(r.get_hl())); return 8; }
	// dec sp
	ocf[0x3b] = function () { r.sp = r.dec_16bit(r.sp); return 8; }

	//****** Misc ******
	// add sp, nn
	ocf[0xe8] = function () { r.sp = r.add_16bit_8bit_signed(r.sp, rb(r.pc)); r.inc_pc(); return 16; }
}