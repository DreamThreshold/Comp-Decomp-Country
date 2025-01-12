
function dkc1decompress(inp, offset=0){
    // the decompression function.
    // After a block of data dedicates to a look up table,
    // the compressed data consists of spans of data, each starting with a
    // command / control byte. There are 4 types of commands modes.
    let input = inp.slice(offset);
    const modeNames = ["Copy", "RLE", "History", "LUT"];

    var index = 128; // index of byte within data;
    // start after the LUT of 64 16-bit words (64*2=128).
    var output = [];
    var highestDiff = 0, diff=0;
    while(index < input.length){
        var control = input[index]; // or "command"
        var mode = control >> 6; // same as extracting leftmost 2 bits
        var detail = control & 0b00111111; // extracts rightmost 6 bits
        // console.log(modeNames[mode]+": "+detail);
        switch(mode){
            // COPY
            case 0:
                // here, the detail refers to number of subsequent bytes to copy
                for (let i = 1; i <= detail; i++){
                    output.push(input[index + i]);
                }
                // output.push(input.slice(index + 1, index + 1 + detail));
                index += 1 + detail;
                break;
            // Run-length Encoding ("RLE")
            case 1:
                // here, the detail refers to number of times to copy the subsequent byte
                for (let i = detail; i > 0; i--){
                    output.push(input[index+1]);
                }
                index += 2;
                break;
            // HISTORY
            case 2:
                // Get the next 2 bytes, swap them, treat this as a word.
                // This word is the starting address within the existing OUTPUT data
                // from which to extract <detail> number of bytes
                let addr = input[index+1] | (input[index+2] << 8);
                output.push(...output.slice(addr, addr + detail));
                diff = output.length-addr;
                highestDiff = Math.max(highestDiff,diff);
                // console.log(`HISTORY: addr ${addr} to index ${output.length} (dec) = ${diff} / 0x${hex(diff,6)}`);
                index += 3;
                break;
            // Lookup Table ("LUT")
            case 3:
                // Take the detail and << 1. This value is our lookup table address.
                // take the 2 bytes of data starting at this address within the input.
                var lutAddress = detail << 1; // Multiplies by 2, ensures evenness
                output.push( input[lutAddress] );
                output.push( input[lutAddress+1] );
                index += 1;

                break;

        }
    }
    console.log(`Decompressed ${input.length} bytes to ${output.length} bytes.`);
    console.log(`Highest difference in offsets for History mode: ${highestDiff} / 0x${hex(highestDiff,6)}`);
    // return new Uint8Array(output);
    return output;
}




// WIP...
function dkc1compress(input){
    var output = new Uint8Array();
    return output;
}