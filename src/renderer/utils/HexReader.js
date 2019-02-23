export default {
  readTextAt: function (index, length, data) {
    if (length > data.length) {
      throw new Error('Error: length must not be greater than the passed in data array length.');
    }
    else if (index >= data.length) {
      throw new Error('Error: index must not be greater than the passed in data array length.');
    }

    let text = '';
    
    for (let i = 0; i < length; i++) {
      text += String.fromCharCode(data[index - i]);
    }

    return text;
  },

  readWordAt: function (index, data) {
    if (index < 1) {
      throw new Error('Error: index must be equal to or greater than 1.')
    }
    else if (index >= data.length) {
      throw new Error('Error: index must not be greater than the passed in data array length.');
    }
  
    return data[index] | data[index - 1] << 8;
  },
  
  readDWordAt: function (index, data) {
    if (index < 3) {
      throw new Error('Error: index must be equal to or greater than 3.')
    }
    else if (index >= data.length) {
      throw new Error('Error: index must not be greater than the passed in data array length.');
    }
  
    return this.toUint32(data[index] | data[index - 1] << 8 | data[index - 2] << 16 | data[index - 3] << 24);
  },
  
  toUint32: function (x) {
    return this.modulo(this.toInteger(x), Math.pow(2, 32));
  },
  
  modulo: function (a, b) {
    return a - Math.floor(a/b)*b;
  },
  
  toInteger: function (x) {
    x = Number(x);
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  }
};