function Gameboy_MixInCpuInstructions_Jumps(system) {

	/*
		r = 8 bit register.
		rr = 16 bit register.
		n = 8 bit binary number.
		nn = 16 bit binary number.
		e = 8 bit signed number.
		c = condition
	*/

	var ocf = system.cpu.opCodeFunctions; 
	var r = system.cpu.registers;
	var rb = function (address) { return system.memory.readByte(address); }
	var rw = function (address) { return system.memory.readWord(address); }
	var wb = function (address, value) { system.memory.writeByte(address, value); }
	var ww = function (address, value) { system.memory.writeWord(address, value); }

	var conditionalAbsoluteJump = function (conditionIsTrue) {

		var addr = rw(r.pc);
		r.inc2_pc();

		if (conditionIsTrue) {
			
			r.pc = addr;
			return 16;

		} else {
			
			return 12;
		}
	}

	var conditionalRelativeJump = function (conditionIsTrue) {

		var offset = rb(r.pc);
		r.inc_pc();

		if (conditionIsTrue) {
			
			r.add_signed_pc(offset);
			return 12;

		} else {
			
			return 8;
		}
	}

	//****** Absolute jumps ******
	// jp nn
	ocf[0xc3] = function () { return conditionalAbsoluteJump(true); };
	// jp (hl)
	ocf[0xe9] = function () { r.pc = r.get_hl(); return 4; };
	// jp z,nn
	ocf[0xca] = function () { return conditionalAbsoluteJump(r.zeroFlagIsSet()); };
	// jp nz,nn
	ocf[0xc2] = function () { return conditionalAbsoluteJump(!r.zeroFlagIsSet()); };
	// jp c,nn
	ocf[0xda] = function () { return conditionalAbsoluteJump(r.carryFlagIsSet()); };
	// jp nc,nn
	ocf[0xd2] = function () { return conditionalAbsoluteJump(!r.carryFlagIsSet()); };
	

	//****** Relative jumps ******

	// jr e
	ocf[0x18] = function () { return conditionalRelativeJump(true); };
	// jr z,e
	ocf[0x28] = function () { return conditionalRelativeJump(r.zeroFlagIsSet()); };
	// jr nz,e
	ocf[0x20] = function () { return conditionalRelativeJump(!r.zeroFlagIsSet()); };
	// jr c,e
	ocf[0x38] = function () { return conditionalRelativeJump(r.carryFlagIsSet()); };
	// jr nc,e
	ocf[0x30] = function () { return conditionalRelativeJump(!r.carryFlagIsSet()); };
}