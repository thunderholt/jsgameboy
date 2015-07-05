function Gameboy_MixInCpuInstructions_8BitAlu(system) {

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

	//****** add a,r ******
	// add a,a
	ocf[0x87] = function () { r.a = r.add_8bit(r.a, r.a); return 4; };
	// add a,b
	ocf[0x80] = function () { r.a = r.add_8bit(r.a, r.b); return 4; };
	// add a,c
	ocf[0x81] = function () { r.a = r.add_8bit(r.a, r.c); return 4; };
	// add a,d
	ocf[0x82] = function () { r.a = r.add_8bit(r.a, r.d); return 4; };
	// add a,e
	ocf[0x83] = function () { r.a = r.add_8bit(r.a, r.e); return 4; };
	// add a,h
	ocf[0x84] = function () { r.a = r.add_8bit(r.a, r.h); return 4; };
	// add a,l
	ocf[0x85] = function () { r.a = r.add_8bit(r.a, r.l); return 4; };

	//****** adc a,r ******
	// adc a,a
	ocf[0x8f] = function () { r.a = r.adc_8bit(r.a, r.a); return 4; };
	// adc a,b
	ocf[0x88] = function () { r.a = r.adc_8bit(r.a, r.b); return 4; };
	// adc a,c
	ocf[0x89] = function () { r.a = r.adc_8bit(r.a, r.c); return 4; };
	// adc a,d
	ocf[0x8a] = function () { r.a = r.adc_8bit(r.a, r.d); return 4; };
	// adc a,e
	ocf[0x8b] = function () { r.a = r.adc_8bit(r.a, r.e); return 4; };
	// adc a,h
	ocf[0x8c] = function () { r.a = r.adc_8bit(r.a, r.h); return 4; };
	// adc a,l
	ocf[0x8d] = function () { r.a = r.adc_8bit(r.a, r.l); return 4; };

	//****** sub a,r ******
	// sub a,a
	ocf[0x97] = function () { r.a = r.sub_8bit(r.a, r.a); return 4; }
	// sub a,b
	ocf[0x90] = function () { r.a = r.sub_8bit(r.a, r.b); return 4; }
	// sub a,c
	ocf[0x91] = function () { r.a = r.sub_8bit(r.a, r.c); return 4; }
	// sub a,d
	ocf[0x92] = function () { r.a = r.sub_8bit(r.a, r.d); return 4; }
	// sub a,e
	ocf[0x93] = function () { r.a = r.sub_8bit(r.a, r.e); return 4; }
	// sub a,h
	ocf[0x94] = function () { r.a = r.sub_8bit(r.a, r.h); return 4; }
	// sub a,l
	ocf[0x95] = function () { r.a = r.sub_8bit(r.a, r.l); return 4; }

	//****** sbc a,r ******
	// sbc a,a
	ocf[0x9f] = function () { r.a = r.sbc_8bit(r.a, r.a); return 4; }
	// sbc a,b
	ocf[0x98] = function () { r.a = r.sbc_8bit(r.a, r.b); return 4; }
	// sbc a,c
	ocf[0x99] = function () { r.a = r.sbc_8bit(r.a, r.c); return 4; }
	// sbc a,d
	ocf[0x9a] = function () { r.a = r.sbc_8bit(r.a, r.d); return 4; }
	// sbc a,e
	ocf[0x9b] = function () { r.a = r.sbc_8bit(r.a, r.e); return 4; }
	// sbc a,h
	ocf[0x9c] = function () { r.a = r.sbc_8bit(r.a, r.h); return 4; }
	// sbc a,l
	ocf[0x9d] = function () { r.a = r.sbc_8bit(r.a, r.l); return 4; }

	//****** inc r ******
	// inc a
	ocf[0x3c] = function () { r.a = r.inc_8bit(r.a); return 4; }
	// inc b
	ocf[0x04] = function () { r.b = r.inc_8bit(r.b); return 4; }
	// inc c
	ocf[0x0c] = function () { r.c = r.inc_8bit(r.c); return 4; }
	// inc d
	ocf[0x14] = function () { r.d = r.inc_8bit(r.d); return 4; }
	// inc e
	ocf[0x1c] = function () { r.e = r.inc_8bit(r.e); return 4; }
	// inc h
	ocf[0x24] = function () { r.h = r.inc_8bit(r.h); return 4; }
	// inc l
	ocf[0x2c] = function () { r.l = r.inc_8bit(r.l); return 4; }

	//****** dec r ******
	// dec a
	ocf[0x3d] = function () { r.a = r.dec_8bit(r.a); return 4; }
	// dec b
	ocf[0x05] = function () { r.b = r.dec_8bit(r.b); return 4; }
	// dec c
	ocf[0x0d] = function () { r.c = r.dec_8bit(r.c); return 4; }
	// dec d
	ocf[0x15] = function () { r.d = r.dec_8bit(r.d); return 4; }
	// dec e
	ocf[0x1d] = function () { r.e = r.dec_8bit(r.e); return 4; }
	// dec h
	ocf[0x25] = function () { r.h = r.dec_8bit(r.h); return 4; }
	// dec l
	ocf[0x2d] = function () { r.l = r.dec_8bit(r.l); return 4; }

	//****** and r ******
	// and a
	ocf[0xa7] = function () { r.a = r.and_8bit(r.a, r.a); return 4; }
	// and b
	ocf[0xa0] = function () { r.a = r.and_8bit(r.a, r.b); return 4; }
	// and c
	ocf[0xa1] = function () { r.a = r.and_8bit(r.a, r.c); return 4; }
	// and d
	ocf[0xa2] = function () { r.a = r.and_8bit(r.a, r.d); return 4; }
	// and e
	ocf[0xa3] = function () { r.a = r.and_8bit(r.a, r.e); return 4; }
	// and h
	ocf[0xa4] = function () { r.a = r.and_8bit(r.a, r.h); return 4; }
	// and l
	ocf[0xa5] = function () { r.a = r.and_8bit(r.a, r.l); return 4; }

	//****** or r ******
	// or a
	ocf[0xb7] = function () { r.a = r.or_8bit(r.a, r.a); return 4; }
	// or b
	ocf[0xb0] = function () { r.a = r.or_8bit(r.a, r.b); return 4; }
	// or c
	ocf[0xb1] = function () { r.a = r.or_8bit(r.a, r.c); return 4; }
	// or d
	ocf[0xb2] = function () { r.a = r.or_8bit(r.a, r.d); return 4; }
	// or e
	ocf[0xb3] = function () { r.a = r.or_8bit(r.a, r.e); return 4; }
	// or h
	ocf[0xb4] = function () { r.a = r.or_8bit(r.a, r.h); return 4; }
	// or l
	ocf[0xb5] = function () { r.a = r.or_8bit(r.a, r.l); return 4; }

	//****** xor r ******
	// xor a
	ocf[0xaf] = function () { r.a = r.xor_8bit(r.a, r.a); return 4; }
	// xor b
	ocf[0xa8] = function () { r.a = r.xor_8bit(r.a, r.b); return 4; }
	// xor c
	ocf[0xa9] = function () { r.a = r.xor_8bit(r.a, r.c); return 4; }
	// xor d
	ocf[0xaa] = function () { r.a = r.xor_8bit(r.a, r.d); return 4; }
	// xor e
	ocf[0xab] = function () { r.a = r.xor_8bit(r.a, r.e); return 4; }
	// xor h
	ocf[0xac] = function () { r.a = r.xor_8bit(r.a, r.h); return 4; }
	// xor l
	ocf[0xad] = function () { r.a = r.xor_8bit(r.a, r.l); return 4; }

	//****** cp r ******
	// cp a
	ocf[0xbf] = function () { r.sub_8bit(r.a, r.a); return 4; }
	// cp b
	ocf[0xb8] = function () { r.sub_8bit(r.a, r.b); return 4; }
	// cp c
	ocf[0xb9] = function () { r.sub_8bit(r.a, r.c); return 4; }
	// cp d
	ocf[0xba] = function () { r.sub_8bit(r.a, r.d); return 4; }
	// cp e
	ocf[0xbb] = function () { r.sub_8bit(r.a, r.e); return 4; }
	// cp h
	ocf[0xbc] = function () { r.sub_8bit(r.a, r.h); return 4; }
	// cp l
	ocf[0xbd] = function () { r.sub_8bit(r.a, r.l); return 4; }

	//****** [op] a, (hl) ******
	// add a, (hl)
	ocf[0x86] = function () { r.a = r.add_8bit(r.a, rb(r.get_hl())); return 8; };
	// adc a, (hl)
	ocf[0x8e] = function () { r.a = r.adc_8bit(r.a, rb(r.get_hl())); return 8; };
	// sub a, (hl)
	ocf[0x96] = function () { r.a = r.sub_8bit(r.a, rb(r.get_hl())); return 8; };
	// sbc a, (hl)
	ocf[0x9e] = function () { r.a = r.sbc_8bit(r.a, rb(r.get_hl())); return 8; };

	//****** [op] (hl) ******
	// xor (hl)
	ocf[0xae] = function () { r.a = r.xor_8bit(r.a, rb(r.get_hl())); return 8; };
	// cp (hl)
	ocf[0xbe] = function () { r.sub_8bit(r.a, rb(r.get_hl())); return 8; };
	// and (hl)
	ocf[0xa6] = function () { r.a = r.and_8bit(r.a, rb(r.get_hl())); return 8; };
	// or (hl)
	ocf[0xb6] = function () { r.a = r.or_8bit(r.a, rb(r.get_hl())); return 8; };
	// inc (hl)
	ocf[0x34] = function () { var addr = r.get_hl(); wb(addr, r.inc_8bit(rb(addr))); return 12; }
	// dec (hl)
	ocf[0x35] = function () { var addr = r.get_hl(); wb(addr, r.dec_8bit(rb(addr))); return 12; }

	//****** [op] a, n ******
	// add a, n
	ocf[0xc6] = function () { r.a = r.add_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };
	// adc a, n
	ocf[0xce] = function () { r.a = r.adc_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };
	// sub a, n
	ocf[0xd6] = function () { r.a = r.sub_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };
	// sbc a, n
	ocf[0xde] = function () { r.a = r.sbc_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };
	// and a, n
	ocf[0xe6] = function () { r.a = r.and_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };
	// or a, n
	ocf[0xf6] = function () { r.a = r.or_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };
	// xor a, n
	ocf[0xee] = function () { r.a = r.xor_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; };

	//****** Misc ******
	// cp n
	ocf[0xfe] = function () { r.sub_8bit(r.a, rb(r.pc)); r.inc_pc(); return 8; }
}