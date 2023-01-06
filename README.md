# RTTEXConverter
RTTEX Converter in JS
# Requirement
- Sharp
# Example
```
(async function() {
    const test = require("./main.js")
    const fs = require("fs")
    
    fs.writeFileSync("name.rttex", await test.RTTEXPack("name.png"))
    fs.writeFileSync("name.png", await test.RTTEXUnpack("name.rttex"))
})()

```
# Credit
- https://github.com/ZTzTopia/RTTEXConverterJS
- https://github.com/SethRobinson/proton/
