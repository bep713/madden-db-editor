// import chai from 'chai';
// import sinon from 'sinon';
// import { shallowMount, createLocalVue } from '@vue/test-utils';
// import Vuex from 'vuex';

// import MaddenHeader from '../../../src/renderer/components/MaddenHeader';
// import HexReader from '../../../src/renderer/plugins/HexReader';

// const expect = chai.expect;
// let sandbox;

// const stubbedFileData = [0x44, 0x42, 0x05, 0x08, 0x01, 0x00, 0x00, 0x00, 0x00, 0x03, 0xF0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17, 0xC3, 0x70, 0x43, 0xCE];

// const localVue = createLocalVue();
// localVue.use(HexReader);
// localVue.use(Vuex);

// describe('Madden Header component', () => {
//   let actions, getters, store, wrapper;

//   beforeEach(() => {
//     sandbox = sinon.createSandbox();

//     actions = {
//       'SAVE_TABLE_COUNT': sandbox.stub(),
//       'SAVE_DB_SIZE': sandbox.stub(),
//       'SAVE_HEADER_DIGIT': sandbox.stub()
//     };

//     getters = {
//       'GET_WORD_AT': () => (index) => { return 25; },
//       'GET_DWORD_AT': () => (index) => { return 2500; },
//       'FILE_HEADER_DATA' () { return stubbedFileData; },
//     };

//     store = new Vuex.Store({
//       state: {},
//       actions: actions,
//       getters: getters
//     });

//     wrapper = shallowMount(MaddenHeader, { store, localVue });
//   });

//   afterEach(() => {
//     sandbox.restore();
//   });

//   describe('vue component unit tests', () => {
//     it('component has expected name', () => {
//       expect(wrapper.name()).to.eql('MaddenHeader');
//     });
//   });

//   describe('has a computed headers attribute', () => {
//     let getHeaderInfoStub, parseHeadersStub;

//     beforeEach(() => {
//       getHeaderInfoStub = sandbox.stub(wrapper.vm, '_getHeaderInfo').callsFake(() => { return { 'header': 25 }});
//       parseHeadersStub = sandbox.stub(wrapper.vm, '_parseHeaders').callsFake(() => { return [{ 'id': 0, 'name': 'header', 'value': 25 }]});
//     });

//     it('wont do anything if fileData is empty', () => {
//       expect(parseHeadersStub.called).to.be.false;
//     });

//     it('gets an object representing the header', () => {
//       expect(getHeaderInfoStub.calledOnce).to.be.true;
//     });

//     it('parses the headers', () => {
//       expect(parseHeadersStub.calledOnce).to.be.true;
//     });

//     it('headers show expected values', () => {
//       let expectedHeaders = [
//         {
//           'id': 0,
//           'name': 'header',
//           'value': 25
//         }
//       ];

//       expect(wrapper.vm.headers).to.eql(expectedHeaders);
//     });
//   });

//   describe('has a method to parse the headers', () => {
//     let result,
//         stubbedArgument = { 'header': 25 };

//     beforeEach(() => {
//       result = wrapper.vm._parseHeaders(stubbedArgument);
//     });

//     it('method exists', () => {
//       expect(wrapper.vm._parseHeaders).to.exist;
//     });

//     it('throws an error if passed in object isnt an object', () => {
//       let fn = () => { wrapper.vm._parseHeaders([0x01]); };
//       expect(fn).to.throw(Error);
//     });

//     it('throws an error if passed in object is null', () => {
//       let fn = () => { wrapper.vm._parseHeaders(); };
//       expect(fn).to.throw(Error);
//     });

//     it('returns the expected result', () => {
//       expect(result).to.eql([{
//         'id': 0,
//         'name': 'header',
//         'value': 25
//       }]);
//     });
//   });

//   describe('has a method to get the header data', () => {
//     let result, readDWordAtStub, readWordAtStub;

//     beforeEach(() => {
//       readDWordAtStub = sandbox.stub().callsFake((num1, num2) => { return 0x01; });
//       readWordAtStub = sandbox.stub().callsFake((num1, num2) => { return 0x05; });

//       wrapper.vm.$readDWordAt = readDWordAtStub;
//       wrapper.vm.$readWordAt = readWordAtStub

//       result = wrapper.vm._getHeaderInfo([0x00, 0x01, 0x02, 0x03]);
//     });

//     it('method exists', () => {
//       expect(wrapper.vm._getHeaderInfo).to.exist; 
//     });

//     it('returns an object', () => {
//       expect(result).to.be.an('object');
//     });

//     it('returns all the expected fields', () => {
//       let requiredFields = ['header', 'version', 'unknown1', 'dbSize', 'zero', 'tableCount', 'unknown2'];

//       requiredFields.forEach((field) => {
//         expect(result[field]).to.exist;
//       });
//     });

//     it('calls the method to get a WORD expected number of times', () => {
//       expect(readWordAtStub.callCount).to.eql(2);
//     });

//     it('calls the method to get a DWORD expected number of times', () => {
//       expect(readDWordAtStub.callCount).to.eql(5);
//     });

//     it('returns the expected result (with stubs)', () => {
//       let expectedResult = {
//         'header': 0x05,
//         'version': 0x05,
//         'unknown1': 0x01,
//         'dbSize': 0x01,
//         'zero': 0x01,
//         'tableCount': 0x01,
//         'unknown2': 0x01
//       };

//       expect(result).to.eql(expectedResult);
//     });
//   });
// });