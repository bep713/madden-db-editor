export default {
  writeDWord: function (data, buffer, startOffset) {
    buffer[startOffset    ] = (data >> 24 & 0x000000FF);
    buffer[startOffset + 1] = (data >> 16 & 0x000000FF);
    buffer[startOffset + 2] = (data >> 8  & 0x000000FF);
    buffer[startOffset + 3] = (data       & 0x000000FF);
  },

  writeWord: function (data, buffer, startOffset) {
    buffer[startOffset    ] = (data >> 8 & 0x00FF);
    buffer[startOffset + 1] = (data      & 0x00FF);
  },

  writeText: function (data, buffer, startOffset) {
    for (let i = data.length - 1; i >= 0; i--) {
      buffer[startOffset + ((data.length - 1) - i)] = data.charCodeAt(i);
    }
  }
}