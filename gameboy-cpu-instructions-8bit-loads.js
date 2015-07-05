function Gameboy_MixInCpuInstructions_8BitLoads(system) {

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

	//****** ld a,r ******
	// ld a,a
	ocf[0x7f] = function () { r.a = r.a; return 4; };
	// ld a,b
	ocf[0x78] = function () { r.a = r.b; return 4; };
	// ld a,c
	ocf[0x79] = function () { r.a = r.c; return 4; };
	// ld a,d
	ocf[0x7a] = function () { r.a = r.d; return 4; };
	// ld a,e
	ocf[0x7b] = function () { r.a = r.e; return 4; };
	// ld a,h
	ocf[0x7c] = function () { r.a = r.h; return 4; };
	// ld a,l
	ocf[0x7d] = function () { r.a = r.l; return 4; };

	//****** ld b,r ******
	// ld b,a
	ocf[0x47] = function () { r.b = r.a; return 4; };
	// ld b,b
	ocf[0x40] = function () { r.b = r.b; return 4; };
	// ld b,c
	ocf[0x41] = function () { r.b = r.c; return 4; };
	// ld b,d
	ocf[0x42] = function () { r.b = r.d; return 4; };
	// ld b,e
	ocf[0x43] = function () { r.b = r.e; return 4; };
	// ld b,h
	ocf[0x44] = function () { r.b = r.h; return 4; };
	// ld b,l
	ocf[0x45] = function () { r.b = r.l; return 4; };

	//****** ld c,r ******
	// ld c,a
	ocf[0x4f] = function () { r.c = r.a; return 4; };
	// ld c,b
	ocf[0x48] = function () { r.c = r.b; return 4; };
	// ld c,c
	ocf[0x49] = function () { r.c = r.c; return 4; };
	// ld c,d
	ocf[0x4a] = function () { r.c = r.d; return 4; };
	// ld c,e
	ocf[0x4b] = function () { r.c = r.e; return 4; };
	// ld c,h
	ocf[0x4c] = function () { r.c = r.h; return 4; };
	// ld c,l
	ocf[0x4d] = function () { r.c = r.l; return 4; };

	//****** ld d,r ******
	// ld d,a
	ocf[0x57] = function () { r.d = r.a; return 4; };
	// ld d,b
	ocf[0x50] = function () { r.d = r.b; return 4; };
	// ld d,c
	ocf[0x51] = function () { r.d = r.c; return 4; };
	// ld d,d
	ocf[0x52] = function () { r.d = r.d; return 4; };
	// ld d,e
	ocf[0x53] = function () { r.d = r.e; return 4; };
	// ld d,h
	ocf[0x54] = function () { r.d = r.h; return 4; };
	// ld d,l
	ocf[0x55] = function () { r.d = r.l; return 4; };

	//****** ld e,r ******
	// ld e,a
	ocf[0x5f] = function () { r.e = r.a; return 4; };
	// ld e,b
	ocf[0x58] = function () { r.e = r.b; return 4; };
	// ld e,c
	ocf[0x59] = function () { r.e = r.c; return 4; };
	// ld e,d
	ocf[0x5a] = function () { r.e = r.d; return 4; };
	// ld e,e
	ocf[0x5b] = function () { r.e = r.e; return 4; };
	// ld e,h
	ocf[0x5c] = function () { r.e = r.h; return 4; };
	// ld e,l
	ocf[0x5d] = function () { r.e = r.l; return 4; };

	//****** ld h,r ******
	// ld h,a
	ocf[0x67] = function () { r.h = r.a; return 4; };	
	// ld h,b
	ocf[0x60] = function () { r.h = r.b; return 4; };	
	// ld h,c
	ocf[0x61] = function () { r.h = r.c; return 4; };	
	// ld h,d
	ocf[0x62] = function () { r.h = r.d; return 4; };	
	// ld h,e
	ocf[0x63] = function () { r.h = r.e; return 4; };	
	// ld h,h
	ocf[0x64] = function () { r.h = r.h; return 4; };	
	// ld h,l
	ocf[0x65] = function () { r.h = r.l; return 4; };

	//****** ld l,r ******
	// ld l,a
	ocf[0x6f] = function () { r.l = r.a; return 4; };
	// ld l,b
	ocf[0x68] = function () { r.l = r.b; return 4; };
	// ld l,c
	ocf[0x69] = function () { r.l = r.c; return 4; };
	// ld l,d
	ocf[0x6a] = function () { r.l = r.d; return 4; };
	// ld l,e
	ocf[0x6b] = function () { r.l = r.e; return 4; };
	// ld l,h
	ocf[0x6c] = function () { r.l = r.h; return 4; };
	// ld l,l
	ocf[0x6d] = function () { r.l = r.l; return 4; };

	//****** ld r,n ******	
	// ld a,n
	ocf[0x3e] = function () { r.a = rb(r.pc); r.inc_pc(); return 8; };
	// ld b,n
	ocf[0x06] = function () { r.b = rb(r.pc); r.inc_pc(); return 8; };
	// ld c,n
	ocf[0x0e] = function () { r.c = rb(r.pc); r.inc_pc(); return 8; };
	// ld d,n
	ocf[0x16] = function () { r.d = rb(r.pc); r.inc_pc(); return 8; };
	// ld e,n
	ocf[0x1e] = function () { r.e = rb(r.pc); r.inc_pc(); return 8; };
	// ld h,n
	ocf[0x26] = function () { r.h = rb(r.pc); r.inc_pc(); return 8; };
	// ld l,n
	ocf[0x2e] = function () { r.l = rb(r.pc); r.inc_pc(); return 8; };

	//****** ld r,(rr) ******
	// ld a,(bc)
	ocf[0x0a] = function () { r.a = rb(r.get_bc()); return 8; };
	// ld a,(de)
	ocf[0x1a] = function () { r.a = rb(r.get_de()); return 8; };
	// ld a,(hl)
	ocf[0x7e] = function () { r.a = rb(r.get_hl()); return 8; };
	// ld b,(hl)
	ocf[0x46] = function () { r.b = rb(r.get_hl()); return 8; };
	// ld c,(hl)
	ocf[0x4e] = function () { r.c = rb(r.get_hl()); return 8; };
	// ld d,(hl)
	ocf[0x56] = function () { r.d = rb(r.get_hl()); return 8; };
	// ld e,(hl)
	ocf[0x5e] = function () { r.e = rb(r.get_hl()); return 8; };
	// ld h,(hl)
	ocf[0x66] = function () { r.h = rb(r.get_hl()); return 8; };
	// ld l,(hl)
	ocf[0x6e] = function () { r.l = rb(r.get_hl()); return 8; };

	//****** ld (rr),r ******
	// ld (bc),a
	ocf[0x02] = function () { wb(r.get_bc(), r.a); return 8; };
	// ld (de),a
	ocf[0x12] = function () { wb(r.get_de(), r.a); return 8; };
	// ld (hl),a
	ocf[0x77] = function () { wb(r.get_hl(), r.a); return 8; };
	// ld (hl),b
	ocf[0x70] = function () { wb(r.get_hl(), r.b); return 8; };
	// ld (hl),c
	ocf[0x71] = function () { wb(r.get_hl(), r.c); return 8; };
	// ld (hl),d
	ocf[0x72] = function () { wb(r.get_hl(), r.d); return 8; };
	// ld (hl),e
	ocf[0x73] = function () { wb(r.get_hl(), r.e); return 8; };
	// ld (hl),h
	ocf[0x74] = function () { wb(r.get_hl(), r.h); return 8; };
	// ld (hl),l
	ocf[0x75] = function () { wb(r.get_hl(), r.l); return 8; };

	//****** Misc ******
	// ldi (hl), a
	ocf[0x22] = function () { var hl = r.get_hl(); wb(hl, r.a); r.set_hl(r.inc_16bit(hl)); return 8; };
	// ldd (hl), a
	ocf[0x32] = function () { var hl = r.get_hl(); wb(hl, r.a); r.set_hl(r.dec_16bit(hl)); return 8; };
	// ld (nn), a
	ocf[0xea] = function () { wb(rw(r.pc), r.a); r.inc2_pc(); return 16; };
	// ldi a,(hl)
	ocf[0x2a] = function () { var hl = r.get_hl(); r.a = rb(hl); r.set_hl(r.inc_16bit(hl)); return 8; };
	// ldd a,(hl)
	ocf[0x3a] = function () { var hl = r.get_hl(); r.a = rb(hl); r.set_hl(r.dec_16bit(hl)); return 8; };
	// ldh (n),a
	ocf[0xe0] = function () { wb(0xff00 + rb(r.pc), r.a); r.inc_pc(); return 12; };
	// ldh a,(n)
	ocf[0xf0] = function () { r.a = rb(0xff00 + rb(r.pc)); r.inc_pc(); return 12; };
	// ld a,(nn)
	ocf[0xfa] = function () { r.a = rb(rw(r.pc)); r.inc2_pc(); return 16; };
	// ld (c),a
	ocf[0xe2] = function () { wb(0xff00 + r.c, r.a); return 8; }
	// ld a,(c)
	ocf[0xf2] = function () { r.a = rb(0xff00 + r.c); return 8; }
} 