var LCD_MODE_READING_OAM = 2;
var LCD_MODE_READING_OAM_AND_VRAM = 3;
var LCD_MODE_HBLANK = 0;
var LCD_MODE_VBLANK = 1;

var VRAM_NUM_TILES = 384;
var VRAM_TILE_WIDTH_PIXELS = 8;
var VRAM_TILE_HEIGHT_PIXELS = 8;
var VRAM_TILE_WIDTH_BYTES = 2;
var VRAM_TILE_SIZE_BYTES = 16;
var VRAM_TILE_SIZE_PIXELS = 64;
var VRAM_TILEMAP_NUM_TILES_X = 32;
var VRAM_TILEMAP_NUM_TILES_Y = 32;
var VRAM_TILEMAP_TOTAL_TILES = 1024;
var VRAM_TILEMAP_WIDTH_PIXELS = VRAM_TILEMAP_NUM_TILES_X * VRAM_TILE_WIDTH_PIXELS;
var VRAM_TILEMAP_HEIGHT_PIXELS = VRAM_TILEMAP_NUM_TILES_Y * VRAM_TILE_HEIGHT_PIXELS;
var VRAM_MAX_SPRITES = 40;
var VRAM_SPRITE_SIZE_BYTES = 4;

var FRAMEBUFFER_WIDTH_PIXELS = 160;
var FRAMEBUFFER_HEIGHT_PIXELS = 160;

var MEMLOC_INTERRUPT_HANDLER_VBLANK = 0x0040;
var MEMLOC_INTERRUPT_HANDLER_LCDSTAT = 0x0048;
var MEMLOC_INTERRUPT_HANDLER_TIMER = 0x0050;
var MEMLOC_INTERRUPT_HANDLER_SERIAL = 0x0058;
var MEMLOC_INTERRUPT_HANDLER_JOYPAD = 0x0060;
var MEMLOC_TILESET0 = 0x8000;
var MEMLOC_TILESET1 = 0x8800;
var MEMLOC_TILEMAP0 = 0x9800;
var MEMLOC_TILEMAP1 = 0x9C00;
var MEMLOC_TILEDATA = 0x8000;
var MEMLOC_TILEDATA_END = 0x97FF;
var MEMLOC_TILEMAPS = 0x9800;
var MEMLOC_TILEMAPS_END = 0x9FFF;
var MEMLOC_SPRITE_ATTRIBUTE_TABLE = 0xFE00;
var MEMLOC_JOYPAD_REGISTER = 0xFF00;
var MEMLOC_LCD_CONTROL_REGISTER = 0xFF40;
var MEMLOC_LCD_STATUS_REGISTER = 0xFF41;
var MEMLOC_BGTILEMAP_SCROLLY = 0xFF42;
var MEMLOC_BGTILEMAP_SCROLLX = 0xFF43;
var MEMLOC_DMA_TRANSFER = 0xFF46;
var MEMLOC_SPRITE_PALETTE0 = 0xff48;
var MEMLOC_SPRITE_PALETTE1 = 0xff49;
var MEMLOC_WINDOWTILEMAP_SCROLLY = 0xFF4A;
var MEMLOC_WINDOWTILEMAP_SCROLLX = 0xFF4B;
var MEMLOC_SCANLINE_INDEX = 0xFF44;
var MEMLOC_LYC_REGISTER = 0xFF45;
var MEMLOC_TILEMAP_PALETTE = 0xFF47;
var MEMLOC_DIVIDER_REGISTER = 0xff04;
var MEMLOC_TIMER_COUNTER_REGISTER = 0xff05;
var MEMLOC_TIMER_MODULO_REGISTER = 0xff06;
var MEMLOC_TIMER_CONTROL_REGISTER = 0xff07;
var MEMLOC_INTERRUPT_FLAG_REGISTER = 0xFF0F;
var MEMLOC_INTERRUPT_ENABLE_REGISTER = 0xFFFF;

var INTERRUPT_ENABLED_VBLANK = 0x01;
var INTERRUPT_ENABLED_LCDSTAT = 0x02;
var INTERRUPT_ENABLED_TIMER = 0x04;
var INTERRUPT_ENABLED_SERIAL = 0x08;
var INTERRUPT_ENABLED_JOYPAD = 0x10;

var INTERRUPT_FLAG_VBLANK = 0x01;
var INTERRUPT_FLAG_LCDSTAT = 0x02;
var INTERRUPT_FLAG_TIMER = 0x04;
var INTERRUPT_FLAG_SERIAL = 0x08;
var INTERRUPT_FLAG_JOYPAD = 0x10;

var SPRITESIZE_8X8 = 0;
var SPRITESIZE_8X16 = 1;

function GameBoy() {
	
	var system = this;

	//this.frameIsRunning = false;
	this.lastFrameDuration = 0;
	this.terminate = false;
	this.terminated = true;

	this.start = function (romName) {

		var self = this;

		var epilogue = function () {

			self.terminated = false;

			self.reset();
			self.loadRom(romName, function () {

				self.mainLoop();
			});
		}

		if (!this.terminated) {
			console.log("Terminating...");
			this.terminate = true;

			this.waitForTerminationInterval = setInterval(function () {

				if (self.terminated) {
					clearInterval(self.waitForTerminationInterval);
					console.log("... Done");
					epilogue();
				}
			}, 
			500);

		} else {
			epilogue();
		}
	}

	this.init = function () {

		var self = this;

		Gameboy_MixInCpu(system);
		Gameboy_MixInGpu(system);
		Gameboy_MixInTimer(system);
		Gameboy_MixInJoypad(system);
		Gameboy_MixInMemory(system);

		this.canvas = document.getElementById("gameboy-canvas");
		this.canvasContext = this.canvas.getContext("2d");

		this.canvasContext.fillStyle = "#EFFFDE";
		this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.canvasContext.fillStyle = "#183442";
		this.canvasContext.font = "15px Courier";
		this.canvasContext.fillText("Choose a ROM from the top right menu...", 6, 14);

		this.memory.init();
		this.cpu.init();
		this.gpu.init();
		this.timer.init();
		this.joypad.init();

		setInterval(function () { self.updateStats(); }, 1000);
	}

	this.reset = function () {

		this.lastFrameDuration = 0;

		this.cpu.reset();
		this.gpu.reset();
		this.timer.reset();
		this.joypad.reset();
		this.memory.reset();

		//this.memory.writeByte(0xFF40, 0x11); // rLCDC
		this.memory.writeByte(0xFF41, 0x80); // rSTAT maybe?
		this.memory.writeByte(0xFF00, 0xFF); // JOYPAD maybe?

		this.memory.writeByte(0xFF05, 0x00); // TIMA
		this.memory.writeByte(0xFF06, 0x00); // TMA
		this.memory.writeByte(0xFF07, 0x00); // TAC
		this.memory.writeByte(0xFF10, 0x80); // NR10
		this.memory.writeByte(0xFF11, 0xBF); // NR11
		this.memory.writeByte(0xFF12, 0xF3); // NR12
		this.memory.writeByte(0xFF14, 0xBF); // NR14
		this.memory.writeByte(0xFF16, 0x3F); // NR21
		this.memory.writeByte(0xFF17, 0x00); // NR22
		this.memory.writeByte(0xFF19, 0xBF); // NR24
		this.memory.writeByte(0xFF1A, 0x7F); // NR30
		this.memory.writeByte(0xFF1B, 0xFF); // NR31
		this.memory.writeByte(0xFF1C, 0x9F); // NR32
		this.memory.writeByte(0xFF1E, 0xBF); // NR33
		this.memory.writeByte(0xFF20, 0xFF); // NR41
		this.memory.writeByte(0xFF21, 0x00); // NR42
		this.memory.writeByte(0xFF22, 0x00); // NR43
		this.memory.writeByte(0xFF23, 0xBF); // NR30
		this.memory.writeByte(0xFF24, 0x77); // NR50
		this.memory.writeByte(0xFF25, 0xF3); // NR51
		this.memory.writeByte(0xFF26, 0xF1); // NR52
		this.memory.writeByte(0xFF40, 0x91); // LCDC
		this.memory.writeByte(0xFF42, 0x00); // SCY
		this.memory.writeByte(0xFF43, 0x00); // SCX
		this.memory.writeByte(0xFF45, 0x00); // LYC
		this.memory.writeByte(0xFF47, 0xFC); // BGP
		this.memory.writeByte(0xFF48, 0xFF); // OBP0
		this.memory.writeByte(0xFF49, 0xFF); // OBP1
		this.memory.writeByte(0xFF4A, 0x00); // WY
		this.memory.writeByte(0xFF4B, 0x00); // WX
		this.memory.writeByte(0xFFFF, 0x00); // IE
	}

	this.loadRom = function (romName, callback) {

		var self = this;

		var request = new XMLHttpRequest();

		request.open("GET", "roms/" + romName, true);

		request.responseType = "arraybuffer";

		request.onload = function (e) {
	  		var arrayBuffer = request.response;
	  		if (arrayBuffer) {
	    		var byteArray = new Uint8Array(arrayBuffer);
		    
		    	var bankNumber = 0;
		    	var bankCounter = 0;
		    	for (var i = 0; i < byteArray.byteLength; i++) {
		      		self.memory.romBanks[bankNumber][bankCounter] = byteArray[i];
		      		bankCounter++;
		      		if (bankCounter == 0x4000) {
		      			bankNumber++;
		      			bankCounter = 0;
		      			console.log("Loading bank " + bankNumber);
		      		}
			    }

			    callback();
	  		}
		};

		request.send(null);
	}

	this.mainLoop = function () {

		var self = this;

		var frameFunction = null;
		frameFunction = function () { 
			self.runFrame(); 

			if (self.terminate) {
				self.terminate = false;
				self.terminated = true;
			} else {
				requestAnimationFrame(frameFunction);
			}
		}

		self.startTime = new Date();
		frameFunction();
	}

	this.runFrame = function () {

		var startTime = performance.now();

		var numberOfAdditionalClocksAvailableForGpu = 0;

		var clocksThisFrame = 0;

		while (clocksThisFrame < 1000000) {

			var frameComplete = this.gpu.heartbeat(numberOfAdditionalClocksAvailableForGpu);

			if (frameComplete) {
				this.clocksLastFrame = clocksThisFrame;
				break;
			}

			var cpuClockExecuted = this.cpu.heartbeat();

			this.timer.heartbeat(cpuClockExecuted);

			numberOfAdditionalClocksAvailableForGpu = cpuClockExecuted;

			clocksThisFrame += numberOfAdditionalClocksAvailableForGpu;

			if (!this.gpu.registers.control.enabled && clocksThisFrame >= 70224) {
				this.clocksLastFrame = clocksThisFrame;
				break;
			}

		}

		var endTime = performance.now();

		this.lastFrameDuration = endTime - startTime;
	},

	this.updateStats = function () {

		if (this.startTime == null) {
			return;
		}

		var totalRunTimeSeconds = ((new Date()).getTime() - this.startTime.getTime()) / 1000;

		document.getElementById("statsTotalClocksExecuted").innerHTML = 
			this.cpu.totalClocksExecuted;

		var averageClocksPerSecond = (this.cpu.totalClocksExecuted / totalRunTimeSeconds);

		document.getElementById("statsAverageClocksPerSecond").innerHTML = 
			averageClocksPerSecond.toFixed(0) + " (" + ((averageClocksPerSecond / 4194304) * 100).toFixed(2) + "%)";

		document.getElementById("statsClocksLastFrame").innerHTML = 
			this.clocksLastFrame + " (" + ((this.clocksLastFrame / 70224) * 100).toFixed(2) + "%)";

		document.getElementById("statsLastFrameDuration").innerHTML = 
			this.lastFrameDuration.toFixed(2) + "ms";
	}

	this.util = {
		toSigned: function (v) {
			if (v >= 128) {
				v = -128 + (v & 0x7F);
			}

			return v;
		}
	}
}