import chai from 'chai';
import sinon from 'sinon';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import fs from 'fs';

import MaddenDatabase from '../../../src/renderer/components/MaddenDatabase.vue';

const expect = chai.expect;
const stubbedFileData = [0x44, 0x42, 0x05, 0x08, 0x01, 0x00, 0x00, 0x00, 0x00, 0x03, 0xF0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17, 0xC3, 0x70, 0x43, 0xCE];
let sandbox;

const emptyFileDataFn = function () {
  return [];
};

const stubbedFileDataFn = function () {
  return stubbedFileData;
};

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Madden Database component', () => {
  let actions, getters, store, wrapper;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    actions = {
      'SAVE_FILE_DATA': sandbox.stub().resolves(),
      'RESET_FILE_DATA': sandbox.stub().resolves()
    };

    getters = {
      'FILE_DATA': emptyFileDataFn,
      'TABLE_COUNT': () => { return 20; }
    };

    store = new Vuex.Store({
      state: {},
      actions: actions,
      getters: getters
    });

    wrapper = shallowMount(MaddenDatabase, { store, localVue });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('vue component unit tests', () => {
    it('component has expected name', () => {
      expect(wrapper.name()).to.eql('MaddenDatabase');
    });
  });

  describe('has a method to read a db file', () => {
    let fsStub, processDbFileDataStub;

    beforeEach(async () => {
      fsStub = sandbox.stub(fs, 'readFile').callsFake((path, cb) => { return cb(null, stubbedFileData); });
      processDbFileDataStub = sandbox.stub(wrapper.vm, '_processDbFileData');
      await wrapper.vm.readFile();
    });

    it('should have a function to read a file', () => {
      expect(wrapper.vm.readFile).to.be.a('function');
    });
  
    it('should call the fs readFile method', () => {
      expect(fsStub.calledOnce).to.be.true;
    });
  
    it('should call the readFile method with correct path', () => {
      expect(fsStub.firstCall.args[0]).to.equal('C:\\Projects\\madden-mods\\projects\\playbooks\\madden_browns.db');
    });

    it('should pass a callback fn to the readFile method', () => {
      expect(fsStub.firstCall.args[1]).to.be.a('function');
    });

    it('calls the expected method to process the file data', () => {
      expect(processDbFileDataStub.calledOnce).to.be.true;
    });
  });

  describe('has a method to process the db file data', () => {
    let result, processDbFileDataStub, getHeaderInfoStub;

    beforeEach(async () => {
      result = await wrapper.vm._processDbFileData(null, stubbedFileData);
    });

    it('throws an error if the error argument is not null', (done) => {
      wrapper.vm._processDbFileData(new Error(), null)
        .catch((err) => {
          expect(err).to.not.be.undefined;
          done();
        });
    });

    it('method should set the fileData attribute with the file data from fs', () => {
      expect(actions.SAVE_FILE_DATA.calledOnce).to.be.true;

      expect(actions.SAVE_FILE_DATA.firstCall.args[1]).to.eql({
        fileData: stubbedFileData
      });
    });

    it('button to toggle header data should appear', () => {
      expect(wrapper.find('.toggle-header-data').exists()).to.be.true;
    });

    it('saves the header data to the store', () => {
      expect(actions.SAVE_FILE_DATA.calledOnce).to.be.true;
    });

    it('passes expected object to the store for header data', () => {
      expect(actions.SAVE_FILE_DATA.firstCall.args.slice(-2)[0]).to.eql({
        fileData: stubbedFileData
      });
    });
  });

  describe('has a method to toggle the header data', () => {
    it('method exists', () => {
      expect(wrapper.vm.toggleHeaderData).to.exist;
    });

    it('method inverts the boolean value', () => {
      wrapper.vm.showHeaderData = false;
      wrapper.vm.toggleHeaderData();
      expect(wrapper.vm.showHeaderData).to.be.true;
    });
  });

  describe('has a computed method to determine if a file is loaded', () => {
    it('returns false when fileData is empty', () => {
      expect(wrapper.vm.fileCurrentlyLoaded).to.be.false;
    });

    it('returns true when fileData is not empty', () => {
      store.hotUpdate({
        getters: {
          ...getters,
          'FILE_DATA': stubbedFileDataFn
        }
      });

      expect(wrapper.vm.fileCurrentlyLoaded).to.be.true;
    });
  });
});