
/**
 * Convert decimal to 16 bit binary.
 */

const decbin = nbr => {
    if(nbr < 0){
       nbr = 0xFFFFFFFF + nbr + 1;
    }
    return ("0000000000000000" + parseInt(nbr, 10).toString(2)).substr(-16);
};

/**
 * Handle conversion to real value for 2 register value.
 */

const getRealValueForTwoRegister = (reg1, reg2) => {
    let register1 = parseInt(reg1);
    let register2 = parseInt(reg2);

   return ~~parseInt(decbin(register2)+decbin(register1),2);
};

/**
 * Handle conversion to real value for signal quality for register number 92.
 */

const getRealValueForSignalQuality = (reg) => {
    let registerValue = parseInt(reg);
    
    // return low byte for signal quality.
    return registerValue & 0xff; 
};

module.exports = {
    getRealValueForTwoRegister,
    getRealValueForSignalQuality
};

