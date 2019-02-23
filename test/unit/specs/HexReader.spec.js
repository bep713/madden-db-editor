import chai from 'chai';
import sinon from 'sinon';
// import { createLocalVue, mount } from '@vue/test-utils';

// import MaddenHeader from '../../../src/renderer/components/MaddenHeader';
import HexReader from '../../../src/renderer/utils/HexReader';

// import Vuex from 'vuex';

const expect = chai.expect;
const stubbedFileData = [0x44, 0x42, 0x05, 0x08, 0x01, 0x00, 0x00, 0x00, 0x00, 0x03, 0xF0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17, 0xC3, 0x70, 0x43, 0xCE];

let sandbox;

describe('Hex Reader unit tests', () => {
  // const localVue = createLocalVue();
  // localVue.use(HexReader);
  // localVue.use(Vuex);

  // let actions, getters, store, wrapper; 

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // actions = {
    //   'SAVE_TABLE_COUNT': sandbox.stub(),
    //   'SAVE_DB_SIZE': sandbox.stub(),
    //   'SAVE_HEADER_DIGIT': sandbox.stub()
    // };

    // getters = {
    //   'GET_WORD_AT' () { return 25; },
    //   'GET_DWORD_AT' () { return 2500; },
    //   'FILE_HEADER_DATA' () { return stubbedFileData; }
    // };

    // store = new Vuex.Store({
    //   state: {},
    //   actions: actions,
    //   getters: getters
    // });

    // wrapper = mount(MaddenHeader, { store, localVue });
  });
  
  afterEach(() => {
    sandbox.restore();
  });

  describe('has a method to read a WORD', () => {
    let result;
  
    beforeEach(() => {
      result = HexReader.readWordAt(2, stubbedFileData);
    });
  
    it('method exists', () => {
      expect(HexReader.readWordAt).to.exist;
    });
  
    it('throws an error if the passed in index is less than 1', () => {
      let fn = () => { HexReader.readWordAt(0, stubbedFileData); };
  
      expect(fn).to.throw(Error);
    });
  
    it('throws an error if the passed in index is greater than or equal to array length', () => {
      let fn = () => { HexReader.readWordAt(2, [0x01]); };
  
      expect(fn).to.throw(Error);
    });
  
    it('returns the expected result', () => {
      expect(result).to.eql(0x05 | 0x42 << 8);
    });
  });
  
  describe('has a method to read a DWORD', () => {
    let result, toUint32Stub;
  
    beforeEach(() => {
      toUint32Stub = sandbox.stub(HexReader, 'toUint32').callsFake((number) => { return 0; });
      result = HexReader.readDWordAt(23, stubbedFileData);
    });
  
    it('method exists', () => {
      expect(HexReader.readDWordAt).to.exist;
    });
  
    it('converts the result to a Uint32 by calling the correct method', () => {
      expect(toUint32Stub.calledOnce).to.be.true;
    });
  
    it('passes the expected argument to the method that converts to a Uint32', () => {
      expect(toUint32Stub.firstCall.args[0]).to.eql(0xCE | 0x43 << 8 | 0x70 << 16 | 0xC3 << 24);
    });
  
    it('returns the result from the Uint32 method', () => {
      expect(result).to.eql(0);
    });
  
    it('throws an error if the index is less than 3', () => {
      toUint32Stub.resetHistory();
  
      let fn = () => {
        HexReader.readDWordAt(2, [0x01, 0x03, 0x05, 0x08]);
      };
  
      expect(fn).to.throw(Error);
    });
  
    it('throws an error if the index is greater than the array length', () => {
      toUint32Stub.resetHistory();
  
      let fn = () => {
        HexReader.readDWordAt(10, [0x01, 0x02, 0x05, 0x05]);
      };
  
      expect(fn).to.throw(Error);
    });
  });
  
  describe('has a method to conver to Uint32', () => {
    let result, moduloStub, toIntegerStub, powStub;
  
    beforeEach(() => {
      moduloStub = sandbox.stub(HexReader, 'modulo').callsFake((num1, num2) => { return 5; });
      toIntegerStub = sandbox.stub(HexReader, 'toInteger').callsFake((number) => { return 2; });
      powStub = sandbox.stub(Math, 'pow').callsFake((num1, num2) => { return 0; });
  
      result = HexReader.toUint32(5);
    });
  
    it('method exists', () => {
      expect(HexReader.toUint32).to.exist;
    });
  
    it('calls the modulo method', () => {
      expect(moduloStub.calledOnce).to.be.true;
    });
  
    it('calls the method to convert a number to an integer', () => {
      expect(toIntegerStub.calledOnce).to.be.true;
    });
  
    it('passes the argument to the method to convert to an integer', () => {
      expect(toIntegerStub.firstCall.args[0]).to.eql(5);
    });
  
    it('calls the Math power method', () => {
      expect(powStub.calledOnce).to.be.true;
    });
  
    it('passes the expected arguments to the pow method', () => {
      expect(powStub.firstCall.args[0]).to.eql(2);
      expect(powStub.firstCall.args[1]).to.eql(32);
    });
  
    it('passes the result of the integer and pow methods to the modulo method', () => {
      expect(moduloStub.firstCall.args[0]).to.eql(2);
      expect(moduloStub.firstCall.args[1]).to.eql(0);
    });
  });
  
  describe('has a method to convert a number to a JS Integer', () => {
    let argument = 0xCE | 0x43 << 8 | 0x70 << 16 | 0xC3 << 24,
        result, ceilStub, floorStub, numberStub;
  
    beforeEach(() => {
      ceilStub = sandbox.stub(Math, 'ceil').callsFake((num) => { return 1; });
      floorStub = sandbox.stub(Math, 'floor').callsFake((num) => { return 0; });
      numberStub = sandbox.stub(window, 'Number').callsFake((num) => { return num; });
  
      result = HexReader.toInteger(argument)
    });
    
    it('method exists', () => {
      expect(HexReader.toInteger).to.exist;
    });
  
    it('calls the Number constructor', () => {
      expect(numberStub.calledOnce).to.be.true;
    });
  
    it('passes the argument to the Number constructor', () => {
      expect(numberStub.firstCall.args[0]).to.eql(argument);
    });
  
    it('calls the ceil method if the number is less than 0', () => {
      expect(ceilStub.calledOnce).to.be.true;
      expect(floorStub.called).to.be.false;
    });
  
    it('passes the number to the ceil method', () => {
      expect(ceilStub.firstCall.args[0]).to.eql(argument);
    });
  
    it('calls the floor function if the number is greater or equal to 0', () => {
      ceilStub.resetHistory();
      floorStub.resetHistory();
  
      HexReader.toInteger(1);
  
      expect(floorStub.calledOnce).to.be.true;
      expect(ceilStub.called).to.be.false;
    });
  
    it('passes the number to the floor method', () => {
      floorStub.resetHistory();
  
      HexReader.toInteger(1);
  
      expect(floorStub.firstCall.args[0]).to.eql(1);
    });
  
    it('returns the result from the ceil method if called', () => {
      expect(result).to.eql(1);
    });
  
    it('returns the result from the floor method if called', () => {
      result = HexReader.toInteger(1);
      expect(result).to.eql(0);
    });
  });
  
  describe('has a method to calculate modulus', () => {
    let result, floorStub;
  
    beforeEach(() => {
      floorStub = sandbox.stub(Math, 'floor').callsFake((num) => { return 0; });
      result = HexReader.modulo(1, 2);
    });
  
    it('method exists', () => {
      expect(HexReader.modulo).to.exist;
    });
  
    it('calls the floor method', () => {
      expect(floorStub.calledOnce).to.be.true;
    });
  
    it('passes the expected argument to the floor function', () => {
      expect(floorStub.firstCall.args[0]).to.eql(1/2);
    });
  
    it('returns the expected result', () => {
      expect(result).to.eql(1 - 0 * 2);
    });
  });

  describe('has a method to read in text', () => {
    it('method exists', () => {
      expect(HexReader.readTextAt).to.exist;
    });

    it('throws an error if the index is greater than the data length', () => {
      let fn = () => { HexReader.readTextAt(5, 5, [0x01, 0x02]) };
      expect(fn).to.throw(Error);
    });

    it('throws an error if the length argument is greater than the data length', () => {
      let fn = () => { HexReader.readTextAt(2, 4, [0x01, 0x02, 0x03]) };
      expect(fn).to.throw(Error);
    });

    it('returns a string from the index at specified length', () => {
      const array = [0x47, 0x4B, 0x50, 0x53];
      const expectedWord = 'SPKG';

      let text = HexReader.readTextAt(3, 4, array);
      expect(text).to.eql(expectedWord);
    });
  });
});