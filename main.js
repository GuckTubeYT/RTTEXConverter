const fs = require("fs")
const zlib = require("zlib")
const sharp = require("sharp")

function getLowestPowerOf2(n) {
    let lowest = 1;
    while (lowest < n) lowest <<= 1;
    return lowest
}

async function RTTEXPack(namePNG) {
    const RTTEXHeader = Buffer.alloc(0x7c)
    var dataPNG = await sharp(namePNG)
    var PNGMetaData = await dataPNG.metadata()
    var PNGBuffer = await dataPNG.flip().raw().toBuffer()

    RTTEXHeader.write("RTTXTR")
    RTTEXHeader.writeInt32LE(getLowestPowerOf2(PNGMetaData.height), 8)
    RTTEXHeader.writeInt32LE(getLowestPowerOf2(PNGMetaData.width), 12)
    RTTEXHeader.writeInt32LE(5121, 16)
    RTTEXHeader.writeInt32LE(PNGMetaData.height, 20)
    RTTEXHeader.writeInt32LE(PNGMetaData.width, 24)
    RTTEXHeader[28] = 1;
    RTTEXHeader[29] = 0;

    const RTPACKHeader = Buffer.alloc(32)
    const compressBuffer = zlib.deflateSync(Buffer.concat([RTTEXHeader, PNGBuffer]))

    RTPACKHeader.write("RTPACK")
    RTPACKHeader.writeUint32LE(compressBuffer.length, 8)
    RTPACKHeader.writeUInt32LE(0x7c + PNGBuffer, 12)
    RTPACKHeader[16] = 1
    return Buffer.concat([RTPACKHeader, compressBuffer])
}

async function RTTEXUnpack(nameFile) {
    var data = fs.readFileSync(nameFile)
    if (data.slice(0, 6).toString() === "RTPACK") data = zlib.inflateSync(data.slice(32))
    if (data.slice(0, 6).toString() === "RTTXTR") {
        return await sharp(data.slice(0x7c), {raw: {
            width: data.readInt32LE(8),
            height: data.readInt32LE(12),
            channels: 3 + data[0x1c]
        }}).flip(true).toFormat("png").toBuffer()
    }
    else console.log("This is not a RTTEX file")
}

module.exports = {
    RTTEXPack: RTTEXPack,
    RTTEXUnpack: RTTEXUnpack
}
