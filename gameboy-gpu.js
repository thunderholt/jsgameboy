function Gameboy_MixInGpu(system) {	

	system.gpu = {

		clocksToRun: 0,
		modeCounter: 0,
		frameBuffer: null,
		registers: null,
		tiles: [],
		tileMaps: [],
		sprites: [],
		scanLineSamplingData: null,
		pixelToRgbLookup: [
			{ r: 239, g: 255, b: 222 },
			{ r: 173, g: 215, b: 148 },
			{ r: 82, g: 146, b: 115 },
			{ r: 24, g: 52, b: 66 }
		],

		init: function () {

			var self = this;

			this.frameBuffer = system.canvasContext.createImageData(
				FRAMEBUFFER_WIDTH_PIXELS * 3, FRAMEBUFFER_HEIGHT_PIXELS * 3);

			system.memory.bindIoPort(
				MEMLOC_LCD_CONTROL_REGISTER, 
				"LCD Control Register", 
				function () {
					return self.registers.control.byteValue;
				},
				function (value) {
					var r = self.registers.control;

					r.byteValue = value;
					r.enabled = (value & 0x80) > 0;
					r.bgEnabled = (value & 0x01) > 0;
					r.windowEnabled = (value & 0x20) > 0;
					r.spritesEnabled = (value & 0x02) > 0;
					r.spriteSize = (value & 0x04) == 0 ? SPRITESIZE_8X8 : SPRITESIZE_8X16;
					r.bgAndWindowTileSetNumber = (value & 0x10) > 0 ? 0 : 1;
					r.bgTileMapNumber = (value & 0x08) == 0 ? 0 : 1;
					r.windowTileMapNumber = (value & 0x40) == 0 ? 0 : 1;
				});

			system.memory.bindIoPort(
				MEMLOC_LCD_STATUS_REGISTER, 
				"LCD Status Register", 
				function () {
					var r = self.registers.status;
					var value = r.byteValue;
					value = (value & 0xfc) | r.mode;
					value = (value & 0x7b) | (r.coincidenceFlag ? 1 : 0);
					return value;
				},
				function (value) {
					var r = self.registers.status;

					r.byteValue = value;
					r.coincidenceInterruptEnabled = (value & 0x40) != 0;
					r.mode0InterruptEnabled = (value & 0x08) != 0;
					r.mode1InterruptEnabled = (value & 0x10) != 0;
					r.mode2InterruptEnabled = (value & 0x20) != 0;
				});

			system.memory.bindIoPort(
				MEMLOC_BGTILEMAP_SCROLLX, 
				"BG Tile Map Scroll X Register", 
				function () {
					return self.registers.bgTileMapScrollX;
				},
				function (value) {
					self.registers.bgTileMapScrollX = value;
				});

			system.memory.bindIoPort(
				MEMLOC_BGTILEMAP_SCROLLY, 
				"BG Tile Map Scroll Y Register", 
				function () {
					return self.registers.bgTileMapScrollY;
				},
				function (value) {
					self.registers.bgTileMapScrollY = value;
				});

			system.memory.bindIoPort(
				MEMLOC_WINDOWTILEMAP_SCROLLX, 
				"Window Tile Map Scroll X Register", 
				function () {
					return self.registers.windowTileMapScrollX;
				},
				function (value) {
					self.registers.windowTileMapScrollX = value;
				});

			system.memory.bindIoPort(
				MEMLOC_WINDOWTILEMAP_SCROLLY, 
				"Window Tile Map Scroll Y Register", 
				function () {
					return self.registers.windowTileMapScrollY;
				},
				function (value) {
					self.registers.windowTileMapScrollY = value;
				});

			system.memory.bindIoPort(
				MEMLOC_SCANLINE_INDEX, 
				"Scanline Index Register", 
				function () {
					return self.registers.scanLineIndex;
				},
				function (value) {
					self.registers.scanLineIndex = value;
				});

			system.memory.bindIoPort(
				MEMLOC_TILEMAP_PALETTE, 
				"Tile Map Palette Register", 
				function () {
					return self.registers.tileMapPalette.byteValue;
				},
				function (value) {
					var r = self.registers.tileMapPalette;

					r.byteValue = value;
					r.colours[0] = value & 0x03;
					r.colours[1] = (value & 0x0C) >> 2;
					r.colours[2] = (value & 0x30) >> 4;
					r.colours[3] = (value & 0xC0) >> 6;
				});

			system.memory.bindIoPort(
				MEMLOC_DMA_TRANSFER, 
				"DMA Transfer Register", 
				function () {
					return 0;
				},
				function (value) {
					var source = value << 8;

					for (var i = 0; i < 0xa0; i++) {

						var byteValue = system.memory.readByte(source + i);
						system.memory.writeByte(0xfe00 + i, byteValue);
					}
				});

			system.memory.bindIoPort(
				MEMLOC_SPRITE_PALETTE0, 
				"Sprite Palette 0 Register", 
				function () {
					return self.registers.spritePalette0.byteValue;
				},
				function (value) {
					var r = self.registers.spritePalette0;

					r.byteValue = value;
					r.colours[0] = value & 0x03;
					r.colours[1] = (value & 0x0C) >> 2;
					r.colours[2] = (value & 0x30) >> 4;
					r.colours[3] = (value & 0xC0) >> 6;
				});

			system.memory.bindIoPort(
				MEMLOC_SPRITE_PALETTE1, 
				"Sprite Palette 1 Register", 
				function () {
					return self.registers.spritePalette1.byteValue;
				},
				function (value) {
					var r = self.registers.spritePalette1;

					r.byteValue = value;
					r.colours[0] = value & 0x03;
					r.colours[1] = (value & 0x0C) >> 2;
					r.colours[2] = (value & 0x30) >> 4;
					r.colours[3] = (value & 0xC0) >> 6;
				});

			system.memory.bindIoPort(
				MEMLOC_LYC_REGISTER, 
				"LCD Y Coordinate Register", 
				function () {
					return self.registers.lyc;
				},
				function (value) {
					self.registers.lyc = value;
				});
		},

		reset: function () {

			this.clocksToRun = 0;
			this.modeCounter = 0;

			this.registers = {
				control: {
					byteValue: 0,
					enabled: false,
					bgEnabled: false,
					windowEnabled: false,
					spritesEnabled: false,
					bgAndWindowTileSetNumber: 0,
					bgTileMapNumber: 0,
					windowTileMapNumber: 0
				},
				status: {
					byteValue: 0,
					coincidenceInterruptEnabled: false,
					mode0InterruptEnabled: false,
					mode1InterruptEnabled: false,
					mode2InterruptEnabled: false,
					coincidenceFlag: 0,
					mode: 0
				},
				bgTileMapScrollX: 0,
				bgTileMapScrollY: 0,
				windowTileMapScrollX: 0,
				windowTileMapScrollY: 0,
				scanLineIndex: 0,
				tileMapPalette: { 
					byteValue: 0,
					colours: [0, 0, 0, 0]
				},
				spritePalette0: {
					byteValue: 0,
					colours: [0, 1, 2, 3]
				},
				spritePalette1: {
					byteValue: 0,
					colours: [0, 1, 2, 3]
				},
				lyc: 0
			};

			this.scanLineSamplingData = {

				bgTileMap: {
					scrollX: 0,
					scrollY: 0,
					offsetX: 0,
					offsetY: 0,
					tileMapRowIndex: 0,
					tilePixelRowIndex: 0 
				},
							
				windowTileMap: {
					skipScanLine: false,
					offsetX: 0,
					offsetY: 0,
					tileMapRowIndex: 0,
					tilePixelRowIndex: 0
				},

				sprites: {
					spritesOnScanline: []
				}
			};

			// Init the tile data.
			this.tiles = [];
			for (var i = 0; i < 384; i++) {

				var tile = [];
				for (var j = 0; j < VRAM_TILE_SIZE_PIXELS; j++) {
					tile[j] = 0;
				}

				this.tiles.push(tile);
			}

			// Init the tile maps.
			this.tileMaps = [];
			for (var i = 0; i < 2; i++) {

				var tileMap = [];
				for (var j = 0; j < VRAM_TILEMAP_TOTAL_TILES; j++) {
					tileMap[j] = 0;
				}

				this.tileMaps.push(tileMap);
			}

			// Init the sprites.
			this.sprites = [];
			for (var i = 0; i < VRAM_MAX_SPRITES; i++) {

				var sprite = {
					x: -8,
					y: -16,
					tileIndex: 0,
					attributes: {
						xFlip: false,
						yFlip: false,
						paletteNumber: 0,
						spriteToBgPriority: 0
					}
				}

				this.sprites.push(sprite);
			}
		},

		log: function (message) {

			console.log("GPU: " + message);
		},

		pokeVram: function (address, value) {

			if (address >= MEMLOC_TILEDATA && address <= MEMLOC_TILEDATA_END) {

				this.pokeTileData(address, value);

			} else if (address >= MEMLOC_TILEMAPS && address <= MEMLOC_TILEMAPS_END) {

				this.pokeTileMap(address, value);
			}
		},

		pokeTileData: function (address, value) {

			address -= MEMLOC_TILEDATA;

			var tileIndex = Math.floor(address / VRAM_TILE_SIZE_BYTES);
			
			var byteNumber = address % VRAM_TILE_SIZE_BYTES;
			var isEvenByte = byteNumber % 2 == 0

			var pixelIndex = Math.floor(byteNumber / 2) * 8;
			var tile = this.tiles[tileIndex];

			for (var i = 0; i < 8; i++) {

				var pixel = tile[pixelIndex];

				var valueShift = isEvenByte ? 7 - i : 6 - i;
				var valueMask = Math.pow(2, 7 - i);
				var pixelMask = isEvenByte ? 0x02: 0x01;

				if (valueShift > 0) {
					pixel = (pixel & pixelMask) | ((value & valueMask) >> valueShift);
				} else if (valueShift < 0) {
					pixel = (pixel & pixelMask) | ((value & valueMask) << (valueShift * -1));
				} else {
					pixel = (pixel & pixelMask) | (value & valueMask);
				}

				if (pixel > 3) {
					debugger;
				}

				tile[pixelIndex] = pixel;

				pixelIndex++;
			}
		},

		pokeTileMap: function (address, value) {

			var tileMapIndex = address < MEMLOC_TILEMAP1 ? 0 : 1;

			var tileMap = this.tileMaps[tileMapIndex];

			var offset = address - (tileMapIndex == 0 ? MEMLOC_TILEMAP0 : MEMLOC_TILEMAP1);

			tileMap[offset] = value;

			//console.log("Poke tile map " + tileMapIndex + " at " + offset + ": " + value);
		},

		pokeSprites: function (address, value) {

			var spriteIndex = Math.floor((address - MEMLOC_SPRITE_ATTRIBUTE_TABLE) / VRAM_SPRITE_SIZE_BYTES);

			var propertyIndex = (address - MEMLOC_SPRITE_ATTRIBUTE_TABLE) % VRAM_SPRITE_SIZE_BYTES;

			var sprite = this.sprites[spriteIndex];

			if (propertyIndex == 0) {

				sprite.y = value - 16;

			} else if (propertyIndex == 1) {

				sprite.x = value - 8;

			} else if (propertyIndex == 2) {

				sprite.tileIndex = value;

			} else if (propertyIndex == 3) {

				sprite.attributes.xFlip = (value & 0x20) > 0;
				sprite.attributes.yFlip = (value & 0x40) > 0;
				sprite.attributes.paletteNumber = (value & 0x10) >> 4;
				sprite.attributes.spriteToBgPriority = (value & 0x80) >> 7;
			}
		},

		heartbeat: function (additionalClocksToRun) {

			var frameComplete = false;

			if (!this.registers.control.enabled) {
				this.clocksToRun = 0;
				return frameComplete;
			}

			this.clocksToRun += additionalClocksToRun;

			// Execute the available clocks 
			while (this.clocksToRun > 0 && !frameComplete) {


				if (this.registers.status.mode == LCD_MODE_READING_OAM) {

					if (this.modeCounter == 80) {

						this.registers.status.mode = LCD_MODE_READING_OAM_AND_VRAM;	
						this.modeCounter = -1;
					}

				} else if (this.registers.status.mode == LCD_MODE_READING_OAM_AND_VRAM) {

					if (this.modeCounter == 172) {

						this.registers.status.mode = LCD_MODE_HBLANK;	
						this.checkMode0Interrupt();
						this.modeCounter = -1;
					}

				} else if (this.registers.status.mode == LCD_MODE_HBLANK) {

					if (this.modeCounter == 204) {

						this.renderScanLineToFrameBuffer();

						this.registers.scanLineIndex++;

						if (this.registers.scanLineIndex == 144) {

							this.registers.status.mode = LCD_MODE_VBLANK;	
							this.modeCounter = -1;

							this.checkMode1Interrupt();

							system.cpu.raiseInterupt(INTERRUPT_FLAG_VBLANK);

						} else {

							this.registers.status.mode = LCD_MODE_READING_OAM;	
							this.checkMode2Interrupt();
							this.modeCounter = -1;
						}

						this.checkCoincidenceInterupt();
					}

				} else if (this.registers.status.mode == LCD_MODE_VBLANK) {

					if (this.modeCounter == 456) {

						this.registers.scanLineIndex++;

						this.modeCounter = -1;

						if (this.registers.scanLineIndex == 154) {

							system.canvasContext.putImageData(
								this.frameBuffer, 0, 0);

							this.registers.scanLineIndex = 0;
							this.registers.status.mode = LCD_MODE_READING_OAM;	
							this.checkMode2Interrupt();
							frameComplete = true;

							//break;
						}

						this.checkCoincidenceInterupt();
					}

				} else {

					throw "Unknown GPU mode: " + this.registers.status.mode;
				}

				this.modeCounter++;
				this.clocksToRun--;

				if (this.modeCounter > 1000) {
					system.cpu.crash("Wierd mode counter value: " + this.modeCounter);
				}
			}

			/*// Update the registers from the localised data.
			this.disableIoPortPokes = true;

			var statusRegisterByte = system.memory.readByte(MEMLOC_LCD_STATUS_REGISTER);
			statusRegisterByte = (statusRegisterByte & 0xfc) | this.registers.status.mode;
			statusRegisterByte = (statusRegisterByte & 0x7b) | (this.registers.status.coincidenceFlag ? 1 : 0);

			system.memory.writeByte(MEMLOC_LCD_STATUS_REGISTER, statusRegisterByte);

			system.memory.writeByte(MEMLOC_SCANLINE_INDEX, this.registers.scanLineIndex);

			this.disableIoPortPokes = false;*/

			return frameComplete;
		},

		checkCoincidenceInterupt: function () {

			this.registers.status.coincidenceFlag = this.registers.scanLineIndex == this.registers.lyc;

			if (this.registers.status.coincidenceFlag && this.registers.status.coincidenceInterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		checkMode0Interrupt: function () {

			if (this.registers.status.mode0InterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		checkMode1Interrupt: function () {

			if (this.registers.status.mode1InterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		checkMode2Interrupt: function () {

			if (this.registers.status.mode0InterruptEnabled) {

				// Raise the LCD stat interrupt.  
				system.cpu.raiseInterupt(INTERRUPT_FLAG_LCDSTAT);
			}
		},

		renderScanLineToFrameBuffer: function () {

			var scanLineIndex = this.registers.scanLineIndex;

			var pixelIndex = 
				scanLineIndex * FRAMEBUFFER_WIDTH_PIXELS;
			//var frameBufferIndex = 
			//	scanLineIndex * FRAMEBUFFER_WIDTH_PIXELS * 4;

			this.buildBgTileMapScanLineSamplingData(scanLineIndex);

			this.buildWindowTileMapScanLineSamplingData(scanLineIndex);

			this.buildSpriteScanLineSamplingData(scanLineIndex);

			var fbData = this.frameBuffer.data;

			var frameBufferBaseOffset = scanLineIndex * FRAMEBUFFER_WIDTH_PIXELS * 4 * 3 * 3;
			var frameBufferSubPixelRowStride = FRAMEBUFFER_WIDTH_PIXELS * 4 * 3;

			for (var i = 0; i < FRAMEBUFFER_WIDTH_PIXELS; i++) {

				var pixel = 0;

				if (this.registers.control.bgEnabled) {
					pixel = this.sampleBgTileMap(i, scanLineIndex);				
				}

				if (this.registers.control.windowEnabled) {
					var overwritePixel = this.sampleWindowTileMap(i, scanLineIndex);
					if (overwritePixel != -1) {
						pixel = overwritePixel;
					}
				}

				if (this.registers.control.spritesEnabled) {
					var overwritePixel = this.sampleSprites(i, scanLineIndex, pixel);
					if (overwritePixel != -1) {
						pixel = overwritePixel;
					}
				}

				var pixelRgb = this.pixelToRgbLookup[pixel];

				var frameBufferColOffset = i * 4 * 3;

				var frameBufferIndex = 
					frameBufferBaseOffset +
					frameBufferColOffset;

				fbData[frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				frameBufferIndex = 
					frameBufferBaseOffset +
					frameBufferSubPixelRowStride + 
					frameBufferColOffset; 

				fbData[frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				frameBufferIndex = 
					frameBufferBaseOffset +
					(2 * frameBufferSubPixelRowStride) + 
					frameBufferColOffset; 

				fbData[frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;

				fbData[++frameBufferIndex] = pixelRgb.r;
				fbData[++frameBufferIndex] = pixelRgb.g;
				fbData[++frameBufferIndex] = pixelRgb.b;
				fbData[++frameBufferIndex] = 255;
			}
		},

		buildBgTileMapScanLineSamplingData: function (y) {

			var data = this.scanLineSamplingData.bgTileMap;

			data.scrollX = this.registers.bgTileMapScrollX;
			data.scrollY = this.registers.bgTileMapScrollY;

			data.offsetX = data.scrollX > 0 ? data.scrollX : VRAM_TILEMAP_WIDTH_PIXELS + data.scrollX;
			data.offsetY = data.scrollY > 0 ? data.scrollY : VRAM_TILEMAP_HEIGHT_PIXELS + data.scrollY;

			data.tileMapRowIndex = 
				Math.floor((data.offsetY + y) / VRAM_TILE_HEIGHT_PIXELS) % VRAM_TILEMAP_NUM_TILES_Y;

			data.tilePixelRowIndex = 
				(data.offsetY + y) % VRAM_TILE_HEIGHT_PIXELS;
		},

		buildWindowTileMapScanLineSamplingData: function (y) {

			var data = this.scanLineSamplingData.windowTileMap;

			data.skipScanLine = y < this.registers.windowTileMapScrollY;

			if (!data.skipScanLine) {

				data.offsetX = -(this.registers.windowTileMapScrollX - 8);
				data.offsetY = -this.registers.windowTileMapScrollY;

				data.tileMapRowIndex = 
					Math.floor((data.offsetY + y) / VRAM_TILE_HEIGHT_PIXELS) % VRAM_TILEMAP_NUM_TILES_Y;

				data.tilePixelRowIndex = 
					(data.offsetY + y) % VRAM_TILE_HEIGHT_PIXELS;
			}

			return data;
		},

		buildSpriteScanLineSamplingData: function (y) {

			var data = this.scanLineSamplingData.sprites;

			data.spritesOnScanline = []; // FIXME - potential slow-down here due to allocation.
			
			var spriteHeight = this.registers.control.spriteSize == SPRITESIZE_8X8 ? 8: 16;

			for (var i = 0; i < this.sprites.length; i++) {
				var sprite = this.sprites[i];

				// Check if the sprite is above the scan line.
				if (sprite.y + spriteHeight <= y) {
					continue;
				}

				// Check if the sprite is below the scan line.
				if (sprite.y > y) {
					continue;
				}

				data.spritesOnScanline.push(sprite);
			}
		},

		sampleBgTileMap: function (x, y) {

			var data = this.scanLineSamplingData.bgTileMap;

			var tileMapColIndex = 
				Math.floor((data.offsetX + x) / VRAM_TILE_WIDTH_PIXELS) % VRAM_TILEMAP_NUM_TILES_X;

			var tilePixelColIndex = 
				(data.offsetX + x) % VRAM_TILE_WIDTH_PIXELS;

			var tileMapIndex = data.tileMapRowIndex * VRAM_TILEMAP_NUM_TILES_X + tileMapColIndex;
	
			var tileIndex = this.readFixedUpTileIndexFromTileMap(
				this.registers.control.bgTileMapNumber, 
				tileMapIndex, 
				this.registers.control.bgAndWindowTileSetNumber);

			var tilePixelIndex = data.tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;

			var pixel = this.tiles[tileIndex][tilePixelIndex];
			
			pixel = this.registers.tileMapPalette.colours[pixel];

			return pixel;
		},

		sampleWindowTileMap: function (x, y) {

			var data = this.scanLineSamplingData.windowTileMap;

			if (data.skipScanLine) {
				return -1;
			}

			var tileMapColIndex = 
				Math.floor((data.offsetX + x) / VRAM_TILE_WIDTH_PIXELS);

			if (tileMapColIndex < 0) {
				return -1;
			}

			var tilePixelColIndex = 
				(data.offsetX + x) % VRAM_TILE_WIDTH_PIXELS;

			var tileMapIndex = data.tileMapRowIndex * VRAM_TILEMAP_NUM_TILES_X + tileMapColIndex;
			
			var tileIndex = this.readFixedUpTileIndexFromTileMap(
				this.registers.control.windowTileMapNumber, 
				tileMapIndex, 
				this.registers.control.bgAndWindowTileSetNumber);

			var tilePixelIndex = data.tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;

			var pixel = this.tiles[tileIndex][tilePixelIndex];
			
			pixel = this.registers.tileMapPalette.colours[pixel];

			return pixel;
		},

		sampleSprites: function (x, y, currentPixel) {

			var data = this.scanLineSamplingData.sprites;

			var spriteHeight = this.registers.control.spriteSize == SPRITESIZE_8X8 ? 8: 16;

			for (var i = 0; i < data.spritesOnScanline.length; i++) {

				var sprite = data.spritesOnScanline[i];

				if (sprite.attributes.spriteToBgPriority == 1 && currentPixel != 0) {
					continue;
				}

				var tilePixelColIndex = x - sprite.x;
				if (tilePixelColIndex < 0) {
					continue;
				} else if (tilePixelColIndex >= 8) {
					continue;
				}

				if (sprite.attributes.xFlip) {
					tilePixelColIndex = 7 - tilePixelColIndex;
				}

				var tilePixelRowIndex = y - sprite.y;

				if (sprite.attributes.yFlip) {
					tilePixelRowIndex = (spriteHeight - 1) - tilePixelRowIndex;
				}

				var tileIndex = 0;
				var tilePixelIndex = 0;

				if (this.registers.control.spriteSize == SPRITESIZE_8X8) {

					tileIndex = sprite.tileIndex;
					tilePixelIndex = tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;


				} else {

					if (tilePixelRowIndex < 8) {

						tileIndex = sprite.tileIndex & 0xfe;
						tilePixelIndex = tilePixelRowIndex * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;
					
					} else {

						tileIndex = sprite.tileIndex | 0x01;
						tilePixelIndex = (tilePixelRowIndex - 8) * VRAM_TILE_WIDTH_PIXELS + tilePixelColIndex;
					}

				}

				var pixel = this.tiles[tileIndex][tilePixelIndex];
			
				if (pixel == 0) {
					continue;
				}

				var palette = sprite.attributes.paletteNumber == 0 ?
					this.registers.spritePalette0 : this.registers.spritePalette1;

				pixel = palette.colours[pixel];

				return pixel;
			}

			return -1;
		},

		readFixedUpTileIndexFromTileMap: function (tileMapNumber, tileMapIndex, tileSetNumber) {

			var tileIndex = this.tileMaps[tileMapNumber][tileMapIndex]; 

			// If we're using tile set 1 then the indexes are signed values between -128 and 127, which
			// means we need to fix up the index to make it zero based.
			if (tileSetNumber == 1) {

				// Convert to twos-compliment signed.
				if (tileIndex >= 128) {
					tileIndex = -128 + (tileIndex & 0x7F);
				}

				// Make zero based.
				tileIndex += 256;
			}

			return tileIndex;
		}
	}
}