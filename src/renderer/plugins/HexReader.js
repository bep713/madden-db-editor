export default {
  install (Vue, options) {
    Vue.prototype.$readWordAt = function (index, data) {
      if (index < 1) {
        throw new Error('Error: index must be equal to or greater than 1.')
      }
      else if (index >= data.length) {
        throw new Error('Error: index must not be greater than the passed in data array length.');
      }

      return data[index] | data[index - 1] << 8;
    };

    Vue.prototype.$readDWordAt = function (index, data) {
      if (index < 3) {
        throw new Error('Error: index must be equal to or greater than 3.')
      }
      else if (index >= data.length) {
        throw new Error('Error: index must not be greater than the passed in data array length.');
      }

      return this.$toUint32(data[index] | data[index - 1] << 8 | data[index - 2] << 16 | data[index - 3] << 24);
    };

    Vue.prototype.$toUint32 = function (x) {
      return this.$modulo(this.$toInteger(x), Math.pow(2, 32));
    };

    Vue.prototype.$modulo = function (a, b) {
      return a - Math.floor(a/b)*b;
    };

    Vue.prototype.$toInteger = function (x) {
      x = Number(x);
      return x < 0 ? Math.ceil(x) : Math.floor(x);
    };
  }
}