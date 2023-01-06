# RTTEXConverter
RTTEX Converter in JS
# Requirement
- Sharp
- Node JS V14 or upper
# Install
you can type `npm install rttexconverter` on the command prompt/linux terminal
# Example
```
(async function() {
    const test = require("rttexconverter")
    const fs = require("fs")
    
    fs.writeFileSync("name.rttex", await test.RTTEXPack("name.png"))
    fs.writeFileSync("name.png", await test.RTTEXUnpack("name.rttex"))
})()

```
# Credit
- https://github.com/ZTzTopia/RTTEXConverterJS
- https://github.com/SethRobinson/proton/
