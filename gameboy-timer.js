function Gameboy_MixInTimer(system) {	

	system.timer = {

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
	}
}