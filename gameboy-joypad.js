function Gameboy_MixInJoypad(system) {

	system.joypad = {

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
	}
}