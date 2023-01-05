const fs = require("fs")
const zlib = require("zlib")
const sharp = require("sharp")

function getLowestPowerOf2(n) {
    let lowest = 1;
    while (lowest < n) {
        lowest <<= 1;
    }
    return lowest
}

async function RTTEXPack(namePNG, saveFile) {
    let memPos = 0;

    const RTTEXHeader = Buffer.alloc(0x7c)
    var dataPNG = await sharp(namePNG)
    var PNGMetaData = await dataPNG.metadata()
    var PNGBuffer = await dataPNG.flip().raw().toBuffer()

    RTTEXHeader.write("RTTXTR")
    memPos += 8; // 6 (RTTXTR) + 2 (1 byte = version, 1 byte = reserved)
    console.log(getLowestPowerOf2(PNGMetaData.height))
    console.log(getLowestPowerOf2(PNGMetaData.width))
    RTTEXHeader.writeInt32LE(getLowestPowerOf2(PNGMetaData.height), memPos)
    memPos += 4;
    RTTEXHeader.writeInt32LE(getLowestPowerOf2(PNGMetaData.width), memPos)
    memPos += 4;
    RTTEXHeader.writeInt32LE(5121, memPos)
    memPos += 4;
    RTTEXHeader.writeInt32LE(PNGMetaData.height, memPos)
    memPos += 4;
    RTTEXHeader.writeInt32LE(PNGMetaData.width, memPos)
    memPos += 4;
    RTTEXHeader[memPos++] = 1;
    RTTEXHeader[memPos++] = 0;

    const RTPACKHeader = Buffer.alloc(32)
    const compressBuffer = zlib.deflateSync(Buffer.concat([RTTEXHeader, PNGBuffer]))

    RTPACKHeader.write("RTPACK")
    memPos = 8; // // 6 (RTPACK) + 2 (1 byte = version, 1 byte = reserved)
    RTPACKHeader.writeUint32LE(compressBuffer.length, memPos)
    memPos += 4;
    RTPACKHeader.writeUInt32LE(0x7c + PNGBuffer, memPos)
    memPos += 4;
    RTPACKHeader[memPos] = 1

    fs.writeFileSync(saveFile, Buffer.concat([RTPACKHeader, compressBuffer]))
}

async function RTTEXUnpack(nameFile, savePNG) {
    let memPos = 0;
    var data = fs.readFileSync(nameFile)
    if (data.slice(0, 6).toString() === "RTPACK") {
        data = zlib.inflateSync(data.slice(32))
    }
    if (data.slice(0, 6).toString() === "RTTXTR") {
        await sharp(data.slice(0x7c), {raw: {
            width: data.readInt32LE(0x08),
            height: data.readInt32LE(0x0C),
            channels: 3 + data[0x1c]
        }}).flip(true).toFormat("png").toFile(savePNG) // langsung nge write bang
    }
    else console.log("This is not a RTTEX file")
}

module.exports = {
    RTTEXPack: RTTEXPack,
    RTTEXUnpack: RTTEXUnpack
}
