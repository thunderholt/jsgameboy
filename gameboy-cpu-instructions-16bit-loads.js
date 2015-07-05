function Gameboy_MixInCpuInstructions_16BitLoads(system) {

	/*
		r = 8 bit register.
		rr = 16 bit register.
		n = 8 bit binary number.
		nn = 16 bit binary number.
		e = 8 bit signed number.
	*/

	var ocf = system.cpu.opCodeFunctions; 
	var r = system.cpu.registers;
	var rb = function (address) { return system.memory.readByte(address); }
	var rw = function (address) { return system.memory.readWord(address); }
	var wb = function (address, value) { system.memory.writeByte(address, value); }
	var ww = function (address, value) { system.memory.writeWord(address, value); }

	//****** ld rr,nn ******
	// ld bc,nn
	ocf[0x01] = function () { r.c = rb(r.pc); r.inc_pc(); r.b = rb(r.pc); r.inc_pc(); return 12; };
	// ld de,nn
	ocf[0x11] = function () { r.e = rb(r.pc); r.inc_pc(); r.d = rb(r.pc); r.inc_pc(); return 12; };
	// ld hl,nn
	ocf[0x21] = function () { r.l = rb(r.pc); r.inc_pc(); r.h = rb(r.pc); r.inc_pc(); /*console.log("HL set to 0x" + r.get_hl().toString(16) + " @ 0x" + ((r.pc - 2).toString(16)));*/ return 12; };
	// ld sp,nn
	ocf[0x31] = function () { r.sp = rw(r.pc); r.inc2_pc(); return 12; };

	//****** push rr ******
	// push bc
	ocf[0xc5] = function () { r.dec_sp(); wb(r.sp, r.b); r.dec_sp(); wb(r.sp, r.c); return 16; };
	// push de
	ocf[0xd5] = function () { r.dec_sp(); wb(r.sp, r.d); r.dec_sp(); wb(r.sp, r.e); return 16; };
	// push hl
	ocf[0xe5] = function () { r.dec_sp(); wb(r.sp, r.h); r.dec_sp(); wb(r.sp, r.l); return 16; };
	// push af
	ocf[0xf5] = function () { r.dec_sp(); wb(r.sp, r.a); r.dec_sp(); wb(r.sp, r.f & 0xf0); return 16; };

	//****** pop rr ******
	// pop bc
	ocf[0xc1] = function () { r.c = rb(r.sp); r.inc_sp(); r.b = rb(r.sp); r.inc_sp(); return 12; };
	// pop de
	ocf[0xd1] = function () { r.e = rb(r.sp); r.inc_sp(); r.d = rb(r.sp); r.inc_sp(); return 12; };
	// pop hl
	ocf[0xe1] = function () { r.l = rb(r.sp); r.inc_sp(); r.h = rb(r.sp); r.inc_sp(); return 12; };
	// pop af
	ocf[0xf1] = function () { r.f = rb(r.sp) & 0xf0; r.inc_sp(); r.a = rb(r.sp); r.inc_sp(); return 12; };

	//****** Misc ******
	// ld (nn),sp
	ocf[0x08] = function () { ww(rw(r.pc), r.sp); r.inc2_pc(); return 20; }
	// ld (hl),n
	ocf[0x36] = function () { wb(r.get_hl(), rb(r.pc)); r.inc_pc(); return 12; }
	// ldhl sp,e
	ocf[0xf8] = function () { r.set_hl(r.add_16bit_8bit_signed(r.sp, system.util.toSigned(rb(r.pc)))); r.inc_pc(); return 12; }
	// ld sp,hl
	ocf[0xf9] = function () { r.sp = (r.h << 8) | r.l; return 8; }
}